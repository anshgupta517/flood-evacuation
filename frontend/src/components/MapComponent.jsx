import React, { useRef, useEffect, useState } from 'react';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Point, LineString } from 'ol/geom';
import { Feature } from 'ol';
import { Style, Stroke, Fill, Circle } from 'ol/style';
import { transform } from 'ol/proj';
import { Draw } from 'ol/interaction';
import axios from 'axios';
import 'ol/ol.css';
import './MapComponent.css';

const MapComponent = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [isDrawingFloodZone, setIsDrawingFloodZone] = useState(false);
  const [floodZones, setFloodZones] = useState([]);
  const [routeStats, setRouteStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyLayers, setEmergencyLayers] = useState([]);

  const floodZoneSource = useRef(new VectorSource());
  const routeSource = useRef(new VectorSource());
  const markerSource = useRef(new VectorSource());

  const [safetyStatus, setSafetyStatus] = useState('safe');
  const [avoidedFloodZones, setAvoidedFloodZones] = useState(0);


  const [simulationActive, setSimulationActive] = useState(false);
  const [routeHistory, setRouteHistory] = useState([]);

  const [totalFloodedArea, setTotalFloodedArea] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(30); // km/h
  const [routeDetails, setRouteDetails] = useState(null);

  // const [coord, setCoord] = useState(null);
  

  const simulateFloodSpread = () => {
    setSimulationActive(true);
    const interval = setInterval(() => {
      if (floodZones.length < 5) { // Limit to 5 flood zones for demo
        const newZone = generateRandomFloodZone();
        setFloodZones(prev => [...prev, newZone]);
      } else {
        clearInterval(interval);
        setSimulationActive(false);
      }
    }, 3000);
  };

  const generateRandomFloodZone = () => {
    // Generate random coordinates near current route
    return Array.from({ length: 4 }, () => [
      start[0] + (Math.random() - 0.5) * 0.01,
      start[1] + (Math.random() - 0.5) * 0.01
    ]);
  };


  // Map initialization
  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        new VectorLayer({ source: markerSource.current }),
        new VectorLayer({ 
          source: floodZoneSource.current,
          style: new Style({
            stroke: new Stroke({ color: 'rgba(0, 0, 255, 1.0)', width: 2 }),
            fill: new Fill({ color: 'rgba(0, 0, 255, 0.3)' })
          })
        }),
        new VectorLayer({
          source: routeSource.current,
          style: new Style({
            stroke: new Stroke({ color: '#2196F3', width: 4 })
          })
        })
      ],
      view: new View({
        center: [72.8777, 19.0760],
        zoom: 13,
        projection: 'EPSG:4326'
      }),
    });

    setMap(initialMap);
    return () => initialMap.setTarget(undefined);
  }, []);

  // Flood zone drawing interaction
  useEffect(() => {
    if (!map || !isDrawingFloodZone) return;

    const draw = new Draw({
      source: floodZoneSource.current,
      type: 'Polygon'
    });

    draw.on('drawend', (event) => {
      const geometry = event.feature.getGeometry();
      const coords = geometry.getCoordinates()[0]
        .map(coord => [coord[1], coord[0]]);
      
      setFloodZones(prev => [...prev, coords]);
    });

    map.addInteraction(draw);
    return () => map.removeInteraction(draw);
  }, [map, isDrawingFloodZone]);

  // Map click handler
  useEffect(() => {
    if (!map || isDrawingFloodZone) return;

    const handler = e => {
      const coord = transform(e.coordinate, map.getView().getProjection(), 'EPSG:4326');
      if (!start) setStart(coord);
      else if (!end) setEnd(coord);
    };

    map.on('click', handler);
    return () => map.un('click', handler);
  }, [map, start, end, isDrawingFloodZone]);

  // Update markers
  useEffect(() => {
    markerSource.current.clear();
    if (start) addMarker(start, 'start');
    if (end) addMarker(end, 'end');
  }, [start, end]);

  // Update route
  useEffect(() => {
    routeSource.current.clear();
    if (routeCoords.length > 0) {
      const line = new LineString(routeCoords.map(coord => [coord[1], coord[0]]));
      const feature = new Feature({ geometry: line });
      
      const routeStyle = new Style({
        stroke: new Stroke({
          color: safetyStatus === 'safe' ? '#000000' : 
                 safetyStatus === 'warning' ? '#FFC107' : '#F44336',
          width: 4,
          lineDash: safetyStatus !== 'safe' ? [10, 5] : undefined
        })
      });

      feature.setStyle(routeStyle);
      routeSource.current.addFeature(feature);
    }
  }, [routeCoords, safetyStatus]);

  // Emergency shelters layer
  
  const addMarker = (coord, type) => {
    const feature = new Feature({
      geometry: new Point(transform(coord, 'EPSG:4326', map.getView().getProjection()))
    });

    feature.setStyle(new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({ color: type === 'start' ? '#4CAF50' : '#F44336' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      })
    }));

    markerSource.current.addFeature(feature);
  };

  // Enhanced route calculation
  const calculateRoute = async () => {
    if (!start || !end) return;

    setIsLoading(true);
    try {
      const { data } = await axios.post('http://127.0.0.1:5000/api/route', {
        start: [start[1], start[0]],
        end: [end[1], end[0]],
        flood_zones: floodZones
      });

      const calculatedTime = (parseFloat(data.distance) / averageSpeed * 60).toFixed(1);
      
      setRouteCoords(data.route);
      setSafetyStatus( 'safe');
      setRouteStats({
        distance: data.distance,
        waypoints: data.route.length,
        avoidedZones: floodZones.length,
        safety: 'safe' || data.safety_status,
        time: `${calculatedTime} mins`,
        elevation: data.elevation || '0m', // Mock elevation data
        complexity: data.complexity || 'Medium' // Mock complexity
      });

      setRouteHistory(prev => [...prev.slice(-2), data.route]);
      setTotalFloodedArea(floodZones.length * 0.25); // Mock area calculation

    } catch (error) {
      alert(error.response?.data?.error || 'Route calculation failed');
    }
    setIsLoading(false);
  };

  const resetMap = () => {
    setStart(null);
    setEnd(null);
    setRouteCoords([]);
    setFloodZones([]);
    floodZoneSource.current.clear();
    emergencyLayers.forEach(layer => map.removeLayer(layer));
  };

  // const handle1 = (e) =>{

  // }

  return (
    <div className="map-container">
      {/* Map Section */}
    <div className="map-content" ref={mapRef} />
    
    {/* Controls and Stats Section */}
    <div className="controls-wrapper">
      <div className="controls">
        <button onClick={calculateRoute} disabled={!start || !end}>
          {isLoading ? '🚀 Calculating...' : '📍 Calculate Route'}
        </button>
        <button onClick={resetMap}>🔄 Reset Map</button>
        <button onClick={() => setIsDrawingFloodZone(!isDrawingFloodZone)}>
          {isDrawingFloodZone ? '🛑 Stop Drawing' : '🌊 Draw Flood Zones'}
        </button>
      </div>

        <div className="status-overview">
          <div className="status-item">
            <span className="status-label">Flood Zones:</span>
            <span className="status-value">{floodZones.length}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Flooded Area:</span>
            <span className="status-value">{totalFloodedArea} km²</span>
          </div>
        </div>
      </div>

      {routeStats && (
        <div className={`stats-panel ${safetyStatus}`}>
          <h3>🚦 Route Statistics</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">📏 Distance:</span>
              <span className="stat-value">{routeStats.distance}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🕒 Estimated Time:</span>
              <span className="stat-value">{routeStats.time}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">📍 Waypoints:</span>
              <span className="stat-value">{routeStats.waypoints}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🚫 Avoided Zones:</span>
              <span className="stat-value">{routeStats.avoidedZones}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🏔️ Elevation:</span>
              <span className="stat-value">{routeStats.elevation}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">📈 Route Complexity:</span>
              <span className="stat-value">{routeStats.complexity}</span>
            </div>
          </div>
          <div className="stat-item safety-indicator">
            Safety Status: <span className="status">{routeStats.safety}</span>
          </div>
        </div>
      )}

{/* <input type="text" onChange={handle1} placeholder='lat'/>
<input type="text" onChange={handle1} placeholder='lon'/> */}


      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Finding safest route...</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;