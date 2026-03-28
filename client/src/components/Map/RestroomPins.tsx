import { useEffect, useRef } from 'react';

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
  map: google.maps.Map;
  restrooms: Restroom[];
}

export default function RestroomPins({ map, restrooms }: RestroomPinsProps) {
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    markersRef.current = restrooms.map((r) => {
      const marker = new google.maps.Marker({
        position: { lat: r.lat, lng: r.lng },
        map,
        title: r.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#7c3aed',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="font-size:13px">
          <strong>${r.name}</strong><br/>
          ${r.hours}<br/>
          ${r.accessible ? '<span style="color:#7c3aed">Accessible</span>' : ''}
        </div>`,
      });

      marker.addListener('click', () => infoWindow.open(map, marker));
      return marker;
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [map, restrooms]);

  return null;
}
