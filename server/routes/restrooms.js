import { Router } from 'express';
import { findRestroomsNear } from '../db/queries/restrooms.js';

const router = Router();

// GET /api/restrooms?lat=&lng=&radius=&accessible=&openNow=
router.get('/', (req, res) => {
  const { lat, lng, radius = 500, accessible, openNow } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  try {
    let rows = findRestroomsNear({
      lat: Number(lat),
      lng: Number(lng),
      radiusMetres: Number(radius),
      accessible: accessible === 'true',
    });

    // Map to frontend-expected shape
    let restrooms = rows.map((r) => ({
      id: r.id,
      name: r.name,
      source: r.source,
      lat: r.lat,
      lng: r.lng,
      distanceMetres: r.distance_metres,
      accessible: !!r.accessible,
      openNow: !!r.open_now,
      hours: r.hours || 'Unknown',
    }));

    if (openNow === 'true') {
      restrooms = restrooms.filter((r) => r.openNow);
    }

    res.json({ restrooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch restrooms' });
  }
});

export default router;
