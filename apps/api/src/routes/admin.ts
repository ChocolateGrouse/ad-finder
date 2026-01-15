import { Router } from "express";
import { prisma } from "../utils/prisma";
import { z } from "zod";

const router = Router();

// Admin authentication middleware (simple password check)
const adminAuth = (req: any, res: any, next: any) => {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Get dashboard stats
router.get("/stats", adminAuth, async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      totalCampaigns,
      activeCampaigns,
      totalBookings,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.campaign.count(),
      prisma.campaign.count({ where: { status: "ACTIVE" } }),
      prisma.booking.count(),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // Calculate revenue from commissions (5% of booking amounts)
    const bookings = await prisma.booking.findMany({
      where: { status: "CONFIRMED" },
    });

    const COMMISSION_RATE = 0.05;
    const totalCommissionRevenue = bookings.reduce((sum, booking) => {
      return sum + Number(booking.budget) * COMMISSION_RATE;
    }, 0);

    // Get bookings from last 30 days for monthly revenue
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentBookings = bookings.filter((b) => b.createdAt >= thirtyDaysAgo);
    const monthlyRevenue = recentBookings.reduce((sum, booking) => {
      return sum + Number(booking.budget) * COMMISSION_RATE;
    }, 0);

    // Get active users count (users who have made at least one booking)
    const usersWithBookings = await prisma.user.count({
      where: { bookings: { some: {} } },
    });

    res.json({
      totalUsers,
      activeUsers: usersWithBookings, // Users who have booked at least once
      totalCampaigns,
      activeCampaigns,
      totalBookings,
      recentUsers,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      totalRevenue: Math.round(totalCommissionRevenue * 100) / 100,
      commissionRate: "5%",
      revenueModel: "Commission-only (5% on bookings)",
    });
  } catch (error) {
    next(error);
  }
});

// Get all users with subscription info
router.get("/users", adminAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        include: {
          subscription: true,
          brand: true,
          _count: {
            select: { campaigns: true, bookings: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    res.json({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt,
        subscription: u.subscription
          ? {
              plan: u.subscription.plan,
              status: u.subscription.status,
            }
          : null,
        brand: u.brand?.name || null,
        campaignsCount: u._count.campaigns,
        bookingsCount: u._count.bookings,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all transactions (booking payments with commissions)
router.get("/transactions", adminAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const COMMISSION_RATE = 0.05;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: { email: true, name: true },
          },
          opportunity: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count(),
    ]);

    res.json({
      transactions: bookings.map((b) => {
        const adCost = Number(b.budget);
        const commission = Math.round(adCost * COMMISSION_RATE * 100) / 100;
        return {
          id: b.id,
          user: b.user.email,
          userName: b.user.name,
          opportunity: b.opportunity.name,
          adCost: adCost,
          commission: commission,
          total: Math.round((adCost + commission) * 100) / 100,
          status: b.status,
          createdAt: b.createdAt,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get active campaigns/ads
router.get("/campaigns", adminAuth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        skip,
        take: limit,
        include: {
          user: {
            include: { brand: true },
          },
          bookings: {
            include: {
              opportunity: {
                include: { platform: true },
              },
            },
          },
          analytics: {
            orderBy: { date: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.campaign.count(),
    ]);

    res.json({
      campaigns: campaigns.map((c) => {
        const latestAnalytics = c.analytics[0];
        const totalBudget = c.bookings.reduce(
          (sum, b) => sum + Number(b.budget),
          0
        );
        const totalSpent = latestAnalytics
          ? Number(latestAnalytics.spend)
          : totalBudget * 0.6;

        return {
          id: c.id,
          name: c.name,
          brand: c.user.brand?.name || c.user.name || "Unknown",
          userEmail: c.user.email,
          budget: Number(c.budget),
          spent: totalSpent,
          status: c.status,
          startDate: c.startDate,
          endDate: c.endDate,
          platforms: c.bookings.map((b) => b.opportunity.platform.name),
          impressions: latestAnalytics?.impressions || 0,
          clicks: latestAnalytics?.clicks || 0,
          conversions: latestAnalytics?.conversions || 0,
          createdAt: c.createdAt,
        };
      }),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get platform statistics
router.get("/platforms", adminAuth, async (req, res, next) => {
  try {
    const platforms = await prisma.adPlatform.findMany({
      include: {
        _count: {
          select: { opportunities: true },
        },
        opportunities: {
          include: {
            bookings: true,
          },
        },
      },
    });

    const platformStats = platforms.map((p) => {
      const totalBookings = p.opportunities.reduce(
        (sum, o) => sum + o.bookings.length,
        0
      );
      const totalRevenue = p.opportunities.reduce(
        (sum, o) =>
          sum +
          o.bookings.reduce((bSum, b) => bSum + Number(b.budget) * 0.05, 0),
        0
      );

      return {
        id: p.id,
        name: p.name,
        type: p.type,
        opportunityCount: p._count.opportunities,
        bookingsCount: totalBookings,
        revenue: totalRevenue,
        lastScraped: p.lastScraped,
        isActive: p.isActive,
      };
    });

    res.json({ platforms: platformStats });
  } catch (error) {
    next(error);
  }
});

// Get user growth data (monthly)
router.get("/growth", adminAuth, async (req, res, next) => {
  try {
    const months = 6;
    const growthData = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = await prisma.user.count({
        where: {
          createdAt: {
            lte: endOfMonth,
          },
        },
      });

      growthData.push({
        month: startOfMonth.toLocaleString("default", { month: "short" }),
        year: startOfMonth.getFullYear(),
        users: count,
      });
    }

    res.json({ growth: growthData });
  } catch (error) {
    next(error);
  }
});

export const adminRoutes = router;
