"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Crown,
  DollarSign,
  Globe,
  Headphones,
  Lock,
  MousePointerClick,
  Play,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const platforms = [
  { name: "Facebook", icon: "f", color: "#1877F2" },
  { name: "Google", icon: "G", color: "#4285F4" },
  { name: "TikTok", icon: "T", color: "#FF0050" },
  { name: "Instagram", icon: "I", color: "#E4405F" },
  { name: "LinkedIn", icon: "in", color: "#0A66C2" },
  { name: "YouTube", icon: "Y", color: "#FF0000" },
  { name: "Twitter", icon: "X", color: "#1DA1F2" },
  { name: "Pinterest", icon: "P", color: "#BD081C" },
];

const features = [
  {
    icon: Search,
    title: "AI-Powered Discovery",
    description: "Our neural network scans 50+ platforms in real-time, surfacing hidden opportunities competitors miss.",
    stat: "50+",
    statLabel: "Platforms",
    highlight: "10x faster than manual research",
  },
  {
    icon: Target,
    title: "Precision Audience Match",
    description: "Machine learning algorithms match your brand DNA with audiences that convert at 3x industry average.",
    stat: "3.2x",
    statLabel: "Better ROI",
    highlight: "AI-optimized targeting",
  },
  {
    icon: DollarSign,
    title: "Smart Budget Allocation",
    description: "Dynamic optimization redistributes spend in real-time to maximize returns across all channels.",
    stat: "40%",
    statLabel: "Cost Savings",
    highlight: "Automatic rebalancing",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Forecast campaign performance before you spend a dollar with our proprietary prediction engine.",
    stat: "95%",
    statLabel: "Accuracy",
    highlight: "Know before you go",
  },
];

// Commission-only model - everything is FREE
const platformFeatures = [
  "Unlimited AI-powered searches",
  "Access to all 50+ ad platforms",
  "AI-powered recommendations",
  "Full analytics dashboard",
  "Campaign management tools",
  "Real-time CTR tracking",
  "Performance reports",
  "Priority support",
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "VP of Marketing",
    company: "TechFlow",
    content: "AD Finder uncovered podcast sponsorships we never knew existed. Our customer acquisition cost dropped 40% in just 3 months. This tool pays for itself 100x over.",
    rating: 5,
    avatar: "SC",
    result: "40% lower CAC",
  },
  {
    name: "Marcus Johnson",
    role: "Founder & CEO",
    company: "Indie Brands Co",
    content: "As a bootstrapped startup, every marketing dollar is precious. AD Finder shows exactly where to invest for maximum impact. It's like having a CMO in your pocket.",
    rating: 5,
    avatar: "MJ",
    result: "$50K saved monthly",
  },
  {
    name: "Emily Rodriguez",
    role: "Growth Lead",
    company: "StartupXYZ",
    content: "The AI recommendations are eerily accurate. We've seen 200% more qualified leads while spending 30% less. Our board was shocked at the quarterly results.",
    rating: 5,
    avatar: "ER",
    result: "200% more leads",
  },
];

const stats = [
  { value: "50+", label: "Ad Platforms", icon: Globe },
  { value: "10K+", label: "Opportunities", icon: Target },
  { value: "500+", label: "Brands Trust Us", icon: Users },
  { value: "$2.4M", label: "Saved Monthly", icon: DollarSign },
];

