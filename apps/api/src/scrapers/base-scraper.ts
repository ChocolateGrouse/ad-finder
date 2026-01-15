import { PricingModel } from "@prisma/client";

export interface ScraperResult {
  title: string;
  description?: string;
  adType: string;
  placement?: string;
  format?: string;
  pricingModel: PricingModel;
  minBudget?: number;
  maxBudget?: number;
  cpmEstimate?: number;
  cpcEstimate?: number | null;
  estimatedReach?: number;
  audienceData?: Record<string, unknown>;
  targetingOptions?: Record<string, unknown>;
  avgCtr?: number;
  avgConversion?: number;
  qualityScore?: number;
  sourceUrl?: string;
  externalId?: string;
}

export interface AdPlacement extends Omit<ScraperResult, "qualityScore" | "sourceUrl" | "externalId"> {}

export abstract class BaseScraper {
  protected platformId = "";

  abstract platformName: string;
  abstract platformType: string;
  abstract sourceUrl: string;

  setPlatformId(id: string): void {
    this.platformId = id;
  }

  abstract scrape(): Promise<ScraperResult[]>;

  protected buildResults(placements: AdPlacement[], platformSlug: string): ScraperResult[] {
    return placements.map((ad) => ({
      ...ad,
      qualityScore: this.generateQualityScore(ad.avgCtr, ad.estimatedReach, ad.cpmEstimate ?? 10),
      externalId: `${platformSlug}-${ad.placement}-${ad.adType}`,
      sourceUrl: this.sourceUrl,
    }));
  }

  protected generateQualityScore(ctr?: number, reach?: number, pricing?: number): number {
    let score = 50;

    if (ctr) score += Math.min(ctr * 1000, 30);

    if (reach) {
      if (reach > 1_000_000) score += 20;
      else if (reach > 100_000) score += 15;
      else if (reach > 10_000) score += 10;
      else if (reach > 1_000) score += 5;
    }

    if (pricing) {
      if (pricing < 3) score += 20;
      else if (pricing < 5) score += 15;
      else if (pricing < 10) score += 10;
      else if (pricing < 20) score += 5;
    }

    return Math.min(Math.round(score), 100);
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected randomDelay(minMs: number, maxMs: number): Promise<void> {
    return this.delay(Math.random() * (maxMs - minMs) + minMs);
  }
}
