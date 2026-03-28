import React from 'react';

export interface RestroomFilters {
  openNow: boolean;
  accessibleOnly: boolean;
  radiusMetres: number;
}

interface RestroomFilterProps {
  filters: RestroomFilters;
  onChange: (filters: RestroomFilters) => void;
}

export default function RestroomFilter({ filters, onChange }: RestroomFilterProps) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={filters.openNow}
          onChange={(e) => onChange({ ...filters, openNow: e.target.checked })}
        />
        Open now
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={filters.accessibleOnly}
          onChange={(e) => onChange({ ...filters, accessibleOnly: e.target.checked })}
        />
        Accessible only
      </label>
      <label className="flex flex-col gap-1">
        Radius: {filters.radiusMetres}m
        <input
          type="range"
          min={100}
          max={2000}
          step={100}
          value={filters.radiusMetres}
          onChange={(e) => onChange({ ...filters, radiusMetres: Number(e.target.value) })}
        />
      </label>
    </div>
  );
}
