import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import adminRoutes from './routes/admin.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.set('trust proxy', 1); // needed behind Render's proxy for rate limiting

// Security middleware
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
const origins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize()); // strips $ and . operators (NoSQL injection)

const limiterOptions = { standardHeaders: true, legacyHeaders: false };
app.use('/api', rateLimit({ ...limiterOptions, windowMs: 15 * 60 * 1000, max: 300 }));
app.use('/api/auth', rateLimit({ ...limiterOptions, windowMs: 15 * 60 * 1000, max: 30 }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
