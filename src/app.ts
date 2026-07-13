import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/AppError';

// Route imports
import authRoutes from './routes/auth.routes';
import bannerRoutes from './routes/banner.routes';
import aboutRoutes from './routes/about.routes';
import teamRoutes from './routes/team.routes';
import serviceRoutes from './routes/service.routes';
import trainingRoutes from './routes/training.routes';
import registrationRoutes from './routes/registration.routes';
import industryRoutes from './routes/industry.routes';
import clientRoutes from './routes/client.routes';
import galleryRoutes from './routes/gallery.routes';
import contactRoutes from './routes/contact.routes';
import dashboardRoutes from './routes/dashboard.routes';
import uploadRoutes from './routes/upload.routes';
import userRoutes from './routes/user.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import mongoose from 'mongoose';
import { connectDB } from './config/database';
import { configureCloudinary } from './config/cloudinary';
import logger from './utils/logger';

const app: Application = express();

// Connect to Database dynamically (essential for serverless platforms like Vercel)
if (mongoose.connection.readyState === 0) {
  connectDB().catch((err) => {
    logger.error('Failed to connect to database in app startup:', err);
  });
}

// Initialize Cloudinary configuration
configureCloudinary();

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'https://abinashengineeringservice.vercel.app',
  'https://abinashengineeringservice.vercel.com',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocal = origin.startsWith('http://localhost') || 
                  origin.startsWith('http://127.0.0.1') || 
                  origin.startsWith('http://192.168.') ||
                  origin.startsWith('http://172.') ||
                  origin.startsWith('http://10.');

    const isVercelDomain = origin.endsWith('.vercel.app') || origin.endsWith('.vercel.com');

    if ((isDevelopment && isLocal) || isLocal || isVercelDomain) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// ── Rate Limiting ────────────────────────────────────────────────────────────
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api', publicLimiter);

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Static Files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'AES API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── Swagger Documentation ───────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/industries', industryRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
