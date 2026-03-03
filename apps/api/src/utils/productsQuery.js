const ALLOWED_SORT_FIELDS = ['createdAt', 'price', 'name'];
const ALLOWED_ORDER_VALUES = ['asc', 'desc'];
const DEFAULT_SORT = 'createdAt';
const DEFAULT_ORDER = 'desc';
const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;
const MAX_LIMIT = 100;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function readSingleValue(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value) || typeof value === 'object') {
    throw badRequest(`${fieldName} must be a single value`);
  }

  return String(value).trim();
}

function parseNumber(value, fieldName, options = {}) {
  const { integer = false, min = 0, max } = options;
  const text = readSingleValue(value, fieldName);

  if (text === undefined) {
    return undefined;
  }

  if (text.length === 0) {
    throw badRequest(`${fieldName} is invalid`);
  }

  const parsed = Number(text);

  if (!Number.isFinite(parsed)) {
    throw badRequest(`${fieldName} must be a number`);
  }

  if (integer && !Number.isInteger(parsed)) {
    throw badRequest(`${fieldName} must be an integer`);
  }

  if (parsed < min) {
    throw badRequest(`${fieldName} must be >= ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw badRequest(`${fieldName} must be <= ${max}`);
  }

  return parsed;
}

function parseEnum(value, fieldName, allowedValues, defaultValue) {
  const text = readSingleValue(value, fieldName);

  if (text === undefined || text.length === 0) {
    return defaultValue;
  }

  if (!allowedValues.includes(text)) {
    throw badRequest(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }

  return text;
}

function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseProductsQuery(query = {}) {
  const q = readSingleValue(query.q, 'q');
  const minPrice = parseNumber(query.minPrice, 'minPrice', { min: 0 });
  const maxPrice = parseNumber(query.maxPrice, 'maxPrice', { min: 0 });
  const inStockMin = parseNumber(query.inStockMin, 'inStockMin', {
    min: 0,
    integer: true,
  });
  const limit = parseNumber(query.limit, 'limit', {
    min: 1,
    max: MAX_LIMIT,
    integer: true,
  });
  const offset = parseNumber(query.offset, 'offset', {
    min: 0,
    integer: true,
  });

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw badRequest('minPrice cannot be greater than maxPrice');
  }

  const sortField = parseEnum(query.sort, 'sort', ALLOWED_SORT_FIELDS, DEFAULT_SORT);
  const sortOrder = parseEnum(query.order, 'order', ALLOWED_ORDER_VALUES, DEFAULT_ORDER);

  const filter = {};

  if (q && q.length > 0) {
    filter.name = {
      $regex: escapeRegex(q),
      $options: 'i',
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      filter.price.$lte = maxPrice;
    }
  }

  if (inStockMin !== undefined) {
    filter.inStock = {
      $gte: inStockMin,
    };
  }

  const sort = {
    [sortField]: sortOrder === 'asc' ? 1 : -1,
    _id: -1,
  };

  return {
    filter,
    sort,
    limit: limit === undefined ? DEFAULT_LIMIT : limit,
    offset: offset === undefined ? DEFAULT_OFFSET : offset,
  };
}

module.exports = parseProductsQuery;
