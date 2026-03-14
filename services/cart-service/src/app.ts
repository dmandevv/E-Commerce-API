import express from 'express';
import { config } from './config/index.js';
import { cartRepository } from './repositories/cartRepository.js';
import cartRoutes from './routes/cartRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api/cart', cartRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cart-service' });
});

app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    await cartRepository.connect();

    app.listen(config.port, () => {
      console.log(`Cart service running on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start cart service:', err);
    process.exit(1);
  }
};

start();
