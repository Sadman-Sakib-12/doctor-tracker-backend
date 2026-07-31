import { IUser } from '../models/User.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}
