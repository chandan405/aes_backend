import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { TeamMember } from '../models/TeamMember.model';
import { Service } from '../models/Service.model';
import { Client } from '../models/Client.model';
import { Industry } from '../models/Industry.model';
import { AboutContent } from '../models/AboutContent.model';
import logger from './logger';

const services = [
  { name: 'Radiographic Testing (RT)', slug: 'radiographic-testing', description: 'Radiographic Testing (RT) is a non-destructive examination technique that uses X-rays or Gamma rays to examine the internal structure of components. AES provides comprehensive RT services for weld inspection, casting examination, and structural integrity assessment.', applications: ['Pressure Vessels', 'Pipeline Inspection', 'Weld Inspection', 'Casting Examination', 'Structural Components'], order: 1 },
  { name: 'Magnetic Particle Testing (MT)', slug: 'magnetic-particle-testing', description: 'Magnetic Particle Testing is used to detect surface and near-surface discontinuities in ferromagnetic materials. Our certified ASNT Level II/III technicians perform MT inspection with state-of-the-art equipment.', applications: ['Weld Inspection', 'Forgings', 'Castings', 'Shafts', 'Pressure Vessels'], order: 2 },
  { name: 'Dye Penetrant Testing (PT)', slug: 'dye-penetrant-testing', description: 'Liquid Penetrant Testing is one of the oldest and most widely used NDT methods. It is used to detect surface-breaking discontinuities in non-porous materials.', applications: ['Aerospace Components', 'Welds', 'Castings', 'Machined Parts', 'Turbine Blades'], order: 3 },
  { name: 'Ultrasonic Testing (UT)', slug: 'ultrasonic-testing', description: 'Ultrasonic Testing uses high-frequency sound waves to detect internal flaws and measure material thickness. AES provides A-scan, B-scan, and C-scan UT inspections.', applications: ['Thickness Measurement', 'Weld Inspection', 'Corrosion Detection', 'Bond Testing'], order: 4 },
  { name: 'Eddy Current Testing (ECT)', slug: 'eddy-current-testing', description: 'Eddy Current Testing uses electromagnetic induction to detect surface and sub-surface flaws. Ideal for conducting materials and widely used in aerospace and power industries.', applications: ['Tube Inspection', 'Surface Crack Detection', 'Coating Thickness', 'Material Sorting'], order: 5 },
  { name: 'Thickness Measurement', slug: 'thickness-measurement', description: 'Precise thickness measurement using ultrasonic and magnetic techniques for corrosion monitoring and wall thickness verification.', applications: ['Pipelines', 'Pressure Vessels', 'Storage Tanks', 'Ship Hulls'], order: 6 },
  { name: 'Corrosion Mapping', slug: 'corrosion-mapping', description: 'Advanced corrosion mapping services using phased array and conventional UT to provide detailed corrosion profiles of structures.', applications: ['Storage Tanks', 'Pipelines', 'Pressure Vessels', 'Marine Structures'], order: 7 },
  { name: 'Advanced NDT (PAUT / TOFD)', slug: 'advanced-ndt', description: 'Phased Array Ultrasonic Testing (PAUT) and Time of Flight Diffraction (TOFD) provide advanced inspection capabilities for critical components.', applications: ['Weld Inspection', 'Pressure Vessels', 'Pipeline Girth Welds', 'Turbine Blades'], order: 8 },
  { name: 'Civil Engineering Testing', slug: 'civil-engineering-testing', description: 'Comprehensive civil engineering NDT including UPV testing, rebound hammer, half-cell potential, and rebar detection for structural assessment.', applications: ['Concrete Strength', 'Rebar Detection', 'Structural Assessment', 'Bridge Inspection'], order: 9 },
  { name: 'Condition Monitoring', slug: 'condition-monitoring', description: 'Vibration analysis, thermography, noise monitoring, and drone inspection services for predictive maintenance of industrial equipment.', applications: ['Rotating Machinery', 'Electrical Equipment', 'Pipeline Monitoring', 'Drone Inspection'], order: 10 },
];

