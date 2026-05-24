import { formatAssetTypeLabel, formatAssignmentDate } from './emailFormatters.js';
import {
  buildAssetDetailsEmailStyles,
  buildAssetDetailsTableHtml,
} from './partials/assetDetailsHtml.js';
import { buildEmailLayoutHtml } from './partials/emailLayoutHtml.js';
import { buildFallbackLinkHtml } from './partials/fallbackLinkHtml.js';
import { buildCtaButtonHtml } from './partials/ctaButtonHtml.js';

/**
 * Builds the HTML body for an asset acknowledgement notification email to an admin.
 *
 * @param {{ adminName: string, assetDetailUrl: string, acknowledgementDetails: { employeeName: string, name: string, assetType: string, serialNumber: string, acknowledgedAt: Date|string } }} placeholders - Template placeholders.
 * @returns {string} HTML email content.
 */
export function buildAssetAcknowledgementEmailHtml(placeholders) {
  const assetTypeLabel = formatAssetTypeLabel(placeholders.acknowledgementDetails.assetType);
  const acknowledgedDateLabel = formatAssignmentDate(
    placeholders.acknowledgementDetails.acknowledgedAt
  );

  const assetDetailsTable = buildAssetDetailsTableHtml([
    { label: 'Assigned to', value: placeholders.acknowledgementDetails.employeeName },
    { label: 'Asset', value: placeholders.acknowledgementDetails.name },
    { label: 'Type', value: assetTypeLabel },
    { label: 'Serial number', value: placeholders.acknowledgementDetails.serialNumber },
    { label: 'Acknowledged on', value: acknowledgedDateLabel },
  ]);

  const bodyContent = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${placeholders.adminName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                <strong>${placeholders.acknowledgementDetails.employeeName}</strong> has acknowledged the asset <strong>${placeholders.acknowledgementDetails.name}</strong>.
              </p>
              ${assetDetailsTable}
              ${buildCtaButtonHtml(placeholders.assetDetailUrl, 'View asset in AssetTrack')}
              ${buildFallbackLinkHtml(placeholders.assetDetailUrl)}
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                The asset status has been updated to acknowledged in your admin portal.
              </p>`;

  return buildEmailLayoutHtml({
    pageTitle: 'Asset Acknowledgement',
    headerTitle: 'Asset Acknowledged',
    extraHead: buildAssetDetailsEmailStyles(),
    bodyContent,
  });
}
