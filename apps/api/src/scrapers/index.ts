import { prisma } from "../utils/prisma";
import { PlatformType } from "@prisma/client";
import { BaseScraper, ScraperResult } from "./base-scraper";
import { FacebookScraper } from "./facebook-scraper";
import { GoogleAdsScraper } from "./google-scraper";
import { TikTokScraper } from "./tiktok-scraper";
import { PodcastScraper } from "./podcast-scraper";
import { NewsletterScraper } from "./newsletter-scraper";
import { LinkedInScraper } from "./linkedin-scraper";
import { TwitterScraper } from "./twitter-scraper";
import { PinterestScraper } from "./pinterest-scraper";
import { SnapchatScraper } from "./snapchat-scraper";
import { RedditScraper } from "./reddit-scraper";
import { TaboolaScraper } from "./taboola-scraper";
import { OutbrainScraper } from "./outbrain-scraper";

const scraperRegistry: Record<string, new () => BaseScraper> = {
  facebook: FacebookScraper,
  instagram: FacebookScraper,
  google: GoogleAdsScraper,
  tiktok: TikTokScraper,
  linkedin: LinkedInScraper,
  twitter: TwitterScraper,
  pinterest: PinterestScraper,
  snapchat: SnapchatScraper,
  reddit: RedditScraper,
  podcorn: PodcastScraper,
  advertisecast: PodcastScraper,
  swapstack: NewsletterScraper,
  paved: NewsletterScraper,
  taboola: TaboolaScraper,
  outbrain: OutbrainScraper,
};

export interface RunScraperResult {
  found: number;
  added: number;
  updated: number;
}

export async function runScraper(platformSlug: string): Promise<RunScraperResult> {
  const ScraperClass = scraperRegistry[platformSlug];
  if (!ScraperClass) {
    console.warn(`No scraper found for platform: ${platformSlug}`);
    return { found: 0, added: 0, updated: 0 };
  }

  let platform = await prisma.adPlatform.findUnique({ where: { slug: platformSlug } });
  if (!platform) {
    platform = await createPlatform(platformSlug);
  }

  const scraper = new ScraperClass();
  scraper.setPlatformId(platform.id);

  const results = await scraper.scrape();
  const stats = await processScraperResults(platform.id, results);

  await prisma.adPlatform.update({
    where: { id: platform.id },
    data: { lastScraped: new Date() },
  });

  return stats;
}

function buildOpportunityData(result: ScraperResult) {
  return {
    title: result.title,
    description: result.description,
    adType: result.adType,
    placement: result.placement,
    format: result.format,
    pricingModel: result.pricingModel,
    minBudget: result.minBudget,
    maxBudget: result.maxBudget,
    cpmEstimate: result.cpmEstimate,
    cpcEstimate: result.cpcEstimate,
    estimatedReach: result.estimatedReach,
    audienceData: result.audienceData,
    targetingOptions: result.targetingOptions,
    avgCtr: result.avgCtr,
    avgConversion: result.avgConversion,
    qualityScore: result.qualityScore,
    sourceUrl: result.sourceUrl,
    isActive: true,
    lastVerified: new Date(),
  };
}

async function processScraperResults(platformId: string, results: ScraperResult[]): Promise<RunScraperResult> {
  let added = 0;
  let updated = 0;

  for (const result of results) {
    try {
      const existing = result.externalId
        ? await prisma.adOpportunity.findFirst({ where: { platformId, externalId: result.externalId } })
        : null;

      if (existing) {
        await prisma.adOpportunity.update({ where: { id: existing.id }, data: buildOpportunityData(result) });
        updated++;
      } else {
        await prisma.adOpportunity.create({
          data: { platformId, externalId: result.externalId, ...buildOpportunityData(result) },
        });
        added++;
      }
    } catch (error) {
      console.error("Error processing scraper result:", error);
    }
  }

  return { found: results.length, added, updated };
}

async function createPlatform(slug: string) {
  const platformConfigs: Record<
    string,
    { name: string; type: PlatformType; website: string }
  > = {
    facebook: {
      name: "Facebook Ads",
      type: "SOCIAL_MEDIA",
      website: "https://www.facebook.com/business/ads",
    },
    instagram: {
      name: "Instagram Ads",
      type: "SOCIAL_MEDIA",
      website: "https://business.instagram.com/advertising",
    },
    google: {
      name: "Google Ads",
      type: "SEARCH_ENGINE",
      website: "https://ads.google.com",
    },
    tiktok: {
      name: "TikTok Ads",
      type: "SOCIAL_MEDIA",
      website: "https://ads.tiktok.com",
    },
    linkedin: {
      name: "LinkedIn Ads",
      type: "SOCIAL_MEDIA",
      website: "https://business.linkedin.com/marketing-solutions/ads",
    },
    twitter: {
      name: "Twitter/X Ads",
      type: "SOCIAL_MEDIA",
      website: "https://ads.twitter.com",
    },
    youtube: {
      name: "YouTube Ads",
      type: "VIDEO",
      website: "https://www.youtube.com/ads/",
    },
    pinterest: {
      name: "Pinterest Ads",
      type: "SOCIAL_MEDIA",
      website: "https://ads.pinterest.com",
    },
    snapchat: {
      name: "Snapchat Ads",
      type: "SOCIAL_MEDIA",
      website: "https://ads.snapchat.com",
    },
    reddit: {
      name: "Reddit Ads",
      type: "SOCIAL_MEDIA",
      website: "https://ads.reddit.com",
    },
    podcorn: {
      name: "Podcorn",
      type: "PODCAST",
      website: "https://podcorn.com",
    },
    advertisecast: {
      name: "AdvertiseCast",
      type: "PODCAST",
      website: "https://www.advertisecast.com",
    },
    swapstack: {
      name: "Swapstack",
      type: "NEWSLETTER",
      website: "https://swapstack.co",
    },
    paved: {
      name: "Paved",
      type: "NEWSLETTER",
      website: "https://paved.com",
    },
    taboola: {
      name: "Taboola",
      type: "NATIVE_ADS",
      website: "https://www.taboola.com",
    },
    outbrain: {
      name: "Outbrain",
      type: "NATIVE_ADS",
      website: "https://www.outbrain.com",
    },
  };

  const config = platformConfigs[slug];

  if (!config) {
    throw new Error(`Unknown platform: ${slug}`);
  }

  return prisma.adPlatform.create({
    data: {
      slug,
      ...config,
      isActive: true,
    },
  });
}

const PLATFORM_SLUGS = [
  "facebook", "instagram", "google", "tiktok", "linkedin", "twitter",
  "youtube", "pinterest", "snapchat", "reddit", "podcorn", "advertisecast",
  "swapstack", "paved", "taboola", "outbrain",
];

export async function seedPlatforms(): Promise<void> {
  for (const slug of PLATFORM_SLUGS) {
    const existing = await prisma.adPlatform.findUnique({ where: { slug } });
    if (!existing) {
      await createPlatform(slug);
      console.log(`Created platform: ${slug}`);
    }
  }
}
