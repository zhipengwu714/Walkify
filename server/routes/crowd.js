import { Router } from 'express';
import { getVenueBusyness } from '../services/besttime.js';

const router = Router();

// GET /api/crowd/heatmap?lat=&lng=&radius=&mode=
router.get('/heatmap', async (req, res) => {
  const { lat, lng, radius = 1000, mode = 'day' } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  try {
    const cells = await getVenueBusyness({ lat: Number(lat), lng: Number(lng), radius: Number(radius) });
    res.json({ mode, timestamp: new Date().toISOString(), cells });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch crowd data' });
  }
});

// GET /api/crowd/forecast?lat=&lng=
router.get('/forecast', async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  // TODO: return hourly forecast array from BestTime.app
  res.json({ forecast: [] });
});

export default router;
