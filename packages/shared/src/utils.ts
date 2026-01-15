import { Plan, PLAN_CONFIGS, COMMISSION_RATE, PlanConfig } from "./types";

export function calculateCommission(budget: number): number {
  return Math.round(budget * COMMISSION_RATE * 100) / 100;
}

export function calculateTotalWithCommission(budget: number): number {
  return Math.round((budget + calculateCommission(budget)) * 100) / 100;
}

export function getPlanConfig(plan: Plan): PlanConfig {
  return PLAN_CONFIGS[plan];
}

export function hasReachedSearchLimit(plan: Plan, searchesUsed: number): boolean {
  const config = PLAN_CONFIGS[plan];
  return config.searchesPerMonth !== -1 && searchesUsed >= config.searchesPerMonth;
}

export function hasReachedCampaignLimit(plan: Plan, activeCampaigns: number): boolean {
  const config = PLAN_CONFIGS[plan];
  return config.maxCampaigns !== -1 && activeCampaigns >= config.maxCampaigns;
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function calculateCtr(impressions: number, clicks: number): number {
  return impressions === 0 ? 0 : clicks / impressions;
}

export function calculateCpc(spend: number, clicks: number): number {
  return clicks === 0 ? 0 : spend / clicks;
}

export function calculateCpa(spend: number, conversions: number): number {
  return conversions === 0 ? 0 : spend / conversions;
}

export function calculateRoas(revenue: number, spend: number): number {
  return spend === 0 ? 0 : revenue / spend;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function truncate(text: string, maxLength: number): string {
  return text.length <= maxLength ? text : text.slice(0, maxLength - 3) + "...";
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", options ?? { year: "numeric", month: "short", day: "numeric" });
}

export function daysBetween(start: Date | string, end: Date | string): number {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;
  return Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}
