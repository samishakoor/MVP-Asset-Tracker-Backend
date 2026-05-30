import APIError from '../utils/APIError.js';
import { STATUS_CODE, ERROR_TYPE, ERROR_MESSAGE } from '../constants/index.js';

const ORDER_VALUES = ['asc', 'desc'];

/**
 * Reusable pagination helper for list APIs.
 * Resolves page/perPage/sort options and builds response metadata.
 */
export class PaginationService {
  /**
   * Normalizes validated query params into skip/take and sort options.
   *
   * @param {object} query - Validated query from controller (page, perPage, limit, sortBy, orderBy).
   * @param {object} config
   * @param {number} config.defaultPage
   * @param {number} config.defaultPerPage
   * @param {string} config.defaultSortBy
   * @param {string} config.defaultOrderBy
   * @param {string[]} config.allowedSortFields
   * @returns {{ page: number, perPage: number, skip: number, take: number, sortBy: string, order: string }}
   * @throws {APIError}
   */
  resolveQuery(query, config) {
    const page = query.page !== undefined ? query.page : config.defaultPage;
    let perPage = query.perPage;
    if (perPage === undefined && query.limit !== undefined) {
      perPage = query.limit;
    }
    if (perPage === undefined) {
      perPage = config.defaultPerPage;
    }

    const sortBy = query.sortBy !== undefined ? query.sortBy : config.defaultSortBy;
    const order = query.orderBy !== undefined ? query.orderBy : config.defaultOrderBy;

    if (!config.allowedSortFields.includes(sortBy)) {
      throw new APIError(
        ERROR_MESSAGE.INVALID_SORT_FIELD,
        STATUS_CODE.BAD_REQUEST,
        ERROR_TYPE.VALIDATION_ERROR
      );
    }

    if (!ORDER_VALUES.includes(order)) {
      throw new APIError(
        ERROR_MESSAGE.INVALID_SORT_ORDER,
        STATUS_CODE.BAD_REQUEST,
        ERROR_TYPE.VALIDATION_ERROR
      );
    }

    const skip = (page - 1) * perPage;

    return {
      page,
      perPage,
      skip,
      take: perPage,
      sortBy,
      order,
    };
  }

  /**
   * Maps API sort field to a Prisma orderBy clause using the provided field map.
   *
   * @param {{ sortBy: string, order: string }} resolved - Output from resolveQuery.
   * @param {Record<string, function(string): object>} sortFieldMap - Maps sortBy to Prisma orderBy builder.
   * @returns {object}
   */
  buildPrismaOrderBy(resolved, sortFieldMap) {
    const orderByBuilder = sortFieldMap[resolved.sortBy];
    return orderByBuilder(resolved.order);
  }

  /**
   * Builds standard pagination metadata for API responses.
   *
   * @param {number} page
   * @param {number} perPage
   * @param {number} total
   * @returns {{ page: number, limit: number, per_page: number, total_records: number, total_pages: number }}
   */
  buildMeta(page, perPage, total) {
    const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);

    return {
      page,
      limit: perPage,
      per_page: perPage,
      total_records: total,
      total_pages: totalPages,
    };
  }

  /**
   * Runs paginated fetch and count in parallel and returns items with metadata.
   *
   * @param {{ page: number, perPage: number, skip: number, take: number, sortBy: string, order: string }} resolved
   * @param {function(object): Promise<Array>} fetchItems
   * @param {function(): Promise<number>} countItems
   * @returns {Promise<{ items: Array, pagination: object }>}
   */
  async paginate(resolved, fetchItems, countItems) {
    const [items, total] = await Promise.all([fetchItems(resolved), countItems()]);

    return {
      items,
      pagination: this.buildMeta(resolved.page, resolved.perPage, total),
    };
  }
}

export default PaginationService;
