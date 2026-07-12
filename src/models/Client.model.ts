import mongoose, { Document, Schema } from 'mongoose';

export interface IClient extends Document {
  name: string;
  logoUrl?: string;
  publicId?: string;
  description?: string;
  website?: string;
  order: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String },
    publicId: { type: String },
    description: { type: String },
    website: { type: String },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const Client = mongoose.model<IClient>('Client', clientSchema);
