import { Request, Response, NextFunction } from 'express';
import { TeamMember } from '../models/TeamMember.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadHelper';

export const getTeam = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const team = await TeamMember.find({ status: 'ACTIVE' }).sort({ order: 1 });
    sendSuccess(res, team, 'Team fetched');
  } catch (err) { next(err); }
};

export const getAllTeam = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const team = await TeamMember.find().sort({ order: 1 });
    sendSuccess(res, team, 'All team members fetched');
  } catch (err) { next(err); }
};

export const createTeamMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = { ...req.body };
    if (body.skills && typeof body.skills === 'string') body.skills = JSON.parse(body.skills);
    let imageUrl: string | undefined;
    let publicId: string | undefined;
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'aes/team');
      imageUrl = result.imageUrl;
      publicId = result.publicId;
    }
    const member = await TeamMember.create({ ...body, imageUrl, publicId, createdBy: req.user!._id });
    sendSuccess(res, member, 'Team member created', 201);
  } catch (err) { next(err); }
};

export const updateTeamMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return next(new AppError('Team member not found', 404));
    const body = { ...req.body };
    if (body.skills && typeof body.skills === 'string') body.skills = JSON.parse(body.skills);
    if (req.file) {
      if (member.publicId) await deleteFromCloudinary(member.publicId);
      const result = await uploadToCloudinary(req.file, 'aes/team');
      body.imageUrl = result.imageUrl;
      body.publicId = result.publicId;
    }
    const updated = await TeamMember.findByIdAndUpdate(req.params.id, body, { new: true });
    sendSuccess(res, updated, 'Team member updated');
  } catch (err) { next(err); }
};

export const deleteTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return next(new AppError('Team member not found', 404));
    if (member.publicId) await deleteFromCloudinary(member.publicId);
    await member.deleteOne();
    sendSuccess(res, null, 'Team member deleted');
  } catch (err) { next(err); }
};
