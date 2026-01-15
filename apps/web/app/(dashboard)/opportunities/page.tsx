"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, AdOpportunity, AdPlatform } from "@/lib/api-client";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  ArrowUpDown,
  BookmarkPlus,
  Eye,
  Filter,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sortBy, setSortBy] = useState("qualityScore");
  const [page, setPage] = useState(1);

  // Fetch platforms for filter dropdown
  const { data: platforms } = useQuery({
    queryKey: ["platforms"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/opportunities/platforms/list`
      );
      return response.json() as Promise<AdPlatform[]>;
    },
  });

  // Fetch opportunities with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ["opportunities", platformFilter, sortBy, page, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortBy,
        sortOrder: sortBy === "cpmEstimate" ? "asc" : "desc",
      });

      if (platformFilter !== "all") {
        params.append("platform", platformFilter);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/opportunities?${params}`
      );
      return response.json();
    },
  });

  const opportunities = data?.opportunities || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ad Opportunities</h1>
          <p className="text-muted-foreground">
            Browse and book the best ad placements across all platforms
          </p>
        </div>
        <Link href="/search">
          <Button variant="gradient">
            <Search className="mr-2 h-4 w-4" />
            New Search
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={platformFilter}
              onValueChange={(value) => {
                setPlatformFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms?.map((platform) => (
                  <SelectItem key={platform.id} value={platform.slug}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qualityScore">Quality Score</SelectItem>
                <SelectItem value="cpmEstimate">Lowest CPM</SelectItem>
                <SelectItem value="estimatedReach">Highest Reach</SelectItem>
                <SelectItem value="avgCtr">Highest CTR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive mb-4">Failed to load opportunities</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {opportunities.length} of {pagination?.total || 0} opportunities
          </p>

          {opportunities.map((opp: AdOpportunity & { platform: AdPlatform }) => (
            <Card key={opp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Main Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{opp.title}</h3>
                          <Badge variant="secondary">{opp.platform.name}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {opp.platform.type} | {opp.adType} | {opp.placement || "Various"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-bold">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        {opp.qualityScore || "N/A"}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{opp.description}</p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Est. CPM</p>
                        <p className="text-lg font-semibold">
                          {opp.cpmEstimate ? `$${opp.cpmEstimate}` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Est. CPC</p>
                        <p className="text-lg font-semibold">
                          {opp.cpcEstimate ? `$${opp.cpcEstimate}` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Est. Reach</p>
                        <p className="text-lg font-semibold">
                          {opp.estimatedReach ? formatNumber(opp.estimatedReach) : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Avg. CTR</p>
                        <p className="text-lg font-semibold">
                          {opp.avgCtr ? `${(Number(opp.avgCtr) * 100).toFixed(1)}%` : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Quality Score Bar */}
                    {opp.qualityScore && (
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Quality Score</span>
                          <span className="font-medium">{opp.qualityScore}/100</span>
                        </div>
                        <Progress value={opp.qualityScore} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <div className="text-right mb-2">
                      <p className="text-xs text-muted-foreground">Min. Budget</p>
                      <p className="text-xl font-bold">
                        {opp.minBudget ? formatCurrency(Number(opp.minBudget)) : "N/A"}
                      </p>
                    </div>
                    <Link href={`/opportunities/${opp.id}`}>
                      <Button className="w-full" variant="gradient">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full">
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {pagination.pages}
                </span>
              </div>
              <Button
                variant="outline"
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
