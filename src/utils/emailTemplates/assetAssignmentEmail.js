import {
  formatAssetConditionLabel,
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

/**
 * Builds the HTML body for an asset assignment notification email.
 *
 * @param {{ userName: string, loginUrl: string, assignmentDetails: { name: string, assetType: string, serialNumber: string, condition: string, assignedAt: Date|string, assignedByName: string } }} placeholders - Template placeholders.
 * @returns {string} HTML email content.
 */
export function buildAssetAssignmentEmailHtml(placeholders) {
  const assetTypeLabel = formatAssetTypeLabel(placeholders.assignmentDetails.assetType);
  const conditionLabel = formatAssetConditionLabel(placeholders.assignmentDetails.condition);
  const assignedDateLabel = formatAssignmentDate(placeholders.assignmentDetails.assignedAt);

  const assetDetailsTable = buildAssetDetailsTableHtml([
    { label: 'Name', value: placeholders.assignmentDetails.name },
    { label: 'Type', value: assetTypeLabel },
    { label: 'Serial number', value: placeholders.assignmentDetails.serialNumber },
    { label: 'Condition', value: conditionLabel },
    { label: 'Assigned on', value: assignedDateLabel },
    { label: 'Assigned by', value: placeholders.assignmentDetails.assignedByName },
  ]);

  const bodyContent = `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">Hi ${placeholders.userName},</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">
                An asset has been assigned to you. Please log in to AssetTrack and acknowledge the asset.
              </p>
              ${assetDetailsTable}
              ${buildCtaButtonHtml(placeholders.loginUrl, 'Log in to AssetTrack')}
              ${buildFallbackLinkHtml(placeholders.loginUrl)}
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#64748b;">
                After signing in, open your assignments to confirm you have received this asset.
              </p>`;

  return buildEmailLayoutHtml({
    pageTitle: 'New Asset Assigned',
    headerTitle: 'New asset assigned to you',
    extraHead: buildAssetDetailsEmailStyles(),
    bodyContent,
  });
}
