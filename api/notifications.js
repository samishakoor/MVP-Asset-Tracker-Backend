import { createServerlessApp } from '../src/createServerlessApp.js';
import notificationRouter from '../src/routes/notificationRoutes.js';

export default createServerlessApp((app) => {
  app.use('/api/notifications', notificationRouter);
});
