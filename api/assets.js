import { createServerlessApp } from '../src/createServerlessApp.js';
import assetRouter from '../src/routes/assetRoutes.js';

export default createServerlessApp((app) => {
  app.use('/api/assets', assetRouter);
});
