import { formatAssetTypeLabel } from './emailFormatters.js';
import {
  buildAssetDetailsEmailStyles,
  buildAssetDetailsTableHtml,
} from './partials/assetDetailsHtml.js';
import { buildEmailLayoutHtml } from './partials/emailLayoutHtml.js';
import { buildFallbackLinkHtml } from './partials/fallbackLinkHtml.js';
import { buildCtaButtonHtml } from './partials/ctaButtonHtml.js';
import { buildLongTextBlockHtml } from './partials/issueDescriptionHtml.js';
import {
  buildSuccessStatusCalloutHtml,
  buildTicketResolvedNextStepsHtml,
} from './partials/statusCalloutHtml.js';

/**
 * Builds the HTML body for a resolved support ticket notification email to an employee.
 *
 * @param {{ userName: string, assetDetailUrl: string, resolutionDetails: { name: string, assetType: string, serialNumber: string, adminName: string, adminNotes: string|null|undefined } }} placeholders - Template placeholders.
 * @returns {string} HTML email content.
 */
export function buildAssetTicketResolvedEmailHtml(placeholders) {
  const assetTypeLabel = formatAssetTypeLabel(placeholders.resolutionDetails.assetType);

  const assetDetailsTable = buildAssetDetailsTableHtml([
    { label: 'Asset', value: placeholders.resolutionDetails.name },
    { label: 'Type', value: assetTypeLabel },
    { label: 'Serial number', value: placeholders.resolutionDetails.serialNumber },
    { label: 'Resolved by', value: placeholders.resolutionDetails.adminName },
  ]);

  const statusCallout = buildSuccessStatusCalloutHtml(
    'Resolved',
    'IT has completed work on your support request and your asset is ready to use again.'
  );

  const nextStepsBlock = buildTicketResolvedNextStepsHtml();

  const bodyContent = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${placeholders.userName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                Good news — the support ticket for <strong>${placeholders.resolutionDetails.name}</strong> has been marked as <strong>resolved</strong> by our IT team.
              </p>
              ${statusCallout}
              ${assetDetailsTable}
              ${nextStepsBlock}
              ${buildCtaButtonHtml(placeholders.assetDetailUrl, 'View asset in AssetTrack')}
              ${buildFallbackLinkHtml(placeholders.assetDetailUrl)}
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                Thank you for reporting the issue. Contact your IT administrator if you need further assistance.
              </p>`;

  return buildEmailLayoutHtml({
    pageTitle: 'Support ticket resolved',
    headerTitle: 'Your support ticket is resolved',
    extraHead: buildAssetDetailsEmailStyles(),
    bodyContent,
  });
}
