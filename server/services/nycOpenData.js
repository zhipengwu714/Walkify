const RESTROOMS_URL =
  'https://data.cityofnewyork.us/resource/vzrx-zg6z.json';

const PEDESTRIAN_COUNTS_URL =
  'https://data.cityofnewyork.us/resource/2de2-6x2h.json';

// Fetches city-operated restrooms near lat/lng within radius metres.
export async function queryNycRestrooms({ lat, lng, radius }) {
  const url = new URL(RESTROOMS_URL);
  url.searchParams.set('$limit', '50');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`NYC Open Data error: ${res.status}`);

  const rows = await res.json();

  return rows
    .map((row) => {
      const rLat = Number(row.latitude);
      const rLng = Number(row.longitude);
      if (!rLat || !rLng) return null;
      return {
        id: `nyc-${row.uid ?? row.facilityname}`,
        name: row.facilityname ?? 'NYC Public Restroom',
        source: 'nyc-open-data',
        lat: rLat,
        lng: rLng,
        accessible: row.accessible === 'Y',
        openNow: null,
        hours: row.hours_of_operation ?? 'Unknown',
        distanceMetres: haversine(lat, lng, rLat, rLng),
      };
    })
    .filter((r) => r && r.distanceMetres <= radius);
}

// Returns the latest bi-annual pedestrian counts for baseline crowd estimates.
export async function getPedestrianCounts() {
  const res = await fetch(`${PEDESTRIAN_COUNTS_URL}?$limit=200`);
  if (!res.ok) throw new Error(`NYC Open Data error: ${res.status}`);
  return res.json();
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