const trustBadges = [
  { icon: Shield, label: "SOC 2 Compliant" },
  { icon: Lock, label: "256-bit Encryption" },
  { icon: Headphones, label: "24/7 Support" },
];

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen particles">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center glow group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">AD Finder</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm hover:text-primary transition relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link href="#pricing" className="text-sm hover:text-primary transition relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
              <Link href="#testimonials" className="text-sm hover:text-primary transition relative group">
                Success Stories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="gradient" size="sm" className="glow-hover ripple-btn">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 hero-gradient opacity-60" />
          <div className="absolute top-20 -left-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] blob-morph" />
          <div className="absolute bottom-20 -right-32 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[80px] blob-morph" style={{ animationDelay: "5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px]" />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-5xl mx-auto text-center">
              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="trust-badge badge-shine">
                    <badge.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm">{badge.label}</span>
                  </div>
                ))}
              </div>

              <Badge variant="outline" className="mb-6 px-5 py-2.5 border-primary/30 bg-primary/5 badge-shine">
                <Sparkles className="h-4 w-4 mr-2 text-primary animate-pulse" />
                <span className="text-sm">Trusted by 500+ high-growth brands worldwide</span>
              </Badge>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]">
                <span className="block">Discover Ads That</span>
                <span className="block gradient-text neon-text">Actually Convert</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
                Our AI analyzes <span className="text-foreground font-semibold">50+ advertising platforms</span> to find
                untapped opportunities your competitors are missing. Stop guessing, start growing.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link href="/signup">
                  <Button size="lg" variant="gradient" className="text-lg px-10 h-16 animate-pulse-glow ripple-btn group">
                    <span>Get Started Free</span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 h-16 group play-glow">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition">
                    <Play className="h-4 w-4 text-primary fill-primary" />
                  </div>
                  Watch 2-Min Demo
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-12">
                <span className="text-primary font-semibold">100% FREE to use</span> - Only pay 5% commission when you book an ad.
              </p>

              {/* Platform icons with enhanced animation */}
              <div className="relative">
                <p className="text-sm text-muted-foreground mb-4">Integrated with leading platforms</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {platforms.map((platform, i) => (
                    <div
                      key={platform.name}
                      className="platform-icon logo-pulse w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center font-bold text-base cursor-pointer card-shine"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        color: platform.color
                      }}
                      title={platform.name}
                    >
                      {platform.icon}
                    </div>
                  ))}
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-sm font-bold glow">
                    +42
                  </div>
                </div>
              </div>

              {/* Scroll indicator */}
              <div className="mt-16 scroll-indicator">
                <ChevronDown className="h-6 w-6 mx-auto text-muted-foreground" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar - Enhanced */}
        <section className="py-16 border-y border-border bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-30" />
          <div className="container mx-auto px-4 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="text-center stagger-in perspective-card"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="perspective-inner">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-4xl md:text-5xl font-bold gradient-text counter-value">{stat.value}</p>
                    <p className="text-muted-foreground mt-2 font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section id="features" className="py-28">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <Badge variant="outline" className="mb-4 badge-shine">
                <Zap className="h-3 w-3 mr-2 text-primary" />
                Powerful Features
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Everything You Need to
                <span className="gradient-text"> Dominate Your Market</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                We&apos;ve built the most comprehensive advertising intelligence platform.
                From discovery to optimization, every tool you need in one place.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {features.map((feature, i) => (
                <Card
                  key={i}
                  className="card-lift premium-card card-shine group gradient-glow-border"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="feature-icon shrink-0">
                        <feature.icon className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-4xl font-bold gradient-text">{feature.stat}</span>
                          <span className="text-sm text-muted-foreground">{feature.statLabel}</span>
                        </div>
                        <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                          <CheckCircle2 className="h-4 w-4" />
                          {feature.highlight}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Enhanced with Visual Journey */}
        <section className="py-28 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-20" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <Badge variant="outline" className="mb-4 badge-shine">
                <MousePointerClick className="h-3 w-3 mr-2 text-primary" />
                Simple Process
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                From Zero to Hero in
                <span className="gradient-text"> Three Steps</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                No complex setup. No learning curve. Start finding winning ad opportunities in minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Tell Us Your Goals",
                  description: "Enter your budget, target audience, and campaign objectives. Our AI learns your brand in seconds.",
                  icon: Target,
                  color: "from-purple-500 to-pink-500",
                },
                {
                  step: "02",
                  title: "Get AI Recommendations",
                  description: "Our neural network analyzes thousands of opportunities and ranks the best matches for your brand.",
                  icon: Sparkles,
                  color: "from-pink-500 to-orange-500",
                },
                {
                  step: "03",
                  title: "Launch & Scale",
                  description: "Book placements with one click. Track performance in real-time. Scale what works automatically.",
                  icon: Rocket,
                  color: "from-orange-500 to-yellow-500",
                },
              ].map((item, i) => (
                <div key={i} className="relative stagger-in" style={{ animationDelay: `${i * 0.2}s` }}>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-16 left-full w-full h-[3px] -translate-x-1/2">
                      <div className="h-full bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
                    </div>
                  )}
                  <div className="text-center">
                    <div className={`w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center glow magnetic-hover`}>
                      <item.icon className="h-14 w-14 text-white" />
                    </div>
                    <div className="text-6xl font-bold text-primary/20 mb-4 counter-value">{item.step}</div>
                    <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link href="/signup">
                <Button size="lg" variant="gradient" className="text-lg px-10 h-14 ripple-btn">
                  Try It Free Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section - Transparent Commission Model */}
        <section id="pricing" className="py-28 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px]" />

          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 badge-shine">
                <DollarSign className="h-3 w-3 mr-2 text-primary" />
                Transparent Pricing
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                100% Free to Use,
                <span className="gradient-text"> Pay Only for Results</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                No monthly fees. No hidden costs. We only succeed when you succeed.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Main pricing card */}
              <Card className="card-lift card-shine pricing-highlight gradient-glow-border mb-12">
                <CardContent className="p-10">
                  <div className="grid md:grid-cols-2 gap-10">
                    {/* Left side - Pricing */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center glow">
                          <Sparkles className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold">Full Access</h3>
                          <p className="text-muted-foreground">Everything you need, free</p>
                        </div>
                      </div>

                      <div className="mb-8 py-6 border-y border-border">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-6xl font-bold gradient-text">$0</span>
                          <span className="text-muted-foreground text-xl">/month</span>
                        </div>
                        <p className="text-lg text-muted-foreground">
                          + <span className="text-primary font-semibold">5% commission</span> only when you book an ad
                        </p>
                      </div>

                      <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span>No credit card required to start</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span>No subscription or monthly fees</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span>Cancel anytime - no commitment</span>
                        </div>
                      </div>

                      <Link href="/signup" className="block">
                        <Button size="lg" variant="gradient" className="w-full h-14 text-lg animate-pulse-glow ripple-btn">
                          Get Started Free
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>

                    {/* Right side - Features */}
                    <div>
                      <h4 className="text-xl font-semibold mb-6">Everything Included:</h4>
                      <ul className="space-y-4">
                        {platformFeatures.map((feature, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* How it works breakdown */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="card-shine">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Search className="h-6 w-6 text-green-500" />
                    </div>
                    <h4 className="font-semibold mb-2">Search & Discover</h4>
                    <p className="text-3xl font-bold text-green-500 mb-1">FREE</p>
                    <p className="text-sm text-muted-foreground">Unlimited searches across 50+ platforms</p>
                  </CardContent>
                </Card>

                <Card className="card-shine">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-blue-500" />
                    </div>
                    <h4 className="font-semibold mb-2">Analyze & Plan</h4>
                    <p className="text-3xl font-bold text-blue-500 mb-1">FREE</p>
                    <p className="text-sm text-muted-foreground">Full analytics and campaign management</p>
                  </CardContent>
                </Card>

                <Card className="card-shine">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">Book & Launch</h4>
                    <p className="text-3xl font-bold text-primary mb-1">5%</p>
                    <p className="text-sm text-muted-foreground">Small commission only when you book</p>
                  </CardContent>
                </Card>
              </div>

              <p className="text-center text-muted-foreground mt-10">
                <span className="font-semibold text-foreground">Example:</span> Book a $1,000 ad placement → You pay $1,050 total (ad cost + $50 service fee)
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials - Enhanced Social Proof */}
        <section id="testimonials" className="py-28 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient opacity-20" />
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 badge-shine">
                <Star className="h-3 w-3 mr-2 text-yellow-500 fill-yellow-500" />
                Success Stories
              </Badge>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Join 500+ Brands
                <span className="gradient-text"> Crushing It</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Don&apos;t just take our word for it. See what growth leaders are saying.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, i) => (
                <Card
                  key={i}
                  className={`card-lift card-shine transition-all duration-500 ${
                    activeTestimonial === i ? 'ring-2 ring-primary scale-105' : ''
                  }`}
                >
                  <CardContent className="p-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium mb-4">
                      <TrendingUp className="h-4 w-4" />
                      {testimonial.result}
                    </div>

                    <p className="text-muted-foreground mb-8 leading-relaxed text-lg testimonial-quote">
                      {testimonial.content}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg glow">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{testimonial.name}</p>
                        <p className="text-muted-foreground">
                          {testimonial.role}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Testimonial indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeTestimonial === i ? 'bg-primary w-8' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA - Maximum Impact */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 luxury-gradient opacity-20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 mb-8">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">100% FREE - No monthly fees, no subscriptions</span>
              </div>

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Ready to Find Ads That
                <span className="block gradient-text neon-text">Actually Work?</span>
              </h2>

              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Join 500+ brands already using AD Finder to discover better opportunities.
                Start for free - only pay 5% when you book an ad that works for you.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link href="/signup">
                  <Button size="lg" variant="gradient" className="text-xl px-12 h-16 animate-pulse-glow ripple-btn">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Free forever
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  5% commission only on bookings
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Enhanced */}
      <footer className="border-t border-border py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">AD Finder</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The intelligent platform for discovering high-converting ad opportunities across 50+ platforms.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Integrations</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Careers</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">Cookie Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition">GDPR</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AD Finder. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <badge.icon className="h-4 w-4" />
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
