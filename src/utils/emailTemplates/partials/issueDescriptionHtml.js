const ISSUE_DESCRIPTION_MAX_LENGTH = 500;

/**
 * Escapes user-provided text for safe inclusion in HTML email content.
 *
 * @param {string} text - Raw user text.
 * @returns {string}
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Builds a long-form text block for email content with truncation support.
 *
 * @param {string} text - Raw text content.
 * @param {string} sectionTitle - Section heading label.
 * @param {string} truncationMessage - Message shown when text is truncated.
 * @returns {string} HTML snippet for the text block.
 */
export function buildLongTextBlockHtml(text, sectionTitle, truncationMessage) {
  const trimmed = text.trim();
  const isTruncated = trimmed.length > ISSUE_DESCRIPTION_MAX_LENGTH;
  const previewText = isTruncated
    ? trimmed.slice(0, ISSUE_DESCRIPTION_MAX_LENGTH)
    : trimmed;
  const escapedPreview = escapeHtml(previewText);
  const displayText = isTruncated ? `${escapedPreview}…` : escapedPreview;

  const truncationNote = isTruncated
    ? `<p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#64748b;font-style:italic;">${truncationMessage}</p>`
    : '';

  return `<div style="margin:0 0 24px;border:1px solid #e2e8f0;border-radius:12px;background-color:#f8fafc;padding:16px 20px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#059669;letter-spacing:0.04em;text-transform:uppercase;">${sectionTitle}</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#0f172a;white-space:pre-wrap;word-break:break-word;">${displayText}</p>
                ${truncationNote}
              </div>`;
}

/**
 * Builds the reported issue block for support ticket emails.
 * Long descriptions are truncated with a note to view the full report in AssetTrack.
 *
 * @param {string} description - Raw issue description from the employee.
 * @returns {string} HTML snippet for the issue description section.
 */
export function buildIssueDescriptionHtml(description) {
  return buildLongTextBlockHtml(
    description,
    'Reported issue',
    'Issue description was truncated. View the full report in AssetTrack.'
  );
}
