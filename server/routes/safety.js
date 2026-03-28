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

    // Composite scoring per docs/scoring.md
    // incident_score = 1 - clamp(incidents_per_100m / 5, 0, 1)
    const radiusIn100m = numRadius / 100;
    const dayIncidentScore = 1 - Math.min(1, (dayIncidents / Math.max(radiusIn100m, 1)) / 5);
    const nightIncidentScore = 1 - Math.min(1, (nightIncidents / Math.max(radiusIn100m, 1)) / 5);

    // Foot traffic from pedestrian counts
    const pedRow = db.prepare(`
      SELECT AVG(count_pm) as avg_traffic FROM pedestrian_counts
      WHERE haversine(lat, lng, ?, ?) <= ?
    `).get(numLat, numLng, numRadius);

    const avgTraffic = pedRow?.avg_traffic || 0;
    const density = Math.min(1, avgTraffic / 1500);

    // traffic_score = min(density, 0.6) / 0.6
    const trafficScore = Math.min(density, 0.6) / 0.6;

    // lighting_score: approximate from foot traffic (high traffic areas tend to be lit)
    const lightingScore = density > 0.3 ? 1.0 : 0.2;

    // Composite: (incident * 0.5) + (lighting * 0.3) + (traffic * 0.2)
    const dayScore = (dayIncidentScore * 0.5) + (lightingScore * 0.3) + (trafficScore * 0.2);
    const nightScore = (nightIncidentScore * 0.5) + (lightingScore * 0.3) + (trafficScore * 0.2);

    res.json({
      lat: numLat,
      lng: numLng,
      radius: numRadius,
      safetyScore: {
        day: Math.round(dayScore * 100),
        night: Math.round(nightScore * 100),
        overall: Math.round(((dayScore + nightScore) / 2) * 100),
      },
      components: {
        dayIncidentScore: +dayIncidentScore.toFixed(3),
        nightIncidentScore: +nightIncidentScore.toFixed(3),
        lightingScore: +lightingScore.toFixed(3),
        trafficScore: +trafficScore.toFixed(3),
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
