/**
 * Builds responsive styles for asset detail tables in transactional emails.
 *
 * @returns {string} HTML style block for email clients.
 */
export function buildAssetDetailsEmailStyles() {
  return `<style>
    @media only screen and (max-width: 480px) {
      .asset-detail-label,
      .asset-detail-value {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      .asset-detail-label {
        padding: 12px 0 4px !important;
      }
      .asset-detail-value {
        padding: 0 0 12px !important;
      }
    }
  </style>`;
}

/**
 * Builds a single row for the asset details table in assignment emails.
 *
 * @param {string} label - Field label.
 * @param {string} value - Field value.
 * @returns {string} HTML table row.
 */
export function buildAssetDetailRowHtml(label, value) {
  return `<tr class="asset-detail-row">
                <td class="asset-detail-label" style="padding:12px 24px 12px 0;font-size:14px;line-height:1.5;color:#64748b;width:140px;min-width:120px;vertical-align:top;">${label}</td>
                <td class="asset-detail-value" style="padding:12px 0;font-size:15px;line-height:1.5;color:#0f172a;font-weight:500;vertical-align:top;">${value}</td>
              </tr>`;
}

/**
 * Builds an asset details table from label/value rows.
 *
 * @param {Array<{ label: string, value: string }>} rows - Detail rows to render.
 * @returns {string} HTML table block.
 */
export function buildAssetDetailsTableHtml(rows) {
  const rowHtml = rows
    .map((row) => buildAssetDetailRowHtml(row.label, row.value))
    .join('\n                      ');

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;border:1px solid #e2e8f0;border-radius:12px;background-color:#f8fafc;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#059669;letter-spacing:0.04em;text-transform:uppercase;">Asset details</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${rowHtml}
                    </table>
                  </td>
                </tr>
              </table>`;
}
