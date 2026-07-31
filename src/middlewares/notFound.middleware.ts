import { Request, Response } from 'express';

/**
 * 404 handler — catches all unmatched routes.
 */
const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};

export default notFound;
