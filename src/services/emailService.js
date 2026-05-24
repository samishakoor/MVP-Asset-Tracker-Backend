import { google } from 'googleapis';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';
import {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_EMAIL,
  OAUTH_REDIRECT_URI,
  OAUTH_REFRESH_TOKEN,
  JWT_EMAIL_VERIFICATION_TOKEN_EXPIRE_TIME,
  JWT_PASSWORD_RESET_TOKEN_EXPIRE_TIME,
} from '../config/index.js';
import { ERROR_MESSAGE, ERROR_TYPE, STATUS_CODE } from '../constants/index.js';
import { formatExpireDuration } from '../utils/formatExpireDuration.js';

/**
 * Service for sending transactional emails via Gmail OAuth API.
 */
export class EmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      OAUTH_CLIENT_ID,
      OAUTH_CLIENT_SECRET,
      OAUTH_REDIRECT_URI || 'https://developers.google.com/oauthplayground'
    );

    this.oauth2Client.setCredentials({
      refresh_token: OAUTH_REFRESH_TOKEN,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Ensures OAuth credentials are configured before sending.
   *
   * @throws {APIError}
   */
  assertOAuthConfig() {
    if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET || !OAUTH_REFRESH_TOKEN || !OAUTH_EMAIL) {
      throw new APIError(
        ERROR_MESSAGE.EMAIL_SEND_FAILED,
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        ERROR_TYPE.INTERNAL_ERROR
      );
    }
  }

  /**
   * Encodes a MIME message buffer for Gmail API raw send.
   *
   * @param {Buffer} messageBuffer
   * @returns {string}
   */
  encodeRawMessage(messageBuffer) {
    return Buffer.from(messageBuffer)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Sends an HTML email via the Gmail API.
   *
   * @param {string} to - Recipient email address.
   * @param {string} subject - Email subject line.
   * @param {string} htmlContent - HTML email body.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendEmail(to, subject, htmlContent) {
    this.assertOAuthConfig();

    const mailOptions = {
      from: `AssetTrack <${OAUTH_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    };

    const mail = new MailComposer(mailOptions);
    const message = await mail.compile().build();
    const rawMessage = this.encodeRawMessage(message);

    await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });
  }

  /**
   * Builds the HTML body for a password reset email.
   *
   * @param {string} userName - Recipient display name.
   * @param {string} resetUrl - Full reset password URL including token.
   * @returns {string} HTML email content.
   */
  buildPasswordResetEmailHtml(userName, resetUrl) {
    const expiresInLabel = formatExpireDuration(JWT_PASSWORD_RESET_TOKEN_EXPIRE_TIME);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,0.06);">
          <tr>
            <td style="padding:32px 32px 24px;background:linear-gradient(180deg,#ecfdf5 0%,#ffffff 100%);">
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#059669;letter-spacing:0.02em;">AssetTrack</p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:600;color:#0f172a;">Reset your password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${userName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                We received a request to reset the password for your AssetTrack account. Click the button below to choose a new password.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:8px;background-color:#059669;">
                    <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Reset password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                This link expires in ${expiresInLabel}. If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e2e8f0;background-color:#f8fafc;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;text-align:center;">
                &copy; AssetTrack &mdash; Company asset management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Sends a password reset email to the user.
   *
   * @param {string} userName - Recipient display name.
   * @param {string} email - Recipient email address.
   * @param {string} resetUrl - Full reset password URL including token.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendPasswordResetEmail(userName, email, resetUrl) {
    try {
      const html = this.buildPasswordResetEmailHtml(userName, resetUrl);
      await this.sendEmail(email, 'Reset your AssetTrack password', html);
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.INTERNAL_ERROR, message: err.message });
      throw new APIError(
        ERROR_MESSAGE.EMAIL_SEND_FAILED,
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        ERROR_TYPE.INTERNAL_ERROR
      );
    }
  }

  /**
   * Builds the HTML body for an email verification message.
   *
   * @param {string} userName - Recipient display name.
   * @param {string} verifyUrl - Full verify-email URL including token.
   * @returns {string} HTML email content.
   */
  buildEmailVerificationHtml(userName, verifyUrl) {
    const expiresInLabel = formatExpireDuration(JWT_EMAIL_VERIFICATION_TOKEN_EXPIRE_TIME);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,0.06);">
          <tr>
            <td style="padding:32px 32px 24px;background:linear-gradient(180deg,#ecfdf5 0%,#ffffff 100%);">
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#059669;letter-spacing:0.02em;">AssetTrack</p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:600;color:#0f172a;">Verify your email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${userName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                Thanks for signing up for AssetTrack. Confirm your email address to activate your account and start tracking your assigned assets.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:8px;background-color:#059669;">
                    <a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Verify your email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                This link expires in ${expiresInLabel}. If you did not create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e2e8f0;background-color:#f8fafc;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;text-align:center;">
                &copy; AssetTrack &mdash; Company asset management
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Sends an email verification message to the user.
   *
   * @param {string} userName - Recipient display name.
   * @param {string} email - Recipient email address.
   * @param {string} verifyUrl - Full verify-email URL including token.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendEmailVerificationEmail(userName, email, verifyUrl) {
    try {
      const html = this.buildEmailVerificationHtml(userName, verifyUrl);
      await this.sendEmail(email, 'Verify your AssetTrack email address', html);
    } catch (err) {
      logger.error({ errorType: ERROR_TYPE.INTERNAL_ERROR, message: err.message });
      throw new APIError(
        ERROR_MESSAGE.EMAIL_SEND_FAILED,
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        ERROR_TYPE.INTERNAL_ERROR
      );
    }
  }
}

export default EmailService;
