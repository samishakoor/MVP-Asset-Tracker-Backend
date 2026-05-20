import catchAsync from '../utils/catchAsync.js';
import { STATUS_CODE, SUCCESS_MESSAGE } from '../constants/index.js';
import { successWithData } from '../utils/response.js';
import { AdminSummaryService } from '../services/adminSummaryService.js';

const adminSummaryService = new AdminSummaryService();

export const getAdminSummary = catchAsync(async (req, res, next) => {
  const data = await adminSummaryService.getSummary();
  res.status(STATUS_CODE.OK).json(successWithData(data, SUCCESS_MESSAGE.ADMIN_SUMMARY_FETCHED));
});
