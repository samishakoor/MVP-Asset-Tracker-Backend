/**
 * Wraps email body content in the shared AssetTrack transactional layout.
 *
 * @param {{ pageTitle: string, headerTitle: string, extraHead?: string, bodyContent: string }} layoutData - Layout placeholders.
 * @returns {string} Full HTML email document.
 */
export function buildEmailLayoutHtml(layoutData) {
  const extraHead = layoutData.extraHead ? layoutData.extraHead : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${layoutData.pageTitle}</title>
  ${extraHead}
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,0.06);">
          <tr>
            <td style="padding:32px 32px 24px;background:linear-gradient(180deg,#ecfdf5 0%,#ffffff 100%);">
              <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#059669;letter-spacing:0.02em;">AssetTrack</p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:600;color:#0f172a;">${layoutData.headerTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;">
              ${layoutData.bodyContent}
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
