import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { optionalAuth, AuthRequest } from "../middleware/auth";
import { Prisma } from "@prisma/client";

const router = Router();

// List opportunities with filtering
router.get("/", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const querySchema = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      platform: z.string().optional(),
      platformType: z.string().optional(),
      adType: z.string().optional(),
      pricingModel: z.string().optional(),
      minBudget: z.coerce.number().optional(),
      maxBudget: z.coerce.number().optional(),
      minCtr: z.coerce.number().optional(),
      search: z.string().optional(),
      sortBy: z.enum(["qualityScore", "cpmEstimate", "estimatedReach", "avgCtr", "createdAt"]).default("qualityScore"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    });

    const params = querySchema.parse(req.query);
    const skip = (params.page - 1) * params.limit;

    // Build where clause
    const where: Prisma.AdOpportunityWhereInput = {
      isActive: true,
    };

    if (params.platform) {
      where.platform = { slug: params.platform };
    }

    if (params.platformType) {
      where.platform = { ...where.platform as object, type: params.platformType as Prisma.EnumPlatformTypeFilter };
    }

    if (params.adType) {
      where.adType = params.adType;
    }

    if (params.pricingModel) {
      where.pricingModel = params.pricingModel as Prisma.EnumPricingModelFilter;
    }

    if (params.minBudget !== undefined) {
      where.minBudget = { gte: params.minBudget };
    }

    if (params.maxBudget !== undefined) {
      where.OR = [
        { maxBudget: { lte: params.maxBudget } },
        { maxBudget: null },
      ];
    }

    if (params.minCtr !== undefined) {
      where.avgCtr = { gte: params.minCtr };
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    // Execute query
    const [opportunities, total] = await Promise.all([
      prisma.adOpportunity.findMany({
        where,
        include: {
          platform: {
            select: {
              id: true,
              name: true,
              slug: true,
              type: true,
              logoUrl: true,
            },
          },
        },
        orderBy: { [params.sortBy]: params.sortOrder },
        skip,
        take: params.limit,
      }),
      prisma.adOpportunity.count({ where }),
    ]);

    res.json({
      opportunities,
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

// Get single opportunity
router.get("/:id", async (req, res, next) => {
  try {
    const opportunity = await prisma.adOpportunity.findUnique({
      where: { id: req.params.id },
      include: {
        platform: true,
      },
    });

    if (!opportunity) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }

    res.json(opportunity);
  } catch (error) {
    next(error);
  }
});

// Get all platforms
router.get("/platforms/list", async (_req, res, next) => {
  try {
    const platforms = await prisma.adPlatform.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    res.json(platforms);
  } catch (error) {
    next(error);
  }
});

// Get trending opportunities
router.get("/trending/list", async (_req, res, next) => {
  try {
    const opportunities = await prisma.adOpportunity.findMany({
      where: {
        isActive: true,
        qualityScore: { gte: 80 },
      },
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            logoUrl: true,
          },
        },
      },
      orderBy: [
        { qualityScore: "desc" },
        { avgCtr: "desc" },
      ],
      take: 10,
    });

    res.json(opportunities);
  } catch (error) {
    next(error);
  }
});

// Get opportunity stats
router.get("/stats/overview", async (_req, res, next) => {
  try {
    const [totalOpportunities, platformCounts, adTypeCounts] = await Promise.all([
      prisma.adOpportunity.count({ where: { isActive: true } }),
      prisma.adOpportunity.groupBy({
        by: ["platformId"],
        _count: true,
        where: { isActive: true },
      }),
      prisma.adOpportunity.groupBy({
        by: ["adType"],
        _count: true,
        where: { isActive: true },
      }),
    ]);

    res.json({
      total: totalOpportunities,
      byPlatform: platformCounts,
      byAdType: adTypeCounts,
    });
  } catch (error) {
    next(error);
  }
});

export { router as opportunityRoutes };
