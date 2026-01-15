import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../utils/prisma";
import { AppError } from "./error-handler";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload) {
      throw new AppError("Invalid or expired token", 401);
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      if (payload) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true },
        });

        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch {
    next();
  }
}

export function requireSubscription(minPlan: "STARTER" | "GROWTH" | "SCALE" = "STARTER") {
  const planOrder = { STARTER: 1, GROWTH: 2, SCALE: 3, ENTERPRISE: 4 };

  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      const subscription = await prisma.subscription.findUnique({
        where: { userId: req.user.id },
      });

      if (!subscription) {
        throw new AppError("Subscription required", 403);
      }

      if (subscription.status !== "ACTIVE" && subscription.status !== "TRIALING") {
        throw new AppError("Active subscription required", 403);
      }

      if (planOrder[subscription.plan] < planOrder[minPlan]) {
        throw new AppError(`${minPlan} plan or higher required`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export async function checkSearchLimit(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
    });

    if (!subscription) {
      throw new AppError("Subscription required", 403);
    }

    const limits: Record<string, number> = {
      STARTER: 50,
      GROWTH: 200,
      SCALE: Infinity,
      ENTERPRISE: Infinity,
    };

    const limit = limits[subscription.plan];

    if (subscription.searchesUsed >= limit) {
      throw new AppError("Monthly search limit reached. Please upgrade your plan.", 429);
    }

    next();
  } catch (error) {
    next(error);
  }
}
