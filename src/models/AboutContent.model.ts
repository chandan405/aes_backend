import mongoose, { Document, Schema } from 'mongoose';

export interface IAboutContent extends Document {
  companyProfile: string;
  vision: string;
  mission: string[];
  industries: string[];
  stats: {
    experience: string;
    customers: string;
    projects: string;
    engineers: string;
  };
  aboutImageUrl?: string;
  visionImageUrl?: string;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const aboutSchema = new Schema<IAboutContent>(
  {
    companyProfile: {
      type: String,
      default:
        'AES provides comprehensive Non Destructive Testing, Inspection Services, Consultancy, and Training Services to various industries including Aerospace, Power, Oil & Gas, Marine, Steel, and Infrastructure.',
    },
    vision: {
      type: String,
      default:
        "To become India's most trusted NDT inspection and training organization through quality and technical excellence.",
    },
    mission: {
      type: [String],
      default: [
        'Deliver accurate and reliable inspection services',
        'Provide quality training programs meeting industry standards',
        'Ensure complete customer satisfaction',
        'Improve workplace safety across industries',
      ],
    },
    industries: {
      type: [String],
      default: ['Aerospace', 'Power', 'Oil & Gas', 'Marine', 'Steel', 'Infrastructure', 'Defense', 'Railway'],
    },
    stats: {
      experience: { type: String, default: '20+' },
      customers: { type: String, default: '500+' },
      projects: { type: String, default: '1000+' },
      engineers: { type: String, default: '50+' },
    },
    aboutImageUrl: { type: String },
    visionImageUrl: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const AboutContent = mongoose.model<IAboutContent>('AboutContent', aboutSchema);
