import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// GET /api/safety?lat=&lng=&radius=
router.get('/', (req, res) => {
  const { lat, lng, radius = 500 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  try {
    const numLat = Number(lat);
    const numLng = Number(lng);
    const numRadius = Number(radius);

    const rows = db.prepare(`
      SELECT
        time_of_day,
        complaint_type,
        COUNT(*) as incident_count
      FROM safety_data
      WHERE haversine(lat, lng, ?, ?) <= ?
      GROUP BY time_of_day, complaint_type
      ORDER BY incident_count DESC
    `).all(numLat, numLng, numRadius);

    const totalIncidents = rows.reduce((sum, r) => sum + r.incident_count, 0);

    const dayIncidents = rows
      .filter((r) => r.time_of_day === 'day')
      .reduce((sum, r) => sum + r.incident_count, 0);

    const nightIncidents = rows
      .filter((r) => r.time_of_day === 'night')
      .reduce((sum, r) => sum + r.incident_count, 0);

    // Score 0-100 (higher = safer). Night incidents weighted 1.5x.
    const dayScore = Math.max(0, 100 - dayIncidents);
    const nightScore = Math.max(0, 100 - nightIncidents * 1.5);

    res.json({
      lat: numLat,
      lng: numLng,
      radius: numRadius,
      safetyScore: {
        day: Math.round(dayScore),
        night: Math.round(nightScore),
        overall: Math.round((dayScore + nightScore) / 2),
      },
      totalIncidents,
      breakdown: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch safety data' });
  }
});

// GET /api/safety/heatmap?south=&north=&west=&east=&mode=
router.get('/heatmap', (req, res) => {
  const { south, north, west, east, mode = 'day' } = req.query;

  if ([south, north, west, east].some((v) => !v)) {
    return res.status(400).json({ error: 'Bounding box required: south, north, west, east' });
  }

  try {
    const rows = db.prepare(`
      SELECT lat, lng, COUNT(*) as incident_count
      FROM safety_data
      WHERE lat BETWEEN ? AND ?
        AND lng BETWEEN ? AND ?
        AND time_of_day = ?
      GROUP BY lat, lng
      ORDER BY incident_count DESC
      LIMIT 500
    `).all(Number(south), Number(north), Number(west), Number(east), mode === 'night' ? 'night' : 'day');

    res.json({
      mode,
      count: rows.length,
      points: rows.map((r) => ({
        lat: r.lat,
        lng: r.lng,
        weight: r.incident_count,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch safety heatmap' });
  }
});

export default router;
