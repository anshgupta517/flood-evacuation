# Backend Server

This is the backend server for the Flood Emergency System (FES). It provides routing capabilities while taking into account flood zones.

## Setup

1. Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Server

Start the server with:

```bash
python server.py
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### POST /api/route

Calculate a route avoiding flood zones.

Request body:

```json
{
    "start": [lat, lng],
    "end": [lat, lng],
    "flood_zones": [[[lat, lng], ...], ...]  // Optional
}
```

Response:

```json
{
    "route": [[lat, lng], ...],
    "distance": "X.XX km",
    "message": "Route calculated successfully!"
}
```
