import mongoose, { Document, Schema } from 'mongoose';

export type TrainingMode = 'ONLINE' | 'OFFLINE' | 'HYBRID';
export type TrainingStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export interface ITraining extends Document {
  name: string;
  duration: string;
  fees: number;
  startDate?: Date;
  endDate?: Date;
  trainerName: string;
  mode: TrainingMode;
  description: string;
  syllabus: string[];
  certificateInfo?: string;
  imageUrl?: string;
  publicId?: string;
  maxStudents?: number;
  status: TrainingStatus;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const trainingSchema = new Schema<ITraining>(
  {
    name: { type: String, required: true, trim: true },
    duration: { type: String, required: true },
    fees: { type: Number, required: true, min: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    trainerName: { type: String, required: true },
    mode: { type: String, enum: ['ONLINE', 'OFFLINE', 'HYBRID'], default: 'OFFLINE' },
    description: { type: String, required: true },
    syllabus: { type: [String], default: [] },
    certificateInfo: { type: String },
    imageUrl: { type: String },
    publicId: { type: String },
    maxStudents: { type: Number },
    status: { type: String, enum: ['PUBLISHED', 'DRAFT', 'ARCHIVED'], default: 'DRAFT' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Training = mongoose.model<ITraining>('Training', trainingSchema);
