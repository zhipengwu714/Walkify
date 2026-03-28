import { useEffect, useRef } from 'react';

interface HeatmapPoint {
  lat: number;
  lng: number;
  density: number;
}

interface HeatmapLayerProps {
  map: google.maps.Map;
  points: HeatmapPoint[];
}

// How many pixels represent HOTSPOT_RADIUS_M metres at a given zoom level.
// At NYC latitude (~40.7°), meters per pixel ≈ 119934 / 2^zoom.
const HOTSPOT_RADIUS_M = 400;
function radiusForZoom(zoom: number): number {
  const metersPerPixel = 119934 / Math.pow(2, zoom);
  return Math.max(8, Math.round(HOTSPOT_RADIUS_M / metersPerPixel));
}

export default function HeatmapLayer({ map, points }: HeatmapLayerProps) {
  const layerRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  // Create layer once, destroy on unmount.
  useEffect(() => {
    layerRef.current = new google.maps.visualization.HeatmapLayer({
      data: [],
      map,
      radius: radiusForZoom(map.getZoom() ?? 14),
      opacity: 0.7,
    });

    const zoomListener = map.addListener('zoom_changed', () => {
      layerRef.current?.set('radius', radiusForZoom(map.getZoom() ?? 14));
    });

    return () => {
      google.maps.event.removeListener(zoomListener);
      layerRef.current?.setMap(null);
      layerRef.current = null;
    };
  }, [map]);

  // Update data whenever points change.
  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.setData(
      points.map((p) => ({
        location: new google.maps.LatLng(p.lat, p.lng),
        weight: p.density,
      }))
    );
  }, [points]);

  return null;
}
