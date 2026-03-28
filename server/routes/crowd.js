import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/crowd/heatmap?lat=&lng=&radius=&mode=
router.get('/heatmap', (req, res) => {
  const { lat, lng, radius = 1000, mode = 'day' } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  try {
    const numLat = Number(lat);
    const numLng = Number(lng);
    const numRadius = Number(radius);
    const countColumn = mode === 'night' ? 'count_pm' : 'count_am';

    // Get pedestrian density points within radius
    const pedRows = db.prepare(`
      SELECT lat, lng, ${countColumn} AS ped_count
      FROM pedestrian_counts
      WHERE haversine(lat, lng, ?, ?) <= ?
        AND ${countColumn} > 0
      ORDER BY ped_count DESC
      LIMIT 200
    `).all(numLat, numLng, numRadius);

    // Get safety incident density within radius
    const safetyRows = db.prepare(`
      SELECT lat, lng, COUNT(*) AS incident_count
      FROM safety_data
      WHERE haversine(lat, lng, ?, ?) <= ?
        AND time_of_day = ?
      GROUP BY lat, lng
      LIMIT 200
    `).all(numLat, numLng, numRadius, mode === 'night' ? 'night' : 'day');

    // Normalize pedestrian counts to 0-1 density
    const maxPed = Math.max(...pedRows.map((r) => r.ped_count), 1);
    const pedCells = pedRows.map((r) => ({
      lat: r.lat,
      lng: r.lng,
      density: +(r.ped_count / maxPed).toFixed(3),
      type: 'pedestrian',
    }));

    // Normalize safety incidents to 0-1 density (inverted — more incidents = higher density on heatmap)
    const maxInc = Math.max(...safetyRows.map((r) => r.incident_count), 1);
    const safetyCells = safetyRows.map((r) => ({
      lat: r.lat,
      lng: r.lng,
      density: +(r.incident_count / maxInc).toFixed(3),
      type: 'safety',
    }));

    // In day mode, show pedestrian density. In night mode, blend both.
    const cells = mode === 'night' ? [...pedCells, ...safetyCells] : pedCells;

    res.json({ mode, timestamp: new Date().toISOString(), cells });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch crowd data' });
  }
});

// GET /api/crowd/forecast?lat=&lng=
router.get('/forecast', (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  try {
    // Generate hourly forecast from AM/PM pedestrian data
    const row = db.prepare(`
      SELECT AVG(count_am) AS avg_am, AVG(count_pm) AS avg_pm
      FROM pedestrian_counts
      WHERE haversine(lat, lng, ?, ?) <= 1000
    `).get(Number(lat), Number(lng));

    const avgAm = row?.avg_am || 0;
    const avgPm = row?.avg_pm || 0;

    // Approximate hourly distribution
    const forecast = Array.from({ length: 24 }, (_, hour) => {
      let factor;
      if (hour >= 7 && hour < 10) factor = avgAm / Math.max(avgPm, 1);
      else if (hour >= 10 && hour < 16) factor = 0.7;
      else if (hour >= 16 && hour < 20) factor = 1.0;
      else if (hour >= 20 && hour < 23) factor = 0.5;
      else factor = 0.1;

      return {
        hour,
        density: +(factor * (avgPm / 1500)).toFixed(3),
      };
    });

    res.json({ forecast });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

export default router;
