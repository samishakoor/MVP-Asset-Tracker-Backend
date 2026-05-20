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

// Employee routes — create tickets
supportTicketRouter.post('/', authenticateUser, createTicket);

// Admin routes — view and review tickets
supportTicketRouter.get('/', authenticateUser, requireRoles(UserRole.ADMIN), getAllTickets);
supportTicketRouter.patch('/:id/review', authenticateUser, requireRoles(UserRole.ADMIN), reviewTicket);

export default supportTicketRouter;
