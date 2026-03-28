import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/foot';

// POST /api/route/day
router.post('/day', async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'origin and destination are required' });
  }

  try {
    const route = await fetchOSRMRoute(origin, destination);
    if (!route) {
      return res.status(404).json({ error: 'No walking route found' });
    }

    res.json({
      route: {
        segments: route.segments,
        distanceMetres: route.distance,
        durationSeconds: route.duration,
      },
    });
  } catch (err) {
    console.error('Day route error:', err);
    res.status(500).json({ error: 'Failed to calculate route' });
  }
});

// POST /api/route/night
router.post('/night', async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'origin and destination are required' });
  }

  try {
    const route = await fetchOSRMRoute(origin, destination);
    if (!route) {
      return res.status(404).json({ error: 'No walking route found' });
    }

    // Score each segment with safety data
    const scoredSegments = route.segments.map((seg) => {
      const midLat = (seg.from.lat + seg.to.lat) / 2;
      const midLng = (seg.from.lng + seg.to.lng) / 2;

      const row = db.prepare(`
        SELECT COUNT(*) as incidents FROM safety_data
        WHERE haversine(lat, lng, ?, ?) <= 200
          AND time_of_day = 'night'
      `).get(midLat, midLng);

      const incidents = row?.incidents || 0;
      // 0 incidents = 1.0 score, 10+ incidents = 0.0 score
      const safetyScore = Math.max(0, Math.min(1, 1 - incidents / 10));

      return { ...seg, safetyScore };
    });

    res.json({
      route: {
        segments: scoredSegments,
        distanceMetres: route.distance,
        durationSeconds: route.duration,
      },
    });
  } catch (err) {
    console.error('Night route error:', err);
    res.status(500).json({ error: 'Failed to calculate route' });
  }
});

async function fetchOSRMRoute(origin, destination) {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&steps=true`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  if (!data.routes?.[0]) return null;

  const route = data.routes[0];
  const coordinates = route.geometry.coordinates;

  // Convert coordinate pairs into route segments
  const segments = [];
  for (let i = 0; i < coordinates.length - 1; i++) {
    segments.push({
      from: { lat: coordinates[i][1], lng: coordinates[i][0] },
      to: { lat: coordinates[i + 1][1], lng: coordinates[i + 1][0] },
    });
  }

  return {
    segments,
    distance: Math.round(route.distance),
    duration: Math.round(route.duration),
  };
}

export default router;
