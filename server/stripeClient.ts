import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export async function getStripeClient(): Promise<Stripe> {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}

export async function isStripeConfigured(): Promise<boolean> {
  return !!process.env.STRIPE_SECRET_KEY;
}
