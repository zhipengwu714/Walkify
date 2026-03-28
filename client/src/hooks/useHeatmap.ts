import { useState, useEffect } from 'react';
import { getMockDensityPoints, type DensityPoint } from '../utils/mockDensity';

interface UseHeatmapParams {
  hour: number;
  enabled: boolean;
}

export function useHeatmap({ hour, enabled }: UseHeatmapParams) {
  const [points, setPoints] = useState<DensityPoint[]>([]);

  useEffect(() => {
    if (!enabled) {
      setPoints([]);
      return;
    }
    setPoints(getMockDensityPoints(hour));
  }, [hour, enabled]);

  return { points };
}
