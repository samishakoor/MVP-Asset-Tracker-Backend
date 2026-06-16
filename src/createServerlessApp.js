import app from './app.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

/**
 * Registers 404 and error handlers after all routes are mounted.
 *
 * @param {import('express').Express} expressApp
 */
export function registerErrorHandlers(expressApp) {
  expressApp.use(notFound);
  expressApp.use(errorHandler);
}

/**
 * Wraps a Vercel serverless function: mounts routes first, then shared error handlers.
 *
 * @param {(expressApp: import('express').Express) => void} registerRoutes
 * @returns {import('express').Express}
 */
export function createServerlessApp(registerRoutes) {
  registerRoutes(app);
  registerErrorHandlers(app);
  return app;
}
