import express from 'express';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;