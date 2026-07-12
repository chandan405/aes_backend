import mongoose, { Document, Schema } from 'mongoose';

export interface IIndustry extends Document {
  name: string;
  description?: string;
  imageUrl?: string;
  publicId?: string;
  icon?: string;
  order: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const industrySchema = new Schema<IIndustry>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    imageUrl: { type: String },
    publicId: { type: String },
    icon: { type: String },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const Industry = mongoose.model<IIndustry>('Industry', industrySchema);
