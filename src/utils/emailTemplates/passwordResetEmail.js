import { buildEmailLayoutHtml } from './partials/emailLayoutHtml.js';
import { buildFallbackLinkHtml } from './partials/fallbackLinkHtml.js';
import { buildCtaButtonHtml } from './partials/ctaButtonHtml.js';

/**
 * Builds the HTML body for a password reset email.
 *
 * @param {{ userName: string, resetUrl: string, expiresInLabel: string }} placeholders - Template placeholders.
 * @returns {string} HTML email content.
 */
export function buildPasswordResetEmailHtml(placeholders) {
  const bodyContent = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${placeholders.userName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                We received a request to reset the password for your AssetTrack account. Click the button below to choose a new password.
              </p>
              ${buildCtaButtonHtml(placeholders.resetUrl, 'Reset password')}
              ${buildFallbackLinkHtml(placeholders.resetUrl)}
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                This link expires in ${placeholders.expiresInLabel}. If you did not request a password reset, you can safely ignore this email.
              </p>`;

  return buildEmailLayoutHtml({
    pageTitle: 'Reset your password',
    headerTitle: 'Reset your password',
    bodyContent,
  });
}
