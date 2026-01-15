"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  CreditCard,
  DollarSign,
  Eye,
  Filter,
  Globe,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

const API_URL = "http://localhost:4000/api";
const ADMIN_KEY = "AdFinderAdmin2024SecretKey";

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalBookings: number;
  recentUsers: number;
  monthlyRevenue: number;
  totalRevenue: number;
  revenueGrowth: number;
  planBreakdown: {
    starter: number;
    growth: number;
    scale: number;
  };
}

interface Transaction {
  id: string;
  user: string;
  userName: string | null;
  plan: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  brand: string;
  userEmail: string;
  budget: number;
  spent: number;
  status: string;
  platforms: string[];
  impressions: number;
  clicks: number;
  conversions: number;
  createdAt: string;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  subscription: { plan: string; status: string } | null;
  brand: string | null;
  campaignsCount: number;
  bookingsCount: number;
}

interface Platform {
  id: string;
  name: string;
  type: string;
  opportunityCount: number;
  bookingsCount: number;
  revenue: number;
  lastScraped: string | null;
  isActive: boolean;
}

interface GrowthData {
  month: string;
  year: number;
  users: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState("");

  // Data states
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [growth, setGrowth] = useState<GrowthData[]>([]);

  const fetchWithAuth = useCallback(async (endpoint: string) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "x-admin-key": ADMIN_KEY,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch data");
    return response.json();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, transactionsData, campaignsData, growthData] = await Promise.all([
        fetchWithAuth("/admin/stats"),
        fetchWithAuth("/admin/transactions"),
        fetchWithAuth("/admin/campaigns"),
        fetchWithAuth("/admin/growth"),
      ]);

