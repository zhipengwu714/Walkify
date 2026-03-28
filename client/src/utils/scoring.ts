// Translates a 0-1 safety score into a display colour and label.
export function safetyScoreColor(score: number): string {
  if (score >= 0.75) return '#22c55e'; // green
  if (score >= 0.5) return '#eab308';  // yellow
  return '#ef4444';                    // red
}

export function safetyScoreLabel(score: number): string {
  if (score >= 0.75) return 'Safe';
  if (score >= 0.5) return 'Moderate';
  return 'Caution';
}

// Translates a 0-1 crowd density into a display label.
export function crowdDensityLabel(density: number): string {
  if (density >= 0.75) return 'Very busy';
  if (density >= 0.5) return 'Busy';
  if (density >= 0.25) return 'Moderate';
  return 'Quiet';
}
