import crypto from 'crypto';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel from '../models/userModel.js';
import { hashPassword } from '../utils/passwordHelper.js';
import {
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_OAUTH_CALLBACK_URL,
} from '../config/index.js';

/**
 * Builds a display name from a Google OAuth profile.
 *
 * @param {import('passport-google-oauth20').Profile} profile
 * @returns {string}
 */
function buildNameFromGoogleProfile(profile) {
  if (profile.displayName) {
    return profile.displayName;
  }

  const givenName = profile.name?.givenName;
  const familyName = profile.name?.familyName;
  const parts = [givenName, familyName].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return profile.emails[0].value;
}

/**
 * Finds an existing user by Google ID, links Google ID to an email account, or creates a new user.
 *
 * @param {import('passport-google-oauth20').Profile} profile
 * @returns {Promise<object>}
 */
async function resolveGoogleUser(profile) {
  const googleId = profile.id;

  const userModel = new UserModel();
  const existingGoogleUser = await userModel.findByGoogleId(googleId);

  if (existingGoogleUser) {
    return existingGoogleUser;
  }

  const email = profile.emails[0].value.toLowerCase();
  const name = buildNameFromGoogleProfile(profile);
  const existingEmailUser = await userModel.findByEmail(email);

  if (existingEmailUser) {
    if (!existingEmailUser.isVerified) {
      await userModel.markEmailVerified(existingEmailUser.id);
    }

    return await userModel.updateGoogleId(existingEmailUser.id, googleId);
  }

  const passwordHash = await hashPassword(crypto.randomBytes(32).toString('hex'));

  return await userModel.create({
    name,
    email,
    googleId,
    passwordHash,
    isVerified: true,
  });
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: GOOGLE_OAUTH_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error('Google profile did not include an email address'), null);
        }

        const user = await resolveGoogleUser(profile);
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
