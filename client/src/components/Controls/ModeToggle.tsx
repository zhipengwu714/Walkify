import React from 'react';

type Mode = 'day' | 'night';

interface ModeToggleProps {
  mode: Mode;
  onToggle: () => void;
}

export default function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="px-4 py-2 rounded-lg bg-white shadow font-medium text-sm"
    >
      {mode === 'day' ? '☀️ Day Mode' : '🌙 Night Mode'}
    </button>
  );
}
