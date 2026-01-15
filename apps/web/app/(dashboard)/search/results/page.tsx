"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api, SearchResult } from "@/lib/api-client";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  ArrowLeft,
  BookmarkPlus,
  Eye,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const searchId = searchParams.get("id");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<string>("PROCESSING");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = async () => {
    if (!searchId) return;

    try {
      const data = await api.searches.getResults(searchId);
      setResults(data.results || []);
      setStatus(data.status);
    } catch (err) {
      setError("Failed to load search results");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();

    // Poll for results if still processing
    const interval = setInterval(() => {
      if (status === "PROCESSING") {
        fetchResults();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [searchId, status]);

  if (!searchId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">No search ID provided</p>
        <Link href="/search">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            New Search
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading search results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchResults}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/search">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
          <p className="text-muted-foreground">
            {status === "PROCESSING"
              ? "Finding the best opportunities for you..."
              : `Found ${results.length} opportunities matching your criteria`}
          </p>
        </div>
        {status === "PROCESSING" && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </div>
        )}
      </div>

      {/* Status Card */}
      {status === "PROCESSING" && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Analyzing opportunities...</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI is matching your criteria against thousands of ad placements
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Main Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {result.opportunity.title}
                            </h3>
                            <Badge variant="secondary">
                              {result.opportunity.platform.name}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.opportunity.adType} | {result.opportunity.placement}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        <span className="text-lg font-bold">{result.matchScore}</span>
                        <span className="text-sm text-muted-foreground">match</span>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    {result.reasoning && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm">
                          <TrendingUp className="inline h-4 w-4 mr-1 text-primary" />
                          {result.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">
                          Recommended Budget
                        </p>
                        <p className="text-lg font-semibold">
                          {result.recommendedBudget
                            ? formatCurrency(result.recommendedBudget)
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">
                          Expected Reach
                        </p>
                        <p className="text-lg font-semibold">
                          {result.expectedReach
                            ? formatNumber(result.expectedReach)
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">
                          Expected CTR
                        </p>
                        <p className="text-lg font-semibold">
                          {result.expectedCtr
                            ? `${(result.expectedCtr * 100).toFixed(1)}%`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">
                          Est. CPM
                        </p>
                        <p className="text-lg font-semibold">
                          {result.opportunity.cpmEstimate
                            ? `$${result.opportunity.cpmEstimate}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Match Score</span>
                        <span className="font-medium">{result.matchScore}/100</span>
                      </div>
                      <Progress value={result.matchScore} className="h-2" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <Link href={`/opportunities/${result.opportunity.id}`}>
                      <Button className="w-full" variant="gradient">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full">
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Add to Campaign
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : status === "COMPLETED" ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No opportunities found matching your criteria. Try adjusting your search
                parameters.
              </p>
              <Link href="/search">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  New Search
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
