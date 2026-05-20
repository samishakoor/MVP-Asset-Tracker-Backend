import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { CLIENT_URL } from './config/index.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';

const app = express();

// Configure CORS settings for requests.
app.use(
  cors({
    origin: CLIENT_URL,
    allowedHeaders: ["Accept", "Content-Type", "Authorization"],
    credentials: true,
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

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
