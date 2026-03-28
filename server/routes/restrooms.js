import { Router } from 'express';
import { queryRestrooms } from '../services/osm.js';
import { queryNycRestrooms } from '../services/nycOpenData.js';

const router = Router();

// GET /api/restrooms?lat=&lng=&radius=&accessible=&openNow=
router.get('/', async (req, res) => {
  const { lat, lng, radius = 500, accessible, openNow } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  try {
    const [osmResults, nycResults] = await Promise.all([
      queryRestrooms({ lat: Number(lat), lng: Number(lng), radius: Number(radius) }),
      queryNycRestrooms({ lat: Number(lat), lng: Number(lng), radius: Number(radius) }),
    ]);

    let restrooms = dedup([...osmResults, ...nycResults]);

    if (accessible === 'true') restrooms = restrooms.filter((r) => r.accessible);
    if (openNow === 'true') restrooms = restrooms.filter((r) => r.openNow);

    res.json({ restrooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch restrooms' });
  }
});

function dedup(restrooms) {type
  const seen = new Set();
  return restrooms.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

export default router;
