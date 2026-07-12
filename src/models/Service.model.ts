import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceImage {
  imageUrl: string;
  publicId?: string;
  caption?: string;
}

export interface IService extends Document {
  name: string;
  slug: string;
  description: string;
  applications: string[];
  images: IServiceImage[];
  icon?: string;
  order: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const serviceImageSchema = new Schema<IServiceImage>(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String },
    caption: { type: String },
  },
  { _id: false }
);

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    applications: { type: [String], default: [] },
    images: { type: [serviceImageSchema], default: [] },
    icon: { type: String },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Service = mongoose.model<IService>('Service', serviceSchema);
