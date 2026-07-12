import mongoose, { Document, Schema } from 'mongoose';

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ITrainingRegistration extends Document {
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  company: string;
  trainingId: mongoose.Types.ObjectId;
  trainingName: string;
  message?: string;
  status: RegistrationStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<ITrainingRegistration>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: String, required: true },
    company: { type: String, required: true },
    trainingId: { type: Schema.Types.ObjectId, ref: 'Training', required: true },
    trainingName: { type: String, required: true },
    message: { type: String },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

export const TrainingRegistration = mongoose.model<ITrainingRegistration>(
  'TrainingRegistration',
  registrationSchema
);
