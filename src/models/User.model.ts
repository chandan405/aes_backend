import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'SUPER_ADMIN'], default: 'ADMIN' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    refreshToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
