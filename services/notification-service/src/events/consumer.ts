import amqplib, { type Channel } from 'amqplib';
import { config } from '../config/index.js';
import { sendEmail } from '../services/emailService.js';
import * as templates from '../templates/index.js';
import type {
  UserRegisteredEvent,
  OrderPlacedEvent,
  PaymentCompletedEvent,
  PaymentFailedEvent,
  OrderStatusUpdatedEvent,
} from '@ecommerce/shared/events';

const EXCHANGE = 'ecommerce.events';
const QUEUE = 'notification-service.events';

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

  // Bind to all events this service cares about
  await channel.bindQueue(QUEUE, EXCHANGE, 'user.registered');
  await channel.bindQueue(QUEUE, EXCHANGE, 'order.placed');
  await channel.bindQueue(QUEUE, EXCHANGE, 'payment.completed');
  await channel.bindQueue(QUEUE, EXCHANGE, 'payment.failed');
  await channel.bindQueue(QUEUE, EXCHANGE, 'order.status_updated');

  await channel.prefetch(1);

  console.log('RabbitMQ consumer listening for notification events');

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    const routingKey = msg.fields.routingKey;
    const data = JSON.parse(msg.content.toString());

    try {
      switch (routingKey) {
        case 'user.registered': {
          const event = data as UserRegisteredEvent;
          const { subject, html } = templates.welcomeEmail(event.name);
          await sendEmail(event.email, subject, html);
          console.log(`Welcome email sent to ${event.email}`);
          break;
        }

        case 'order.placed': {
          const event = data as OrderPlacedEvent;
          const { subject, html } = templates.orderConfirmation(
            event.orderId,
            event.total,
            event.items.length
          );
          // Note: we'd need the user's email here — for now log it
          // In production, either the event includes email or we call user-service
          console.log(`Order confirmation for order ${event.orderId}`);
          await sendEmail('customer@example.com', subject, html);
          break;
        }

        case 'payment.completed': {
          const event = data as PaymentCompletedEvent;
          const { subject, html } = templates.paymentReceipt(
            event.orderId,
            event.amount
          );
          console.log(`Payment receipt for order ${event.orderId}`);
          await sendEmail('customer@example.com', subject, html);
          break;
        }

        case 'payment.failed': {
          const event = data as PaymentFailedEvent;
          const { subject, html } = templates.paymentFailed(
            event.orderId,
            event.reason
          );
          console.log(`Payment failure alert for order ${event.orderId}`);
          await sendEmail('customer@example.com', subject, html);
          break;
        }

        case 'order.status_updated': {
          const event = data as OrderStatusUpdatedEvent;
          const { subject, html } = templates.orderStatusUpdate(
            event.orderId,
            event.newStatus
          );
          console.log(`Status update email for order ${event.orderId}`);
          await sendEmail('customer@example.com', subject, html);
          break;
        }

        default:
          console.warn(`Unhandled event: ${routingKey}`);
      }

      channel.ack(msg);
    } catch (err) {
      console.error(`Error processing ${routingKey}:`, err);
      channel.nack(msg, false, true);
    }
  });
}
