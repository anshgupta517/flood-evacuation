from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple, Optional
import osmnx as ox
import networkx as nx
from shapely.geometry import LineString, Polygon
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Flood Emergency Service API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('CORS_ORIGIN', '*')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request validation
class Point(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    start: List[float]
    end: List[float]
    flood_zones: Optional[List[List[List[float]]]] = None

@app.post("/api/route")
async def calculate_route(request: RouteRequest):
    try:
        print("\n=== Starting Route Calculation ===")
        print(f"Received request data: {request}")

        # Convert to (lat, lng) for OSMnx
        start_lat, start_lng = request.start[0], request.start[1]
        end_lat, end_lng = request.end[0], request.end[1]
        print(f"Start point: ({start_lat}, {start_lng})")
        print(f"End point: ({end_lat}, {end_lng})")

        print("Fetching road network...")
        G = ox.graph_from_point(
            (start_lat, start_lng),
            network_type="drive",
            dist=5000
        )
        print(f"Network fetched: {len(G.nodes)} nodes, {len(G.edges)} edges")

        # Process flood zones
        if request.flood_zones:
            print(f"Processing {len(request.flood_zones)} flood zones...")
            remove_flooded_roads(G, request.flood_zones)
            print(f"After flood processing: {len(G.nodes)} nodes, {len(G.edges)} edges")

        # Find nodes
        print("Finding nearest nodes...")
        start_node = ox.distance.nearest_nodes(G, X=start_lng, Y=start_lat)
        end_node = ox.distance.nearest_nodes(G, X=end_lng, Y=end_lat)
        print(f"Start node ID: {start_node}")
        print(f"End node ID: {end_node}")

        print("Calculating shortest path...")
        try:
            path = nx.shortest_path(G, start_node, end_node, weight='length')
        except nx.NetworkXNoPath:
            raise HTTPException(
                status_code=404,
                detail={
                    "error": "No safe path exists!",
                    "message": "Flood blocks all routes."
                }
            )

        print(f"Path found with {len(path)} nodes")

        print("Extracting route coordinates...")
        route_coords = [
            [G.nodes[node]['y'], G.nodes[node]['x']]
            for node in path
        ]
        print(f"Extracted {len(route_coords)} coordinate pairs")

        print("Calculating total distance...")
        total_distance = sum(
            G[u][v][0]['length'] for u, v in nx.utils.pairwise(path)
        )
        print(f"Total distance: {total_distance/1000:.2f} km")

        return {
            "route": route_coords,
            "distance": f"{total_distance / 1000:.2f} km",
            "message": "Route calculated successfully!"
        }

    except Exception as e:
        print(f"ERROR: Unexpected error occurred: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Route calculation failed",
                "message": str(e)
            }
        )

def remove_flooded_roads(graph, flood_zones):
    """Remove roads intersecting with flood zones (corrected coordinate order)."""
    print("\n=== Processing Flood Zones ===")
    edges_to_remove = set()
    for i, zone in enumerate(flood_zones):
        print(f"Processing flood zone {i+1}/{len(flood_zones)}")
        try:
            # Extract and swap coordinates
            if isinstance(zone[0][0], (list, tuple)):
                coords = [tuple([p[1], p[0]]) for p in zone[0]]
            else:
                coords = [tuple([p[1], p[0]]) for p in zone]
            
            if coords[0] != coords[-1]:
                coords.append(coords[0])
            flood_poly = Polygon(coords)
            print(f"Flood zone {i+1} polygon created with {len(coords)} points")

            # Check edges
            edge_count = 0
            for u, v, key in graph.edges(keys=True):
                edge_data = graph[u][v][key]
                if 'geometry' in edge_data:
                    road_line = edge_data['geometry']
                else:
                    road_line = LineString([
                        (graph.nodes[u]['x'], graph.nodes[u]['y']),
                        (graph.nodes[v]['x'], graph.nodes[v]['y'])
                    ])
                if road_line.intersects(flood_poly):
                    edges_to_remove.add((u, v, key))
                    edge_count += 1
            print(f"Found {edge_count} intersecting edges in zone {i+1}")
        except Exception as e:
            print(f"ERROR processing flood zone {i+1}: {str(e)}")
            continue

    print(f"Removing {len(edges_to_remove)} total flooded edges...")
    for u, v, key in edges_to_remove:
        graph.remove_edge(u, v, key)
    print("Flood zone processing complete")

def get_road_network(start_point, dist=5000):
    """Fetch road network around start point (5km radius by default)."""
    print(f"\n=== Fetching Road Network ===")
    print(f"Start point: {start_point}")
    print(f"Search radius: {dist}m")
    G = ox.graph_from_point(
        (start_point[0], start_point[1]),
        network_type="drive",
        dist=dist
    )
    print(f"Network fetched with {len(G.nodes)} nodes and {len(G.edges)} edges")
    return G

if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    print("\n=== Starting FastAPI Server ===")
    print(f"Port: {port}")
    uvicorn.run("server:app", host=host, port=port, reload=debug)