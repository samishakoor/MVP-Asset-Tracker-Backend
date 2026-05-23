import express from 'express';
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
} from '../controllers/authController.js';

const authRouter = express.Router();

// Public authentication routes: sign up, log in, password reset, and email verification
authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/send-verification-email', sendVerificationEmail);
authRouter.post('/verify-email', verifyEmail);

export default authRouter;
