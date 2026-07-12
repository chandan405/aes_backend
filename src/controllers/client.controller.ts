import { Request, Response, NextFunction } from 'express';
import { Client } from '../models/Client.model';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/uploadHelper';

export const getClients = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clients = await Client.find({ status: 'ACTIVE' }).sort({ order: 1 });
    sendSuccess(res, clients, 'Clients fetched');
  } catch (err) { next(err); }
};

export const getAllClients = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clients = await Client.find().sort({ order: 1 });
    sendSuccess(res, clients, 'All clients fetched');
  } catch (err) { next(err); }
};

export const createClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = { ...req.body };
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'aes/clients');
      body.logoUrl = result.imageUrl;
      body.publicId = result.publicId;
    }
    const client = await Client.create(body);
    sendSuccess(res, client, 'Client created', 201);
  } catch (err) { next(err); }
};

export const updateClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return next(new AppError('Client not found', 404));
    const body = { ...req.body };
    if (req.file) {
      if (client.publicId) await deleteFromCloudinary(client.publicId);
      const result = await uploadToCloudinary(req.file, 'aes/clients');
      body.logoUrl = result.imageUrl;
      body.publicId = result.publicId;
    }
    const updated = await Client.findByIdAndUpdate(req.params.id, body, { new: true });
    sendSuccess(res, updated, 'Client updated');
  } catch (err) { next(err); }
};

export const deleteClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return next(new AppError('Client not found', 404));
    if (client.publicId) await deleteFromCloudinary(client.publicId);
    await client.deleteOne();
    sendSuccess(res, null, 'Client deleted');
  } catch (err) { next(err); }
};

export const reorderClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orders } = req.body as { orders: Array<{ id: string; order: number }> };
    await Promise.all(orders.map(({ id, order }) => Client.findByIdAndUpdate(id, { order })));
    sendSuccess(res, null, 'Clients reordered');
  } catch (err) { next(err); }
};
