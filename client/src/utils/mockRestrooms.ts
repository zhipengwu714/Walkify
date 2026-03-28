import type { Restroom } from '../types/restroom';

// Real NYC public restrooms used as fallback when OSM/backend is unavailable.
export const MOCK_RESTROOMS: Restroom[] = [
  {
    id: 'mock-1',
    name: 'Bryant Park Public Restroom',
    source: 'nyc-open-data',
    lat: 40.7536, lng: -73.9832,
    distanceMetres: 0,
    accessible: true,
    openNow: true,
    hours: '07:00–23:00',
    lastVerified: '2025-11-01',
  },
  {
    id: 'mock-2',
    name: 'Madison Square Park Restroom',
    source: 'nyc-open-data',
    lat: 40.7425, lng: -73.9878,
    distanceMetres: 0,
    accessible: true,
    openNow: true,
    hours: '06:00–22:00',
    lastVerified: '2025-10-15',
  },
  {
    id: 'mock-3',
    name: 'Washington Square Park Restroom',
    source: 'nyc-open-data',
    lat: 40.7308, lng: -74.0006,
    distanceMetres: 0,
    accessible: false,
    openNow: true,
    hours: '06:00–22:00',
    lastVerified: '2025-09-20',
  },
  {
    id: 'mock-4',
    name: 'Central Park — 72nd St Restroom',
    source: 'nyc-open-data',
    lat: 40.7727, lng: -73.9748,
    distanceMetres: 0,
    accessible: true,
    openNow: true,
    hours: '08:00–20:00',
    lastVerified: '2025-11-05',
  },
  {
    id: 'mock-5',
    name: 'Battery Park Restroom',
    source: 'nyc-open-data',
    lat: 40.7033, lng: -74.0170,
    distanceMetres: 0,
    accessible: true,
    openNow: true,
    hours: '07:00–21:00',
    lastVerified: '2025-10-01',
  },
  {
    id: 'mock-6',
    name: 'Grand Central Terminal Restroom',
    source: 'nyc-open-data',
    lat: 40.7527, lng: -73.9772,
    distanceMetres: 0,
    accessible: true,
    openNow: true,
    hours: '05:30–01:30',
    lastVerified: '2025-11-10',
  },
  {
    id: 'mock-7',
    name: 'Union Square Park Restroom',
    source: 'nyc-open-data',
    lat: 40.7359, lng: -73.9906,
    distanceMetres: 0,
    accessible: false,
    openNow: true,
    hours: '06:00–22:00',
    lastVerified: '2025-09-01',
  },
  {
    id: 'mock-8',
    name: 'Riverside Park — 72nd St',
    source: 'nyc-open-data',
    lat: 40.7790, lng: -73.9890,
    distanceMetres: 0,
    accessible: true,
    openNow: null,
    hours: 'Dawn to dusk',
    lastVerified: '2025-08-15',
  },
];

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function getMockRestrooms(lat: number, lng: number, radiusMetres: number): Restroom[] {
  return MOCK_RESTROOMS
    .map((r) => ({ ...r, distanceMetres: haversine(lat, lng, r.lat, r.lng) }))
    .filter((r) => r.distanceMetres <= radiusMetres)
    .sort((a, b) => a.distanceMetres - b.distanceMetres);
}
