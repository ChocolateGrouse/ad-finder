import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate, checkSearchLimit, AuthRequest } from "../middleware/auth";
import { processSearch } from "../services/search-service";

const router = Router();

// Create new search
router.post("/", authenticate, checkSearchLimit, async (req: AuthRequest, res, next) => {
  try {
    const searchSchema = z.object({
      budget: z.number().positive(),
      targetAudience: z.record(z.unknown()).optional(),
      industries: z.array(z.string()).optional().default([]),
      adTypes: z.array(z.string()).optional().default([]),
      platforms: z.array(z.string()).optional().default([]),
      goals: z.array(z.string()).optional().default([]),
    });

    const data = searchSchema.parse(req.body);

    // Create search record
    const search = await prisma.search.create({
      data: {
        userId: req.user!.id,
        budget: data.budget,
        targetAudience: data.targetAudience,
        industries: data.industries,
        adTypes: data.adTypes,
        platforms: data.platforms,
        goals: data.goals,
        status: "PROCESSING",
      },
    });

    // Increment search count
    await prisma.subscription.update({
      where: { userId: req.user!.id },
      data: { searchesUsed: { increment: 1 } },
    });

    // Process search asynchronously
    processSearch(search.id).catch((err) => {
      console.error("Search processing error:", err);
    });

    res.status(201).json(search);
  } catch (error) {
    next(error);
  }
});

// List user's searches
router.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const querySchema = z.object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
    });

    const params = querySchema.parse(req.query);
    const skip = (params.page - 1) * params.limit;

    const [searches, total] = await Promise.all([
      prisma.search.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
      }),
      prisma.search.count({ where: { userId: req.user!.id } }),
    ]);

    res.json({
      searches,
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

// Get single search
router.get("/:id", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const search = await prisma.search.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!search) {
      res.status(404).json({ error: "Search not found" });
      return;
    }

    res.json(search);
  } catch (error) {
    next(error);
  }
});

// Get search results
router.get("/:id/results", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const search = await prisma.search.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!search) {
      res.status(404).json({ error: "Search not found" });
      return;
    }

    const results = await prisma.searchResult.findMany({
      where: { searchId: search.id },
      include: {
        opportunity: {
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
        },
      },
      orderBy: { rank: "asc" },
    });

    res.json({
      status: search.status,
      results,
    });
  } catch (error) {
    next(error);
  }
});

export { router as searchRoutes };
