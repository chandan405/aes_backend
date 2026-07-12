import { Request, Response, NextFunction } from 'express';
import { Training } from '../models/Training.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadHelper';

export const getPublishedTrainings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trainings = await Training.find({ status: 'PUBLISHED' }).sort({ createdAt: -1 });
    sendSuccess(res, trainings, 'Trainings fetched');
  } catch (err) { next(err); }
};

export const getTrainingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return next(new AppError('Training not found', 404));
    sendSuccess(res, training, 'Training fetched');
  } catch (err) { next(err); }
};

export const getAllTrainings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const trainings = await Training.find().sort({ createdAt: -1 });
    sendSuccess(res, trainings, 'All trainings fetched');
  } catch (err) { next(err); }
};

export const createTraining = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = { ...req.body };
    if (body.syllabus && typeof body.syllabus === 'string') body.syllabus = JSON.parse(body.syllabus);
    if (body.fees) body.fees = parseFloat(body.fees);
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'aes/trainings');
      body.imageUrl = result.imageUrl;
      body.publicId = result.publicId;
    }
    const training = await Training.create({ ...body, createdBy: req.user!._id });
    sendSuccess(res, training, 'Training created', 201);
  } catch (err) { next(err); }
};

export const updateTraining = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return next(new AppError('Training not found', 404));
    const body = { ...req.body };
    if (body.syllabus && typeof body.syllabus === 'string') body.syllabus = JSON.parse(body.syllabus);
    if (body.fees) body.fees = parseFloat(body.fees);
    if (req.file) {
      if (training.publicId) await deleteFromCloudinary(training.publicId);
      const result = await uploadToCloudinary(req.file, 'aes/trainings');
      body.imageUrl = result.imageUrl;
      body.publicId = result.publicId;
    }
    const updated = await Training.findByIdAndUpdate(req.params.id, body, { new: true });
    sendSuccess(res, updated, 'Training updated');
  } catch (err) { next(err); }
};

export const deleteTraining = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return next(new AppError('Training not found', 404));
    if (training.publicId) await deleteFromCloudinary(training.publicId);
    await training.deleteOne();
    sendSuccess(res, null, 'Training deleted');
  } catch (err) { next(err); }
};

export const toggleTrainingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return next(new AppError('Training not found', 404));
    training.status = training.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await training.save();
    sendSuccess(res, training, 'Training status toggled');
  } catch (err) { next(err); }
};
