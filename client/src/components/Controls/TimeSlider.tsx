import React from 'react';
import { formatHour } from '../../utils/formatting';

interface TimeSliderProps {
  hour: number;
  onChange: (hour: number) => void;
}

export default function TimeSlider({ hour, onChange }: TimeSliderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-3 flex flex-col gap-1 w-48">
      <label className="text-xs font-medium text-gray-600">
        Crowd forecast — {formatHour(hour)}
      </label>
      <input
        type="range"
        min={0}
        max={23}
        value={hour}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-purple-600"
      />
    </div>
  );
}
