import { Request, Response, NextFunction } from 'express';
import { Banner } from '../models/Banner.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadHelper';

export const getBanners = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banners = await Banner.find({ status: 'ACTIVE' }).sort({ order: 1 });
    sendSuccess(res, banners, 'Banners fetched');
  } catch (err) { next(err); }
};

export const getAllBanners = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    sendSuccess(res, banners, 'All banners fetched');
  } catch (err) { next(err); }
};

export const createBanner = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, subtitle, description, ctaText, ctaLink, order } = req.body;
    if (!req.file) return next(new AppError('Banner image is required', 400));
    const { imageUrl, publicId } = await uploadToCloudinary(req.file, 'aes/banners');
    const banner = await Banner.create({
      title, subtitle, description, ctaText, ctaLink,
      order: order || 0, imageUrl, publicId, createdBy: req.user!._id,
    });
    sendSuccess(res, banner, 'Banner created', 201);
  } catch (err) { next(err); }
};

export const updateBanner = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return next(new AppError('Banner not found', 404));
    const updateData: Partial<typeof banner> = { ...req.body };
    if (req.file) {
      if (banner.publicId) await deleteFromCloudinary(banner.publicId);
      const { imageUrl, publicId } = await uploadToCloudinary(req.file, 'aes/banners');
      (updateData as Record<string, unknown>).imageUrl = imageUrl;
      (updateData as Record<string, unknown>).publicId = publicId;
    }
    const updated = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    sendSuccess(res, updated, 'Banner updated');
  } catch (err) { next(err); }
};

export const deleteBanner = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banner = await Banner.findById(_req.params.id);
    if (!banner) return next(new AppError('Banner not found', 404));
    if (banner.publicId) await deleteFromCloudinary(banner.publicId);
    await banner.deleteOne();
    sendSuccess(res, null, 'Banner deleted');
  } catch (err) { next(err); }
};

export const toggleBannerStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return next(new AppError('Banner not found', 404));
    banner.status = banner.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await banner.save();
    sendSuccess(res, banner, `Banner ${banner.status === 'ACTIVE' ? 'activated' : 'deactivated'}`);
  } catch (err) { next(err); }
};
