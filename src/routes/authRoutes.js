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

// Public — Register a new user account
authRouter.post('/signup', signup);

// Public — Log in with email and password
authRouter.post('/login', login);

// Public — Request a password reset email
authRouter.post('/forgot-password', forgotPassword);

// Public — Reset password using a reset token
authRouter.post('/reset-password', resetPassword);

// Public — Send email verification link to the user
authRouter.post('/send-verification-email', sendVerificationEmail);

// Public — Verify email address using a verification token
authRouter.post('/verify-email', verifyEmail);

export default authRouter;
