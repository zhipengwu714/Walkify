const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function get<T>(path: string, params: Record<string, string | number | boolean>): Promise<T> {
  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE_URL + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchRestrooms(params: {
  lat: number; lng: number; radius: number; openNow: boolean; accessible: boolean;
}) {
  // 1. Try backend
  try {
    const data: any = await get('/api/restrooms', params);
    return data.restrooms ?? [];
  } catch { /* backend not running */ }

  // 2. Try OSM directly with a 6s timeout
  try {
    const { fetchRestroomsFromOSM } = await import('./osm');
    const result = await Promise.race([
      fetchRestroomsFromOSM(params),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('OSM timeout')), 6000)
      ),
    ]);
    return result;
  } catch { /* OSM unavailable or slow */ }

  // 3. Fallback: hardcoded mock data so the UI always shows something
  const { getMockRestrooms } = await import('./mockRestrooms');
  return getMockRestrooms(params.lat, params.lng, params.radius);
}

export function fetchHeatmap(params: { lat: number; lng: number; radius: number; mode: string }) {
  return get<any>('/api/crowd/heatmap', params);
}

export function fetchDayRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  return post<any>('/api/route/day', { origin, destination });
}

export function fetchNightRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  departureTime: string
) {
  return post<any>('/api/route/night', { origin, destination, departureTime });
}
