import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendEmail, passwordResetEmail } from '../utils/email';
import logger from '../utils/logger';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  } as jwt.SignOptions);
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError('Email and password are required', 400));

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }
    if (user.status === 'INACTIVE') {
      return next(new AppError('Your account has been deactivated', 403));
    }

    const { accessToken, refreshToken } = generateTokens(String(user._id));
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    }, 'Login successful');
  } catch (err) { next(err); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return next(new AppError('Refresh token required', 400));

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return next(new AppError('Invalid refresh token', 401));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(String(user._id));
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    sendSuccess(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (err) { next(new AppError('Invalid or expired refresh token', 401)); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).select('-passwordHash -refreshToken');
    sendSuccess(res, user, 'Profile fetched');
  } catch (err) { next(err); }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!._id);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 400));
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save({ validateBeforeSave: false });
    sendSuccess(res, null, 'Password changed successfully');
  } catch (err) { next(err); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (user) { user.refreshToken = undefined; await user.save({ validateBeforeSave: false }); }
    sendSuccess(res, null, 'Logged out successfully');
  } catch (err) { next(err); }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new AppError('Please provide an email address', 400));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success even if user not found for security reasons
      sendSuccess(res, null, 'If a matching account exists, a password reset link has been sent to your email.');
      return;
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and set on user schema
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await user.save({ validateBeforeSave: false });

    // Construct reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/admin/reset-password?token=${resetToken}`;

    // Send email or log to console as fallback
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      logger.warn(`\n⚠️ SMTP is not configured. Falling back to logging the reset link:\n\n🔗 PASSWORD RESET LINK: ${resetUrl}\n`);
    } else {
      await sendEmail({
        to: user.email,
        subject: 'AES Admin - Password Reset Request',
        html: passwordResetEmail(user.name, resetUrl),
      });
    }

    sendSuccess(res, null, 'If a matching account exists, a password reset link has been sent to your email.');
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return next(new AppError('Token and password are required', 400));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // Set new password
    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined; // Invalidate current login sessions

    await user.save({ validateBeforeSave: false });

    sendSuccess(res, null, 'Password reset successful. You can now log in.');
  } catch (err) {
    next(err);
  }
};
