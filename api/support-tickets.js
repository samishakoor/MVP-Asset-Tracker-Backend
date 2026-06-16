import { createServerlessApp } from '../src/createServerlessApp.js';
import supportTicketRouter from '../src/routes/supportTicketRoutes.js';

export default createServerlessApp((app) => {
  app.use('/api/support-tickets', supportTicketRouter);
});
