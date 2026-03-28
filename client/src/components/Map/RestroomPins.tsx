import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface Restroom {
  id: string;
  name: string;
  lat: number;
  lng: number;
  accessible: boolean;
  openNow: boolean;
  hours: string;
}

interface RestroomPinsProps {
  map: mapboxgl.Map;
  restrooms: Restroom[];
}

export default function RestroomPins({ map, restrooms }: RestroomPinsProps) {
  useEffect(() => {
    const markers: mapboxgl.Marker[] = restrooms.map((r) => {
      const el = document.createElement('div');
      el.className = 'restroom-pin';
      el.style.cssText = 'width:24px;height:24px;background:#7c3aed;border-radius:50%;border:2px solid white;cursor:pointer;';

      const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
        `<strong>${r.name}</strong><br/>${r.hours}<br/>${r.accessible ? 'Accessible' : ''}`
      );

      return new mapboxgl.Marker(el)
        .setLngLat([r.lng, r.lat])
        .setPopup(popup)
        .addTo(map);
    });

    return () => markers.forEach((m) => m.remove());
  }, [map, restrooms]);

  return null;
}
