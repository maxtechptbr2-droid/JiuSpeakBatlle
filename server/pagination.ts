/**
 * Helper to standardise and safe-parse and enforce limits on offset-based pagination.
 * Prevents memory issues when tables grow to 10k+ records.
 */
export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function parsePagination(
  query: any,
  defaultLimit: number = 20,
  maxLimit: number = 100
): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page || 1)) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(query.limit || defaultLimit)) || defaultLimit)
  );
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
}

export function formatPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    items: data,
    pagination: {
      count: data.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
