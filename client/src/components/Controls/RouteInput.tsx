import React, { useState } from 'react';

export default function RouteInput() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call route API
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-3 flex flex-col gap-2">
      <input
        className="border rounded px-2 py-1 text-sm"
        placeholder="From"
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
      />
      <input
        className="border rounded px-2 py-1 text-sm"
        placeholder="To"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1 text-sm">
        Get Route
      </button>
    </form>
  );
}