const clients = [
  { name: 'HAL', description: 'Hindustan Aeronautics Limited', order: 1 },
  { name: 'NTPC', description: 'National Thermal Power Corporation', order: 2 },
  { name: 'DRDO', description: 'Defence Research and Development Organisation', order: 3 },
  { name: 'Indian Navy', description: 'Indian Naval Services', order: 4 },
  { name: 'Indian Coast Guard', description: 'Indian Coast Guard', order: 5 },
  { name: 'ONGC', description: 'Oil and Natural Gas Corporation', order: 6 },
  { name: 'Indian Railway', description: 'Indian Railways', order: 7 },
  { name: 'JSW Steel', description: 'JSW Steel Limited', order: 8 },
  { name: 'TATA', description: 'Tata Group of Companies', order: 9 },
];

const industries = [
  { name: 'Aerospace', icon: '✈️', order: 1 },
  { name: 'Defense', icon: '🛡️', order: 2 },
  { name: 'Oil & Gas', icon: '⛽', order: 3 },
  { name: 'Power Plant', icon: '⚡', order: 4 },
  { name: 'Steel Plant', icon: '🏭', order: 5 },
  { name: 'Cement Plant', icon: '🏗️', order: 6 },
  { name: 'Railway', icon: '🚂', order: 7 },
  { name: 'Marine', icon: '⚓', order: 8 },
  { name: 'Mining', icon: '⛏️', order: 9 },
  { name: 'Infrastructure', icon: '🌉', order: 10 },
];

const team = [
  {
    name: 'Mr. Abinash Behera',
    designation: 'Director',
    qualification: 'B.Tech',
    experience: '20+ Years',
    description: 'Mr. Abinash Behera is the Founder and Director of AES with over 20 years of experience in NDT inspection and training. He holds ASNT Level III certification and has expertise in multiple NDT methods across aerospace, oil & gas, and industrial sectors.',
    skills: ['UT Level III', 'MT Level III', 'PT Level III', 'RT Level III', 'ECT Level III', 'ASNT Certified', 'NDT Training', 'Aerospace NDT', 'Oil & Gas NDT'],
    order: 1,
  },
  {
    name: 'Mr. Suryakanta Malla',
    designation: 'Operation Director',
    experience: '15+ Years',
    description: 'Mr. Suryakanta Malla oversees operations and project management, ensuring all inspection services meet the highest quality standards.',
    skills: ['Operations Management', 'Project Management', 'Quality Control', 'Client Relations'],
    order: 2,
  },
  {
    name: 'Mr. Gouranga Behera',
    designation: 'Technical Head',
    experience: '12+ Years',
    description: 'Mr. Gouranga Behera leads the technical team and is responsible for technical excellence and innovation in NDT services.',
    skills: ['UT Level II', 'MT Level II', 'RT Level II', 'Technical Leadership', 'Quality Assurance'],
    order: 3,
  },
];

const seed = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/aes_db';
  await mongoose.connect(uri);
  logger.info('Connected to MongoDB for seeding...');

  // Admin user
  const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@aes.com' });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
    await User.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@aes.com',
      passwordHash,
      role: 'SUPER_ADMIN',
    });
    logger.info('✅ Admin user created');
  }

  // About content
  const aboutExists = await AboutContent.findOne();
  if (!aboutExists) {
    await AboutContent.create({});
    logger.info('✅ About content created');
  }

  // Services
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany(services);
    logger.info(`✅ ${services.length} services seeded`);
  }

  // Clients
  const clientCount = await Client.countDocuments();
  if (clientCount === 0) {
    await Client.insertMany(clients);
    logger.info(`✅ ${clients.length} clients seeded`);
  }

  // Industries
  const industryCount = await Industry.countDocuments();
  if (industryCount === 0) {
    await Industry.insertMany(industries);
    logger.info(`✅ ${industries.length} industries seeded`);
  }

  // Team
  const teamCount = await TeamMember.countDocuments();
  if (teamCount === 0) {
    await TeamMember.insertMany(team);
    logger.info(`✅ ${team.length} team members seeded`);
  }

  logger.info('🌱 Database seeded successfully!');
  await mongoose.disconnect();
};

seed().catch(err => {
  logger.error('Seed error:', err);
  process.exit(1);
});
