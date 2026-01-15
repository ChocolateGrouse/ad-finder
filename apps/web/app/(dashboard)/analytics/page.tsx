"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { api, DashboardStats, Campaign } from "@/lib/api-client";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Eye,
  MousePointerClick,
  Target,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface PlatformData {
  platform: string;
  impressions: number;
  clicks: number;
  spend: number;
  color: string;
}

// Platform colors
const platformColors: Record<string, string> = {
  TikTok: "#000000",
  Instagram: "#E4405F",
  Google: "#4285F4",
  Facebook: "#1877F2",
  YouTube: "#FF0000",
  LinkedIn: "#0A66C2",
  Twitter: "#1DA1F2",
  Pinterest: "#BD081C",
};

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

function KPICardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-3 w-28 mt-2" />
      </CardContent>
    </Card>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b">
      <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
      <td className="py-3 px-4"><Skeleton className="h-5 w-16" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-14 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
      <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-10 ml-auto" /></td>
    </tr>
  );
}

// Simple bar chart component
function SimpleBarChart({ data }: { data: PlatformData[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No platform data available
      </div>
    );
  }

  const maxSpend = Math.max(...data.map((d) => d.spend));

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.platform} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.platform}</span>
            <span className="text-muted-foreground">{formatCurrency(item.spend)}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${maxSpend > 0 ? (item.spend / maxSpend) * 100 : 0}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("30d");

  // Calculate date range params
  const getDateParams = () => {
    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "90d":
        start.setDate(end.getDate() - 90);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage and set it
        const token = localStorage.getItem("token");
        if (token) {
          const { apiClient } = await import("@/lib/api-client");
          apiClient.setAuthToken(token);
        }

        const dateParams = getDateParams();

        // Fetch data in parallel
        const [statsData, platformsData, campaignsData] = await Promise.all([
          api.analytics.getOverview(dateParams).catch(() => null),
          api.analytics.getPlatforms().catch(() => []),
          api.campaigns.list().catch(() => []),
        ]);

        setStats(statsData);

        // Transform platform data with colors
        const platformsWithColors = (platformsData || []).map((p: any) => ({
          platform: p.platform || "Unknown",
          impressions: p.impressions || 0,
          clicks: p.clicks || 0,
          spend: p.spend || 0,
          color: platformColors[p.platform] || "#6B7280",
        }));
        setPlatforms(platformsWithColors);

        setCampaigns(Array.isArray(campaignsData) ? campaignsData : []);
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyticsData();
  }, [dateRange]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await api.analytics.export("csv");

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${dateRange}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export analytics");
    } finally {
      setExporting(false);
    }
  };

  // Calculate KPIs from stats
  const kpiCards = stats ? [
    {
      title: "Average CTR",
      value: stats.avgCtr ? `${(stats.avgCtr * 100).toFixed(2)}%` : "0%",
      benchmark: "Industry avg: 2.1%",
      status: (stats.avgCtr || 0) > 0.021 ? "above" : "below",
    },
    {
      title: "Average CPC",
      value: stats.clicks > 0 ? formatCurrency(stats.totalSpend / stats.clicks) : "$0",
      benchmark: "Industry avg: $0.68",
      status: stats.clicks > 0 && (stats.totalSpend / stats.clicks) < 0.68 ? "above" : "below",
    },
    {
      title: "ROAS",
      value: stats.totalSpend > 0 ? `${(stats.revenue / stats.totalSpend).toFixed(1)}x` : "0x",
      benchmark: "Target: 3x",
      status: stats.totalSpend > 0 && (stats.revenue / stats.totalSpend) >= 3 ? "above" : "below",
    },
    {
      title: "Cost per Conversion",
      value: stats.conversions > 0 ? formatCurrency(stats.totalSpend / stats.conversions) : "$0",
      benchmark: "Target: $5.00",
      status: stats.conversions > 0 && (stats.totalSpend / stats.conversions) <= 5 ? "above" : "below",
    },
  ] : [];

  // Overview stats cards
  const overviewStats = stats ? [
    {
      title: "Total Impressions",
      value: formatNumber(stats.impressions),
      change: "+23.5%",
      trend: "up" as const,
      icon: Eye,
    },
    {
      title: "Total Clicks",
      value: formatNumber(stats.clicks),
      change: "+18.2%",
      trend: "up" as const,
      icon: MousePointerClick,
    },
    {
      title: "Conversions",
      value: formatNumber(stats.conversions),
      change: "+12.8%",
      trend: "up" as const,
      icon: Target,
    },
    {
      title: "Total Spend",
      value: formatCurrency(stats.totalSpend),
      change: "-5.2%",
      trend: "down" as const,
      icon: DollarSign,
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your advertising performance across all campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </div>
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

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : overviewStats.length > 0 ? (
          overviewStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs flex items-center mt-1 ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No analytics data yet</h3>
              <p className="text-muted-foreground">
                Start creating campaigns and booking ads to see your performance metrics.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* KPI Cards */}
      {kpiCards.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </>
          ) : (
            kpiCards.map((kpi) => (
              <Card key={kpi.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{kpi.title}</p>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                    </div>
                    <Badge variant={kpi.status === "above" ? "default" : "destructive"}>
                      {kpi.status === "above" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {kpi.status === "above" ? "Above" : "Below"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{kpi.benchmark}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by Platform</CardTitle>
            <CardDescription>Where your advertising budget is going</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <SimpleBarChart data={platforms} />
                {platforms.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Spend</span>
                      <span className="font-bold">
                        {formatCurrency(platforms.reduce((sum, p) => sum + p.spend, 0))}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>CTR and engagement by platform</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : platforms.length > 0 ? (
              <div className="space-y-4">
                {platforms.map((platform) => {
                  const ctr = platform.impressions > 0
                    ? ((platform.clicks / platform.impressions) * 100).toFixed(2)
                    : "0.00";
                  return (
                    <div
                      key={platform.platform}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: platform.color }}
                        />
                        <span className="font-medium">{platform.platform}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="text-muted-foreground">Impressions</p>
                          <p className="font-medium">{formatNumber(platform.impressions)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Clicks</p>
                          <p className="font-medium">{formatNumber(platform.clicks)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">CTR</p>
                          <p className="font-medium">{ctr}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No platform performance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Detailed metrics for all your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Budget</th>
                  <th className="text-right py-3 px-4 font-medium">Start</th>
                  <th className="text-right py-3 px-4 font-medium">End</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : campaigns.length > 0 ? (
                  campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{campaign.name}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={campaign.status === "ACTIVE" ? "default" : "secondary"}
                        >
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(campaign.budget)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {campaign.startDate
                          ? new Date(campaign.startDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {campaign.endDate
                          ? new Date(campaign.endDate).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No campaigns found. Create your first campaign to see performance data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
