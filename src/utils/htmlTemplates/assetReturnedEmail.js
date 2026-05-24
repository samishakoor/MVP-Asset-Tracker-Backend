import {
  formatAssetTypeLabel,
  formatAssignmentDate,
  formatAssignmentDuration,
} from './emailFormatters.js';
import {
  buildAssetDetailsEmailStyles,
  buildAssetDetailsTableHtml,
} from './partials/assetDetailsHtml.js';
import { buildEmailLayoutHtml } from './partials/emailLayoutHtml.js';
import { buildFallbackLinkHtml } from './partials/fallbackLinkHtml.js';
import { buildCtaButtonHtml } from './partials/ctaButtonHtml.js';
import {
  buildAssetReturnedNextStepsHtml,
  buildReturnedStatusCalloutHtml,
} from './partials/statusCalloutHtml.js';

/**
 * Builds detail rows for an asset return notification email.
 *
 * @param {{ name: string, assetType: string, serialNumber: string, assignedAt: Date|string, returnedAt: Date|string, acknowledgedAt: Date|string|null|undefined, adminName: string }} returnDetails - Return summary.
 * @returns {Array<{ label: string, value: string }>}
 */
function buildAssetReturnDetailRows(returnDetails) {
  const assetTypeLabel = formatAssetTypeLabel(returnDetails.assetType);
  const assignedDateLabel = formatAssignmentDate(returnDetails.assignedAt);
  const returnedDateLabel = formatAssignmentDate(returnDetails.returnedAt);
  const durationLabel = formatAssignmentDuration(
    returnDetails.assignedAt,
    returnDetails.returnedAt
  );

  const rows = [
    { label: 'Asset', value: returnDetails.name },
    { label: 'Type', value: assetTypeLabel },
    { label: 'Serial number', value: returnDetails.serialNumber },
    { label: 'Assigned on', value: assignedDateLabel },
    { label: 'Returned on', value: returnedDateLabel },
    { label: 'Assignment duration', value: durationLabel },
  ];

  if (returnDetails.acknowledgedAt) {
    rows.push({
      label: 'Acknowledged on',
      value: formatAssignmentDate(returnDetails.acknowledgedAt),
    });
  }

  return rows;
}

/**
 * Builds the HTML body for an asset return notification email to an employee.
 *
 * @param {{ userName: string, historyUrl: string, returnDetails: { name: string, assetType: string, serialNumber: string, assignedAt: Date|string, returnedAt: Date|string, acknowledgedAt: Date|string|null|undefined, adminName: string } }} placeholders - Template placeholders.
 * @returns {string} HTML email content.
 */
export function buildAssetReturnedEmailHtml(placeholders) {
  const assetDetailsTable = buildAssetDetailsTableHtml(
    buildAssetReturnDetailRows(placeholders.returnDetails)
  );

  const returnedDateLabel = formatAssignmentDate(placeholders.returnDetails.returnedAt);

  const statusCallout = buildReturnedStatusCalloutHtml(
    'Returned',
    `This assignment was closed on ${returnedDateLabel} and removed from your active gear.`
  );

  const nextStepsBlock = buildAssetReturnedNextStepsHtml();

  const bodyContent = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${placeholders.userName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                <strong>${placeholders.returnDetails.name}</strong> has been marked as <strong>returned</strong> and is no longer assigned to you.
              </p>
              ${statusCallout}
              ${assetDetailsTable}
              ${nextStepsBlock}
              ${buildCtaButtonHtml(placeholders.historyUrl, 'View assignment history')}
              ${buildFallbackLinkHtml(placeholders.historyUrl)}
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                Thank you for returning company equipment through AssetTrack.
              </p>`;

  return buildEmailLayoutHtml({
    pageTitle: 'Asset returned',
    headerTitle: 'Your asset has been returned',
    extraHead: buildAssetDetailsEmailStyles(),
    bodyContent,
  });
}
