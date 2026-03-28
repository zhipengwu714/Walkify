import React from 'react';
import type { Restroom } from '../../types/restroom';
import { formatDistance } from '../../utils/formatting';

interface RestroomDetailCardProps {
  restroom: Restroom;
  onBack: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  'openstreetmap': 'OpenStreetMap',
  'nyc-open-data': 'NYC Open Data',
};

function formatVerifiedDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function RestroomDetailCard({ restroom, onBack }: RestroomDetailCardProps) {
  const openLabel =
    restroom.openNow === true ? 'Open now' :
    restroom.openNow === false ? 'Closed' :
    'Hours unknown';

  const openColor =
    restroom.openNow === true ? 'text-green-600 bg-green-50' :
    restroom.openNow === false ? 'text-red-600 bg-red-50' :
    'text-gray-500 bg-gray-50';

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-2">
        <button
          onClick={onBack}
          className="mt-0.5 p-1 rounded hover:bg-gray-100 text-gray-500 shrink-0"
          aria-label="Back to list"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-semibold text-sm leading-snug">{restroom.name}</h2>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
          {formatDistance(restroom.distanceMetres)}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${openColor}`}>
          {openLabel}
        </span>
        {restroom.accessible && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
            Accessible
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2 text-sm">
        <DetailRow label="Hours" value={restroom.hours || 'Unknown'} />
        <DetailRow label="Last verified" value={formatVerifiedDate(restroom.lastVerified)} />
        <DetailRow label="Source" value={SOURCE_LABELS[restroom.source] ?? restroom.source} />
      </div>

      {/* Data gap note */}
      {restroom.source === 'openstreetmap' && (
        <p className="text-xs text-gray-400 leading-relaxed border-t pt-3">
          Hours and open status from OpenStreetMap may be outdated. Verify before visiting.
        </p>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-800 text-right">{value}</span>
    </div>
  );
}
