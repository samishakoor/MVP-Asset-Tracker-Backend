import express from 'express';
import userRouter from './userRoutes.js';
import authRouter from './authRoutes.js';
import assetRouter from './assetRoutes.js';
import assignmentRouter from './assignmentRoutes.js';
import supportTicketRouter from './supportTicketRoutes.js';
import adminRouter from './adminRoutes.js';
import notificationRouter from './notificationRoutes.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/users', userRouter);
router.use('/assets', assetRouter);
router.use('/assignments', assignmentRouter);
router.use('/support-tickets', supportTicketRouter);
router.use('/notifications', notificationRouter);

// Health check endpoint
router.get('/ping', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'pong' });
});

export default router;
