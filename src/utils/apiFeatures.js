/**
 * A reusable helper that builds Mongoose query options
 * from URL query parameters (search, filter, sort, pagination).
 *
 * Usage:
 *   const features = new APIFeatures(Model.find(), req.query)
 *     .search(['name', 'specialization'])
 *     .filter()
 *     .sort()
 *     .paginate();
 *
 *   const docs = await features.query;
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Full-text search via MongoDB $text index.
   * Falls back to regex search on provided fields if no text index.
   */
  search(fields = []) {
    const keyword = this.queryString.search;
    if (keyword) {
      const regexConditions = fields.map((f) => ({
        [f]: { $regex: keyword, $options: 'i' },
      }));
      this.query = this.query.or(regexConditions);
    }
    return this;
  }

  /**
   * Date-range filter: ?startDate=2024-01-01&endDate=2024-12-31
   * Also supports: ?condition=stable&specialization=Cardiology
   */
  filter() {
    // Clone and remove pagination / search / sort keys
    const queryObj = { ...this.queryString };
    const excluded = ['page', 'limit', 'sort', 'search', 'startDate', 'endDate'];
    excluded.forEach((k) => delete queryObj[k]);

    // Date range on createdAt
    const { startDate, endDate } = this.queryString;
    if (startDate || endDate) {
      queryObj.createdAt = {};
      if (startDate) queryObj.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryObj.createdAt.$lte = end;
      }
    }

    this.query = this.query.find(queryObj);
    return this;
  }

  /**
   * Sort: ?sort=-createdAt,name
   */
  sort() {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(',').join(' ')
      : '-createdAt';
    this.query = this.query.sort(sortBy);
    return this;
  }

  /**
   * Pagination: ?page=1&limit=10
   */
  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.min(100, parseInt(this.queryString.limit, 10) || 10);
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this._page = page;
    this._limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
