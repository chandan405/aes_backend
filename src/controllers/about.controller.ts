import { Request, Response, NextFunction } from 'express';
import { AboutContent } from '../models/AboutContent.model';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary } from '../utils/uploadHelper';

export const getAbout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let about = await AboutContent.findOne();
    if (!about) about = await AboutContent.create({});
    sendSuccess(res, about, 'About content fetched');
  } catch (err) { next(err); }
};

export const updateAbout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData: Record<string, unknown> = { ...req.body, updatedBy: req.user!._id };
    if (req.body.mission && typeof req.body.mission === 'string') {
      updateData.mission = JSON.parse(req.body.mission);
    }
    if (req.body.industries && typeof req.body.industries === 'string') {
      updateData.industries = JSON.parse(req.body.industries);
    }
    if (req.body.stats && typeof req.body.stats === 'string') {
      updateData.stats = JSON.parse(req.body.stats);
    }
    if (files?.aboutImage?.[0]) {
      const { imageUrl } = await uploadToCloudinary(files.aboutImage[0], 'aes/about');
      updateData.aboutImageUrl = imageUrl;
    }
    if (files?.visionImage?.[0]) {
      const { imageUrl } = await uploadToCloudinary(files.visionImage[0], 'aes/about');
      updateData.visionImageUrl = imageUrl;
    }
    const about = await AboutContent.findOneAndUpdate({}, updateData, { new: true, upsert: true });
    sendSuccess(res, about, 'About content updated');
  } catch (err) { next(err); }
};
