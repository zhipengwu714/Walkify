import { useState, useCallback } from 'react';

type Mode = 'day' | 'night';

export function useMapMode() {
  const [mode, setMode] = useState<Mode>(() => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 20 ? 'day' : 'night';
  });

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'day' ? 'night' : 'day'));
  }, []);

  return { mode, toggleMode };
}
