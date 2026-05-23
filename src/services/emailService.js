import nodemailer from 'nodemailer';
import APIError from '../utils/APIError.js';
import logger from '../utils/logger.js';
import {
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
} from '../config/index.js';
import { ERROR_MESSAGE, ERROR_TYPE, STATUS_CODE } from '../constants/index.js';

/**
 * Service for sending transactional emails via SMTP.
 */
export class EmailService {
  /**
   * Creates a nodemailer transport from environment configuration.
   *
   * @returns {import('nodemailer').Transporter}
   * @throws {APIError}
   */
  createTransport() {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      throw new APIError(
        ERROR_MESSAGE.EMAIL_SEND_FAILED,
        STATUS_CODE.INTERNAL_SERVER_ERROR,
        ERROR_TYPE.INTERNAL_ERROR
      );
    }

    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
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
                This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
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
      const transport = this.createTransport();
      const html = this.buildPasswordResetEmailHtml(userName, resetUrl);

      await transport.sendMail({
        from: SMTP_FROM,
        to: email,
        subject: 'Reset your AssetTrack password',
        html,
      });
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
