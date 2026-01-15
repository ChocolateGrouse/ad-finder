import { prisma } from "../utils/prisma";
import { Prisma, AdOpportunity } from "@prisma/client";

interface SearchParams {
  budget: number;
  targetAudience?: Record<string, unknown>;
  industries: string[];
  adTypes: string[];
  platforms: string[];
  goals: string[];
}

interface ScoredOpportunity {
  opportunity: AdOpportunity & {
    platform: { id: string; name: string; slug: string; type: string };
  };
  matchScore: number;
  recommendedBudget: number;
  expectedReach: number;
  expectedCtr: number;
  expectedRoi: number;
  reasoning: string;
}

export async function processSearch(searchId: string): Promise<void> {
  try {
    // Get search parameters
    const search = await prisma.search.findUnique({
      where: { id: searchId },
    });

    if (!search) {
      throw new Error("Search not found");
    }

    const params: SearchParams = {
      budget: Number(search.budget),
      targetAudience: search.targetAudience as Record<string, unknown> | undefined,
      industries: search.industries,
      adTypes: search.adTypes,
      platforms: search.platforms,
      goals: search.goals,
    };

    // Find matching opportunities
    const opportunities = await findMatchingOpportunities(params);

    // Score and rank opportunities
    const scoredOpportunities = scoreOpportunities(opportunities, params);

    // Take top 20 results
    const topResults = scoredOpportunities.slice(0, 20);

    // Create search results
    await prisma.searchResult.createMany({
      data: topResults.map((result, index) => ({
        searchId,
        opportunityId: result.opportunity.id,
        matchScore: result.matchScore,
        recommendedBudget: result.recommendedBudget,
        expectedReach: result.expectedReach,
        expectedCtr: result.expectedCtr,
        expectedRoi: result.expectedRoi,
        reasoning: result.reasoning,
        rank: index + 1,
      })),
    });

    // Update search status
    await prisma.search.update({
      where: { id: searchId },
      data: {
        status: "COMPLETED",
        resultCount: topResults.length,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Search processing error:", error);

    // Mark search as failed
    await prisma.search.update({
      where: { id: searchId },
      data: { status: "FAILED" },
    });

    throw error;
  }
}

async function findMatchingOpportunities(params: SearchParams) {
  const where: Prisma.AdOpportunityWhereInput = {
    isActive: true,
  };

  // Filter by budget range
  where.OR = [
    {
      minBudget: { lte: params.budget },
      maxBudget: { gte: params.budget * 0.1 }, // At least 10% of budget
    },
    {
      minBudget: { lte: params.budget },
      maxBudget: null,
    },
    {
      minBudget: null,
      maxBudget: { gte: params.budget * 0.1 },
    },
  ];

  // Filter by platforms if specified
  if (params.platforms.length > 0) {
    where.platform = { slug: { in: params.platforms } };
  }

  // Filter by ad types if specified
  if (params.adTypes.length > 0) {
    where.adType = { in: params.adTypes };
  }

  const opportunities = await prisma.adOpportunity.findMany({
    where,
    include: {
      platform: {
        select: { id: true, name: true, slug: true, type: true },
      },
    },
    orderBy: { qualityScore: "desc" },
    take: 100, // Get top 100 for scoring
  });

  return opportunities;
}

function scoreOpportunities(
  opportunities: Array<AdOpportunity & { platform: { id: string; name: string; slug: string; type: string } }>,
  params: SearchParams
): ScoredOpportunity[] {
  const scored = opportunities.map((opportunity) => {
    let score = 0;
    const reasons: string[] = [];

    // Base score from quality score (0-40 points)
    const qualityPoints = ((opportunity.qualityScore || 50) / 100) * 40;
    score += qualityPoints;
    if (qualityPoints > 30) {
      reasons.push("High quality score");
    }

    // CTR performance (0-25 points)
    const avgCtr = Number(opportunity.avgCtr) || 0.02;
    const ctrPoints = Math.min(avgCtr * 1000, 25);
    score += ctrPoints;
    if (avgCtr > 0.03) {
      reasons.push("Strong click-through rate");
    }

    // Budget fit (0-20 points)
    const minBudget = Number(opportunity.minBudget) || 0;
    const maxBudget = Number(opportunity.maxBudget) || params.budget * 2;
    const budgetFitRatio = params.budget >= minBudget && params.budget <= maxBudget ? 1 : 0.5;
    const budgetPoints = budgetFitRatio * 20;
    score += budgetPoints;
    if (budgetFitRatio === 1) {
      reasons.push("Perfect budget fit");
    }

    // Reach efficiency (0-15 points)
    const cpmEstimate = Number(opportunity.cpmEstimate) || 10;
    const reachEfficiency = Math.min(20 / cpmEstimate, 1);
    const reachPoints = reachEfficiency * 15;
    score += reachPoints;
    if (reachEfficiency > 0.7) {
      reasons.push("Excellent cost per impression");
    }

    // Goal alignment - simplified scoring
    if (params.goals.includes("awareness") && opportunity.adType.includes("display")) {
      score += 5;
      reasons.push("Good for brand awareness");
    }
    if (params.goals.includes("clicks") && avgCtr > 0.02) {
      score += 5;
      reasons.push("Optimized for click performance");
    }
    if (params.goals.includes("conversions") && Number(opportunity.avgConversion) > 0.01) {
      score += 5;
      reasons.push("Strong conversion potential");
    }

    // Calculate expected metrics
    const recommendedBudget = Math.min(
      Math.max(minBudget, params.budget * 0.2),
      params.budget
    );
    const expectedReach = Math.round((recommendedBudget / cpmEstimate) * 1000);
    const expectedCtr = avgCtr;
    const expectedRoi = avgCtr * 2; // Simplified ROI estimate

    return {
      opportunity,
      matchScore: Math.round(Math.min(score, 100)),
      recommendedBudget,
      expectedReach,
      expectedCtr,
      expectedRoi,
      reasoning: reasons.slice(0, 3).join(". ") + ".",
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.matchScore - a.matchScore);

  return scored;
}

export async function getSearchRecommendations(userId: string) {
  // Get user's past searches
  const pastSearches = await prisma.search.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      results: {
        include: { opportunity: true },
        orderBy: { matchScore: "desc" },
        take: 3,
      },
    },
  });

  // Analyze patterns
  const platformCounts: Record<string, number> = {};
  const adTypeCounts: Record<string, number> = {};

  for (const search of pastSearches) {
    for (const result of search.results) {
      const platform = result.opportunity.platformId;
      const adType = result.opportunity.adType;
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      adTypeCounts[adType] = (adTypeCounts[adType] || 0) + 1;
    }
  }

  // Find trending opportunities in preferred categories
  const topPlatforms = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  const recommendations = await prisma.adOpportunity.findMany({
    where: {
      isActive: true,
      platformId: { in: topPlatforms },
      qualityScore: { gte: 75 },
    },
    include: {
      platform: {
        select: { id: true, name: true, slug: true, type: true },
      },
    },
    orderBy: { qualityScore: "desc" },
    take: 5,
  });

  return recommendations;
}
