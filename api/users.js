import { createServerlessApp } from '../src/createServerlessApp.js';
import userRouter from '../src/routes/userRoutes.js';

export default createServerlessApp((app) => {
  app.use('/api/users', userRouter);
});
