import Joi from 'joi';

const SORT_ORDER_VALUES = ['asc', 'desc'];

/**
 * Builds a Joi query schema for paginated list endpoints.
 *
 * @param {object} options
 * @param {string[]} options.allowedSortFields
 * @param {number} options.defaultPage
 * @param {number} options.defaultPerPage
 * @param {string} options.defaultSortBy
 * @param {string} options.defaultOrderBy
 * @returns {import('joi').ObjectSchema}
 */
export function createPaginationQuerySchema(options) {
  return Joi.object({
    page: Joi.number().integer().min(1).default(options.defaultPage),
    perPage: Joi.number().integer().min(1).max(100),
    limit: Joi.number().integer().min(1).max(100),
    sortBy: Joi.string()
      .valid(...options.allowedSortFields)
      .default(options.defaultSortBy),
    orderBy: Joi.string()
      .valid(...SORT_ORDER_VALUES)
      .default(options.defaultOrderBy),
  });
}

export const auditLogsPaginationSchema = createPaginationQuerySchema({
  allowedSortFields: ['createdAt'],
  defaultPage: 1,
  defaultPerPage: 20,
  defaultSortBy: 'createdAt',
  defaultOrderBy: 'desc',
});

export const notificationsPaginationSchema = createPaginationQuerySchema({
  allowedSortFields: ['createdAt'],
  defaultPage: 1,
  defaultPerPage: 10,
  defaultSortBy: 'createdAt',
  defaultOrderBy: 'desc',
});

export const myHistoryPaginationSchema = createPaginationQuerySchema({
  allowedSortFields: ['returnedAt', 'assignedAt', 'assetName'],
  defaultPage: 1,
  defaultPerPage: 10,
  defaultSortBy: 'returnedAt',
  defaultOrderBy: 'desc',
});
