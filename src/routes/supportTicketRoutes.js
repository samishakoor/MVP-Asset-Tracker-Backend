import express from 'express';
import {
  createTicket,
  getAllTickets,
  reviewTicket,
} from '../controllers/supportTicketController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { UserRole } from '../constants/index.js';

const supportTicketRouter = express.Router();

// Private (Employee) — Report an issue on an active assignment
supportTicketRouter.post('/', authenticateUser, createTicket);

// Private (Admin) — List support tickets with pagination and optional status filter
supportTicketRouter.get('/', authenticateUser, requireRoles(UserRole.ADMIN), getAllTickets);

// Private (Admin) — Review or resolve a support ticket by id
supportTicketRouter.patch('/:id/review', authenticateUser, requireRoles(UserRole.ADMIN), reviewTicket);

export default supportTicketRouter;
