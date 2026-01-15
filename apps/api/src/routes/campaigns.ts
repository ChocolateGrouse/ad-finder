import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate, requireSubscription, AuthRequest } from "../middleware/auth";

const router = Router();

// Create campaign
router.post("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const campaignSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      budget: z.number().positive(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    });

    const data = campaignSchema.parse(req.body);

    const campaign = await prisma.campaign.create({
      data: {
        userId: req.user!.id,
        name: data.name,
        description: data.description,
        budget: data.budget,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: "DRAFT",
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});

// List campaigns
router.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const querySchema = z.object({
      status: z.enum(["DRAFT", "PENDING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
    });

    const params = querySchema.parse(req.query);
    const skip = (params.page - 1) * params.limit;

    const where = {
      userId: req.user!.id,
      ...(params.status && { status: params.status }),
    };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          bookings: {
            include: {
              opportunity: {
                select: {
                  id: true,
                  title: true,
                  platform: {
                    select: { name: true, slug: true },
                  },
                },
              },
            },
          },
          _count: {
            select: { bookings: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    res.json({
      campaigns,
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

// Get single campaign
router.get("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      include: {
        bookings: {
          include: {
            opportunity: {
              include: {
                platform: {
                  select: { id: true, name: true, slug: true, type: true },
                },
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

// Update campaign
router.patch("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const campaignSchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      budget: z.number().positive().optional(),
      startDate: z.string().datetime().optional().nullable(),
      endDate: z.string().datetime().optional().nullable(),
      status: z.enum(["DRAFT", "PENDING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]).optional(),
    });

    const data = campaignSchema.parse(req.body);

    const campaign = await prisma.campaign.updateMany({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : data.startDate === null ? null : undefined,
        endDate: data.endDate ? new Date(data.endDate) : data.endDate === null ? null : undefined,
      },
    });

    if (campaign.count === 0) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    const updated = await prisma.campaign.findUnique({
      where: { id: req.params.id },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete campaign
router.delete("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    if (campaign.status === "ACTIVE") {
      res.status(400).json({ error: "Cannot delete an active campaign" });
      return;
    }

    await prisma.campaign.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Campaign deleted" });
  } catch (error) {
    next(error);
  }
});

// Get campaign analytics
router.get("/:id/analytics", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const querySchema = z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    });

    const params = querySchema.parse(req.query);

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    const where = {
      campaignId: campaign.id,
      ...(params.startDate && { date: { gte: new Date(params.startDate) } }),
      ...(params.endDate && { date: { lte: new Date(params.endDate) } }),
    };

    const analytics = await prisma.campaignAnalytics.findMany({
      where,
      orderBy: { date: "asc" },
    });

    // Calculate totals
    const totals = analytics.reduce(
      (acc, curr) => ({
        impressions: acc.impressions + curr.impressions,
        clicks: acc.clicks + curr.clicks,
        conversions: acc.conversions + curr.conversions,
        spend: acc.spend + Number(curr.spend),
        revenue: acc.revenue + Number(curr.revenue),
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 }
    );

    const avgCtr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
    const avgCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0;

    res.json({
      daily: analytics,
      totals: {
        ...totals,
        ctr: avgCtr,
        cpc: avgCpc,
        roas,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as campaignRoutes };
