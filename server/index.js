import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import restroomsRouter from './routes/restrooms.js';
import crowdRouter from './routes/crowd.js';
import routeRouter from './routes/route.js';
import safetyRouter from './routes/safety.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/api/restrooms', restroomsRouter);
app.use('/api/crowd', crowdRouter);
app.use('/api/route', routeRouter);
app.use('/api/safety', safetyRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Walkify server running on http://localhost:${PORT}`);
});
