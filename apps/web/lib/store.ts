import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Brand, Subscription, Search, Campaign } from "./api-client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

interface BrandState {
  brand: Brand | null;
  setBrand: (brand: Brand | null) => void;
}

export const useBrandStore = create<BrandState>((set) => ({
  brand: null,
  setBrand: (brand) => set({ brand }),
}));

interface SubscriptionState {
  subscription: Subscription | null;
  setSubscription: (subscription: Subscription | null) => void;
  getPlanLimits: () => {
    searchesPerMonth: number;
    hasAnalytics: boolean;
    hasApiAccess: boolean;
  };
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  setSubscription: (subscription) => set({ subscription }),
  getPlanLimits: () => {
    const { subscription } = get();
    switch (subscription?.plan) {
      case "STARTER":
        return { searchesPerMonth: 50, hasAnalytics: false, hasApiAccess: false };
      case "GROWTH":
        return { searchesPerMonth: 200, hasAnalytics: true, hasApiAccess: false };
      case "SCALE":
        return { searchesPerMonth: Infinity, hasAnalytics: true, hasApiAccess: true };
      case "ENTERPRISE":
        return { searchesPerMonth: Infinity, hasAnalytics: true, hasApiAccess: true };
      default:
        return { searchesPerMonth: 0, hasAnalytics: false, hasApiAccess: false };
    }
  },
}));

interface SearchState {
  searches: Search[];
  currentSearch: Search | null;
  setSearches: (searches: Search[]) => void;
  setCurrentSearch: (search: Search | null) => void;
  addSearch: (search: Search) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searches: [],
  currentSearch: null,
  setSearches: (searches) => set({ searches }),
  setCurrentSearch: (currentSearch) => set({ currentSearch }),
  addSearch: (search) =>
    set((state) => ({ searches: [search, ...state.searches] })),
}));

interface CampaignState {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  setCampaigns: (campaigns: Campaign[]) => void;
  setCurrentCampaign: (campaign: Campaign | null) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  currentCampaign: null,
  setCampaigns: (campaigns) => set({ campaigns }),
  setCurrentCampaign: (currentCampaign) => set({ currentCampaign }),
  addCampaign: (campaign) =>
    set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
  updateCampaign: (id, updates) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
}));

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "system",
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "ui-storage",
    }
  )
);
