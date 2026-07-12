import { Request, Response, NextFunction } from 'express';
import { Gallery } from '../models/Gallery.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadHelper';

export const getGallery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { status: 'ACTIVE' };
    if (req.query.category) filter.category = req.query.category;
    const images = await Gallery.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    sendSuccess(res, images, 'Gallery fetched');
  } catch (err) { next(err); }
};

export const getFeaturedGallery = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const images = await Gallery.find({ status: 'ACTIVE', isFeatured: true })
      .sort({ displayOrder: 1 })
      .limit(6);
    sendSuccess(res, images, 'Featured gallery fetched');
  } catch (err) { next(err); }
};

export const getGalleryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return next(new AppError('Image not found', 404));
    sendSuccess(res, image, 'Gallery image fetched');
  } catch (err) { next(err); }
};

export const getAllGallery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    const images = await Gallery.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    sendSuccess(res, images, 'All gallery images fetched');
  } catch (err) { next(err); }
};

export const uploadGalleryImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) return next(new AppError('Image file is required', 400));
    const { title, description, category, altText, displayOrder, isFeatured } = req.body;
    const { imageUrl, thumbnailUrl, publicId } = await uploadToCloudinary(req.file, 'aes/gallery');
    const image = await Gallery.create({
      title, description, category, altText,
      imageUrl, thumbnailUrl, publicId,
      displayOrder: parseInt(displayOrder) || 0,
      isFeatured: isFeatured === 'true',
      createdBy: req.user!._id,
    });
    sendSuccess(res, image, 'Image uploaded successfully', 201);
  } catch (err) { next(err); }
};

export const updateGalleryImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return next(new AppError('Image not found', 404));
    const body = { ...req.body };
    if (body.isFeatured !== undefined) body.isFeatured = body.isFeatured === 'true';
    if (body.displayOrder !== undefined) body.displayOrder = parseInt(body.displayOrder);
    if (req.file) {
      if (image.publicId) await deleteFromCloudinary(image.publicId);
      const result = await uploadToCloudinary(req.file, 'aes/gallery');
      body.imageUrl = result.imageUrl;
      body.thumbnailUrl = result.thumbnailUrl;
      body.publicId = result.publicId;
    }
    const updated = await Gallery.findByIdAndUpdate(req.params.id, body, { new: true });
    sendSuccess(res, updated, 'Gallery image updated');
  } catch (err) { next(err); }
};

export const deleteGalleryImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return next(new AppError('Image not found', 404));
    if (image.publicId) await deleteFromCloudinary(image.publicId);
    await image.deleteOne();
    sendSuccess(res, null, 'Image deleted');
  } catch (err) { next(err); }
};

export const toggleGalleryStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) return next(new AppError('Image not found', 404));
    image.status = image.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await image.save();
    sendSuccess(res, image, 'Gallery image status toggled');
  } catch (err) { next(err); }
};
