/**
 * Returns 404 JSON when no route matches req.originalUrl.
 * Register after all routers and before errorHandler.
 *
 * @type {import('express').RequestHandler}
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    error: {
      message: `Route ${req.originalUrl} not found`,
    },
  });
};

export default notFound;
