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

export function fetchRestrooms(params: {
  lat: number; lng: number; radius: number; openNow: boolean; accessible: boolean;
}) {
  return get<any[]>('/api/restrooms', params).then((data: any) => data.restrooms ?? []);
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
