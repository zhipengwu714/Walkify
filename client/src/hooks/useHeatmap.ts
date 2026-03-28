import { useState, useEffect } from 'react';
import { getMockDensityPoints, type DensityPoint } from '../utils/mockDensity';

interface UseHeatmapParams {
  lat: number;
  lng: number;
  radius: number;
  hour: number;
  mode: 'day' | 'night';
  enabled: boolean;
}

export function useHeatmap({ lat, lng, radius, hour, mode, enabled }: UseHeatmapParams) {
  const [points, setPoints] = useState<DensityPoint[]>([]);

  useEffect(() => {
    if (!enabled) {
      setPoints([]);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
        const url = new URL('http://localhost:3001/api/crowd/heatmap');
        url.searchParams.set('lat', String(lat));
        url.searchParams.set('lng', String(lng));
        url.searchParams.set('radius', String(radius));
        url.searchParams.set('mode', mode);

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.cells?.length > 0) {
            setPoints(data.cells.map((c: any) => ({
              lat: c.lat,
              lng: c.lng,
              density: c.density,
            })));
            return;
          }
        }
      } catch { /* backend not running */ }

      // Fallback to mock density
      if (!cancelled) {
        setPoints(getMockDensityPoints(hour));
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [lat, lng, radius, hour, mode, enabled]);

  return { points };
}
