import { Request, Response, NextFunction } from 'express';
import { Service } from '../models/Service.model';
import { Training } from '../models/Training.model';
import { TrainingRegistration } from '../models/TrainingRegistration.model';
import { ContactEnquiry } from '../models/ContactEnquiry.model';
import { Gallery } from '../models/Gallery.model';
import { TeamMember } from '../models/TeamMember.model';
import { Client } from '../models/Client.model';
import { sendSuccess } from '../utils/response';

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalServices,
      totalTrainings,
      totalRegistrations,
      pendingRegistrations,
      totalEnquiries,
      newEnquiries,
      totalGallery,
      totalTeam,
      totalClients,
      recentRegistrations,
      recentEnquiries,
      recentGallery,
    ] = await Promise.all([
      Service.countDocuments({ status: 'ACTIVE' }),
      Training.countDocuments({ status: 'PUBLISHED' }),
      TrainingRegistration.countDocuments(),
      TrainingRegistration.countDocuments({ status: 'PENDING' }),
      ContactEnquiry.countDocuments(),
      ContactEnquiry.countDocuments({ status: 'NEW' }),
      Gallery.countDocuments({ status: 'ACTIVE' }),
      TeamMember.countDocuments({ status: 'ACTIVE' }),
      Client.countDocuments({ status: 'ACTIVE' }),
      TrainingRegistration.find().sort({ createdAt: -1 }).limit(5).select('name trainingName status createdAt'),
      ContactEnquiry.find().sort({ createdAt: -1 }).limit(5).select('name email serviceRequired status createdAt'),
      Gallery.find({ status: 'ACTIVE' }).sort({ createdAt: -1 }).limit(6).select('title imageUrl thumbnailUrl category'),
    ]);

    sendSuccess(res, {
      stats: {
        totalServices,
        totalTrainings,
        totalRegistrations,
        pendingRegistrations,
        totalEnquiries,
        newEnquiries,
        totalGallery,
        totalTeam,
        totalClients,
      },
      recentRegistrations,
      recentEnquiries,
      recentGallery,
    }, 'Dashboard data fetched');
  } catch (err) { next(err); }
};
