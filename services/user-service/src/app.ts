import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config/index.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// ─── Middleware ──────────────────────────────────────────
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────
app.use('/api/users', userRoutes);

// ─── Health Check ───────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

// ─── Error Handler (must be last) ───────────────────────
app.use(errorHandler);

// ─── Start ──────────────────────────────────────────────
const start = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected');

    app.listen(config.port, () => {
      console.log(`User service running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start user service:', err);
    process.exit(1);
  }
};

start();
