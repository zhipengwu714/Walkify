import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface HeatmapLayerProps {
  map: mapboxgl.Map;
}

// Adds/removes the crowd density heatmap layer on the provided map instance.
export default function HeatmapLayer({ map }: HeatmapLayerProps) {
  useEffect(() => {
    const SOURCE_ID = 'crowd-density';
    const LAYER_ID = 'crowd-heatmap';

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    map.addLayer({
      id: LAYER_ID,
      type: 'heatmap',
      source: SOURCE_ID,
      paint: {
        'heatmap-weight': ['get', 'density'],
        'heatmap-intensity': 1,
        'heatmap-radius': 30,
        'heatmap-opacity': 0.7,
      },
    });

    return () => {
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map]);

  return null;
}
