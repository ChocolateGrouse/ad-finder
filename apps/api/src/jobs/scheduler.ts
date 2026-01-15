import cron from "node-cron";
import { prisma } from "../utils/prisma";
import { runScraper } from "../scrapers";

interface ScheduledJob {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
}

const jobs: ScheduledJob[] = [
  {
    name: "scrape-social-platforms",
    schedule: "0 */6 * * *", // Every 6 hours
    handler: async () => {
      console.log("Starting social platform scraping...");
      await runScrapingJob(["facebook", "instagram", "tiktok", "twitter", "linkedin"]);
    },
  },
  {
    name: "scrape-search-platforms",
    schedule: "0 */6 * * *", // Every 6 hours
    handler: async () => {
      console.log("Starting search platform scraping...");
      await runScrapingJob(["google"]);
    },
  },
  {
    name: "scrape-podcasts",
    schedule: "0 0 * * *", // Daily at midnight
    handler: async () => {
      console.log("Starting podcast platform scraping...");
      await runScrapingJob(["podcorn", "advertisecast"]);
    },
  },
  {
    name: "scrape-newsletters",
    schedule: "0 0 * * *", // Daily at midnight
    handler: async () => {
      console.log("Starting newsletter platform scraping...");
      await runScrapingJob(["swapstack", "paved"]);
    },
  },
  {
    name: "scrape-influencer-platforms",
    schedule: "0 */12 * * *", // Every 12 hours
    handler: async () => {
      console.log("Starting influencer platform scraping...");
      await runScrapingJob(["aspireiq", "grin", "upfluence"]);
    },
  },
  {
    name: "cleanup-old-data",
    schedule: "0 3 * * *", // Daily at 3 AM
    handler: async () => {
      console.log("Starting data cleanup...");
      await cleanupOldData();
    },
  },
  {
    name: "reset-monthly-searches",
    schedule: "0 0 1 * *", // First day of each month
    handler: async () => {
      console.log("Resetting monthly search counts...");
      await resetMonthlySearches();
    },
  },
];

async function runScrapingJob(platforms: string[]): Promise<void> {
  const job = await prisma.scrapingJob.create({
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    let totalFound = 0;
    let totalAdded = 0;
    let totalUpdated = 0;

    for (const platform of platforms) {
      try {
        const result = await runScraper(platform);
        totalFound += result.found;
        totalAdded += result.added;
        totalUpdated += result.updated;
      } catch (error) {
        console.error(`Error scraping ${platform}:`, error);
      }
    }

    await prisma.scrapingJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        itemsFound: totalFound,
        itemsAdded: totalAdded,
        itemsUpdated: totalUpdated,
      },
    });

    console.log(`Scraping completed: ${totalFound} found, ${totalAdded} added, ${totalUpdated} updated`);
  } catch (error) {
    await prisma.scrapingJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}

async function cleanupOldData(): Promise<void> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Mark opportunities not verified in 30 days as inactive
  await prisma.adOpportunity.updateMany({
    where: {
      lastVerified: { lt: thirtyDaysAgo },
      isActive: true,
    },
    data: { isActive: false },
  });

  // Delete old scraping jobs
  await prisma.scrapingJob.deleteMany({
    where: {
      createdAt: { lt: thirtyDaysAgo },
    },
  });

  console.log("Cleanup completed");
}

async function resetMonthlySearches(): Promise<void> {
  await prisma.subscription.updateMany({
    data: { searchesUsed: 0 },
  });

  console.log("Monthly search counts reset");
}

export function initializeScrapingScheduler(): void {
  for (const job of jobs) {
    cron.schedule(job.schedule, async () => {
      console.log(`Running scheduled job: ${job.name}`);
      try {
        await job.handler();
      } catch (error) {
        console.error(`Job ${job.name} failed:`, error);
      }
    });

    console.log(`Scheduled job: ${job.name} (${job.schedule})`);
  }
}

// Manual trigger for testing
export async function triggerScraping(platforms?: string[]): Promise<void> {
  const targetPlatforms = platforms || [
    "facebook",
    "google",
    "tiktok",
    "instagram",
    "linkedin",
  ];

  await runScrapingJob(targetPlatforms);
}
