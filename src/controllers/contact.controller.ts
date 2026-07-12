import { Request, Response, NextFunction } from 'express';
import { ContactEnquiry } from '../models/ContactEnquiry.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { sendEmail, contactEnquiryAdminEmail } from '../utils/email';

export const submitContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, phone, serviceRequired, message } = req.body;
    const enquiry = await ContactEnquiry.create({ name, email, phone, serviceRequired, message });

    if (process.env.ADMIN_EMAIL) {
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `New Contact Enquiry from ${name}`,
        html: contactEnquiryAdminEmail({ name, email, phone, serviceRequired: serviceRequired || 'Not specified', message }),
      });
    }
    sendSuccess(res, { id: enquiry._id }, 'Your enquiry has been submitted. We will get back to you shortly!', 201);
  } catch (err) { next(err); }
};

export const getAllEnquiries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    const enquiries = await ContactEnquiry.find(filter).sort({ createdAt: -1 });
    sendSuccess(res, enquiries, 'Enquiries fetched');
  } catch (err) { next(err); }
};

export const updateEnquiryStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const enquiry = await ContactEnquiry.findByIdAndUpdate(
      req.params.id, { status: req.body.status, adminNotes: req.body.adminNotes }, { new: true }
    );
    if (!enquiry) return next(new AppError('Enquiry not found', 404));
    sendSuccess(res, enquiry, 'Enquiry status updated');
  } catch (err) { next(err); }
};

export const deleteEnquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const enquiry = await ContactEnquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return next(new AppError('Enquiry not found', 404));
    sendSuccess(res, null, 'Enquiry deleted');
  } catch (err) { next(err); }
};
