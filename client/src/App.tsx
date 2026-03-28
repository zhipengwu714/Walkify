import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import ModeToggle from './components/Controls/ModeToggle';
import RouteInput from './components/Controls/RouteInput';
import TimeSlider from './components/Controls/TimeSlider';
import { useMapMode } from './hooks/useMapMode';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? '';

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { mode, toggleMode } = useMapMode();

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mode === 'day'
        ? 'mapbox://styles/mapbox/streets-v12'
        : 'mapbox://styles/mapbox/dark-v11',
      center: [-73.9857, 40.7484], // NYC
      zoom: 13,
    });
  }, []);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <ModeToggle mode={mode} onToggle={toggleMode} />
        <RouteInput />
        {mode === 'day' && <TimeSlider />}
      </div>
    </div>
  );
}
