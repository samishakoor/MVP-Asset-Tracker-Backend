import dotenv from 'dotenv';
import fs from 'fs';

// Always load base .env first
dotenv.config({ path: './.env' });

// Overlay environment-specific file when present (e.g. .env.development)
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'prod') {
  const envFile = `./.env.${process.env.NODE_ENV}`;
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile, override: true });
  }
}

export const PORT = Number(process.env.PORT) || 3000;
export const NODE_ENV = process.env.NODE_ENV;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_ACCESS_TOKEN_EXPIRE_TIME = process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME || '7d';
export const CLIENT_URL = process.env.CLIENT_URL;
export const SERVER_URL = process.env.SERVER_URL;
export const RESEND_TOKEN = process.env.RESEND_TOKEN;
export const RESEND_FROM = process.env.RESEND_FROM;
export const JWT_PASSWORD_RESET_TOKEN_EXPIRE_TIME =
  Number(process.env.JWT_PASSWORD_RESET_TOKEN_EXPIRE_TIME) || 60;
export const JWT_EMAIL_VERIFICATION_TOKEN_EXPIRE_TIME =
  Number(process.env.JWT_EMAIL_VERIFICATION_TOKEN_EXPIRE_TIME) || 1440;
