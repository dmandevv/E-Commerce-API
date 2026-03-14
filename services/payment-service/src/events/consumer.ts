import amqplib, { type Channel } from 'amqplib';
import { config } from '../config/index.js';
import { createPaymentForOrder } from '../services/paymentService.js';
import type { OrderPlacedEvent } from '@ecommerce/shared/events';

const EXCHANGE = 'ecommerce.events';
const QUEUE = 'payment-service.orders';

async function connectWithRetry(url: string, maxRetries = 10): Promise<amqplib.ChannelModel> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await amqplib.connect(url);

      conn.on('error', (err) => {
        console.error('RabbitMQ connection error:', err.message);
      });

      conn.on('close', () => {
        console.error('RabbitMQ connection closed. Exiting for restart...');
        process.exit(1);
      });

      return conn;
    } catch {
      const delay = Math.min(attempt * 2000, 10000);
      console.log(`RabbitMQ attempt ${attempt}/${maxRetries} failed, retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Failed to connect to RabbitMQ after ${maxRetries} attempts`);
}

export async function startConsumer(): Promise<void> {
  const connection = await connectWithRetry(config.rabbitmqUrl);
  const channel: Channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
  await channel.assertQueue(QUEUE, { durable: true });

  // Listen for order events
  await channel.bindQueue(QUEUE, EXCHANGE, 'order.placed');

  await channel.prefetch(1);

  console.log('RabbitMQ consumer listening for order events');

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const event: OrderPlacedEvent = JSON.parse(msg.content.toString());
      console.log(`Received order.placed for order ${event.orderId}`);

      await createPaymentForOrder(event);

      channel.ack(msg);
    } catch (err) {
      console.error('Error processing order.placed:', err);
      channel.nack(msg, false, true);
    }
  });
}
