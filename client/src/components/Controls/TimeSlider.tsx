import React, { useState } from 'react';

export default function TimeSlider() {
  const [hour, setHour] = useState(new Date().getHours());

  return (
    <div className="bg-white rounded-lg shadow p-3 flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">
        Crowd forecast — {hour}:00
      </label>
      <input
        type="range"
        min={0}
        max={23}
        value={hour}
        onChange={(e) => setHour(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
