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
import { ERROR_MESSAGE, ERROR_TYPE, STATUS_CODE, EMAIL_SUBJECT } from '../constants/index.js';
import { formatExpireDuration } from '../utils/formatExpireDuration.js';
import {
  buildAssetAcknowledgementEmailHtml,
  buildAssetAssignmentEmailHtml,
  buildEmailVerificationEmailHtml,
  buildPasswordResetEmailHtml,
  buildSupportTicketReportedEmailHtml,
  buildAssetUnderRepairEmailHtml,
  buildAssetTicketResolvedEmailHtml,
  buildAssetReturnedEmailHtml,
  buildAssignmentCancelledEmailHtml,
} from '../utils/emailTemplates/index.js';

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
      const html = buildPasswordResetEmailHtml({
        userName,
        resetUrl,
        expiresInLabel: formatExpireDuration(JWT_PASSWORD_RESET_TOKEN_EXPIRE_TIME),
      });
      await this.sendEmail(email, EMAIL_SUBJECT.PASSWORD_RESET, html);
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
      const html = buildEmailVerificationEmailHtml({
        userName,
        verifyUrl,
        expiresInLabel: formatExpireDuration(JWT_EMAIL_VERIFICATION_TOKEN_EXPIRE_TIME),
      });
      await this.sendEmail(email, EMAIL_SUBJECT.EMAIL_VERIFICATION, html);
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
   * Sends an asset assignment notification email to the employee.
   *
   * @param {string} userName - Recipient display name.
   * @param {string} email - Recipient email address.
   * @param {string} loginUrl - Full login URL for the client app.
   * @param {{ name: string, assetType: string, serialNumber: string, condition: string, assignedAt: Date|string, assignedByName: string }} assignmentDetails - Asset and assignment summary.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendAssetAssignmentEmail(userName, email, loginUrl, assignmentDetails) {
    try {
      const html = buildAssetAssignmentEmailHtml({
        userName,
        loginUrl,
        assignmentDetails,
      });
      await this.sendEmail(email, EMAIL_SUBJECT.ASSET_ASSIGNMENT, html);
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
   * Sends an asset acknowledgement notification email to the assigning admin.
   *
   * @param {string} adminName - Admin recipient display name.
   * @param {string} email - Admin recipient email address.
   * @param {string} assetDetailUrl - Full admin asset detail URL for the client app.
   * @param {{ employeeName: string, name: string, assetType: string, serialNumber: string, acknowledgedAt: Date|string }} acknowledgementDetails - Acknowledgement summary.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendAssetAcknowledgementEmail(adminName, email, assetDetailUrl, acknowledgementDetails) {
    try {
      const html = buildAssetAcknowledgementEmailHtml({
        adminName,
        assetDetailUrl,
        acknowledgementDetails,
      });
      await this.sendEmail(email, EMAIL_SUBJECT.ASSET_ACKNOWLEDGEMENT, html);
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
   * Sends a support ticket reported notification email to the assigning admin.
   *
   * @param {string} adminName - Admin recipient display name.
   * @param {string} email - Admin recipient email address.
   * @param {string} ticketsUrl - Full admin tickets URL for the client app.
   * @param {{ employeeName: string, name: string, assetType: string, serialNumber: string, description: string }} ticketDetails - Ticket and asset summary.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendSupportTicketReportedEmail(adminName, email, ticketsUrl, ticketDetails) {
    try {
      const html = buildSupportTicketReportedEmailHtml({
        adminName,
        ticketsUrl,
        ticketDetails,
      });
      await this.sendEmail(email, EMAIL_SUBJECT.SUPPORT_TICKET_REPORTED, html);
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
   * Sends an asset under repair notification email to the assigned employee.
   *
   * @param {string} userName - Employee recipient display name.
   * @param {string} email - Employee recipient email address.
   * @param {string} assetDetailUrl - Full employee asset detail URL for the client app.
   * @param {{ name: string, assetType: string, serialNumber: string, adminName: string, adminNotes: string|null|undefined }} repairDetails - Repair update summary.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendAssetUnderRepairEmail(userName, email, assetDetailUrl, repairDetails) {
    try {
      const html = buildAssetUnderRepairEmailHtml({
        userName,
        assetDetailUrl,
        repairDetails,
      });
      await this.sendEmail(email, EMAIL_SUBJECT.ASSET_UNDER_REPAIR, html);
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
   * Sends a resolved support ticket notification email to the assigned employee.
   *
   * @param {string} userName - Employee recipient display name.
   * @param {string} email - Employee recipient email address.
   * @param {string} assetDetailUrl - Full employee asset detail URL for the client app.
   * @param {{ name: string, assetType: string, serialNumber: string, adminName: string, adminNotes: string|null|undefined }} resolutionDetails - Ticket resolution summary.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendAssetTicketResolvedEmail(userName, email, assetDetailUrl, resolutionDetails) {
    try {
      const html = buildAssetTicketResolvedEmailHtml({
        userName,
        assetDetailUrl,
        resolutionDetails,
      });
      await this.sendEmail(email, EMAIL_SUBJECT.ASSET_TICKET_RESOLVED, html);
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
   * Sends an asset return notification email to the employee.
   *
   * @param {string} userName - Employee recipient display name.
   * @param {string} email - Employee recipient email address.
   * @param {string} historyUrl - Full employee assignment history URL for the client app.
   * @param {{ name: string, assetType: string, serialNumber: string, assignedAt: Date|string, returnedAt: Date|string, acknowledgedAt: Date|string|null|undefined, adminName: string }} returnDetails - Return summary.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendAssetReturnedEmail(userName, email, historyUrl, returnDetails) {
    try {
      const html = buildAssetReturnedEmailHtml({
        userName,
        historyUrl,
        returnDetails,
      });
      await this.sendEmail(email, EMAIL_SUBJECT.ASSET_RETURNED, html);
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
   * Sends an assignment cancellation notification email to the employee.
   *
   * @param {string} userName - Employee recipient display name.
   * @param {string} email - Employee recipient email address.
   * @param {string} loginUrl - Full login URL for the client app.
   * @param {{ name: string, assetType: string, serialNumber: string, assignedAt: Date|string, adminName: string }} cancellationDetails - Cancellation summary.
   * @returns {Promise<void>}
   * @throws {APIError}
   */
  async sendAssignmentCancelledEmail(userName, email, loginUrl, cancellationDetails) {
    try {
      const html = buildAssignmentCancelledEmailHtml({
        userName,
        loginUrl,
        cancellationDetails,
      });
      await this.sendEmail(email, EMAIL_SUBJECT.ASSIGNMENT_CANCELLED, html);
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
