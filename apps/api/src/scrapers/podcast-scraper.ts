import { BaseScraper, ScraperResult } from "./base-scraper";
import { PricingModel } from "@prisma/client";

export class PodcastScraper extends BaseScraper {
  platformName = "Podcast Networks";
  platformType = "PODCAST";

  async scrape(): Promise<ScraperResult[]> {
    const results: ScraperResult[] = [];

    // Podcast advertising opportunities
    const adPlacements = [
      {
        title: "Pre-Roll Podcast Ads (15s)",
        description: "Short ads played before the podcast episode begins. High attention and completion rates.",
        adType: "audio",
        placement: "pre_roll",
        format: "15 seconds audio",
        pricingModel: "CPM" as PricingModel,
        minBudget: 250,
        maxBudget: 25000,
        cpmEstimate: 18.0,
        cpcEstimate: null,
        estimatedReach: 50000,
        avgCtr: 0.012,
        avgConversion: 0.008,
        audienceData: {
          demographics: "25-54 professionals",
          engagement: "high intent listeners",
        },
        targetingOptions: {
          podcast_category: ["business", "technology", "news", "comedy", "sports"],
          listener_demographics: true,
          episode_topics: true,
        },
      },
      {
        title: "Mid-Roll Podcast Ads (60s)",
        description: "Host-read ads in the middle of episodes. Highest engagement and trust.",
        adType: "audio",
        placement: "mid_roll",
        format: "60 seconds audio",
        pricingModel: "CPM" as PricingModel,
        minBudget: 500,
        maxBudget: 50000,
        cpmEstimate: 25.0,
        cpcEstimate: null,
        estimatedReach: 75000,
        avgCtr: 0.018,
        avgConversion: 0.015,
        audienceData: {
          demographics: "highly engaged listeners",
          trust_factor: "high - host endorsed",
        },
        targetingOptions: {
          podcast_category: true,
          host_read: true,
          listener_loyalty: true,
        },
      },
      {
        title: "Post-Roll Podcast Ads (30s)",
        description: "Ads at the end of episodes. Cost-effective brand awareness.",
        adType: "audio",
        placement: "post_roll",
        format: "30 seconds audio",
        pricingModel: "CPM" as PricingModel,
        minBudget: 150,
        maxBudget: 15000,
        cpmEstimate: 12.0,
        cpcEstimate: null,
        estimatedReach: 40000,
        avgCtr: 0.008,
        avgConversion: 0.005,
        audienceData: {
          demographics: "completionist listeners",
          attention: "moderate",
        },
        targetingOptions: {
          podcast_category: true,
          episode_length: true,
        },
      },
      {
        title: "Podcast Sponsorship - Full Episode",
        description: "Be the exclusive sponsor of entire episodes. Maximum brand association.",
        adType: "sponsorship",
        placement: "full_episode",
        format: "multiple mentions + pre/mid/post",
        pricingModel: "FLAT_RATE" as PricingModel,
        minBudget: 2000,
        maxBudget: 100000,
        cpmEstimate: 35.0,
        cpcEstimate: null,
        estimatedReach: 100000,
        avgCtr: 0.025,
        avgConversion: 0.018,
        audienceData: {
          exclusivity: "sole sponsor",
          mentions: "3-5 per episode",
        },
        targetingOptions: {
          podcast_show: true,
          episode_selection: true,
          host_integration: true,
        },
      },
      {
        title: "Dynamic Ad Insertion (DAI)",
        description: "Programmatically inserted ads that can be updated after publication. Scalable reach.",
        adType: "audio",
        placement: "dynamic",
        format: "15-60 seconds",
        pricingModel: "CPM" as PricingModel,
        minBudget: 100,
        maxBudget: 30000,
        cpmEstimate: 15.0,
        cpcEstimate: null,
        estimatedReach: 200000,
        avgCtr: 0.010,
        avgConversion: 0.007,
        audienceData: {
          flexibility: "high - update anytime",
          targeting: "programmatic",
        },
        targetingOptions: {
          listener_location: true,
          device_type: true,
          time_targeting: true,
          frequency_cap: true,
        },
      },
      {
        title: "Branded Podcast Series",
        description: "Create your own branded podcast series. Ultimate content marketing.",
        adType: "content",
        placement: "branded_content",
        format: "full podcast series",
        pricingModel: "FLAT_RATE" as PricingModel,
        minBudget: 10000,
        maxBudget: 250000,
        cpmEstimate: null,
        cpcEstimate: null,
        estimatedReach: 500000,
        avgCtr: 0.035,
        avgConversion: 0.022,
        audienceData: {
          brand_association: "maximum",
          content_control: "full",
        },
        targetingOptions: {
          topic_focus: true,
          distribution_network: true,
          cross_promotion: true,
        },
      },
      {
        title: "Podcast Network Package",
        description: "Advertise across multiple shows in a podcast network. Broad reach in niche.",
        adType: "audio",
        placement: "network_wide",
        format: "30-60 seconds",
        pricingModel: "CPM" as PricingModel,
        minBudget: 1000,
        maxBudget: 75000,
        cpmEstimate: 20.0,
        cpcEstimate: null,
        estimatedReach: 300000,
        avgCtr: 0.014,
        avgConversion: 0.010,
        audienceData: {
          network_shows: "10-50 podcasts",
          category_focus: true,
        },
        targetingOptions: {
          network_selection: true,
          category_focus: true,
          frequency_distribution: true,
        },
      },
    ];

    for (const ad of adPlacements) {
      results.push({
        ...ad,
        qualityScore: this.generateQualityScore(ad.avgCtr, ad.estimatedReach, ad.cpmEstimate || 20),
        externalId: `podcast-${ad.placement}-${ad.adType}`,
        sourceUrl: "https://podcorn.com",
      });
    }

    return results;
  }
}
