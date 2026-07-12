import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';

export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().select('-passwordHash -refreshToken').sort({ createdAt: -1 });
    sendSuccess(res, users, 'Users fetched');
  } catch (err) { next(err); }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('Email already registered', 409));
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role: role || 'ADMIN' });
    sendSuccess(res, { id: user._id, name: user.name, email: user.email, role: user.role }, 'User created', 201);
  } catch (err) { next(err); }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, role, status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, role, status }, { new: true }).select('-passwordHash -refreshToken');
    if (!user) return next(new AppError('User not found', 404));
    sendSuccess(res, user, 'User updated');
  } catch (err) { next(err); }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    sendSuccess(res, null, 'User deleted');
  } catch (err) { next(err); }
};
