import type { Restroom } from '../types/restroom';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export async function fetchRestroomsFromOSM(params: {
  lat: number;
  lng: number;
  radius: number;
  accessible: boolean;
}): Promise<Restroom[]> {
  const { lat, lng, radius, accessible } = params;

  const accessibleFilter = accessible ? '["wheelchair"="yes"]' : '';
  const query = `
    [out:json][timeout:15];
    node["amenity"="toilets"]${accessibleFilter}(around:${radius},${lat},${lng});
    out body;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);

  const data = await res.json();

  return (data.elements as any[]).map((el) => ({
    id: `osm-${el.id}`,
    name: el.tags?.name ?? el.tags?.description ?? 'Public Restroom',
    source: 'openstreetmap',
    lat: el.lat,
    lng: el.lon,
    distanceMetres: haversine(lat, lng, el.lat, el.lon),
    accessible: el.tags?.wheelchair === 'yes',
    openNow: null,
    hours: el.tags?.opening_hours ?? 'Unknown',
    lastVerified: null,
  }));
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
