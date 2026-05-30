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
export const JWT_ACCESS_TOKEN_EXPIRE_TIME = process.env.JWT_ACCESS_TOKEN_EXPIRE_TIME || '1d';
export const CLIENT_URL = process.env.CLIENT_URL;
export const SERVER_URL = process.env.SERVER_URL;
export const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID;
export const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
export const OAUTH_REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN;
export const OAUTH_EMAIL = process.env.OAUTH_EMAIL;
export const OAUTH_REDIRECT_URI = process.env.OAUTH_REDIRECT_URI;
export const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
export const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
export const GOOGLE_OAUTH_CALLBACK_URL = process.env.GOOGLE_OAUTH_CALLBACK_URL;
export const JWT_PASSWORD_RESET_TOKEN_EXPIRE_TIME =
  process.env.JWT_PASSWORD_RESET_TOKEN_EXPIRE_TIME || '1h';
export const JWT_EMAIL_VERIFICATION_TOKEN_EXPIRE_TIME =
  process.env.JWT_EMAIL_VERIFICATION_TOKEN_EXPIRE_TIME || '1h';
