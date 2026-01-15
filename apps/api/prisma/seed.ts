import { PrismaClient, PlatformType, PricingModel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Ad Platforms
  const platforms = [
    {
      name: 'Facebook Ads',
      slug: 'facebook-ads',
      type: PlatformType.SOCIAL_MEDIA,
      website: 'https://business.facebook.com',
      apiAvailable: true,
    },
    {
      name: 'Instagram Ads',
      slug: 'instagram-ads',
      type: PlatformType.SOCIAL_MEDIA,
      website: 'https://business.instagram.com',
      apiAvailable: true,
    },
    {
      name: 'TikTok Ads',
      slug: 'tiktok-ads',
      type: PlatformType.SOCIAL_MEDIA,
      website: 'https://ads.tiktok.com',
      apiAvailable: true,
    },
    {
      name: 'Google Ads',
      slug: 'google-ads',
      type: PlatformType.SEARCH_ENGINE,
      website: 'https://ads.google.com',
      apiAvailable: true,
    },
    {
      name: 'YouTube Ads',
      slug: 'youtube-ads',
      type: PlatformType.VIDEO,
      website: 'https://ads.youtube.com',
      apiAvailable: true,
    },
    {
      name: 'LinkedIn Ads',
      slug: 'linkedin-ads',
      type: PlatformType.SOCIAL_MEDIA,
      website: 'https://business.linkedin.com/marketing-solutions/ads',
      apiAvailable: true,
    },
    {
      name: 'Twitter/X Ads',
      slug: 'twitter-x-ads',
      type: PlatformType.SOCIAL_MEDIA,
      website: 'https://ads.twitter.com',
      apiAvailable: true,
    },
    {
      name: 'Pinterest Ads',
      slug: 'pinterest-ads',
      type: PlatformType.SOCIAL_MEDIA,
      website: 'https://ads.pinterest.com',
      apiAvailable: true,
    },
    {
      name: 'Snapchat Ads',
      slug: 'snapchat-ads',
      type: PlatformType.SOCIAL_MEDIA,
      website: 'https://ads.snapchat.com',
      apiAvailable: true,
    },
    {
      name: 'Reddit Ads',
      slug: 'reddit-ads',
      type: PlatformType.SOCIAL_MEDIA,
      website: 'https://ads.reddit.com',
      apiAvailable: true,
    },
    {
      name: 'Podcorn',
      slug: 'podcorn',
      type: PlatformType.PODCAST,
      website: 'https://podcorn.com',
      apiAvailable: false,
    },
    {
      name: 'AdvertiseCast',
      slug: 'advertisecast',
      type: PlatformType.PODCAST,
      website: 'https://advertisecast.com',
      apiAvailable: false,
    },
    {
      name: 'Swapstack',
      slug: 'swapstack',
      type: PlatformType.NEWSLETTER,
      website: 'https://swapstack.co',
      apiAvailable: false,
    },
    {
      name: 'Paved',
      slug: 'paved',
      type: PlatformType.NEWSLETTER,
      website: 'https://paved.com',
      apiAvailable: false,
    },
    {
      name: 'Taboola',
      slug: 'taboola',
      type: PlatformType.NATIVE_ADS,
      website: 'https://taboola.com',
      apiAvailable: true,
    },
    {
      name: 'Outbrain',
      slug: 'outbrain',
      type: PlatformType.NATIVE_ADS,
      website: 'https://outbrain.com',
      apiAvailable: true,
    },
    {
      name: 'AspireIQ',
      slug: 'aspireiq',
      type: PlatformType.INFLUENCER,
      website: 'https://aspire.io',
      apiAvailable: false,
    },
    {
      name: 'Grin',
      slug: 'grin',
      type: PlatformType.INFLUENCER,
      website: 'https://grin.co',
      apiAvailable: false,
    },
    {
      name: 'Upfluence',
      slug: 'upfluence',
      type: PlatformType.INFLUENCER,
      website: 'https://upfluence.com',
      apiAvailable: false,
    },
    {
      name: 'Google Display Network',
      slug: 'google-display-network',
      type: PlatformType.DISPLAY_NETWORK,
      website: 'https://ads.google.com/display',
      apiAvailable: true,
    },
  ];

  for (const platform of platforms) {
    await prisma.adPlatform.upsert({
      where: { name: platform.name },
      update: platform,
      create: platform,
    });
  }

  console.log(`Created ${platforms.length} ad platforms`);

  // Create sample ad opportunities for each platform
  const createdPlatforms = await prisma.adPlatform.findMany();

  const opportunityTemplates = [
    {
      adType: 'Feed Ad',
      placement: 'News Feed',
      pricingModel: PricingModel.CPM,
      minBudget: 50,
      maxBudget: 10000,
      cpmEstimate: 8.5,
      estimatedReach: 50000,
      avgCtr: 1.2,
    },
    {
      adType: 'Story Ad',
      placement: 'Stories',
      pricingModel: PricingModel.CPM,
      minBudget: 25,
      maxBudget: 5000,
      cpmEstimate: 6.0,
      estimatedReach: 30000,
      avgCtr: 0.8,
    },
    {
      adType: 'Video Ad',
      placement: 'In-Stream',
      pricingModel: PricingModel.CPM,
      minBudget: 100,
      maxBudget: 20000,
      cpmEstimate: 12.0,
      estimatedReach: 100000,
      avgCtr: 1.5,
    },
    {
      adType: 'Sponsored Post',
      placement: 'Feed',
      pricingModel: PricingModel.FLAT_RATE,
      minBudget: 200,
      maxBudget: 5000,
      cpmEstimate: 10.0,
      estimatedReach: 25000,
      avgCtr: 2.0,
    },
    {
      adType: 'Banner Ad',
      placement: 'Sidebar',
      pricingModel: PricingModel.CPC,
      minBudget: 30,
      maxBudget: 3000,
      cpcEstimate: 0.5,
      estimatedReach: 80000,
      avgCtr: 0.5,
    },
  ];

  let opportunityCount = 0;

  for (const platform of createdPlatforms) {
    const numOpportunities = Math.floor(Math.random() * 3) + 2; // 2-4 opportunities per platform

    for (let i = 0; i < numOpportunities; i++) {
      const template = opportunityTemplates[i % opportunityTemplates.length];
      const qualityScore = Math.floor(Math.random() * 30) + 70; // 70-100

      await prisma.adOpportunity.create({
        data: {
          platformId: platform.id,
          title: `${platform.name} - ${template.adType}`,
          description: `High-performance ${template.adType.toLowerCase()} on ${platform.name}. Great for brand awareness and conversions.`,
          adType: template.adType,
          placement: template.placement,
          pricingModel: template.pricingModel,
          minBudget: template.minBudget,
          maxBudget: template.maxBudget,
          cpmEstimate: template.cpmEstimate,
          cpcEstimate: template.cpcEstimate,
          estimatedReach: template.estimatedReach,
          avgCtr: template.avgCtr,
          qualityScore,
          audienceData: {
            demographics: ['18-34', '35-54'],
            interests: ['Technology', 'Business', 'Lifestyle'],
            locations: ['United States', 'United Kingdom', 'Canada'],
          },
          isActive: true,
          lastVerified: new Date(),
        },
      });
      opportunityCount++;
    }
  }

  console.log(`Created ${opportunityCount} ad opportunities`);

  // Create demo users with subscriptions
  const demoUsers = [
    { email: 'sarah@techflow.com', name: 'Sarah Chen', plan: 'GROWTH' as const, brandName: 'TechFlow' },
    { email: 'marcus@indieco.com', name: 'Marcus Johnson', plan: 'STARTER' as const, brandName: 'Indie Brands' },
    { email: 'emily@startup.xyz', name: 'Emily Rodriguez', plan: 'SCALE' as const, brandName: 'StartupXYZ' },
    { email: 'john@acme.co', name: 'John Smith', plan: 'GROWTH' as const, brandName: 'ACME Corp' },
    { email: 'lisa@brand.io', name: 'Lisa Park', plan: 'STARTER' as const, brandName: 'BrandIO' },
    { email: 'david@nexus.tech', name: 'David Miller', plan: 'GROWTH' as const, brandName: 'Nexus Tech' },
    { email: 'anna@creative.co', name: 'Anna Wilson', plan: 'SCALE' as const, brandName: 'Creative Co' },
    { email: 'mike@digital.io', name: 'Mike Brown', plan: 'STARTER' as const, brandName: 'Digital IO' },
  ];

  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        passwordHash: '$2b$10$demo.hash.for.seeding.only',
        emailVerified: new Date(),
      },
    });

    // Create brand
    await prisma.brand.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: userData.brandName,
        industry: 'Technology',
        website: `https://${userData.email.split('@')[1]}`,
      },
    });

    // Create subscription
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        stripeCustomerId: `cus_demo_${user.id}`,
        stripeSubscriptionId: `sub_demo_${user.id}`,
        plan: userData.plan,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Create a campaign for each user
    const opportunities = await prisma.adOpportunity.findMany({ take: 3 });

    const campaign = await prisma.campaign.create({
      data: {
        userId: user.id,
        name: `${userData.brandName} Q1 Campaign`,
        budget: userData.plan === 'SCALE' ? 10000 : userData.plan === 'GROWTH' ? 5000 : 2000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
      },
    });

    // Create bookings for the campaign
    if (opportunities.length > 0) {
      await prisma.booking.create({
        data: {
          userId: user.id,
          campaignId: campaign.id,
          opportunityId: opportunities[0].id,
          budget: campaign.budget * 0.6,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
        },
      });
    }

    // Create analytics for the campaign
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      await prisma.campaignAnalytics.create({
        data: {
          campaignId: campaign.id,
          date,
          impressions: Math.floor(Math.random() * 50000) + 10000,
          clicks: Math.floor(Math.random() * 2000) + 500,
          conversions: Math.floor(Math.random() * 100) + 20,
          spend: (campaign.budget / 30) * (Math.random() * 0.3 + 0.85),
          revenue: (campaign.budget / 30) * (Math.random() * 0.5 + 1.2),
        },
      });
    }
  }

  console.log(`Created ${demoUsers.length} demo users with subscriptions and campaigns`);
  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
