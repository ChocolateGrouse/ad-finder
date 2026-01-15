import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { stripe } from "../utils/stripe";
import { AppError } from "../middleware/error-handler";

const router = Router();

const COMMISSION_RATE = 0.05; // 5% commission

// Create booking
router.post("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const bookingSchema = z.object({
      opportunityId: z.string(),
      campaignId: z.string().optional(),
      budget: z.number().positive(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    });

    const data = bookingSchema.parse(req.body);

    // Verify opportunity exists
    const opportunity = await prisma.adOpportunity.findUnique({
      where: { id: data.opportunityId },
      include: { platform: true },
    });

    if (!opportunity) {
      throw new AppError("Opportunity not found", 404);
    }

    // Verify campaign belongs to user if provided
    if (data.campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: data.campaignId,
          userId: req.user!.id,
        },
      });

      if (!campaign) {
        throw new AppError("Campaign not found", 404);
      }
    }

    // Calculate commission
    const commissionAmount = data.budget * COMMISSION_RATE;
    const totalAmount = data.budget + commissionAmount;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
        opportunityId: data.opportunityId,
        campaignId: data.campaignId,
        budget: data.budget,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        commissionRate: COMMISSION_RATE,
        commissionAmount,
        totalAmount,
        status: "PAYMENT_REQUIRED",
      },
      include: {
        opportunity: {
          include: {
            platform: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    // Create Stripe payment intent
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (!subscription) {
      throw new AppError("No subscription found", 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: "usd",
      customer: subscription.stripeCustomerId,
      metadata: {
        bookingId: booking.id,
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      booking,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
});

// List bookings
router.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const querySchema = z.object({
      status: z.enum(["PENDING", "PAYMENT_REQUIRED", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED", "REFUNDED"]).optional(),
      campaignId: z.string().optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
    });

    const params = querySchema.parse(req.query);
    const skip = (params.page - 1) * params.limit;

    const where = {
      userId: req.user!.id,
      ...(params.status && { status: params.status }),
      ...(params.campaignId && { campaignId: params.campaignId }),
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          opportunity: {
            include: {
              platform: {
                select: { id: true, name: true, slug: true, type: true },
              },
            },
          },
          campaign: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      bookings,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single booking
router.get("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      include: {
        opportunity: {
          include: { platform: true },
        },
        campaign: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// Update booking status
router.patch("/:id/status", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { status } = z
      .object({
        status: z.enum(["CANCELLED"]),
      })
      .parse(req.body);

    const booking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    // Only allow cancellation of pending or payment required bookings
    if (!["PENDING", "PAYMENT_REQUIRED"].includes(booking.status)) {
      throw new AppError("Cannot cancel this booking", 400);
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export { router as bookingRoutes };
