import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common["Authorization"];
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();

// API Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  brand?: Brand;
  subscription?: Subscription;
}

export interface Brand {
  id: string;
  name: string;
  website: string | null;
  industry: string;
  targetAudience: Record<string, unknown> | null;
  monthlyBudget: number | null;
}

export interface Subscription {
  id: string;
  plan: "STARTER" | "GROWTH" | "SCALE" | "ENTERPRISE";
  status: "ACTIVE" | "PAST_DUE" | "CANCELED" | "TRIALING";
  currentPeriodEnd: string | null;
}

export interface AdPlatform {
  id: string;
  name: string;
  slug: string;
  type: string;
  website: string;
  logoUrl?: string;
}

export interface AdOpportunity {
  id: string;
  platform: AdPlatform;
  title: string;
  description: string | null;
  adType: string;
  placement: string | null;
  pricingModel: "CPM" | "CPC" | "CPA" | "FLAT_RATE" | "AUCTION";
  minBudget: number | null;
  maxBudget: number | null;
  cpmEstimate: number | null;
  cpcEstimate: number | null;
  estimatedReach: number | null;
  avgCtr: number | null;
  qualityScore: number | null;
  sourceUrl: string | null;
}

export interface Search {
  id: string;
  budget: number;
  targetAudience: Record<string, unknown> | null;
  industries: string[];
  adTypes: string[];
  platforms: string[];
  goals: string[];
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
  results?: SearchResult[];
}

export interface SearchResult {
  id: string;
  opportunity: AdOpportunity;
  matchScore: number;
  recommendedBudget: number | null;
  expectedReach: number | null;
  expectedCtr: number | null;
  reasoning: string | null;
  rank: number;
}

export interface Campaign {
  id: string;
  name: string;
  budget: number;
  startDate: string | null;
  endDate: string | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
  bookings?: Booking[];
  createdAt: string;
}

export interface Booking {
  id: string;
  opportunity: AdOpportunity;
  budget: number;
  startDate: string;
  endDate: string;
  status: "PENDING" | "CONFIRMED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  commissionRate: number;
  commissionAmount: number | null;
}

export interface Analytics {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number | null;
  cpc: number | null;
  roas: number | null;
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

// API Functions
export const api = {
  // Auth
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      apiClient.post<{ user: User; token: string }>("/auth/register", data),
    login: (data: { email: string; password: string }) =>
      apiClient.post<{ user: User; token: string }>("/auth/login", data),
    logout: () => apiClient.post("/auth/logout"),
    me: () => apiClient.get<User>("/users/me"),
  },

  // Brand
  brand: {
    get: () => apiClient.get<Brand>("/users/me/brand"),
    create: (data: Partial<Brand>) => apiClient.post<Brand>("/users/me/brand", data),
    update: (data: Partial<Brand>) => apiClient.patch<Brand>("/users/me/brand", data),
  },

  // Subscriptions
  subscriptions: {
    getPlans: () =>
      apiClient.get<{ plans: Array<{ id: string; name: string; price: number; features: string[] }> }>(
        "/subscriptions/plans"
      ),
    getCurrent: () => apiClient.get<Subscription>("/subscriptions/current"),
    createCheckout: (priceId: string) =>
      apiClient.post<{ url: string }>("/subscriptions/create-checkout", { priceId }),
    createPortal: () => apiClient.post<{ url: string }>("/subscriptions/create-portal"),
  },

  // Opportunities
  opportunities: {
    list: (params?: {
      page?: number;
      limit?: number;
      platform?: string;
      adType?: string;
      minBudget?: number;
      maxBudget?: number;
    }) => apiClient.get<{ opportunities: AdOpportunity[]; total: number }>("/opportunities", { params }),
    get: (id: string) => apiClient.get<AdOpportunity>(`/opportunities/${id}`),
    getPlatforms: () => apiClient.get<AdPlatform[]>("/opportunities/platforms"),
    getTrending: () => apiClient.get<AdOpportunity[]>("/opportunities/trending"),
  },

  // Searches
  searches: {
    create: (data: {
      budget: number;
      targetAudience?: Record<string, unknown>;
      industries?: string[];
      adTypes?: string[];
      platforms?: string[];
      goals?: string[];
    }) => apiClient.post<Search>("/searches", data),
    list: () => apiClient.get<Search[]>("/searches"),
    get: (id: string) => apiClient.get<Search>(`/searches/${id}`),
    getResults: (id: string) => apiClient.get<SearchResult[]>(`/searches/${id}/results`),
  },

  // Campaigns
  campaigns: {
    create: (data: { name: string; budget: number; startDate?: string; endDate?: string }) =>
      apiClient.post<Campaign>("/campaigns", data),
    list: () => apiClient.get<Campaign[]>("/campaigns"),
    get: (id: string) => apiClient.get<Campaign>(`/campaigns/${id}`),
    update: (id: string, data: Partial<Campaign>) => apiClient.patch<Campaign>(`/campaigns/${id}`, data),
    delete: (id: string) => apiClient.delete(`/campaigns/${id}`),
    getAnalytics: (id: string, params?: { startDate?: string; endDate?: string }) =>
      apiClient.get<Analytics[]>(`/campaigns/${id}/analytics`, { params }),
  },

  // Bookings
  bookings: {
    create: (data: { opportunityId: string; campaignId?: string; budget: number; startDate: string; endDate: string }) =>
      apiClient.post<Booking>("/bookings", data),
    list: () => apiClient.get<Booking[]>("/bookings"),
    get: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),
    updateStatus: (id: string, status: string) => apiClient.patch<Booking>(`/bookings/${id}/status`, { status }),
  },

  // Analytics
  analytics: {
    getOverview: (params?: { startDate?: string; endDate?: string }) =>
      apiClient.get<DashboardStats>("/analytics/overview", { params }),
    getPlatforms: () =>
      apiClient.get<Array<{ platform: string; impressions: number; clicks: number; spend: number }>>("/analytics/platforms"),
    export: (format: "csv" | "json") => apiClient.get<Blob>(`/analytics/export?format=${format}`, { responseType: "blob" }),
  },
};
