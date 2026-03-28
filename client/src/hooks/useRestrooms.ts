import { useState, useEffect, useRef } from 'react';
import { fetchRestrooms } from '../utils/api';
import type { Restroom } from '../types/restroom';

interface UseRestroomsParams {
  lat: number;
  lng: number;
  radiusMetres: number;
  openNow: boolean;
  accessibleOnly: boolean;
}

export function useRestrooms({ lat, lng, radiusMetres, openNow, accessibleOnly }: UseRestroomsParams) {
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!lat || !lng) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    fetchRestrooms({ lat, lng, radius: radiusMetres, openNow, accessible: accessibleOnly })
      .then((data) => {
        setRestrooms(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError('Failed to load restrooms. Check your connection.');
        setLoading(false);
      });

    return () => abortRef.current?.abort();
  }, [lat, lng, radiusMetres, openNow, accessibleOnly]);

  return { restrooms, loading, error };
}
