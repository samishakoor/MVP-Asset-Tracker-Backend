import { createServerlessApp } from '../src/createServerlessApp.js';
import authRouter from '../src/routes/authRoutes.js';

export default createServerlessApp((app) => {
  app.use('/api/auth', authRouter);
});
