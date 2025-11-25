const stripePublicKey = import.meta.env.PUBLIC_STRIPE_PUBLIC_KEY;
const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY;

export type CheckoutLineItem = {
  priceId: string;
  quantity: number;
};

export function getStripeConfig() {
  return {
    publicKey: stripePublicKey,
    secretKey: stripeSecretKey,
    ready: Boolean(stripePublicKey)
  };
}

export async function createCheckoutSession(lineItems: CheckoutLineItem[]) {
  if (!stripePublicKey) {
    console.warn('Stripe public key missing, returning mock checkout URL');
    return { url: '/checkout/mock-session' };
  }

  // Replace with backend call to create session using secret key.
  return {
    url: `${import.meta.env.PUBLIC_BACKEND_URL || ''}/checkout/session?items=${encodeURIComponent(
      JSON.stringify(lineItems)
    )}`
  };
}
