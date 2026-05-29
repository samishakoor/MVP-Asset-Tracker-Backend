import catchAsync from '../utils/catchAsync.js';
import APIError from '../utils/APIError.js';
import { STATUS_CODE, ERROR_TYPE, SUCCESS_MESSAGE } from '../constants/index.js';
import { successWithData } from '../utils/response.js';
import logger from '../utils/logger.js';
import { AssetService } from '../services/assetService.js';
import {
  createAssetSchema,
  getAllAssetsFilterSchema,
  assetIdParamSchema,
  updateAssetSchema,
} from '../validators/assetSchemas.js';
import { assetsPaginationSchema } from '../validators/paginationSchemas.js';

const assetService = new AssetService();

export const createAsset = catchAsync(async (req, res, next) => {
  const { error, value: validatedBody } = createAssetSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await assetService.createAsset(validatedBody, req.user.id);
  res.status(STATUS_CODE.CREATED).json(successWithData(data, SUCCESS_MESSAGE.ASSET_CREATED));
});

export const getAllAssets = catchAsync(async (req, res, next) => {
  const wantsPagination =
    req.query.page !== undefined ||
    req.query.limit !== undefined ||
    req.query.perPage !== undefined;

  let querySchema = getAllAssetsFilterSchema;
  if (wantsPagination) {
    querySchema = getAllAssetsFilterSchema.concat(assetsPaginationSchema);
  }

  const { error, value: validatedQuery } = querySchema.validate(req.query, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const filters = {
    status: validatedQuery.status,
    assetType: validatedQuery.asset_type,
    employeeId: validatedQuery.employee_id,
    hasActiveAssignment: validatedQuery.active_assignment === 'true',
    search: validatedQuery.search,
  };

  let paginationQuery = null;
  if (wantsPagination) {
    paginationQuery = validatedQuery;
  }

  const data = await assetService.getAllAssets(filters, paginationQuery);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.ASSETS_FETCHED));
});

export const getAssetTypes = catchAsync(async (req, res) => {
  const data = await assetService.getAssetTypes();
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.ASSET_TYPES_FETCHED));
});

export const getAssetById = catchAsync(async (req, res, next) => {
  const { error, value: validatedParams } = assetIdParamSchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await assetService.getAssetById(validatedParams.id);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.ASSET_FETCHED));
});

export const updateAsset = catchAsync(async (req, res, next) => {
  const { error: paramsError, value: validatedParams } = assetIdParamSchema.validate(
    req.params,
    { abortEarly: false }
  );
  if (paramsError) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: paramsError.message });
    return next(
      new APIError(paramsError.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const { error: bodyError, value: validatedBody } = updateAssetSchema.validate(
    req.body,
    { abortEarly: false }
  );
  if (bodyError) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: bodyError.message });
    return next(
      new APIError(bodyError.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  const data = await assetService.updateAsset(validatedParams.id, validatedBody);
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.ASSET_UPDATED));
});

export const deleteAsset = catchAsync(async (req, res, next) => {
  const { error, value: validatedParams } = assetIdParamSchema.validate(req.params, {
    abortEarly: false,
  });
  if (error) {
    logger.error({ errorType: ERROR_TYPE.VALIDATION_ERROR, message: error.message });
    return next(
      new APIError(error.message, STATUS_CODE.BAD_REQUEST, ERROR_TYPE.VALIDATION_ERROR)
    );
  }

  await assetService.deleteAsset(validatedParams.id, req.user.id);
  res.status(STATUS_CODE.OK).json(successWithData(null, SUCCESS_MESSAGE.ASSET_DELETED));
});
