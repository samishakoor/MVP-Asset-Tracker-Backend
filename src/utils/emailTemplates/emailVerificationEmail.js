import { buildEmailLayoutHtml } from './partials/emailLayoutHtml.js';
import { buildFallbackLinkHtml } from './partials/fallbackLinkHtml.js';
import { buildCtaButtonHtml } from './partials/ctaButtonHtml.js';

/**
 * Builds the HTML body for an email verification message.
 *
 * @param {{ userName: string, verifyUrl: string, expiresInLabel: string }} placeholders - Template placeholders.
 * @returns {string} HTML email content.
 */
export function buildEmailVerificationEmailHtml(placeholders) {
  const bodyContent = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${placeholders.userName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                Thanks for signing up for AssetTrack. Confirm your email address to activate your account and start tracking your assigned assets.
              </p>
              ${buildCtaButtonHtml(placeholders.verifyUrl, 'Verify your email')}
              ${buildFallbackLinkHtml(placeholders.verifyUrl)}
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                This link expires in ${placeholders.expiresInLabel}. If you did not create an account, you can safely ignore this email.
              </p>`;

  return buildEmailLayoutHtml({
    pageTitle: 'Verify your email',
    headerTitle: 'Verify your email',
    bodyContent,
  });
}
