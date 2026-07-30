import { Query } from 'mongoose';

interface QueryString {
  search?: string;
  page?: string;
  limit?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: string | undefined;
}

class APIFeatures<T> {
  public query: Query<T[], T>;
  private queryString: QueryString;
  public _page: number = 1;
  public _limit: number = 10;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search(fields: string[]): this {
    const keyword = this.queryString.search;
    if (keyword) {
      const regexConditions = fields.map((f) => ({
        [f]: { $regex: keyword, $options: 'i' },
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.query = (this.query as any).or(regexConditions);
    }
    return this;
  }

  filter(): this {
    const queryObj: Record<string, unknown> = {};
    const excluded = ['page', 'limit', 'sort', 'search', 'startDate', 'endDate'];

    Object.keys(this.queryString).forEach((k) => {
      if (!excluded.includes(k) && this.queryString[k] !== undefined) {
        queryObj[k] = this.queryString[k];
      }
    });

    const { startDate, endDate } = this.queryString;
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      queryObj.createdAt = dateFilter;
    }

    this.query = this.query.find(queryObj as Parameters<typeof this.query.find>[0]);
    return this;
  }

  sort(): this {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(',').join(' ')
      : '-createdAt';
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate(): this {
    const page = Math.max(1, parseInt(this.queryString.page || '1', 10));
    const limit = Math.min(100, parseInt(this.queryString.limit || '10', 10));
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this._page = page;
    this._limit = limit;
    return this;
  }
}

export default APIFeatures;
