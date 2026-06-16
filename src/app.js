import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { CLIENT_URL } from './config/index.js';
import passport from './middlewares/googleOAuth.js';

const app = express();

// CORS must run before routes; origin must be an array/callback — not a raw comma-separated string
app.use(
  cors({
    origin: CLIENT_URL,
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

app.use(passport.initialize());

export default app;
