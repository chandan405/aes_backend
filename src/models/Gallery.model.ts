import mongoose, { Document, Schema } from 'mongoose';

export type GalleryCategory =
  | 'NDT Inspection'
  | 'Advanced Testing'
  | 'Civil Testing'
  | 'Training Gallery'
  | 'Equipment Gallery'
  | 'Client Projects'
  | 'Company Events';

export interface IGallery extends Document {
  title: string;
  description?: string;
  category: GalleryCategory;
  imageUrl: string;
  thumbnailUrl?: string;
  publicId?: string;
  altText?: string;
  displayOrder: number;
  isFeatured: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: {
      type: String,
      enum: [
        'NDT Inspection',
        'Advanced Testing',
        'Civil Testing',
        'Training Gallery',
        'Equipment Gallery',
        'Client Projects',
        'Company Events',
      ],
      required: true,
    },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    publicId: { type: String },
    altText: { type: String },
    displayOrder: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

gallerySchema.index({ category: 1, status: 1 });
gallerySchema.index({ isFeatured: 1, status: 1 });

export const Gallery = mongoose.model<IGallery>('Gallery', gallerySchema);
