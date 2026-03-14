import { Request, Response } from 'express';
import Stripe from 'stripe';
import { config } from '../config/index.js';
import * as paymentService from '../services/paymentService.js';

const stripe = new Stripe(config.stripeSecretKey);

// ─── Get payment details (frontend needs client_secret) ─
export const getPayment = async (req: Request<{ orderId: string }>, res: Response): Promise<void> => {
  const payment = await paymentService.getPaymentByOrderId(
    req.params.orderId,
    req.user!.id
  );

  res.status(200).json({ success: true, data: payment });
};

// ─── Stripe webhook endpoint ────────────────────────────
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  if (config.stripeWebhookSecret) {
    // Production: verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body, // raw body — NOT parsed JSON
      signature,
      config.stripeWebhookSecret
    );
  } else {
    // Development: trust the payload without verification
    event = JSON.parse(req.body.toString()) as Stripe.Event;
  }

  await paymentService.handleStripeWebhook(event);

  // Stripe expects a 200 response to acknowledge receipt
  res.status(200).json({ received: true });
};
