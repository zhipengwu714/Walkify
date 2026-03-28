import { useEffect, useRef } from 'react';
import type { Restroom } from '../../types/restroom';

interface RestroomPinsProps {
  map: google.maps.Map;
  restrooms: Restroom[];
  selectedId: string | null;
  onSelect: (restroom: Restroom) => void;
}

export default function RestroomPins({ map, restrooms, selectedId, onSelect }: RestroomPinsProps) {
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();
    infoWindowRef.current?.close();

    restrooms.forEach((r) => {
      const isSelected = r.id === selectedId;
      const marker = new google.maps.Marker({
        position: { lat: r.lat, lng: r.lng },
        map,
        title: r.name,
        zIndex: isSelected ? 10 : 1,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 11 : 8,
          fillColor: isSelected ? '#6d28d9' : '#7c3aed',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: isSelected ? 3 : 2,
        },
      });

      marker.addListener('click', () => onSelect(r));
      markersRef.current.set(r.id, marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current.clear();
    };
  }, [map, restrooms]);

  // Update icon when selection changes without re-creating all markers
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const isSelected = id === selectedId;
      marker.setZIndex(isSelected ? 10 : 1);
      marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: isSelected ? 11 : 8,
        fillColor: isSelected ? '#6d28d9' : '#7c3aed',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: isSelected ? 3 : 2,
      });
    });
  }, [selectedId]);

  return null;
}
