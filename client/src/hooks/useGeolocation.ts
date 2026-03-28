import { useState, useEffect } from 'react';

interface Position {
  lat: number;
  lng: number;
}

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message)
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { position, error };
}
