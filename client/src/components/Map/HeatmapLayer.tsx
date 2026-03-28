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

export default function HeatmapLayer({ map, points }: HeatmapLayerProps) {
  const layerRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    const data = points.map((p) =>
      new google.maps.visualization.WeightedLocation({
        location: new google.maps.LatLng(p.lat, p.lng),
        weight: p.density,
      })
    );

    if (layerRef.current) {
      layerRef.current.setData(data);
    } else {
      layerRef.current = new google.maps.visualization.HeatmapLayer({ data, map });
    }

    return () => {
      layerRef.current?.setMap(null);
      layerRef.current = null;
    };
  }, [map, points]);

  return null;
}
