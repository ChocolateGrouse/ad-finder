import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Warning: STRIPE_SECRET_KEY not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// Commission rate (5%)
export const COMMISSION_RATE = parseFloat(process.env.STRIPE_COMMISSION_RATE || "0.05");

// Platform features - all FREE
export const PLATFORM_FEATURES = {
  free: [
    "Unlimited searches",
    "Access to 50+ ad platforms",
    "AI-powered recommendations",
    "Full analytics dashboard",
    "Campaign management",
    "Real-time CTR tracking",
    "Performance reports",
  ],
  commission: "5% commission only when you book an ad",
};

export async function createCustomer(email: string, name?: string): Promise<Stripe.Customer | { id: string }> {
  try {
    return await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        platform: "ad-finder",
      },
    });
  } catch (error) {
    // In development, return a mock customer ID if Stripe fails
    if (process.env.NODE_ENV !== "production") {
      console.warn("Stripe customer creation failed, using mock ID:", (error as Error).message);
      return { id: `mock_cus_${Date.now()}` };
    }
    throw error;
  }
}

// Create a checkout session for booking an ad opportunity
export async function createBookingCheckout(
  customerId: string,
  bookingDetails: {
    opportunityName: string;
    adCost: number; // Cost of the ad placement
    bookingId: string;
  },
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const commission = Math.round(bookingDetails.adCost * COMMISSION_RATE * 100) / 100;
  const total = bookingDetails.adCost + commission;

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: bookingDetails.opportunityName,
            description: "Ad placement booking",
          },
          unit_amount: Math.round(bookingDetails.adCost * 100), // Convert to cents
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "AD Finder Service Fee (5%)",
            description: "Platform commission for booking facilitation",
          },
          unit_amount: Math.round(commission * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: bookingDetails.bookingId,
      adCost: bookingDetails.adCost.toString(),
      commission: commission.toString(),
      total: total.toString(),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

// Calculate commission for a given ad cost
export function calculateCommission(adCost: number): {
  adCost: number;
  commission: number;
  total: number;
  commissionRate: string;
} {
  const commission = Math.round(adCost * COMMISSION_RATE * 100) / 100;
  const total = Math.round((adCost + commission) * 100) / 100;

  return {
    adCost,
    commission,
    total,
    commissionRate: `${COMMISSION_RATE * 100}%`,
  };
}

// Create a payment intent for booking (alternative to checkout)
export async function createBookingPaymentIntent(
  customerId: string,
  adCost: number,
  bookingId: string
): Promise<Stripe.PaymentIntent> {
  const { total, commission } = calculateCommission(adCost);

  return stripe.paymentIntents.create({
    amount: Math.round(total * 100), // Convert to cents
    currency: "usd",
    customer: customerId,
    metadata: {
      bookingId,
      adCost: adCost.toString(),
      commission: commission.toString(),
    },
  });
}

// Process refund for a booking
export async function refundBooking(
  paymentIntentId: string,
  reason?: string
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason: "requested_by_customer",
    metadata: {
      refundReason: reason || "Customer requested refund",
    },
  });
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export function constructWebhookEvent(
  body: Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ""
  );
}

// Get customer's payment methods
export async function getCustomerPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });
  return paymentMethods.data;
}

// Get customer's payment history
export async function getCustomerPayments(
  customerId: string,
  limit: number = 10
): Promise<Stripe.PaymentIntent[]> {
  const payments = await stripe.paymentIntents.list({
    customer: customerId,
    limit,
  });
  return payments.data;
}
