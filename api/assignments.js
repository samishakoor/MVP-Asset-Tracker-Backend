import { createServerlessApp } from '../src/createServerlessApp.js';
import assignmentRouter from '../src/routes/assignmentRoutes.js';

export default createServerlessApp((app) => {
  app.use('/api/assignments', assignmentRouter);
});
