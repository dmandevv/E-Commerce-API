import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env'), override: true });

interface Config {
    port: number,
    mongoUri: string,
    jwtSecret: string,
    rabbitmqUrl: string;
}

export const config: Config = {
    port: parseInt(process.env.PORT || '3002', 10),
    mongoUri: process.env.MONGO_URI || 'mongodb://admin:admin_password@localhost:27017/product-service?authSource=admin',
    jwtSecret: process.env.JWT_SECRET || '',
    rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://admin:admin_password@localhost:5672',
};