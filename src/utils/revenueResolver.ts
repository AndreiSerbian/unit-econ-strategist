// FIN-008 — Centralized revenue resolver.
// Single helper that determines what `currentMetrics.revenue` should be
// based on the active business type, the user's revenueSource preference,
// and the available auto-derived inputs (products / SaaS / Marketplace /
// Token / Services).
//
// Replaces multiple competing useEffects in Dashboard.tsx that each wrote
// to currentMetrics.revenue and could race or overwrite manual entries.

import type { BusinessType } from "@/config/businessTypeMetrics";
import { computeServicesTotalRevenue } from "@/components/services/revenue";

export type RevenueSource = "auto" | "manual";

export interface MetricsLike {
  revenue: number;
  revenueSource?: RevenueSource;
  manualRevenueOverride?: number;
}

export interface ResolveRevenueInput {
  businessType: BusinessType;
  products: any[];
  saasAggregateKPIs?: { totalRevenue?: number } | null;
  marketplaceTotals?: { totalPlatformRevenue?: number } | null;
  tokenScenarioMetrics?: { totalPackageRevenue?: number } | null;
  currentMetrics: MetricsLike;
}

export interface ResolveRevenueResult {
  calculatedRevenue: number;
  revenueSource: RevenueSource;
  finalRevenue: number;
  sourceReason: string;
}

function calcAuto(input: ResolveRevenueInput): { value: number; reason: string } {
  const { businessType, products, saasAggregateKPIs, marketplaceTotals, tokenScenarioMetrics } = input;

  switch (businessType) {
    case "saas":
      return {
        value: saasAggregateKPIs?.totalRevenue ?? 0,
        reason: "saas:saasAggregateKPIs.totalRevenue",
      };
    case "marketplace":
      return {
        value: marketplaceTotals?.totalPlatformRevenue ?? 0,
        reason: "marketplace:totalPlatformRevenue",
      };
    case "token_saas":
      return {
        value: tokenScenarioMetrics?.totalPackageRevenue ?? 0,
        reason: "token_saas:totalPackageRevenue",
      };
    case "services":
      return {
        value: computeServicesTotalRevenue(products || []),
        reason: "services:computeServicesTotalRevenue(billingModel-aware)",
      };
    case "sharing": {
      const v = (products || []).reduce((sum, p: any) => {
        const hourly = (p.price || 0) * ((p.utilizationRate ?? 0) / 100) * 720;
        return sum + hourly * (p.quantity || 0);
      }, 0);
      return { value: v, reason: "sharing:price*utilization%*720h*qty" };
    }
    case "ecommerce":
    case "production":
    case "freemium":
    default: {
      const v = (products || []).reduce(
        (sum, p: any) => sum + (p.price || 0) * (p.quantity || 0),
        0,
      );
      return { value: v, reason: `${businessType}:Σ price*quantity` };
    }
  }
}

export function resolveRevenue(input: ResolveRevenueInput): ResolveRevenueResult {
  const auto = calcAuto(input);

  // Decide the effective source. If the user has explicitly chosen a source,
  // honour it. Otherwise: legacy projects fall back to "auto" when there is
  // any auto-derivable revenue (so existing behaviour is preserved), and to
  // "manual" otherwise (so a user-typed value isn't silently zeroed out).
  let revenueSource: RevenueSource;
  let sourceReason: string;
  if (input.currentMetrics.revenueSource === "auto" || input.currentMetrics.revenueSource === "manual") {
    revenueSource = input.currentMetrics.revenueSource;
    sourceReason = `explicit:${revenueSource}`;
  } else if (auto.value > 0) {
    revenueSource = "auto";
    sourceReason = `legacy-auto-fallback:${auto.reason}`;
  } else {
    revenueSource = "manual";
    sourceReason = "legacy-manual-fallback:no-auto-revenue";
  }

  const finalRevenue =
    revenueSource === "auto"
      ? auto.value
      : input.currentMetrics.manualRevenueOverride ?? input.currentMetrics.revenue ?? 0;

  return {
    calculatedRevenue: auto.value,
    revenueSource,
    finalRevenue,
    sourceReason: `${revenueSource} (${sourceReason})`,
  };
}
