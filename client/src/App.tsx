import React, { useRef, useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import ModeToggle from './components/Controls/ModeToggle';
import RouteInput from './components/Controls/RouteInput';
import TimeSlider from './components/Controls/TimeSlider';
import { useMapMode } from './hooks/useMapMode';

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  version: 'weekly',
  libraries: ['visualization'],
});

export default function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const { mode, toggleMode } = useMapMode();
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    loader.load().then(() => {
      if (map.current || !mapContainer.current) return;
      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: 40.7484, lng: -73.9857 }, // NYC
        zoom: 14,
        mapTypeId: mode === 'night' ? 'roadmap' : 'roadmap',
        styles: mode === 'night' ? nightStyles : [],
        disableDefaultUI: false,
      });
      setMapsReady(true);
    });
  }, []);

  // Swap map styles when mode changes
  useEffect(() => {
    if (!map.current) return;
    map.current.setOptions({ styles: mode === 'night' ? nightStyles : [] });
  }, [mode]);

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
