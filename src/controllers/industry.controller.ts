import { Request, Response, NextFunction } from 'express';
import { Industry } from '../models/Industry.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadHelper';

export const getIndustries = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const industries = await Industry.find({ status: 'ACTIVE' }).sort({ order: 1 });
    sendSuccess(res, industries, 'Industries fetched');
  } catch (err) { next(err); }
};

export const getAllIndustries = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const industries = await Industry.find().sort({ order: 1 });
    sendSuccess(res, industries, 'All industries fetched');
  } catch (err) { next(err); }
};

export const createIndustry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = { ...req.body };
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'aes/industries');
      body.imageUrl = result.imageUrl;
      body.publicId = result.publicId;
    }
    const industry = await Industry.create(body);
    sendSuccess(res, industry, 'Industry created', 201);
  } catch (err) { next(err); }
};

export const updateIndustry = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const industry = await Industry.findById(req.params.id);
    if (!industry) return next(new AppError('Industry not found', 404));
    const body = { ...req.body };
    if (req.file) {
      if (industry.publicId) await deleteFromCloudinary(industry.publicId);
      const result = await uploadToCloudinary(req.file, 'aes/industries');
      body.imageUrl = result.imageUrl;
      body.publicId = result.publicId;
    }
    const updated = await Industry.findByIdAndUpdate(req.params.id, body, { new: true });
    sendSuccess(res, updated, 'Industry updated');
  } catch (err) { next(err); }
};

export const deleteIndustry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const industry = await Industry.findById(req.params.id);
    if (!industry) return next(new AppError('Industry not found', 404));
    if (industry.publicId) await deleteFromCloudinary(industry.publicId);
    await industry.deleteOne();
    sendSuccess(res, null, 'Industry deleted');
  } catch (err) { next(err); }
};
