import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { CLIENT_URL, NODE_ENV } from './config/index.js';
import { swaggerSpec } from './config/swagger.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';

const app = express();

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const defaultProdOrigins = [
  'https://mvp-asset-tracker-frontend.vercel.app',
];

const isProduction = NODE_ENV === 'production' || NODE_ENV === 'prod';

/** @param {string} origin */
function normalizeOrigin(origin) {
  return origin.trim().replace(/\/+$/, '');
}

const envOrigins = CLIENT_URL
  ? CLIENT_URL.split(',').map((s) => normalizeOrigin(s)).filter(Boolean)
  : [];

const allowedOrigins = [
  ...new Set([
    ...(isProduction ? defaultProdOrigins.map(normalizeOrigin) : []),
    ...envOrigins,
    ...(envOrigins.length || isProduction ? [] : defaultDevOrigins),
  ]),
];

/**
 * @param {string|undefined} origin
 * @param {(err: Error | null, allow?: boolean) => void} callback
 */
function corsOrigin(origin, callback) {
  if (!origin) {
    callback(null, true);
    return;
  }

  const normalized = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalized)) {
    callback(null, true);
    return;
  }

  const localDevPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
  if (!isProduction && localDevPattern.test(normalized)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
}

// CORS must run before routes; origin must be an array/callback — not a raw comma-separated string
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
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

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Asset Tracker API Docs',
}));

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
