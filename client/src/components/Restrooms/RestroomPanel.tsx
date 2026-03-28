import React, { useState } from 'react';
import RestroomFilter, { RestroomFilters } from './RestroomFilter';
import { useRestrooms } from '../../hooks/useRestrooms';

interface RestroomPanelProps {
  lat: number;
  lng: number;
}

export default function RestroomPanel({ lat, lng }: RestroomPanelProps) {
  const [filters, setFilters] = useState<RestroomFilters>({
    openNow: false,
    accessibleOnly: false,
    radiusMetres: 500,
  });

  const { restrooms, loading } = useRestrooms({ lat, lng, ...filters });

  return (
    <div className="bg-white rounded-lg shadow p-3 w-64 flex flex-col gap-3">
      <h2 className="font-semibold text-sm">Nearby Restrooms</h2>
      <RestroomFilter filters={filters} onChange={setFilters} />
      {loading && <p className="text-xs text-gray-500">Loading...</p>}
      <ul className="flex flex-col gap-2">
        {restrooms.map((r) => (
          <li key={r.id} className="text-xs border-t pt-2">
            <p className="font-medium">{r.name}</p>
            <p className="text-gray-500">{r.distanceMetres}m · {r.hours}</p>
            {r.accessible && <span className="text-purple-600">Accessible</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
