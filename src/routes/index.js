import express from 'express';
import userRouter from './userRoutes.js';
import authRouter from './authRoutes.js';
import assetRouter from './assetRoutes.js';
import assignmentRouter from './assignmentRoutes.js';
import supportTicketRouter from './supportTicketRoutes.js';
import adminRouter from './adminRoutes.js';
import notificationRouter from './notificationRoutes.js';

const router = express.Router();

// Mount: /api/auth — authentication (public routes)
router.use('/auth', authRouter);

// Mount: /api/admin — admin dashboard and audit logs (private, admin)
router.use('/admin', adminRouter);

// Mount: /api/users — employee self-service and admin user management
router.use('/users', userRouter);

// Mount: /api/assets — asset inventory (private, admin)
router.use('/assets', assetRouter);

// Mount: /api/assignments — assign, return, and acknowledge assets
router.use('/assignments', assignmentRouter);

// Mount: /api/support-tickets — employee tickets and admin review
router.use('/support-tickets', supportTicketRouter);

// Mount: /api/notifications — employee notification inbox
router.use('/notifications', notificationRouter);

// Public — API health check
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'pong' });
});

export default router;
