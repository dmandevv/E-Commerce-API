import { Request, Response, NextFunction } from 'express';
import { AppError } from '@ecommerce/shared/errors';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Known operational errors (NotFound, Unauthorized, etc.)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Mongoose duplicate key error (e.g., duplicate email)
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    res.status(409).json({
      success: false,
      message: 'Duplicate field value entered',
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unknown / programming errors
  console.error('UNEXPECTED ERROR:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
