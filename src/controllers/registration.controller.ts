import { Request, Response, NextFunction } from 'express';
import { TrainingRegistration } from '../models/TrainingRegistration.model';
import { Training } from '../models/Training.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { sendEmail, trainingRegistrationUserEmail, trainingRegistrationAdminEmail } from '../utils/email';

export const registerForTraining = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, phone, qualification, experience, company, trainingId, message } = req.body;

    const training = await Training.findById(trainingId);
    if (!training) return next(new AppError('Training not found', 404));
    if (training.status !== 'PUBLISHED') return next(new AppError('This training is not currently available', 400));

    const registration = await TrainingRegistration.create({
      name, email, phone, qualification, experience, company,
      trainingId, trainingName: training.name, message,
    });

    // Send emails (non-blocking)
    sendEmail({ to: email, subject: 'Training Registration Confirmation - AES', html: trainingRegistrationUserEmail(name, training.name) });
    if (process.env.ADMIN_EMAIL) {
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `New Training Registration: ${training.name}`,
        html: trainingRegistrationAdminEmail({ name, email, phone, company, qualification, experience, course: training.name, message: message || '' }),
      });
    }

    sendSuccess(res, { id: registration._id }, 'Registration submitted successfully. We will contact you soon!', 201);
  } catch (err) { next(err); }
};

export const getAllRegistrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, trainingId } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (trainingId) filter.trainingId = trainingId;
    const registrations = await TrainingRegistration.find(filter).sort({ createdAt: -1 });
    sendSuccess(res, registrations, 'Registrations fetched');
  } catch (err) { next(err); }
};

export const getRegistrationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reg = await TrainingRegistration.findById(req.params.id);
    if (!reg) return next(new AppError('Registration not found', 404));
    sendSuccess(res, reg, 'Registration fetched');
  } catch (err) { next(err); }
};

export const updateRegistrationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, adminNotes } = req.body;
    const reg = await TrainingRegistration.findByIdAndUpdate(
      req.params.id, { status, adminNotes }, { new: true }
    );
    if (!reg) return next(new AppError('Registration not found', 404));
    sendSuccess(res, reg, 'Registration status updated');
  } catch (err) { next(err); }
};
