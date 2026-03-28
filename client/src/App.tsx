import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import ModeToggle from './components/Controls/ModeToggle';
import RouteInput from './components/Controls/RouteInput';
import TimeSlider from './components/Controls/TimeSlider';
import HeatmapLayer from './components/Map/HeatmapLayer';
import RestroomPins from './components/Map/RestroomPins';
import RouteLayer from './components/Map/RouteLayer';
import RestroomPanel from './components/Restrooms/RestroomPanel';
import { useMapMode } from './hooks/useMapMode';
import { useGeolocation } from './hooks/useGeolocation';
import { useRestrooms } from './hooks/useRestrooms';
import { useHeatmap } from './hooks/useHeatmap';
import type { Restroom } from './types/restroom';
import type { RestroomFilters } from './components/Restrooms/RestroomFilter';
import type { RouteSegment } from './types/route';

const NYC_CENTER = { lat: 40.7484, lng: -73.9857 };

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  version: 'weekly',
  libraries: ['visualization'],
});

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const { mode, toggleMode } = useMapMode();
  const { position } = useGeolocation();
  const [mapsReady, setMapsReady] = useState(false);
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [hour, setHour] = useState(new Date().getHours());
  const [mapCenter, setMapCenter] = useState(NYC_CENTER);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);

  const [filters, setFilters] = useState<RestroomFilters>({
    openNow: false,
    accessibleOnly: false,
    radiusMetres: 500,
  });

  const center = position ?? mapCenter;

  // Single restroom fetch — drives both map pins and panel list
  const { restrooms, loading, error } = useRestrooms({
    lat: center.lat,
    lng: center.lng,
    radiusMetres: filters.radiusMetres,
    openNow: filters.openNow,
    accessibleOnly: filters.accessibleOnly,
  });

  const { points: heatmapPoints } = useHeatmap({
    lat: center.lat,
    lng: center.lng,
    radius: filters.radiusMetres > 1000 ? filters.radiusMetres : 1500,
    hour,
    mode,
    enabled: true,
  });

  const handleMapIdle = useCallback(() => {
    if (!map.current) return;
    const c = map.current.getCenter();
    if (!c) return;
    const newLat = c.lat();
    const newLng = c.lng();
    setMapCenter((prev) => {
      // Only update if moved meaningfully (avoid infinite re-render)
      const dist = Math.abs(prev.lat - newLat) + Math.abs(prev.lng - newLng);
      if (dist < 0.002) return prev;
      return { lat: newLat, lng: newLng };
    });
  }, []);

  useEffect(() => {
    loader.load().then(() => {
      if (map.current || !mapContainer.current) return;
      map.current = new google.maps.Map(mapContainer.current, {
        center,
        zoom: 14,
        styles: mode === 'night' ? nightStyles : [],
        disableDefaultUI: false,
      });
      setMapsReady(true);
      map.current.addListener('idle', handleMapIdle);
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;
    map.current.setOptions({ styles: mode === 'night' ? nightStyles : [] });
  }, [mode]);

  useEffect(() => {
    if (!map.current || !position) return;
    map.current.panTo({ lat: position.lat, lng: position.lng });
  }, [position]);

  useEffect(() => {
    if (!map.current || !selectedRestroom) return;
    map.current.panTo({ lat: selectedRestroom.lat, lng: selectedRestroom.lng });
  }, [selectedRestroom]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {mapsReady && map.current && (
        <>
          <HeatmapLayer map={map.current} points={heatmapPoints} />
          <RestroomPins
            map={map.current}
            restrooms={restrooms}
            selectedId={selectedRestroom?.id ?? null}
            onSelect={setSelectedRestroom}
          />
          {routeSegments.length > 0 && (
            <RouteLayer map={map.current} segments={routeSegments} mode={mode} />
          )}
        </>
      )}

      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <ModeToggle mode={mode} onToggle={toggleMode} />
        <RouteInput mode={mode} onRouteCalculated={setRouteSegments} />
        {mode === 'day' && <TimeSlider hour={hour} onChange={setHour} />}
      </div>

      <RestroomPanel
        restrooms={restrooms}
        loading={loading}
        error={error}
        filters={filters}
        onFiltersChange={setFilters}
        selectedRestroom={selectedRestroom}
        onSelect={setSelectedRestroom}
      />
    </div>
  );
}

const nightStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#383838' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#616161' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
];
