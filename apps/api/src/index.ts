import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { errorHandler } from "./middleware/error-handler";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/users";
import { subscriptionRoutes } from "./routes/subscriptions";
import { opportunityRoutes } from "./routes/opportunities";
import { searchRoutes } from "./routes/searches";
import { campaignRoutes } from "./routes/campaigns";
import { bookingRoutes } from "./routes/bookings";
import { analyticsRoutes } from "./routes/analytics";
import { webhookRoutes } from "./routes/webhooks";
import { adminRoutes } from "./routes/admin";
import { prisma } from "./utils/prisma";
import { initializeScrapingScheduler } from "./jobs/scheduler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      process.env.ADMIN_URL || "http://localhost:3002",
    ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Logging
app.use(morgan("combined"));

// Body parsing - webhook routes need raw body
app.use("/api/webhooks", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/searches", searchRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ error: "Not found" });
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);

  // Initialize scraping scheduler
  if (process.env.ENABLE_SCRAPING === "true") {
    initializeScrapingScheduler();
    console.log("Scraping scheduler initialized");
  }
});

export default app;
