/**
 * Builds a primary call-to-action button for transactional emails.
 *
 * @param {string} href - Button destination URL.
 * @param {string} label - Button label text.
 * @returns {string} HTML snippet for the CTA button.
 */
export function buildCtaButtonHtml(href, label) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:8px;background-color:#059669;">
                    <a href="${href}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      ${label}
                    </a>
                  </td>
                </tr>
              </table>`;
}
