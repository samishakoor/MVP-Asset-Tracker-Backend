import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { CLIENT_URL, NODE_ENV } from './config/index.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';

const app = express();

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const corsOrigins = CLIENT_URL
  ? CLIENT_URL.split(',').map((s) => s.trim()).filter(Boolean)
  : defaultDevOrigins;

const localDevOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * @param {string|undefined} origin - Request Origin header.
 * @param {(err: Error|null, allow?: boolean) => void} callback - CORS callback.
 */
function corsOrigin(origin, callback) {
  if (!origin) {
    callback(null, true);
    return;
  }

  if (corsOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  if (NODE_ENV === 'development' && localDevOriginPattern.test(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
}

// CORS must run before routes; allow Vite (localhost / 127.0.0.1) in development
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Security middleware (after CORS)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Asset Tracker API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
