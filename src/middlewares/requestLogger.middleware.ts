import { Request, Response, NextFunction } from 'express';

/**
 * Simple request logger for development.
 * Logs method, URL and response time.
 */
const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production') return next();

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(
      `${color}${req.method}\x1b[0m ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });
  next();
};

export default requestLogger;
