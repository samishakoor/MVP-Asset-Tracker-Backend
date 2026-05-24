import {
  formatAssetTypeLabel,
  formatAssignmentDate,
} from './emailFormatters.js';
import {
  buildAssetDetailsEmailStyles,
  buildAssetDetailsTableHtml,
} from './partials/assetDetailsHtml.js';
import { buildEmailLayoutHtml } from './partials/emailLayoutHtml.js';
import { buildFallbackLinkHtml } from './partials/fallbackLinkHtml.js';
import { buildCtaButtonHtml } from './partials/ctaButtonHtml.js';
import {
  buildAssignmentCancelledNextStepsHtml,
  buildAssignmentCancelledStatusCalloutHtml,
} from './partials/statusCalloutHtml.js';

/**
 * Builds the HTML body for an assignment cancellation notification email to an employee.
 *
 * @param {{ userName: string, loginUrl: string, cancellationDetails: { name: string, assetType: string, serialNumber: string, assignedAt: Date|string, adminName: string } }} placeholders - Template placeholders.
 * @returns {string} HTML email content.
 */
export function buildAssignmentCancelledEmailHtml(placeholders) {
  const assetTypeLabel = formatAssetTypeLabel(placeholders.cancellationDetails.assetType);
  const assignedDateLabel = formatAssignmentDate(placeholders.cancellationDetails.assignedAt);

  const assetDetailsTable = buildAssetDetailsTableHtml([
    { label: 'Asset', value: placeholders.cancellationDetails.name },
    { label: 'Type', value: assetTypeLabel },
    { label: 'Serial number', value: placeholders.cancellationDetails.serialNumber },
    { label: 'Originally assigned on', value: assignedDateLabel },
    { label: 'Cancelled by', value: placeholders.cancellationDetails.adminName },
  ]);

  const statusCallout = buildAssignmentCancelledStatusCalloutHtml(
    'Assignment cancelled',
    'This assignment was cancelled before you acknowledged the asset, so no return action is required from you.'
  );

  const nextStepsBlock = buildAssignmentCancelledNextStepsHtml();

  const bodyContent = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${placeholders.userName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                Your pending assignment for <strong>${placeholders.cancellationDetails.name}</strong> has been cancelled by IT.
              </p>
              ${statusCallout}
              ${assetDetailsTable}
              ${nextStepsBlock}
              ${buildCtaButtonHtml(placeholders.loginUrl, 'Log in to AssetTrack')}
              ${buildFallbackLinkHtml(placeholders.loginUrl)}
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                If you have questions about this update, please contact your IT administrator.
              </p>`;

  return buildEmailLayoutHtml({
    pageTitle: 'Assignment cancelled',
    headerTitle: 'Your assetassignment has been cancelled',
    extraHead: buildAssetDetailsEmailStyles(),
    bodyContent,
  });
}
