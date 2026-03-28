import React, { useState } from 'react';
import { fetchRoute } from '../../utils/api';
import type { RouteSegment } from '../../types/route';

interface RouteInputProps {
  mode: 'day' | 'night';
  onRouteCalculated: (segments: RouteSegment[]) => void;
}

export default function RouteInput({ mode, onRouteCalculated }: RouteInputProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const originCoords = await geocode(origin);
      const destCoords = await geocode(destination);

      if (!originCoords || !destCoords) {
        setError('Could not find one or both locations.');
        setLoading(false);
        return;
      }

      const data = await fetchRoute(originCoords, destCoords, mode);

      if (data.route?.segments) {
        onRouteCalculated(data.route.segments);
      } else {
        setError('No walking route found.');
      }
    } catch {
      setError('Route calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOrigin('');
    setDestination('');
    setError(null);
    onRouteCalculated([]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-3 flex flex-col gap-2 w-56">
      <input
        className="border rounded px-2 py-1 text-sm"
        placeholder="From (e.g. Times Square)"
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
      />
      <input
        className="border rounded px-2 py-1 text-sm"
        placeholder="To (e.g. Central Park)"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-purple-600 text-white rounded px-3 py-1 text-sm disabled:opacity-50"
        >
          {loading ? 'Finding...' : mode === 'night' ? 'Safe Route' : 'Get Route'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-2 py-1 text-sm text-gray-500 border rounded hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </form>
  );
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  // Use Nominatim (free, no API key) with NYC bias
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', New York City')}&limit=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Walkify/1.0' },
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data[0]) return null;

  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}
