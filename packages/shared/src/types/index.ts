export enum Plan {
  STARTER = "STARTER",
  GROWTH = "GROWTH",
  SCALE = "SCALE",
  ENTERPRISE = "ENTERPRISE",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
  TRIALING = "TRIALING",
  INCOMPLETE = "INCOMPLETE",
}

export enum PlatformType {
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  SEARCH_ENGINE = "SEARCH_ENGINE",
  DISPLAY_NETWORK = "DISPLAY_NETWORK",
  INFLUENCER = "INFLUENCER",
  PODCAST = "PODCAST",
  NEWSLETTER = "NEWSLETTER",
  NATIVE_ADS = "NATIVE_ADS",
  VIDEO = "VIDEO",
  OTHER = "OTHER",
}

export enum PricingModel {
  CPM = "CPM",
  CPC = "CPC",
  CPA = "CPA",
  FLAT_RATE = "FLAT_RATE",
  AUCTION = "AUCTION",
  HYBRID = "HYBRID",
}

export enum SearchStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum CampaignStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum BookingStatus {
  PENDING = "PENDING",
  PAYMENT_REQUIRED = "PAYMENT_REQUIRED",
  CONFIRMED = "CONFIRMED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum ScrapingStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  brand?: Brand;
  subscription?: Subscription;
}

export interface Brand {
  id: string;
  userId: string;
  name: string;
  website: string | null;
  industry: string;
  targetAudience: Record<string, unknown> | null;
  monthlyBudget: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  plan: Plan;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  searchesUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdPlatform {
  id: string;
  name: string;
  slug: string;
  type: PlatformType;
  website: string;
  logoUrl: string | null;
  apiAvailable: boolean;
  lastScraped: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdOpportunity {
  id: string;
  platformId: string;
  platform?: AdPlatform;
  title: string;
  description: string | null;
  adType: string;
  placement: string | null;
  format: string | null;
  pricingModel: PricingModel;
  minBudget: number | null;
  maxBudget: number | null;
  cpmEstimate: number | null;
  cpcEstimate: number | null;
  estimatedReach: number | null;
  audienceData: Record<string, unknown> | null;
  targetingOptions: Record<string, unknown> | null;
  avgCtr: number | null;
  avgConversion: number | null;
  qualityScore: number | null;
  sourceUrl: string | null;
  externalId: string | null;
  isActive: boolean;
  lastVerified: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Search {
  id: string;
  userId: string;
  budget: number;
  targetAudience: Record<string, unknown> | null;
  industries: string[];
  adTypes: string[];
  platforms: string[];
  goals: string[];
  status: SearchStatus;
  resultCount: number;
  results?: SearchResult[];
  createdAt: string;
  completedAt: string | null;
}

export interface SearchResult {
  id: string;
  searchId: string;
  opportunityId: string;
  opportunity?: AdOpportunity;
  matchScore: number;
  recommendedBudget: number | null;
  expectedReach: number | null;
  expectedCtr: number | null;
  expectedRoi: number | null;
  reasoning: string | null;
  rank: number;
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  budget: number;
  startDate: string | null;
  endDate: string | null;
  status: CampaignStatus;
  bookings?: Booking[];
  analytics?: CampaignAnalytics[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  campaignId: string | null;
  campaign?: Campaign;
  opportunityId: string;
  opportunity?: AdOpportunity;
  budget: number;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  stripePaymentId: string | null;
  commissionRate: number;
  commissionAmount: number | null;
  totalAmount: number | null;
  externalBookingId: string | null;
  trackingUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignAnalytics {
  id: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number | null;
  cpc: number | null;
  cpa: number | null;
  roas: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapingJob {
  id: string;
  platformId: string | null;
  status: ScrapingStatus;
  startedAt: string | null;
  completedAt: string | null;
  itemsFound: number;
  itemsAdded: number;
  itemsUpdated: number;
  error: string | null;
  logs: Record<string, unknown> | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateSearchRequest {
  budget: number;
  targetAudience?: Record<string, unknown>;
  industries?: string[];
  adTypes?: string[];
  platforms?: string[];
  goals?: string[];
}

export interface CreateCampaignRequest {
  name: string;
  description?: string;
  budget: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateBookingRequest {
  opportunityId: string;
  campaignId?: string;
  budget: number;
  startDate: string;
  endDate: string;
}

export interface DashboardStats {
  totalSearches: number;
  activeCampaigns: number;
  totalSpend: number;
  avgCtr: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface PlatformStats {
  platform: string;
  impressions: number;
  clicks: number;
  spend: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface OpportunityFilters extends PaginationParams {
  platform?: string;
  platformType?: PlatformType;
  adType?: string;
  pricingModel?: PricingModel;
  minBudget?: number;
  maxBudget?: number;
  minReach?: number;
}

export interface PlanConfig {
  id: Plan;
  name: string;
  price: number;
  searchesPerMonth: number;
  maxCampaigns: number;
  features: string[];
  stripePriceId: string;
}

export const PLAN_CONFIGS: Record<Plan, PlanConfig> = {
  [Plan.STARTER]: {
    id: Plan.STARTER,
    name: "Starter",
    price: 49,
    searchesPerMonth: 50,
    maxCampaigns: 2,
    features: [
      "50 AI-powered searches/month",
      "2 active campaigns",
      "Basic analytics",
      "Email support",
    ],
    stripePriceId: "price_starter",
  },
  [Plan.GROWTH]: {
    id: Plan.GROWTH,
    name: "Growth",
    price: 149,
    searchesPerMonth: 200,
    maxCampaigns: 10,
    features: [
      "200 AI-powered searches/month",
      "10 active campaigns",
      "Advanced analytics",
      "API access",
      "Priority support",
    ],
    stripePriceId: "price_growth",
  },
  [Plan.SCALE]: {
    id: Plan.SCALE,
    name: "Scale",
    price: 399,
    searchesPerMonth: -1, // unlimited
    maxCampaigns: -1, // unlimited
    features: [
      "Unlimited searches",
      "Unlimited campaigns",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 phone support",
    ],
    stripePriceId: "price_scale",
  },
  [Plan.ENTERPRISE]: {
    id: Plan.ENTERPRISE,
    name: "Enterprise",
    price: 0, // custom pricing
    searchesPerMonth: -1,
    maxCampaigns: -1,
    features: [
      "Everything in Scale",
      "Custom SLA",
      "On-premise deployment",
      "White-label options",
      "Dedicated infrastructure",
    ],
    stripePriceId: "price_enterprise",
  },
};

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export const COMMISSION_RATE = 0.05;
