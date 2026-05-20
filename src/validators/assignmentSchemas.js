import Joi from 'joi';
import { AssetStatus } from '../constants/index.js';

const assignmentStatusValues = [
  AssetStatus.ASSIGNED,
  AssetStatus.ACKNOWLEDGED,
  AssetStatus.PENDING_REVIEW,
  AssetStatus.UNDER_REPAIR,
];

export const assignAssetSchema = Joi.object({
  assetId: Joi.string().uuid().required(),
  employeeId: Joi.string().uuid().required(),
  assignedAt: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const assignmentIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const acknowledgeAssetSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const returnAssetSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const updateAssignmentStatusSchema = Joi.object({
  currentStatus: Joi.string()
    .valid(...assignmentStatusValues)
    .required(),
});
