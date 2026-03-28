import React, { useState } from 'react';
import RestroomFilter, { RestroomFilters } from './RestroomFilter';
import RestroomDetailCard from './RestroomDetailCard';
import { useRestrooms } from '../../hooks/useRestrooms';
import { formatDistance } from '../../utils/formatting';
import type { Restroom } from '../../types/restroom';

interface RestroomPanelProps {
  lat: number;
  lng: number;
  selectedRestroom: Restroom | null;
  onSelect: (restroom: Restroom | null) => void;
}

export default function RestroomPanel({ lat, lng, selectedRestroom, onSelect }: RestroomPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<RestroomFilters>({
    openNow: false,
    accessibleOnly: false,
    radiusMetres: 500,
  });

  const { restrooms, loading, error } = useRestrooms({ lat, lng, ...filters });

  const activeFilterCount = [filters.openNow, filters.accessibleOnly].filter(Boolean).length;

  return (
    <>
      {/* ── Mobile FAB toggle ── */}
      <button
        onClick={() => { setIsOpen((o) => !o); onSelect(null); }}
        className="md:hidden fixed bottom-6 right-4 z-30 w-14 h-14 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center"
        aria-label="Toggle restroom finder"
      >
        <ToiletIcon />
        {restrooms.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-white text-purple-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-purple-200">
            {restrooms.length > 99 ? '99+' : restrooms.length}
          </span>
        )}
      </button>

      {/* ── Mobile bottom sheet ── */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '70vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 2rem)' }}>
          <PanelContent
            restrooms={restrooms}
            loading={loading}
            error={error}
            filters={filters}
            filtersVisible={filtersVisible}
            activeFilterCount={activeFilterCount}
            selectedRestroom={selectedRestroom}
            onFiltersToggle={() => setFiltersVisible((v) => !v)}
            onFiltersChange={setFilters}
            onSelect={onSelect}
          />
        </div>
      </div>

      {/* ── Desktop sidebar ── */}
      <div className="hidden md:flex fixed right-0 top-0 bottom-0 z-20 w-80 bg-white shadow-xl flex-col border-l border-gray-100">
        <PanelContent
          restrooms={restrooms}
          loading={loading}
          error={error}
          filters={filters}
          filtersVisible={filtersVisible}
          activeFilterCount={activeFilterCount}
          selectedRestroom={selectedRestroom}
          onFiltersToggle={() => setFiltersVisible((v) => !v)}
          onFiltersChange={setFilters}
          onSelect={onSelect}
        />
      </div>
    </>
  );
}

// ── Shared panel body ────────────────────────────────────────────

interface PanelContentProps {
  restrooms: Restroom[];
  loading: boolean;
  error: string | null;
  filters: RestroomFilters;
  filtersVisible: boolean;
  activeFilterCount: number;
  selectedRestroom: Restroom | null;
  onFiltersToggle: () => void;
  onFiltersChange: (f: RestroomFilters) => void;
  onSelect: (r: Restroom | null) => void;
}

function PanelContent({
  restrooms, loading, error, filters, filtersVisible, activeFilterCount,
  selectedRestroom, onFiltersToggle, onFiltersChange, onSelect,
}: PanelContentProps) {
  if (selectedRestroom) {
    return (
      <div className="p-4">
        <RestroomDetailCard restroom={selectedRestroom} onBack={() => onSelect(null)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <div>
          <h2 className="font-semibold text-sm">Nearby Restrooms</h2>
          {!loading && !error && (
            <p className="text-xs text-gray-400">{restrooms.length} found</p>
          )}
        </div>
        <button
          onClick={onFiltersToggle}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition-colors ${
            filtersVisible || activeFilterCount > 0
              ? 'border-purple-400 text-purple-700 bg-purple-50'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10M11 20h2" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-0.5 bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters (collapsible) */}
      {filtersVisible && (
        <div className="px-4 pb-3 border-b border-gray-100 shrink-0">
          <RestroomFilter filters={filters} onChange={onFiltersChange} />
        </div>
      )}

      {/* List body */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading && <LoadingSkeleton />}
        {error && <ErrorState message={error} />}
        {!loading && !error && restrooms.length === 0 && <EmptyState />}
        {!loading && !error && restrooms.length > 0 && (
          <ul className="flex flex-col divide-y divide-gray-50">
            {restrooms.map((r) => (
              <RestroomListItem key={r.id} restroom={r} onSelect={onSelect} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── List item ────────────────────────────────────────────────────

function RestroomListItem({ restroom: r, onSelect }: { restroom: Restroom; onSelect: (r: Restroom) => void }) {
  const openLabel =
    r.openNow === true ? { text: 'Open', cls: 'text-green-600' } :
    r.openNow === false ? { text: 'Closed', cls: 'text-red-500' } :
    null;

  return (
    <li>
      <button
        onClick={() => onSelect(r)}
        className="w-full text-left py-3 flex items-start justify-between gap-3 hover:bg-gray-50 rounded-lg -mx-1 px-1 transition-colors"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400">{formatDistance(r.distanceMetres)}</span>
            {openLabel && <span className={`text-xs font-medium ${openLabel.cls}`}>{openLabel.text}</span>}
            {r.accessible && <span className="text-xs text-blue-600">Accessible</span>}
          </div>
          {r.hours && r.hours !== 'Unknown' && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{r.hours}</p>
          )}
        </div>
        <svg className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </li>
  );
}

// ── States ───────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3 pt-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-1.5 py-2">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
      </svg>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <ToiletIcon className="w-8 h-8 text-gray-200" />
      <p className="text-sm text-gray-400">No restrooms found nearby.</p>
      <p className="text-xs text-gray-300">Try increasing the radius.</p>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────

function ToiletIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 2a1 1 0 0 0-1 1v1H5a1 1 0 0 0-1 1v3c0 2.97 2.16 5.43 5 5.92V16H8a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1v-3.08C18.84 12.43 21 9.97 21 7V4a1 1 0 0 0-1-1h-3V3a1 1 0 0 0-1-1H9zm1 2h4v1H10V4zm-4 2h12v1c0 2.21-1.79 4-4 4h-4C7.79 11 6 9.21 6 7V6zm5 12v2h2v-2h-2z"/>
    </svg>
  );
}
