import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

const router = Router();

// Get current user
router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
        brand: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
            searchesUsed: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update current user
router.patch("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      image: z.string().url().optional(),
    });

    const data = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get user's brand
router.get("/me/brand", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { userId: req.user!.id },
    });

    if (!brand) {
      throw new AppError("Brand not found", 404);
    }

    res.json(brand);
  } catch (error) {
    next(error);
  }
});

// Create brand
router.post("/me/brand", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const brandSchema = z.object({
      name: z.string().min(2),
      website: z.string().url().optional(),
      industry: z.string(),
      targetAudience: z.record(z.unknown()).optional(),
      monthlyBudget: z.number().positive().optional(),
    });

    const data = brandSchema.parse(req.body);

    // Check if brand already exists
    const existingBrand = await prisma.brand.findUnique({
      where: { userId: req.user!.id },
    });

    if (existingBrand) {
      throw new AppError("Brand already exists", 409);
    }

    const brand = await prisma.brand.create({
      data: {
        ...data,
        userId: req.user!.id,
      },
    });

    res.status(201).json(brand);
  } catch (error) {
    next(error);
  }
});

// Update brand
router.patch("/me/brand", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const brandSchema = z.object({
      name: z.string().min(2).optional(),
      website: z.string().url().optional().nullable(),
      industry: z.string().optional(),
      targetAudience: z.record(z.unknown()).optional(),
      monthlyBudget: z.number().positive().optional().nullable(),
    });

    const data = brandSchema.parse(req.body);

    const brand = await prisma.brand.update({
      where: { userId: req.user!.id },
      data,
    });

    res.json(brand);
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };
