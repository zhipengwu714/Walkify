import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import restroomsRouter from './routes/restrooms.js';
import crowdRouter from './routes/crowd.js';
import routeRouter from './routes/route.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/api/restrooms', restroomsRouter);
app.use('/api/crowd', crowdRouter);
app.use('/api/route', routeRouter);

app.listen(PORT, () => {
  console.log(`Walkify server running on http://localhost:${PORT}`);
});
