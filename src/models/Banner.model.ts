import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  publicId?: string;
  ctaText?: string;
  ctaLink?: string;
  order: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String },
    ctaText: { type: String, default: 'Learn More' },
    ctaLink: { type: String, default: '/services' },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Banner = mongoose.model<IBanner>('Banner', bannerSchema);
