// NYPD CompStat open data integration.
// Incident data is used for night-mode safety scoring.
// Scoring methodology: see docs/scoring.md

const COMPLAINT_URL = 'https://data.cityofnewyork.us/resource/5uac-w243.json';

// Fetches recent felony complaints near a bounding box for safety scoring.
// Returns raw incident records — scoring happens in route.js.
export async function getIncidentsNear({ lat, lng, radiusKm = 1, limit = 500 }) {
  // NYC Open Data supports simple bounding box queries via $where
  const delta = radiusKm / 111; // rough degrees per km
  const where = `latitude > '${lat - delta}' AND latitude < '${lat + delta}' AND longitude > '${lng - delta}' AND longitude < '${lng + delta}'`;

  const url = new URL(COMPLAINT_URL);
  url.searchParams.set('$where', where);
  url.searchParams.set('$limit', String(limit));
  url.searchParams.set('$order', 'cmplnt_fr_dt DESC');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`CompStat error: ${res.status}`);
  return res.json();
}
