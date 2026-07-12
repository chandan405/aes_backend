import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { User, IUser } from '../models/User.model';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { id: string };

    const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
    if (!user || user.status === 'INACTIVE') {
      return next(new AppError('User not found or inactive.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token.', 401));
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError('You do not have permission to perform this action.', 403));
      return;
    }
    next();
  };
};
