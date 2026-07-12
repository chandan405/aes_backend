import mongoose, { Document, Schema } from 'mongoose';

export interface IContactEnquiry extends Document {
  name: string;
  email: string;
  phone: string;
  serviceRequired?: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactEnquirySchema = new Schema<IContactEnquiry>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    serviceRequired: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ['NEW', 'READ', 'REPLIED', 'CLOSED'], default: 'NEW' },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export const ContactEnquiry = mongoose.model<IContactEnquiry>('ContactEnquiry', contactEnquirySchema);
