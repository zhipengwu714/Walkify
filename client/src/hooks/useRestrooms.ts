import { useState, useEffect } from 'react';
import { fetchRestrooms } from '../utils/api';

interface Restroom {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceMetres: number;
  accessible: boolean;
  openNow: boolean;
  hours: string;
}

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

  useEffect(() => {
    setLoading(true);
    fetchRestrooms({ lat, lng, radius: radiusMetres, openNow, accessible: accessibleOnly })
      .then(setRestrooms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lat, lng, radiusMetres, openNow, accessibleOnly]);

  return { restrooms, loading };
}
