import mongoose, { Document, Schema } from 'mongoose';

export interface ITeamMember extends Document {
  name: string;
  designation: string;
  qualification?: string;
  experience?: string;
  description?: string;
  skills: string[];
  imageUrl?: string;
  publicId?: string;
  order: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    qualification: { type: String, trim: true },
    experience: { type: String, trim: true },
    description: { type: String },
    skills: { type: [String], default: [] },
    imageUrl: { type: String },
    publicId: { type: String },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const TeamMember = mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
