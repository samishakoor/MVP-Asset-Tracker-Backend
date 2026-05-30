import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  googleAuthCallback,
} from "../controllers/authController.js";
import { CLIENT_URL } from "../config/index.js";
import passport from "../middlewares/googleOAuth.js";

const authRouter = express.Router();

// Public — Register a new user account
authRouter.post("/signup", signup);

// Public — Log in with email and password
authRouter.post("/login", login);

// Public — Request a password reset email
authRouter.post("/forgot-password", forgotPassword);

// Public — Reset password using a reset token
authRouter.post("/reset-password", resetPassword);

// Public — Send email verification link to the user
authRouter.post("/send-verification-email", sendVerificationEmail);

// Public — Verify email address using a verification token
authRouter.post("/verify-email", verifyEmail);

// Public — Redirect to Google OAuth consent screen
authRouter.get(
  "/google/login",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
  }),
);

// Public — Google OAuth callback; issues JWT and redirects to the client
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${CLIENT_URL}/login?error=google_auth_failed`,
  }),
  googleAuthCallback,
);

export default authRouter;
