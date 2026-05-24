/**
 * Builds a fallback link block when the primary CTA button is unavailable.
 *
 * @param {string} actionUrl - Full action URL from the email.
 * @returns {string} HTML snippet for the fallback link section.
 */
export function buildFallbackLinkHtml(actionUrl) {
  return `<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#64748b;">
                If the button above does not work, copy and paste the link below into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.6;word-break:break-all;">
                <a href="${actionUrl}" target="_blank" rel="noopener noreferrer" style="color:#059669;text-decoration:underline;">${actionUrl}</a>
              </p>`;
}
