import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface RouteSegment {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  safetyScore?: number;
}

interface RouteLayerProps {
  map: mapboxgl.Map;
  segments: RouteSegment[];
  mode: 'day' | 'night';
}

export default function RouteLayer({ map, segments, mode }: RouteLayerProps) {
  useEffect(() => {
    const SOURCE_ID = 'route';
    const LAYER_ID = 'route-line';

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: segments.map((seg) => ({
        type: 'Feature',
        properties: { safetyScore: seg.safetyScore ?? 1 },
        geometry: {
          type: 'LineString',
          coordinates: [
            [seg.from.lng, seg.from.lat],
            [seg.to.lng, seg.to.lat],
          ],
        },
      })),
    };

    if (map.getSource(SOURCE_ID)) {
      (map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource).setData(geojson);
      return;
    }

    map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });
    map.addLayer({
      id: LAYER_ID,
      type: 'line',
      source: SOURCE_ID,
      paint: {
        'line-color': mode === 'night'
          ? ['interpolate', ['linear'], ['get', 'safetyScore'], 0, '#ef4444', 1, '#22c55e']
          : '#3b82f6',
        'line-width': 4,
      },
    });

    return () => {
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map, segments, mode]);

  return null;
}
