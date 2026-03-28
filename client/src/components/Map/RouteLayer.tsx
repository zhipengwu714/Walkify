import { useEffect, useRef } from 'react';
import { safetyScoreColor } from '../../utils/scoring';

interface RouteSegment {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  safetyScore?: number;
}

interface RouteLayerProps {
  map: google.maps.Map;
  segments: RouteSegment[];
  mode: 'day' | 'night';
}

export default function RouteLayer({ map, segments, mode }: RouteLayerProps) {
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    polylinesRef.current = segments.map((seg) => {
      const color = mode === 'night'
        ? safetyScoreColor(seg.safetyScore ?? 1)
        : '#3b82f6';

      return new google.maps.Polyline({
        path: [
          { lat: seg.from.lat, lng: seg.from.lng },
          { lat: seg.to.lat, lng: seg.to.lng },
        ],
        strokeColor: color,
        strokeWeight: 5,
        strokeOpacity: 0.85,
        map,
      });
    });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, segments, mode]);

  return null;
}
