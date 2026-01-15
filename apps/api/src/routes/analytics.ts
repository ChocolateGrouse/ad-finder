import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate, requireSubscription, AuthRequest } from "../middleware/auth";

const router = Router();

// Get overview stats
router.get("/overview", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const querySchema = z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    });

    const params = querySchema.parse(req.query);

    // Get campaign IDs for user
    const userCampaigns = await prisma.campaign.findMany({
      where: { userId: req.user!.id },
      select: { id: true },
    });

    const campaignIds = userCampaigns.map((c) => c.id);

    // Get analytics
    const analyticsWhere = {
      campaignId: { in: campaignIds },
      ...(params.startDate && { date: { gte: new Date(params.startDate) } }),
      ...(params.endDate && { date: { lte: new Date(params.endDate) } }),
    };

    const analytics = await prisma.campaignAnalytics.aggregate({
      where: analyticsWhere,
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
        spend: true,
        revenue: true,
      },
    });

    // Get counts
    const [totalSearches, activeCampaigns, totalBookings] = await Promise.all([
      prisma.search.count({ where: { userId: req.user!.id } }),
      prisma.campaign.count({ where: { userId: req.user!.id, status: "ACTIVE" } }),
      prisma.booking.count({ where: { userId: req.user!.id } }),
    ]);

    const totals = analytics._sum;
    const impressions = totals.impressions || 0;
    const clicks = totals.clicks || 0;
    const conversions = totals.conversions || 0;
    const spend = Number(totals.spend) || 0;
    const revenue = Number(totals.revenue) || 0;

    res.json({
      totalSearches,
      activeCampaigns,
      totalBookings,
      impressions,
      clicks,
      conversions,
      spend,
      revenue,
      avgCtr: impressions > 0 ? clicks / impressions : 0,
      avgCpc: clicks > 0 ? spend / clicks : 0,
      roas: spend > 0 ? revenue / spend : 0,
    });
  } catch (error) {
    next(error);
  }
});

// Get platform breakdown
router.get("/platforms", authenticate, requireSubscription("GROWTH"), async (req: AuthRequest, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user!.id,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
      include: {
        opportunity: {
          include: {
            platform: {
              select: { id: true, name: true, slug: true, type: true },
            },
          },
        },
      },
    });

    // Group by platform
    const platformStats: Record<string, {
      platform: { id: string; name: string; slug: string; type: string };
      bookings: number;
      totalSpend: number;
    }> = {};

    for (const booking of bookings) {
      const platformId = booking.opportunity.platform.id;
      if (!platformStats[platformId]) {
        platformStats[platformId] = {
          platform: booking.opportunity.platform,
          bookings: 0,
          totalSpend: 0,
        };
      }
      platformStats[platformId].bookings++;
      platformStats[platformId].totalSpend += Number(booking.budget);
    }

    res.json(Object.values(platformStats));
  } catch (error) {
    next(error);
  }
});

// Get daily analytics
router.get("/daily", authenticate, requireSubscription("GROWTH"), async (req: AuthRequest, res, next) => {
  try {
    const querySchema = z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      campaignId: z.string().optional(),
    });

    const params = querySchema.parse(req.query);

    const userCampaigns = await prisma.campaign.findMany({
      where: {
        userId: req.user!.id,
        ...(params.campaignId && { id: params.campaignId }),
      },
      select: { id: true },
    });

    const analytics = await prisma.campaignAnalytics.findMany({
      where: {
        campaignId: { in: userCampaigns.map((c) => c.id) },
        date: {
          gte: new Date(params.startDate),
          lte: new Date(params.endDate),
        },
      },
      orderBy: { date: "asc" },
    });

    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

// Export analytics
router.get("/export", authenticate, requireSubscription("SCALE"), async (req: AuthRequest, res, next) => {
  try {
    const querySchema = z.object({
      format: z.enum(["csv", "json"]).default("json"),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    });

    const params = querySchema.parse(req.query);

    const userCampaigns = await prisma.campaign.findMany({
      where: { userId: req.user!.id },
      select: { id: true, name: true },
    });

    const analytics = await prisma.campaignAnalytics.findMany({
      where: {
        campaignId: { in: userCampaigns.map((c) => c.id) },
        ...(params.startDate && { date: { gte: new Date(params.startDate) } }),
        ...(params.endDate && { date: { lte: new Date(params.endDate) } }),
      },
      include: {
        campaign: {
          select: { name: true },
        },
      },
      orderBy: { date: "asc" },
    });

    if (params.format === "csv") {
      const headers = ["Date", "Campaign", "Impressions", "Clicks", "Conversions", "Spend", "Revenue", "CTR", "CPC", "ROAS"];
      const rows = analytics.map((a) => [
        a.date.toISOString().split("T")[0],
        a.campaign.name,
        a.impressions,
        a.clicks,
        a.conversions,
        a.spend,
        a.revenue,
        a.ctr || 0,
        a.cpc || 0,
        a.roas || 0,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=analytics.csv");
      res.send(csv);
    } else {
      res.json(analytics);
    }
  } catch (error) {
    next(error);
  }
});

export { router as analyticsRoutes };
