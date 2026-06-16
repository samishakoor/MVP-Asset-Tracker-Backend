import { createServerlessApp } from '../src/createServerlessApp.js';
import adminRouter from '../src/routes/adminRoutes.js';

export default createServerlessApp((app) => {
  app.use('/api/admin', adminRouter);
});
