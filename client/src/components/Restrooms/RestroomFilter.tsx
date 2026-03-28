import React from 'react';

export interface RestroomFilters {
  openNow: boolean;
  accessibleOnly: boolean;
  radiusMetres: number;
}

const RADIUS_PRESETS = [250, 500, 1000, 2000] as const;

interface RestroomFilterProps {
  filters: RestroomFilters;
  onChange: (filters: RestroomFilters) => void;
}

export default function RestroomFilter({ filters, onChange }: RestroomFilterProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Radius presets */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Radius</p>
        <div className="flex gap-1.5">
          {RADIUS_PRESETS.map((r) => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, radiusMetres: r })}
              className={`flex-1 py-1 rounded text-xs font-medium border transition-colors ${
                filters.radiusMetres === r
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-400'
              }`}
            >
              {r < 1000 ? `${r}m` : `${r / 1000}km`}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-3">
        <button
          onClick={() => onChange({ ...filters, openNow: !filters.openNow })}
          className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${
            filters.openNow
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
          }`}
        >
          Open now
        </button>
        <button
          onClick={() => onChange({ ...filters, accessibleOnly: !filters.accessibleOnly })}
          className={`flex-1 py-1.5 rounded text-xs font-medium border transition-colors ${
            filters.accessibleOnly
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
          }`}
        >
          Accessible
        </button>
      </div>
    </div>
  );
}
