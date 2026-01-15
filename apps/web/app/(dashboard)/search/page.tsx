"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api-client";
import {
  DollarSign,
  Filter,
  Loader2,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const platforms = [
  { id: "facebook", name: "Facebook", type: "social" },
  { id: "instagram", name: "Instagram", type: "social" },
  { id: "tiktok", name: "TikTok", type: "social" },
  { id: "linkedin", name: "LinkedIn", type: "social" },
  { id: "twitter", name: "Twitter/X", type: "social" },
  { id: "google", name: "Google Ads", type: "search" },
  { id: "youtube", name: "YouTube", type: "video" },
  { id: "pinterest", name: "Pinterest", type: "social" },
  { id: "reddit", name: "Reddit", type: "social" },
  { id: "snapchat", name: "Snapchat", type: "social" },
  { id: "podcasts", name: "Podcasts", type: "audio" },
  { id: "newsletters", name: "Newsletters", type: "email" },
];

const adTypes = [
  { id: "display", name: "Display/Banner" },
  { id: "video", name: "Video" },
  { id: "native", name: "Native" },
  { id: "stories", name: "Stories" },
  { id: "search", name: "Search" },
  { id: "audio", name: "Audio/Podcast" },
  { id: "influencer", name: "Influencer" },
];

const goals = [
  { id: "awareness", name: "Brand Awareness", icon: Users },
  { id: "clicks", name: "Website Traffic", icon: TrendingUp },
  { id: "conversions", name: "Conversions", icon: Zap },
  { id: "leads", name: "Lead Generation", icon: Target },
];

const industries = [
  "Technology",
  "E-commerce",
  "SaaS",
  "Finance",
  "Health & Wellness",
  "Fashion",
  "Food & Beverage",
  "Travel",
  "Education",
  "Entertainment",
  "Real Estate",
  "Automotive",
];

export default function SearchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState([5000]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedAdTypes, setSelectedAdTypes] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const toggleSelection = (
    id: string,
    selected: string[],
    setSelected: (value: string[]) => void
  ) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);

    try {
      const search = await api.searches.create({
        budget: budget[0],
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
        adTypes: selectedAdTypes.length > 0 ? selectedAdTypes : undefined,
        goals: selectedGoals.length > 0 ? selectedGoals : undefined,
        industries: selectedIndustries.length > 0 ? selectedIndustries : undefined,
      });

      toast({
        title: "Search started",
        description: "We're finding the best ad opportunities for you.",
        variant: "success",
      });

      // Redirect to results page
      router.push(`/search/results?id=${search.id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Search failed",
        description: err.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Ad Opportunities</h1>
        <p className="text-muted-foreground">
          Tell us about your campaign and we&apos;ll find the best ad placements for your budget.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Search Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Monthly Budget
              </CardTitle>
              <CardDescription>
                How much do you want to spend on advertising per month?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">{formatCurrency(budget[0])}</span>
                <Input
                  type="number"
                  value={budget[0]}
                  onChange={(e) => setBudget([parseInt(e.target.value) || 0])}
                  className="w-32 text-right"
                />
              </div>
              <Slider
                value={budget}
                onValueChange={setBudget}
                min={100}
                max={100000}
                step={100}
                className="mt-6"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$100</span>
                <span>$100,000+</span>
              </div>
            </CardContent>
          </Card>

          {/* Platforms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Platforms
              </CardTitle>
              <CardDescription>
                Select which platforms you want to advertise on (leave empty for all)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <Badge
                    key={platform.id}
                    variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-sm"
                    onClick={() =>
                      toggleSelection(platform.id, selectedPlatforms, setSelectedPlatforms)
                    }
                  >
                    {platform.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ad Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Ad Types
              </CardTitle>
              <CardDescription>
                What types of ads are you interested in?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {adTypes.map((type) => (
                  <Badge
                    key={type.id}
                    variant={selectedAdTypes.includes(type.id) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-sm"
                    onClick={() =>
                      toggleSelection(type.id, selectedAdTypes, setSelectedAdTypes)
                    }
                  >
                    {type.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Campaign Goals
              </CardTitle>
              <CardDescription>
                What do you want to achieve with your advertising?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedGoals.includes(goal.id)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                    onClick={() =>
                      toggleSelection(goal.id, selectedGoals, setSelectedGoals)
                    }
                  >
                    <goal.icon
                      className={`h-5 w-5 ${
                        selectedGoals.includes(goal.id)
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span className="font-medium">{goal.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Industry
              </CardTitle>
              <CardDescription>
                What industry is your brand in?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <Badge
                    key={industry}
                    variant={selectedIndustries.includes(industry) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-sm"
                    onClick={() =>
                      toggleSelection(industry, selectedIndustries, setSelectedIndustries)
                    }
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Search Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Budget</Label>
                <p className="text-2xl font-bold">{formatCurrency(budget[0])}/mo</p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Platforms</Label>
                <p className="text-sm">
                  {selectedPlatforms.length === 0
                    ? "All platforms"
                    : `${selectedPlatforms.length} selected`}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Ad Types</Label>
                <p className="text-sm">
                  {selectedAdTypes.length === 0
                    ? "All types"
                    : `${selectedAdTypes.length} selected`}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Goals</Label>
                <p className="text-sm">
                  {selectedGoals.length === 0
                    ? "Not specified"
                    : selectedGoals.join(", ")}
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="w-full"
                  variant="gradient"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Find Opportunities
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  This will use 1 of your monthly searches
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <Sparkles className="inline h-4 w-4 mr-1 text-yellow-500" />
                Leave platforms empty to search across all 50+ platforms
              </p>
              <p>
                <Sparkles className="inline h-4 w-4 mr-1 text-yellow-500" />
                Select multiple goals for more diverse recommendations
              </p>
              <p>
                <Sparkles className="inline h-4 w-4 mr-1 text-yellow-500" />
                Industry selection helps us find niche opportunities
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
