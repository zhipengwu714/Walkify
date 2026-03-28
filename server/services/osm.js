const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Queries OpenStreetMap Overpass for restrooms within radius metres of lat/lng.
export async function queryRestrooms({ lat, lng, radius }) {
  const query = `
    [out:json][timeout:10];
    node["amenity"="toilets"](around:${radius},${lat},${lng});
    out body;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!res.ok) throw new Error(`Overpass error: ${res.status}`);

  const data = await res.json();

  return data.elements.map((el) => ({
    id: `osm-${el.id}`,
    name: el.tags?.name ?? 'Public Restroom',
    source: 'openstreetmap',
    lat: el.lat,
    lng: el.lon,
    accessible: el.tags?.wheelchair === 'yes',
    openNow: null, // OSM does not reliably provide open status
    hours: el.tags?.opening_hours ?? 'Unknown',
    distanceMetres: haversine(lat, lng, el.lat, el.lon),
  }));
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
