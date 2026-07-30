import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { IUser } from '../models/User.model';
import { AuthPayload } from '../types';

const signToken = (payload: { id: string; role: string }): string =>
  jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN as string) || '7d',
  });

const verifyToken = (token: string): AuthPayload =>
  jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;

const sendTokenResponse = (user: IUser, statusCode: number, res: Response): void => {
  const token = signToken({ id: String(user._id), role: user.role });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

export { signToken, verifyToken, sendTokenResponse };