      setStats(statsData);
      setTransactions(transactionsData.transactions || []);
      setCampaigns(campaignsData.campaigns || []);
      setGrowth(growthData.growth || []);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to connect to API. Using demo data.");
      // Set demo data as fallback
      setStats({
        totalUsers: 256,
        activeSubscriptions: 156,
        totalCampaigns: 89,
        activeCampaigns: 42,
        totalBookings: 342,
        recentUsers: 12,
        monthlyRevenue: 12450,
        totalRevenue: 45892,
        revenueGrowth: 23.5,
        planBreakdown: { starter: 89, growth: 52, scale: 15 },
      });
      setTransactions([
        { id: "TXN-001", user: "sarah@techflow.com", userName: "Sarah", plan: "Growth", amount: 149, status: "ACTIVE", createdAt: new Date().toISOString() },
        { id: "TXN-002", user: "marcus@indieco.com", userName: "Marcus", plan: "Starter", amount: 49, status: "ACTIVE", createdAt: new Date().toISOString() },
        { id: "TXN-003", user: "emily@startup.xyz", userName: "Emily", plan: "Scale", amount: 399, status: "ACTIVE", createdAt: new Date().toISOString() },
      ]);
      setCampaigns([
        { id: "AD-001", name: "Summer Sale", brand: "TechFlow", userEmail: "sarah@techflow.com", budget: 5000, spent: 3200, status: "ACTIVE", platforms: ["Facebook"], impressions: 450000, clicks: 12500, conversions: 340, createdAt: new Date().toISOString() },
        { id: "AD-002", name: "Product Launch", brand: "Indie Brands", userEmail: "marcus@indieco.com", budget: 2500, spent: 1800, status: "ACTIVE", platforms: ["Instagram"], impressions: 220000, clicks: 8900, conversions: 156, createdAt: new Date().toISOString() },
      ]);
      setGrowth([
        { month: "Aug", year: 2024, users: 89 },
        { month: "Sep", year: 2024, users: 112 },
        { month: "Oct", year: 2024, users: 145 },
        { month: "Nov", year: 2024, users: 178 },
        { month: "Dec", year: 2024, users: 210 },
        { month: "Jan", year: 2025, users: 256 },
      ]);
    }
  }, [fetchWithAuth]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await fetchWithAuth("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, [fetchWithAuth]);

  const fetchPlatforms = useCallback(async () => {
    try {
      const data = await fetchWithAuth("/admin/platforms");
      setPlatforms(data.platforms || []);
    } catch (err) {
      console.error("Error fetching platforms:", err);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    const isAuth = localStorage.getItem("admin_authenticated");
    if (!isAuth) {
      router.push("/");
      return;
    }
    setIsLoading(false);
    fetchData();
  }, [router, fetchData]);

  useEffect(() => {
    if (activeTab === "users" && users.length === 0) {
      fetchUsers();
    }
    if (activeTab === "platforms" && platforms.length === 0) {
      fetchPlatforms();
    }
  }, [activeTab, users.length, platforms.length, fetchUsers, fetchPlatforms]);

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    router.push("/");
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    fetchData();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "platforms") fetchPlatforms();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const maxGrowthUsers = Math.max(...growth.map((g) => g.users), 1);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl admin-gradient flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold">Ad Revenue</h1>
            <p className="text-xs text-muted-foreground">Tracker</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Overview", value: "overview" },
            { icon: CreditCard, label: "Transactions", value: "transactions" },
            { icon: Target, label: "Active Ads", value: "ads" },
            { icon: Users, label: "Users", value: "users" },
            { icon: Globe, label: "Platforms", value: "platforms" },
            { icon: BarChart3, label: "Analytics", value: "analytics" },
            { icon: Bell, label: "Alerts", value: "alerts" },
            { icon: Settings, label: "Settings", value: "settings" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                activeTab === item.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "transactions" && "All Transactions"}
              {activeTab === "ads" && "Active Advertisements"}
              {activeTab === "users" && "User Management"}
              {activeTab === "platforms" && "Platform Analytics"}
              {activeTab === "analytics" && "Revenue Analytics"}
              {activeTab === "alerts" && "System Alerts"}
              {activeTab === "settings" && "Admin Settings"}
            </h2>
            <p className="text-muted-foreground text-sm">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {error && (
              <span className="text-xs text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-lg">
                {error}
              </span>
            )}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg border border-border hover:bg-muted transition"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm text-primary">Live</span>
            </div>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground text-sm">Total Revenue</span>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <ArrowUp className="h-4 w-4" />
                  <span>{stats.revenueGrowth}% from last month</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground text-sm">Monthly Revenue</span>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <ArrowUp className="h-4 w-4" />
                  <span>18.2% vs last month</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground text-sm">Total Campaigns</span>
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats.totalCampaigns}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <span>{stats.activeCampaigns} active</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground text-sm">Active Subscriptions</span>
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats.activeSubscriptions}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                  <ArrowUp className="h-4 w-4" />
                  <span>{stats.recentUsers} new this week</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">User Growth</h3>
                <div className="h-48 flex items-end gap-4">
                  {growth.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full admin-gradient rounded-t transition-all hover:opacity-80"
                        style={{ height: `${(item.users / maxGrowthUsers) * 150}px` }}
                      />
                      <span className="text-xs text-muted-foreground mt-2">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Subscription Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { name: "Starter ($49/mo)", count: stats.planBreakdown.starter, color: "bg-blue-500" },
                    { name: "Growth ($149/mo)", count: stats.planBreakdown.growth, color: "bg-purple-500" },
                    { name: "Scale ($399/mo)", count: stats.planBreakdown.scale, color: "bg-green-500" },
                  ].map((plan) => (
                    <div key={plan.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{plan.name}</span>
                        <span className="text-sm font-semibold">{plan.count} users</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${plan.color} rounded-full`}
                          style={{ width: `${(plan.count / stats.activeSubscriptions) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Transactions</h3>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className="text-sm text-primary hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((txn) => (
                      <tr key={txn.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4 font-mono text-sm">{txn.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4 text-sm">{txn.user}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {txn.plan}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">${txn.amount}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            txn.status === "ACTIVE"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>
              <button className="px-4 py-2 admin-gradient text-white rounded-lg text-sm hover:opacity-90">
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-sm">{txn.id.slice(0, 12)}...</td>
                      <td className="py-3 px-4 text-sm">{txn.user}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {txn.plan}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">${txn.amount}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          txn.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="p-2 hover:bg-muted rounded-lg">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Active Ads Tab */}
        {activeTab === "ads" && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-muted-foreground text-sm mb-2">Total Active Ads</p>
                <p className="text-3xl font-bold">{campaigns.filter((c) => c.status === "ACTIVE").length}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-muted-foreground text-sm mb-2">Total Spend</p>
                <p className="text-3xl font-bold">
                  ${campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-muted-foreground text-sm mb-2">Total Impressions</p>
                <p className="text-3xl font-bold">
                  {(campaigns.reduce((sum, c) => sum + c.impressions, 0) / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-muted-foreground text-sm mb-2">Total Clicks</p>
                <p className="text-3xl font-bold">
                  {(campaigns.reduce((sum, c) => sum + c.clicks, 0) / 1000).toFixed(1)}K
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Active Advertisements</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaign</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Brand</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Budget</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Spent</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Impressions</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Clicks</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">CTR</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((ad) => (
                      <tr key={ad.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4 font-mono text-sm">{ad.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4 text-sm font-medium">{ad.name}</td>
                        <td className="py-3 px-4 text-sm">{ad.brand}</td>
                        <td className="py-3 px-4">${ad.budget.toLocaleString()}</td>
                        <td className="py-3 px-4">${ad.spent.toLocaleString()}</td>
                        <td className="py-3 px-4">{(ad.impressions / 1000).toFixed(0)}K</td>
                        <td className="py-3 px-4">{(ad.clicks / 1000).toFixed(1)}K</td>
                        <td className="py-3 px-4 font-semibold text-primary">
                          {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : 0}%
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            ad.status === "ACTIVE"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {ad.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button className="px-4 py-2 admin-gradient text-white rounded-lg text-sm hover:opacity-90">
                Export Users
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Brand</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campaigns</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{user.email}</td>
                      <td className="py-3 px-4 text-sm">{user.name || "-"}</td>
                      <td className="py-3 px-4 text-sm">{user.brand || "-"}</td>
                      <td className="py-3 px-4">
                        {user.subscription ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                            {user.subscription.plan}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">{user.campaignsCount}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.subscription?.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {user.subscription?.status || "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Platforms Tab */}
        {activeTab === "platforms" && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {platforms.map((platform) => (
                <div key={platform.id} className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{platform.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      platform.isActive
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                    }`}>
                      {platform.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span>{platform.type.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Opportunities</span>
                      <span className="font-semibold">{platform.opportunityCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bookings</span>
                      <span className="font-semibold">{platform.bookingsCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-semibold text-green-500">${platform.revenue.toFixed(2)}</span>
                    </div>
                    {platform.lastScraped && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Scraped</span>
                        <span>{new Date(platform.lastScraped).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && stats && (
          <div className="space-y-6">
            {/* Revenue Overview */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm text-muted-foreground mb-2">Average Revenue Per User</h3>
                <p className="text-3xl font-bold">
                  ${stats.activeSubscriptions > 0 ? (stats.monthlyRevenue / stats.activeSubscriptions).toFixed(2) : '0'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Per active subscription</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm text-muted-foreground mb-2">Conversion Rate</h3>
                <p className="text-3xl font-bold">
                  {stats.totalUsers > 0 ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">Users to paid subscribers</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm text-muted-foreground mb-2">Campaign Activation</h3>
                <p className="text-3xl font-bold">
                  {stats.totalCampaigns > 0 ? ((stats.activeCampaigns / stats.totalCampaigns) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">Active campaigns ratio</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-6">Monthly Revenue Trend</h3>
              <div className="h-64 flex items-end gap-2">
                {[
                  { month: 'Aug', revenue: 4200 },
                  { month: 'Sep', revenue: 5800 },
                  { month: 'Oct', revenue: 7200 },
                  { month: 'Nov', revenue: 8900 },
                  { month: 'Dec', revenue: 10500 },
                  { month: 'Jan', revenue: stats.monthlyRevenue },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">${(item.revenue / 1000).toFixed(1)}k</span>
                      <div
                        className="w-full admin-gradient rounded-t transition-all hover:opacity-80"
                        style={{ height: `${(item.revenue / 12000) * 180}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Distribution & Metrics */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Revenue by Plan</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Scale', price: 399, count: stats.planBreakdown.scale, color: 'bg-green-500' },
                    { name: 'Growth', price: 149, count: stats.planBreakdown.growth, color: 'bg-purple-500' },
                    { name: 'Starter', price: 49, count: stats.planBreakdown.starter, color: 'bg-blue-500' },
                  ].map((plan) => {
                    const revenue = plan.price * plan.count;
                    const percentage = stats.monthlyRevenue > 0 ? (revenue / stats.monthlyRevenue) * 100 : 0;
                    return (
                      <div key={plan.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{plan.name} ({plan.count} users)</span>
                          <span className="text-sm font-semibold">${revenue}/mo</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${plan.color} rounded-full`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Key Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Monthly Recurring Revenue</span>
                    <span className="font-bold text-green-500">${stats.monthlyRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Annual Run Rate</span>
                    <span className="font-bold">${(stats.monthlyRevenue * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Lifetime Value (Est.)</span>
                    <span className="font-bold">${((stats.monthlyRevenue / stats.activeSubscriptions) * 18).toFixed(0) || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Churn Rate (Est.)</span>
                    <span className="font-bold text-yellow-500">~5.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            {/* Alert Summary */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Critical</span>
                </div>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-muted-foreground">Warnings</span>
                </div>
                <p className="text-3xl font-bold">2</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-muted-foreground">Info</span>
                </div>
                <p className="text-3xl font-bold">5</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Resolved</span>
                </div>
                <p className="text-3xl font-bold">12</p>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Active Alerts</h3>
              <div className="space-y-3">
                {[
                  { type: 'warning', title: 'Scraper Rate Limited', message: 'Facebook scraper hit rate limit. Will retry in 2 hours.', time: '15 min ago' },
                  { type: 'warning', title: 'High API Latency', message: 'Average response time exceeded 500ms threshold.', time: '1 hour ago' },
                  { type: 'info', title: 'New User Signup Spike', message: '12 new signups in the last hour (3x normal rate).', time: '2 hours ago' },
                  { type: 'info', title: 'Database Backup Complete', message: 'Daily backup completed successfully.', time: '4 hours ago' },
                  { type: 'info', title: 'SSL Certificate Renewal', message: 'Certificate will expire in 25 days. Auto-renewal scheduled.', time: '6 hours ago' },
                ].map((alert, idx) => (
                  <div key={idx} className={`flex items-start gap-4 p-4 rounded-lg border ${
                    alert.type === 'critical' ? 'border-red-500/30 bg-red-500/5' :
                    alert.type === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5' :
                    'border-blue-500/30 bg-blue-500/5'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === 'critical' ? 'bg-red-500' :
                      alert.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{alert.title}</h4>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    </div>
                    <button className="text-xs text-primary hover:underline">Dismiss</button>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">System Status</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'API Server', status: 'operational', uptime: '99.9%' },
                  { name: 'Database', status: 'operational', uptime: '99.99%' },
                  { name: 'Redis Cache', status: 'operational', uptime: '99.9%' },
                  { name: 'Stripe Webhooks', status: 'operational', uptime: '100%' },
                  { name: 'Facebook Scraper', status: 'degraded', uptime: '95.2%' },
                  { name: 'Email Service', status: 'operational', uptime: '99.8%' },
                ].map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        service.status === 'operational' ? 'bg-green-500' :
                        service.status === 'degraded' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <span className="text-sm">{service.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{service.uptime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Admin Profile */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Admin Profile</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Admin Email</label>
                  <input
                    type="email"
                    defaultValue="admin@adfinder.io"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Display Name</label>
                  <input
                    type="text"
                    defaultValue="System Administrator"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button className="mt-4 px-4 py-2 admin-gradient text-white rounded-lg text-sm hover:opacity-90">
                Update Profile
              </button>
            </div>

            {/* Notification Settings */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { label: 'New user signups', description: 'Get notified when new users register', enabled: true },
                  { label: 'Payment failures', description: 'Alert when subscription payments fail', enabled: true },
                  { label: 'Scraper issues', description: 'Notify when scrapers encounter errors', enabled: true },
                  { label: 'Weekly reports', description: 'Receive weekly analytics summary', enabled: false },
                  { label: 'Security alerts', description: 'Critical security notifications', enabled: true },
                ].map((setting, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <button className={`w-12 h-6 rounded-full transition-colors ${
                      setting.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        setting.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* API Configuration */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">API Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Admin API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      defaultValue="AdFinderAdmin2024SecretKey"
                      className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                    <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm">
                      Regenerate
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Webhook URL</label>
                  <input
                    type="url"
                    defaultValue="https://api.adfinder.io/webhooks/admin"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Scraping Configuration */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-4">Scraping Configuration</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Scraping Interval</label>
                  <select className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="1">Every 1 hour</option>
                    <option value="6" selected>Every 6 hours</option>
                    <option value="12">Every 12 hours</option>
                    <option value="24">Every 24 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Concurrent Scrapers</label>
                  <select className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="1">1 (Conservative)</option>
                    <option value="3" selected>3 (Balanced)</option>
                    <option value="5">5 (Aggressive)</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 admin-gradient text-white rounded-lg text-sm hover:opacity-90">
                  Save Configuration
                </button>
                <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted">
                  Run Scrapers Now
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-red-500/30 rounded-xl p-6">
              <h3 className="font-semibold text-red-500 mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div>
                    <p className="font-medium">Clear All Cache</p>
                    <p className="text-sm text-muted-foreground">Remove all cached data from Redis</p>
                  </div>
                  <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/20">
                    Clear Cache
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div>
                    <p className="font-medium">Reset All Scrapers</p>
                    <p className="text-sm text-muted-foreground">Stop all scrapers and reset their state</p>
                  </div>
                  <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/20">
                    Reset Scrapers
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
