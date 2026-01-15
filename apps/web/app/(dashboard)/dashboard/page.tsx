"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Eye,
  MousePointerClick,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  AlertCircle,
} from "lucide-react";
import { api, DashboardStats, AdOpportunity, Campaign } from "@/lib/api-client";
import { formatNumber, formatCurrency } from "@/lib/utils";

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [opportunities, setOpportunities] = useState<AdOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage and set it
        const token = localStorage.getItem("token");
        if (token) {
          const { apiClient } = await import("@/lib/api-client");
          apiClient.setAuthToken(token);
        }

        // Fetch data in parallel
        const [statsData, campaignsData, opportunitiesData] = await Promise.all([
          api.analytics.getOverview().catch(() => null),
          api.campaigns.list().catch(() => []),
          api.opportunities.list({ limit: 3 }).catch(() => ({ opportunities: [] })),
        ]);

        setStats(statsData);
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
        setOpportunities(opportunitiesData?.opportunities || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Calculate display stats from API data
  const displayStats = stats ? [
    {
      title: "Total Impressions",
      value: formatNumber(stats.impressions),
      icon: Eye,
      change: "Across all campaigns",
      trend: "neutral" as const,
    },
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns.toString(),
      icon: Target,
      change: `${campaigns.filter(c => c.status === "DRAFT").length} drafts`,
      trend: "neutral" as const,
    },
    {
      title: "Total Clicks",
      value: formatNumber(stats.clicks),
      icon: MousePointerClick,
      change: `${stats.conversions} conversions`,
      trend: "up" as const,
    },
    {
      title: "Avg. CTR",
      value: stats.avgCtr ? `${(stats.avgCtr * 100).toFixed(2)}%` : "0%",
      icon: TrendingUp,
      change: stats.avgCtr > 0.02 ? "Above average" : "Keep optimizing",
      trend: stats.avgCtr > 0.02 ? "up" as const : "neutral" as const,
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your advertising performance.
          </p>
        </div>
        <Link href="/search">
          <Button variant="gradient" size="lg" className="group">
            <Search className="mr-2 h-4 w-4" />
            New Search
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : displayStats.length > 0 ? (
          displayStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    stat.trend === "up" ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {stat.trend === "up" && <TrendingUp className="inline h-3 w-3 mr-1" />}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          // Empty state for new users
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No data yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by searching for ad opportunities and creating your first campaign.
              </p>
              <Link href="/search">
                <Button variant="gradient">
                  <Search className="mr-2 h-4 w-4" />
                  Find Opportunities
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Campaigns</CardTitle>
              <CardDescription>Recent and active campaigns</CardDescription>
            </div>
            <Link href="/campaigns">
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            ) : campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.slice(0, 3).map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(campaign.budget)} budget
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        campaign.status === "ACTIVE"
                          ? "default"
                          : campaign.status === "COMPLETED"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">No campaigns yet</p>
                <Link href="/campaigns/new">
                  <Button variant="outline" size="sm">
                    Create Campaign
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Opportunities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Opportunities</CardTitle>
              <CardDescription>Highest rated ad placements for you</CardDescription>
            </div>
            <Link href="/opportunities">
              <Button variant="ghost" size="sm">
                Browse All
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <ListItemSkeleton />
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            ) : opportunities.length > 0 ? (
              <div className="space-y-4">
                {opportunities.map((opp, index) => (
                  <Link
                    key={opp.id}
                    href={`/opportunities/${opp.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{opp.title}</p>
                        <p className="text-sm text-muted-foreground">{opp.platform.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {opp.qualityScore && (
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold">{opp.qualityScore}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {opp.cpmEstimate && `$${opp.cpmEstimate} CPM`}
                        {opp.avgCtr && ` | ${(opp.avgCtr * 100).toFixed(1)}% CTR`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">No opportunities found</p>
                <Link href="/search">
                  <Button variant="outline" size="sm">
                    Search Opportunities
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to help you get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/search">
              <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Find Ad Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  Search across 50+ platforms to find the best placements
                </p>
              </div>
            </Link>
            <Link href="/campaigns/new">
              <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Create Campaign</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new campaign to organize your ad bookings
                </p>
              </div>
            </Link>
            <Link href="/analytics">
              <div className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">View Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track performance across all your campaigns
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
