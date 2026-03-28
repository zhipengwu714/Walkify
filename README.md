# Walkify

> Navigate your city differently — beat the crowds by day, stay safe by night.

---

## Overview

Walkify is a browser-based navigation tool for pedestrians. It operates in two distinct modes, each answering a different question:

**Day mode** — *Where are people right now, and how do I route around them?*
Crowd density is something to avoid. Walkify surfaces live and predicted foot traffic by area, helping you find quieter routes through busy cities — useful for commuters, tourists, and anyone who'd rather not fight through a packed street market.

**Night mode** — *Which route home is actually safe?*
The logic inverts. At night, some foot traffic is a good sign. Walkify combines incident history, street lighting, and moderate pedestrian activity to score and recommend routes that are genuinely safer — not just quieter.

Both modes share a restroom layer, surfacing publicly accessible bathrooms nearby with hours, accessibility status, and distance.

> **Status:** Pre-development. This README documents the intended architecture and feature scope. No working codebase exists yet.

---

## Table of Contents

- [The Core Idea](#the-core-idea)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Data Sources](#data-sources)
- [Data Source Notes](#data-source-notes)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## The Core Idea

Day mode and night mode use the same underlying foot traffic data but treat it oppositely:

|  | Day Mode | Night Mode |
|---|---|---|
| High foot traffic | ⚠️ Avoid — crowded | ✅ Good — eyes on the street |
| Low foot traffic | ✅ Good — quiet route | ⚠️ Caution — isolated |
| Incident history | Not weighted | Heavily weighted |
| Street lighting | Not weighted | Weighted |

This inversion is intentional. The app doesn't just dim the map at night — it fundamentally rethinks what a "good route" means depending on the time of day.

---

## Features

### Day Mode — Crowd Routing

- Live and predicted heatmap of pedestrian density by area
- Route planner that weights streets by busyness — finds the least-congested path between two points
- Time-of-day slider to preview expected crowd patterns before you leave
- Venue-level busyness signals for parks, transit hubs, markets, and retail corridors
- **Data sources:** BestTime.app, NYC Open Data pedestrian counts, Google Popular Times

### Night Mode — Safety Routing

- Safety score per route segment, combining:
  - Incident history (crime/assault reports by location and time of day)
  - Street lighting coverage
  - Foot traffic as a *positive* signal — moderate activity means eyes on the street
- Routes ranked by safety score, not just distance
- Clear visual distinction between well-scored and flagged segments
- **Data sources:** NYPD CompStat open data, NYC streetlight dataset, foot traffic APIs

### Restroom Finder — Both Modes

- Pin layer showing publicly accessible restrooms within a configurable radius
- Each pin includes:
  - Opening hours
  - ADA / step-free accessibility status
  - Last verified date
- Filters: open now, accessible only, distance radius
- **Data sources:** OpenStreetMap Overpass API, NYC Open Data public restrooms, Google Places API (fallback for private businesses)

> **Known limitation:** No single data source covers all publicly accessible restrooms. NYC Open Data covers city-operated facilities only. OpenStreetMap fills in some gaps but private-business bathrooms (cafes, restaurants, etc.) are inconsistently mapped. This is a known limitation of the current approach.

---

## Tech Stack

| Layer | Proposed Choice | Notes |
|---|---|---|
| Frontend | React + TypeScript | Component-driven, strong typing for map state |
| Map engine | Mapbox GL JS | Preferred for heatmap layer and custom route styling |
| Styling | Tailwind CSS | Utility-first, responsive map UI |
| Backend / API | Node.js + Express | REST API for data aggregation and caching |
| Database | PostgreSQL + PostGIS | Geospatial queries for route scoring and restroom proximity |
| Hosting | Vercel (frontend) + Railway (backend) | Low-ops for early stage |

> Stack is not finalised. Contributions proposing alternatives are welcome — see [Contributing](#contributing).

---

## Data Sources

| Feature | Source | Cost | Status |
|---|---|---|---|
| Live crowd / venue busyness | [BestTime.app API](https://besttime.app/) | Free tier available | Planned |
| Pedestrian corridor counts | [NYC Open Data](https://data.cityofnewyork.us/Transportation/Bi-Annual-Pedestrian-Counts/2de2-6x2h) | Free | Planned |
| Venue popular times | Google Popular Times via [Outscraper](https://outscraper.com/) | Free tier available | Planned |
| Public restrooms (city-operated) | [NYC Open Data](https://data.cityofnewyork.us/City-Government/Public-Restrooms-Operational-/vzrx-zg6z) | Free | Planned |
| Public restrooms (general) | [OpenStreetMap Overpass API](https://overpass-api.de/) | Free | Planned |
| Restroom hours & access | [Google Places API](https://developers.google.com/maps/documentation/places/web-service) | Free tier available | Planned |
| Night incident history | [NYPD CompStat open data](https://compstat.nypdonline.org/) | Free | Research stage |
| Street lighting | [NYC Open Data streetlight dataset](https://data.cityofnewyork.us/) | Free | Research stage |

> All primary data sources are free or have a usable free tier.

---

## Data Source Notes

### Crowd Density
BestTime.app provides hourly venue-level busyness (0–100%) updated hourly. Live data requires the paid plan; forecast data (historical patterns by hour and day) is available on the free tier and sufficient for route planning. NYC Open Data pedestrian counts cover 114 fixed corridor locations updated bi-annually — useful for baseline patterns, not real-time conditions.

### Restrooms
No single source covers all publicly accessible restrooms. The current plan layers three sources:
1. **NYC Open Data** — authoritative for city-operated facilities (parks, libraries, transit)
2. **OpenStreetMap** — community-mapped, covers some cafes and businesses but inconsistently
3. **Google Places API** — fallback for hours and access details on private businesses

Private businesses that allow public restroom use are not systematically tracked anywhere. This is a hard data gap, not a solvable engineering problem with current sources.

### Night Safety Scoring
NYPD CompStat data is incident-level and public. Translating raw incident counts into a per-route safety score requires care — incidents without population or exposure weighting can produce misleading results (a busy block naturally has more reported incidents). The scoring methodology will be documented separately in [`docs/scoring.md`](docs/scoring.md) before implementation begins.

### A Note on "Safety"
Crowd density and safety are not the same thing. A busy area at night is not automatically safe, and a quiet area is not automatically dangerous. This app surfaces data to inform decisions — it does not make safety guarantees. Scoring models will be documented transparently so users understand what they're seeing.

---

## Project Structure

```
walkify/
├── client/                        # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/               # Heatmap, route layer, restroom pins
│   │   │   │   ├── HeatmapLayer.tsx
│   │   │   │   ├── RouteLayer.tsx
│   │   │   │   └── RestroomPins.tsx
│   │   │   ├── Restrooms/         # Restroom finder UI and filters
│   │   │   │   ├── RestroomPanel.tsx
│   │   │   │   └── RestroomFilter.tsx
│   │   │   └── Controls/          # Mode toggle, time slider, route input
│   │   │       ├── ModeToggle.tsx
│   │   │       ├── TimeSlider.tsx
│   │   │       └── RouteInput.tsx
│   │   ├── hooks/
│   │   │   ├── useGeolocation.ts  # Current position
│   │   │   ├── useMapMode.ts      # Day / night mode state
│   │   │   └── useRestrooms.ts    # Restroom data fetching
│   │   ├── utils/
│   │   │   ├── api.ts             # API call wrappers
│   │   │   ├── scoring.ts         # Client-side score display logic
│   │   │   └── formatting.ts      # Data formatting helpers
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── index.html
│
├── server/                        # Node.js + Express backend
│   ├── index.js                   # Entry point
│   ├── routes/
│   │   ├── restrooms.js           # Restroom data endpoints
│   │   ├── crowd.js               # Crowd density endpoints
│   │   └── route.js               # Route scoring endpoints
│   ├── services/
│   │   ├── besttime.js            # BestTime.app integration
│   │   ├── osm.js                 # OpenStreetMap Overpass integration
│   │   ├── nycOpenData.js         # NYC Open Data integrations
│   │   └── compstat.js            # NYPD CompStat integration
│   └── db/
│       ├── migrations/            # PostGIS schema migrations
│       └── queries/               # Geospatial query helpers
│
├── docs/
│   └── scoring.md                 # Safety and crowd scoring methodology
│
├── .env.example
├── package.json
└── README.md
```

---

## API Endpoints (Planned)

### Crowd

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/crowd/heatmap` | Crowd density grid for a bounding box |
| `GET` | `/api/crowd/forecast` | Hourly crowd forecast for a location |

#### `GET /api/crowd/heatmap` — Query Params
```
?lat=40.7128&lng=-74.0060&radius=1000&mode=day
```

#### Response
```json
{
  "mode": "day",
  "timestamp": "2026-03-28T14:00:00Z",
  "cells": [
    { "lat": 40.714, "lng": -74.005, "density": 0.82 },
    { "lat": 40.715, "lng": -74.004, "density": 0.41 }
  ]
}
```

---

### Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/route/day` | Crowd-avoiding route between two points |
| `POST` | `/api/route/night` | Safety-scored route between two points |

#### `POST /api/route/night` — Request Body
```json
{
  "origin": { "lat": 40.7128, "lng": -74.0060 },
  "destination": { "lat": 40.7282, "lng": -73.9942 },
  "departureTime": "2026-03-28T22:30:00Z"
}
```

#### Response
```json
{
  "route": {
    "segments": [
      {
        "from": { "lat": 40.7128, "lng": -74.0060 },
        "to": { "lat": 40.7200, "lng": -74.0010 },
        "safetyScore": 0.87,
        "flags": ["well-lit", "moderate-traffic"]
      }
    ],
    "overallScore": 0.83,
    "distanceMetres": 1840,
    "estimatedMinutes": 22
  }
}
```

---

### Restrooms

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/restrooms` | Restrooms near a location |

#### `GET /api/restrooms` — Query Params
```
?lat=40.7128&lng=-74.0060&radius=500&accessible=true&openNow=true
```

#### Response
```json
{
  "restrooms": [
    {
      "id": "osm-123456",
      "name": "Bryant Park Public Restroom",
      "source": "nyc-open-data",
      "lat": 40.7536,
      "lng": -73.9832,
      "distanceMetres": 210,
      "accessible": true,
      "openNow": true,
      "hours": "07:00–23:00",
      "lastVerified": "2025-11-08"
    }
  ]
}
```

---

## Roadmap

### Phase 1 — Foundation
- [ ] Base map with day/night mode toggle
- [ ] Restroom pin layer from OpenStreetMap + NYC Open Data
- [ ] Basic crowd heatmap from NYC Open Data pedestrian counts
- [ ] Geolocation and map centering

### Phase 2 — Day Mode
- [ ] BestTime.app integration for live venue busyness
- [ ] Crowd-weighted route planner
- [ ] Time-of-day slider for forecast patterns
- [ ] Heatmap updates on slider change

### Phase 3 — Night Mode
- [ ] NYPD CompStat data pipeline
- [ ] Street lighting dataset integration
- [ ] Safety scoring model per route segment (see `docs/scoring.md`)
- [ ] Night route planner with scored overlays
- [ ] Segment-level flag display (well-lit, isolated, etc.)

### Phase 4 — Polish
- [ ] Responsive mobile layout
- [ ] PWA support with offline restroom cache
- [ ] Restroom data freshness indicators
- [ ] Multi-city support beyond NYC

---

## Getting Started

> No working codebase yet. This section will be updated once an initial scaffold exists.

```bash
# Clone the repo
git clone https://github.com/walkify/walkify.git
cd walkify

# Install dependencies (root, client, and server)
npm install
cd client && npm install
cd ../server && npm install

# Set up environment variables
cp .env.example .env
# Fill in your API keys — see Environment Variables below

# Run client and server concurrently from root
npm run dev
```

---

## Environment Variables

```bash
# .env

# Map rendering
MAPBOX_ACCESS_TOKEN=

# Restroom hours and fallback place data
GOOGLE_PLACES_API_KEY=

# Crowd / venue busyness
BESTTIME_API_KEY=

# Database
DATABASE_URL=
```

Copy `.env.example` to `.env` and fill in values before running locally. Never commit `.env` to version control.

---

## Contributing

Contributions are welcome, particularly around data sourcing, scoring methodology, and city-specific integrations. Please open an issue to discuss before submitting a pull request.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes with a clear message
4. Open a pull request with a description of what changed and why

Code style is enforced via ESLint and Prettier (config to be added in Phase 1). Please ensure your code passes linting before submitting.

### Good first issues (planned)
- Set up base Mapbox map component
- Build OpenStreetMap Overpass query for restroom pins
- Design day/night mode toggle UI
- Research and document safety scoring methodology

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

- [OpenStreetMap](https://www.openstreetmap.org/) contributors for restroom and map data
- [Mapbox](https://www.mapbox.com/) for map rendering
- [BestTime.app](https://besttime.app/) for foot traffic forecasting
- [NYPD](https://www.nyc.gov/site/nypd/stats/crime-statistics/compstat.page) for open CompStat crime data
- [NYC Open Data](https://opendata.cityofnewyork.us/) for pedestrian counts, restroom locations, and streetlight data
