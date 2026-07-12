import { Response } from 'express';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: Record<string, unknown>
): void => {
  const response: ApiResponse<T> = { success: true, message, data };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, message: string, statusCode = 400): void => {
  res.status(statusCode).json({ success: false, message });
};
