import express, { Application } from 'express';
import cors from 'cors';
import pollRoutes from './routes/pollRoutes';
import sessionRoutes from './routes/sessionRoutes';
import voteRoutes from './routes/voteRoutes';
import historyRoutes from './routes/historyRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/polls', pollRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/votes', voteRoutes);
app.use('/api/v1/polls/history', historyRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

