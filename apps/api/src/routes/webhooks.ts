import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { constructWebhookEvent } from "../utils/stripe";
import Stripe from "stripe";

const router = Router();

// Stripe webhook handler
router.post("/stripe", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(req.body as Buffer, sig);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    res.status(400).send(`Webhook Error: ${err}`);
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  await prisma.subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscriptionId,
      status: "ACTIVE",
    },
  });

  console.log(`Checkout completed for customer: ${customerId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id;

  // Map price ID to plan
  const planMap: Record<string, "STARTER" | "GROWTH" | "SCALE"> = {
    [process.env.STRIPE_STARTER_PRICE_ID || ""]: "STARTER",
    [process.env.STRIPE_GROWTH_PRICE_ID || ""]: "GROWTH",
    [process.env.STRIPE_SCALE_PRICE_ID || ""]: "SCALE",
  };

  const plan = planMap[priceId] || "STARTER";

  const statusMap: Record<string, "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING" | "INCOMPLETE"> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    trialing: "TRIALING",
    incomplete: "INCOMPLETE",
  };

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      plan,
      status: statusMap[subscription.status] || "ACTIVE",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`Subscription updated: ${subscription.id}, plan: ${plan}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "CANCELED",
      cancelAtPeriodEnd: false,
    },
  });

  console.log(`Subscription deleted: ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.billing_reason === "subscription_cycle") {
    // Reset monthly search count on successful renewal
    await prisma.subscription.updateMany({
      where: { stripeCustomerId: invoice.customer as string },
      data: { searchesUsed: 0 },
    });

    console.log(`Search count reset for customer: ${invoice.customer}`);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  await prisma.subscription.updateMany({
    where: { stripeCustomerId: invoice.customer as string },
    data: { status: "PAST_DUE" },
  });

  console.log(`Payment failed for customer: ${invoice.customer}`);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.bookingId;

  if (bookingId) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        stripePaymentId: paymentIntent.id,
      },
    });

    console.log(`Booking confirmed: ${bookingId}`);
  }
}

export { router as webhookRoutes };
