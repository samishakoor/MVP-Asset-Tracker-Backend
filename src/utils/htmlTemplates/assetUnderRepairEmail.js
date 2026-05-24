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
  buildRepairNextStepsHtml,
  buildStatusCalloutHtml,
} from './partials/statusCalloutHtml.js';

/**
 * Builds the HTML body for an asset under repair notification email to an employee.
 *
 * @param {{ userName: string, assetDetailUrl: string, repairDetails: { name: string, assetType: string, serialNumber: string, adminName: string, adminNotes: string|null|undefined } }} placeholders - Template placeholders.
 * @returns {string} HTML email content.
 */
export function buildAssetUnderRepairEmailHtml(placeholders) {
  const assetTypeLabel = formatAssetTypeLabel(placeholders.repairDetails.assetType);

  const assetDetailsTable = buildAssetDetailsTableHtml([
    { label: 'Asset', value: placeholders.repairDetails.name },
    { label: 'Type', value: assetTypeLabel },
    { label: 'Serial number', value: placeholders.repairDetails.serialNumber },
    { label: 'Reviewed by', value: placeholders.repairDetails.adminName },
  ]);

  const statusCallout = buildStatusCalloutHtml(
    'Under repair',
    'Your assigned asset is being serviced by the IT team following your support request.'
  );

  let adminNotesBlock = '';
  if (placeholders.repairDetails.adminNotes) {
    adminNotesBlock = buildLongTextBlockHtml(
      placeholders.repairDetails.adminNotes,
      'IT notes',
      'IT notes were truncated. View the full update in AssetTrack.'
    );
  }

  const nextStepsBlock = buildRepairNextStepsHtml();

  const bodyContent = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${placeholders.userName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                We wanted to let you know that <strong>${placeholders.repairDetails.name}</strong>, assigned to you, has been marked as <strong>under repair</strong>.
              </p>
              ${statusCallout}
              ${assetDetailsTable}
              ${adminNotesBlock}
              ${nextStepsBlock}
              ${buildCtaButtonHtml(placeholders.assetDetailUrl, 'View asset status')}
              ${buildFallbackLinkHtml(placeholders.assetDetailUrl)}
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                If you have urgent questions, please contact your IT administrator.
              </p>`;

  return buildEmailLayoutHtml({
    pageTitle: 'Asset under repair',
    headerTitle: 'Your asset is under repair',
    extraHead: buildAssetDetailsEmailStyles(),
    bodyContent,
  });
}
