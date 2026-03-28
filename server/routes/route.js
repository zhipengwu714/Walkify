import { Router } from 'express';

const router = Router();

// POST /api/route/day
router.post('/day', async (req, res) => {
  const { origin, destination } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'origin and destination are required' });
  }

  // TODO: fetch crowd-weighted route using graph + BestTime data
  res.json({ route: null, message: 'Day routing not yet implemented' });
});

// POST /api/route/night
router.post('/night', async (req, res) => {
  const { origin, destination, departureTime } = req.body;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'origin and destination are required' });
  }

  // TODO: score route segments by safety (lighting + incidents + foot traffic)
  res.json({ route: null, message: 'Night routing not yet implemented' });
});

export default router;
