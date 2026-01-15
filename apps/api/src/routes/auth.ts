import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { createCustomer } from "../utils/stripe";
import { AppError } from "../middleware/error-handler";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create Stripe customer (for commission payments when they book ads)
    const stripeCustomer = await createCustomer(data.email, data.name);

    // Create user with FREE access (commission-only model)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        subscription: {
          create: {
            stripeCustomerId: stripeCustomer.id,
            plan: "STARTER", // All users get full access for free
            status: "ACTIVE", // Active immediately - no trial needed
            currentPeriodStart: new Date(),
            currentPeriodEnd: null, // No end date - free forever
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.passwordHash);

    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    next(error);
  }
});

// Logout (stateless, just for frontend consistency)
router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

// Request password reset
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (user) {
      // TODO: Send password reset email
      console.log(`Password reset requested for: ${email}`);
    }

    res.json({ message: "If an account exists, a password reset link has been sent." });
  } catch (error) {
    next(error);
  }
});

// OAuth sign in (for NextAuth.js integration)
const oauthSchema = z.object({
  provider: z.enum(["google", "github"]),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  providerAccountId: z.string(),
});

router.post("/oauth", async (req, res, next) => {
  try {
    const data = oauthSchema.parse(req.body);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { accounts: true },
    });

    if (!user) {
      // Create Stripe customer for new OAuth users
      const stripeCustomer = await createCustomer(data.email, data.name || "User");

      // Create new user with FREE access (commission-only model)
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: new Date(),
          subscription: {
            create: {
              stripeCustomerId: stripeCustomer.id,
              plan: "STARTER", // All users get full access for free
              status: "ACTIVE", // Active immediately - no trial needed
              currentPeriodStart: new Date(),
              currentPeriodEnd: null, // No end date - free forever
            },
          },
          accounts: {
            create: {
              type: "oauth",
              provider: data.provider,
              providerAccountId: data.providerAccountId,
            },
          },
        },
        include: { accounts: true },
      });
    } else {
      // Check if this OAuth account is already linked
      const existingAccount = user.accounts.find(
        (acc) => acc.provider === data.provider && acc.providerAccountId === data.providerAccountId
      );

      if (!existingAccount) {
        // Link new OAuth account to existing user
        await prisma.account.create({
          data: {
            userId: user.id,
            type: "oauth",
            provider: data.provider,
            providerAccountId: data.providerAccountId,
          },
        });
      }

      // Update user info if needed
      if (data.image && !user.image) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: data.image },
        });
      }
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = z
      .object({
        token: z.string(),
        password: z.string().min(8),
      })
      .parse(req.body);

    // TODO: Verify token from database
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationRecord || verificationRecord.expires < new Date()) {
      throw new AppError("Invalid or expired token", 400);
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { email: verificationRecord.identifier },
      data: { passwordHash },
    });

    await prisma.verificationToken.delete({ where: { token } });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };
