import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import mongoose from 'mongoose';

const handleCastError = (err: mongoose.Error.CastError) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKeyError = (err: { keyValue: Record<string, string> }) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`Duplicate value for field: ${field}`, 409);
};

const handleValidationError = (err: mongoose.Error.ValidationError) => {
  const messages = Object.values(err.errors).map((e) => e.message).join(', ');
  return new AppError(`Validation error: ${messages}`, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please log in again.', 401);

export const errorHandler = (
  err: AppError & { code?: number; keyValue?: Record<string, string>; name?: string },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let error: AppError = { ...err, message: err.message } as AppError;

  if (err instanceof mongoose.Error.CastError) error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err as { keyValue: Record<string, string> });
  if (err instanceof mongoose.Error.ValidationError) error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} - ${statusCode}: ${message}`, err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
