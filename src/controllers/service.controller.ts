import { Request, Response, NextFunction } from 'express';
import { Service } from '../models/Service.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadHelper';

// ── Public ────────────────────────────────────────────────────────────────────
export const getServices = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const services = await Service.find({ status: 'ACTIVE' }).sort({ order: 1 });
    sendSuccess(res, services, 'Services fetched');
  } catch (err) { next(err); }
};

export const getServiceBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, status: 'ACTIVE' });
    if (!service) return next(new AppError('Service not found', 404));
    sendSuccess(res, service, 'Service fetched');
  } catch (err) { next(err); }
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const getAllServices = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const services = await Service.find().sort({ order: 1 });
    sendSuccess(res, services, 'All services fetched');
  } catch (err) { next(err); }
};

export const createService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, applications, order } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const exists = await Service.findOne({ slug });
    if (exists) return next(new AppError('A service with this name already exists', 409));

    const images: Array<{ imageUrl: string; publicId?: string; caption?: string }> = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file, 'aes/services');
        images.push({ imageUrl: result.imageUrl, publicId: result.publicId });
      }
    }
    const applicationsArr = typeof applications === 'string' ? JSON.parse(applications) : (applications || []);
    const service = await Service.create({
      name, slug, description, applications: applicationsArr,
      images, order: order || 0, createdBy: req.user!._id,
    });
    sendSuccess(res, service, 'Service created', 201);
  } catch (err) { next(err); }
};

export const updateService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return next(new AppError('Service not found', 404));
    const body: Record<string, unknown> = { ...req.body };
    if (body.applications && typeof body.applications === 'string') {
      body.applications = JSON.parse(body.applications as string);
    }
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImages: Array<{ imageUrl: string; publicId?: string }> = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file, 'aes/services');
        newImages.push({ imageUrl: result.imageUrl, publicId: result.publicId });
      }
      body.images = [...(service.images || []), ...newImages];
    }
    const updated = await Service.findByIdAndUpdate(req.params.id, body, { new: true });
    sendSuccess(res, updated, 'Service updated');
  } catch (err) { next(err); }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return next(new AppError('Service not found', 404));
    for (const img of service.images) {
      if (img.publicId) await deleteFromCloudinary(img.publicId);
    }
    await service.deleteOne();
    sendSuccess(res, null, 'Service deleted');
  } catch (err) { next(err); }
};

export const toggleServiceStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return next(new AppError('Service not found', 404));
    service.status = service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await service.save();
    sendSuccess(res, service, 'Service status toggled');
  } catch (err) { next(err); }
};

export const deleteServiceImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, imageIndex } = req.params;
    const service = await Service.findById(id);
    if (!service) return next(new AppError('Service not found', 404));
    const idx = parseInt(imageIndex, 10);
    const img = service.images[idx];
    if (!img) return next(new AppError('Image not found', 404));
    if (img.publicId) await deleteFromCloudinary(img.publicId);
    service.images.splice(idx, 1);
    await service.save();
    sendSuccess(res, service, 'Image deleted');
  } catch (err) { next(err); }
};

// Avoid circular import from slugify
function slugify(text: string, opts: { lower?: boolean; strict?: boolean }): string {
  let s = text;
  if (opts.lower) s = s.toLowerCase();
  if (opts.strict) s = s.replace(/[^a-z0-9\s-]/g, '');
  return s.trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}
