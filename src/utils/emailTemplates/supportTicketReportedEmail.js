import { formatAssetTypeLabel } from './emailFormatters.js';
import {
  buildAssetDetailsEmailStyles,
  buildAssetDetailsTableHtml,
} from './partials/assetDetailsHtml.js';
import { buildEmailLayoutHtml } from './partials/emailLayoutHtml.js';
import { buildFallbackLinkHtml } from './partials/fallbackLinkHtml.js';
import { buildCtaButtonHtml } from './partials/ctaButtonHtml.js';
import { buildIssueDescriptionHtml } from './partials/issueDescriptionHtml.js';

/**
 * Builds the HTML body for a support ticket reported notification email to an admin.
 *
 * @param {{ adminName: string, ticketsUrl: string, ticketDetails: { employeeName: string, name: string, assetType: string, serialNumber: string, description: string } }} placeholders - Template placeholders.
 * @returns {string} HTML email content.
 */
export function buildSupportTicketReportedEmailHtml(placeholders) {
  const assetTypeLabel = formatAssetTypeLabel(placeholders.ticketDetails.assetType);

  const assetDetailsTable = buildAssetDetailsTableHtml([
    { label: 'Reported by', value: placeholders.ticketDetails.employeeName },
    { label: 'Asset', value: placeholders.ticketDetails.name },
    { label: 'Type', value: assetTypeLabel },
    { label: 'Serial number', value: placeholders.ticketDetails.serialNumber },
  ]);

  const issueDescriptionBlock = buildIssueDescriptionHtml(placeholders.ticketDetails.description);

  const bodyContent = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${placeholders.adminName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                <strong>${placeholders.ticketDetails.employeeName}</strong> has flagged an issue for <strong>${placeholders.ticketDetails.name}</strong>.
              </p>
              ${assetDetailsTable}
              ${issueDescriptionBlock}
              ${buildCtaButtonHtml(placeholders.ticketsUrl, 'Review ticket in AssetTrack')}
              ${buildFallbackLinkHtml(placeholders.ticketsUrl)}
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                The asset status has been updated to pending IT review in your admin portal.
              </p>`;

  return buildEmailLayoutHtml({
    pageTitle: 'Asset issue reported',
    headerTitle: 'Asset issue reported',
    extraHead: buildAssetDetailsEmailStyles(),
    bodyContent,
  });
}
