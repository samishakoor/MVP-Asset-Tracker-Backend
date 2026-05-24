/**
 * Builds a highlighted status callout for transactional emails.
 *
 * @param {string} statusLabel - Short status label.
 * @param {string} message - Supporting status message.
 * @returns {string} HTML snippet for the status callout.
 */
export function buildStatusCalloutHtml(statusLabel, message) {
  return `<div style="margin:0 0 24px;border:1px solid #fcd34d;border-radius:12px;background-color:#fffbeb;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#b45309;letter-spacing:0.04em;text-transform:uppercase;">Current status</p>
                <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#92400e;">${statusLabel}</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#78350f;">${message}</p>
              </div>`;
}

/**
 * Builds a success status callout for resolved ticket emails.
 *
 * @param {string} statusLabel - Short status label.
 * @param {string} message - Supporting status message.
 * @returns {string} HTML snippet for the success status callout.
 */
export function buildSuccessStatusCalloutHtml(statusLabel, message) {
  return `<div style="margin:0 0 24px;border:1px solid #6ee7b7;border-radius:12px;background-color:#ecfdf5;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#047857;letter-spacing:0.04em;text-transform:uppercase;">Current status</p>
                <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#065f46;">${statusLabel}</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#047857;">${message}</p>
              </div>`;
}

/**
 * Builds a "what happens next" guidance block for repair update emails.
 *
 * @returns {string} HTML snippet for next steps guidance.
 */
export function buildRepairNextStepsHtml() {
  return `<div style="margin:0 0 24px;border:1px solid #e2e8f0;border-radius:12px;background-color:#ffffff;padding:16px 20px;">
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#059669;letter-spacing:0.04em;text-transform:uppercase;">What happens next</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">&bull; IT is actively working on the issue you reported.</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">&bull; You can track progress anytime from your asset page in AssetTrack.</td>
                  </tr>
                  <tr>
                    <td style="padding:0;font-size:14px;line-height:1.6;color:#475569;">&bull; We will notify you when the repair is complete.</td>
                  </tr>
                </table>
              </div>`;
}

/**
 * Builds a "what happens next" guidance block for resolved ticket emails.
 *
 * @returns {string} HTML snippet for next steps guidance.
 */
export function buildTicketResolvedNextStepsHtml() {
  return `<div style="margin:0 0 24px;border:1px solid #e2e8f0;border-radius:12px;background-color:#ffffff;padding:16px 20px;">
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#059669;letter-spacing:0.04em;text-transform:uppercase;">What happens next</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">&bull; Your asset status has been restored and is ready for normal use.</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">&bull; You can review the full ticket history from your asset page in AssetTrack.</td>
                  </tr>
                  <tr>
                    <td style="padding:0;font-size:14px;line-height:1.6;color:#475569;">&bull; If the issue returns, you can report a new support ticket at any time.</td>
                  </tr>
                </table>
              </div>`;
}

/**
 * Builds a neutral status callout for asset return emails.
 *
 * @param {string} statusLabel - Short status label.
 * @param {string} message - Supporting status message.
 * @returns {string} HTML snippet for the status callout.
 */
export function buildReturnedStatusCalloutHtml(statusLabel, message) {
  return `<div style="margin:0 0 24px;border:1px solid #cbd5e1;border-radius:12px;background-color:#f8fafc;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#475569;letter-spacing:0.04em;text-transform:uppercase;">Current status</p>
                <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#0f172a;">${statusLabel}</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">${message}</p>
              </div>`;
}

/**
 * Builds a "what happens next" guidance block for asset return emails.
 *
 * @returns {string} HTML snippet for next steps guidance.
 */
export function buildAssetReturnedNextStepsHtml() {
  return `<div style="margin:0 0 24px;border:1px solid #e2e8f0;border-radius:12px;background-color:#ffffff;padding:16px 20px;">
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#059669;letter-spacing:0.04em;text-transform:uppercase;">What happens next</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">&bull; This asset is no longer assigned to you in AssetTrack.</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">&bull; You can review this assignment anytime from your assignment history.</td>
                  </tr>
                  <tr>
                    <td style="padding:0;font-size:14px;line-height:1.6;color:#475569;">&bull; Contact IT if you believe this return was recorded in error.</td>
                  </tr>
                </table>
              </div>`;
}

/**
 * Builds a status callout for assignment cancellation emails.
 *
 * @param {string} statusLabel - Short status label.
 * @param {string} message - Supporting status message.
 * @returns {string} HTML snippet for the status callout.
 */
export function buildAssignmentCancelledStatusCalloutHtml(statusLabel, message) {
  return `<div style="margin:0 0 24px;border:1px solid #fcd34d;border-radius:12px;background-color:#fffbeb;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#b45309;letter-spacing:0.04em;text-transform:uppercase;">Current status</p>
                <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#92400e;">${statusLabel}</p>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#78350f;">${message}</p>
              </div>`;
}

/**
 * Builds a "what happens next" guidance block for assignment cancellation emails.
 *
 * @returns {string} HTML snippet for next steps guidance.
 */
export function buildAssignmentCancelledNextStepsHtml() {
  return `<div style="margin:0 0 24px;border:1px solid #e2e8f0;border-radius:12px;background-color:#ffffff;padding:16px 20px;">
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#059669;letter-spacing:0.04em;text-transform:uppercase;">What happens next</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">&bull; This assignment has been removed from your active gear in AssetTrack.</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">&bull; No action is required from you because the asset was not yet acknowledged.</td>
                  </tr>
                  <tr>
                    <td style="padding:0;font-size:14px;line-height:1.6;color:#475569;">&bull; Contact IT if you have questions about this change.</td>
                  </tr>
                </table>
              </div>`;
}
