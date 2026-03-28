import React, { useRef, useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import ModeToggle from './components/Controls/ModeToggle';
import RouteInput from './components/Controls/RouteInput';
import TimeSlider from './components/Controls/TimeSlider';
import HeatmapLayer from './components/Map/HeatmapLayer';
import RestroomPins from './components/Map/RestroomPins';
import RestroomPanel from './components/Restrooms/RestroomPanel';
import { useMapMode } from './hooks/useMapMode';
import { useGeolocation } from './hooks/useGeolocation';
import { useRestrooms } from './hooks/useRestrooms';
import { useHeatmap } from './hooks/useHeatmap';
import type { Restroom } from './types/restroom';

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

  const center = position ?? NYC_CENTER;

  const { restrooms } = useRestrooms({
    lat: center.lat,
    lng: center.lng,
    radiusMetres: 500,
    openNow: false,
    accessibleOnly: false,
  });

  const { points: heatmapPoints } = useHeatmap({
    hour,
    enabled: mode === 'day',
  });

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
          {mode === 'day' && <HeatmapLayer map={map.current} points={heatmapPoints} />}
          <RestroomPins
            map={map.current}
            restrooms={restrooms}
            selectedId={selectedRestroom?.id ?? null}
            onSelect={setSelectedRestroom}
          />
        </>
      )}

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <ModeToggle mode={mode} onToggle={toggleMode} />
        <RouteInput />
        {mode === 'day' && <TimeSlider hour={hour} onChange={setHour} />}
      </div>

      <RestroomPanel
        lat={center.lat}
        lng={center.lng}
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
