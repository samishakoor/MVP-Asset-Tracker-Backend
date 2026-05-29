import Joi from 'joi';
import {
  AssetCondition,
  AssetStatus,
} from '../constants/index.js';

const assetConditionValues = Object.values(AssetCondition);
const assetStatusValues = Object.values(AssetStatus);

const assetTypeField = Joi.string().trim().min(1).max(64).required();

const assetTypeFieldOptional = Joi.string().trim().min(1).max(64).optional();

export const createAssetSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  assetType: assetTypeField,
  serialNumber: Joi.string().trim().min(1).max(255).required(),
  condition: Joi.string()
    .valid(...assetConditionValues)
    .required(),
  notes: Joi.string().trim().max(2000).allow('', null).optional(),
});

export const getAllAssetsFilterSchema = Joi.object({
  status: Joi.string()
    .valid(...assetStatusValues)
    .optional(),
  asset_type: assetTypeFieldOptional,
  employee_id: Joi.string().uuid().optional(),
  active_assignment: Joi.string().valid('true').optional(),
  search: Joi.string().trim().max(255).optional(),
});

export const getAllAssetsQuerySchema = getAllAssetsFilterSchema;

export const assetIdParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const updateAssetSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).optional(),
  assetType: assetTypeFieldOptional,
  serialNumber: Joi.string().trim().min(1).max(255).optional(),
  condition: Joi.string()
    .valid(...assetConditionValues)
    .optional(),
  notes: Joi.string().trim().max(2000).allow('', null).optional(),
}).min(1);
