import { Router } from "express";
import { prisma } from "../utils/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import {
  PLANS,
  createCheckoutSession,
  createBillingPortalSession,
} from "../utils/stripe";

const router = Router();

// Get available plans
router.get("/plans", (_req, res) => {
  const plans = Object.entries(PLANS).map(([key, value]) => ({
    id: key,
    ...value,
  }));

  res.json({ plans });
});

// Get current subscription
router.get("/current", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (!subscription) {
      throw new AppError("No subscription found", 404);
    }

    const plan = PLANS[subscription.plan as keyof typeof PLANS];

    res.json({
      ...subscription,
      planDetails: plan,
    });
  } catch (error) {
    next(error);
  }
});

// Create checkout session
router.post("/create-checkout", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { priceId } = req.body;

    if (!priceId) {
      throw new AppError("Price ID required", 400);
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (!subscription) {
      throw new AppError("No subscription found", 404);
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const session = await createCheckoutSession(
      subscription.stripeCustomerId,
      priceId,
      `${frontendUrl}/dashboard?checkout=success`,
      `${frontendUrl}/dashboard?checkout=cancelled`
    );

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// Create billing portal session
router.post("/create-portal", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (!subscription) {
      throw new AppError("No subscription found", 404);
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const session = await createBillingPortalSession(
      subscription.stripeCustomerId,
      `${frontendUrl}/settings`
    );

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

export { router as subscriptionRoutes };
