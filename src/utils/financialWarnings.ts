// FIN-005 / FIN-006 / FIN-007 — Diagnostic financial warnings.
// Detection-only. Never mutates user data. Emits structured warnings the
// UI / audit layer can opt-in to surface later.

import type { BusinessType } from "@/config/businessTypeMetrics";
import { getSalaryDoubleCountWarning } from "./serviceCogs";

export type FinancialWarningCode =
  | "SERVICE_LABOR_DOUBLE_COUNT_RISK"
  | "LOGISTICS_DOUBLE_OR_TRIPLE_COUNT_RISK";

export interface FinancialWarning {
  code: FinancialWarningCode;
  message: string;
  details: Record<string, unknown>;
}

interface MetricsLike {
  detailedExpenses?: any;
}

export function detectFinancialWarnings(
  metrics: MetricsLike,
  products: any[],
  businessType: BusinessType,
): FinancialWarning[] {
  const warnings: FinancialWarning[] = [];
  const de = metrics?.detailedExpenses;

  // FIN-005/006 — Service labor double count
  if (businessType === "services") {
    const hasServiceDirectLabour = (products || []).some(
      (p: any) => (p?.cost ?? 0) > 0 || (p?.hourlyRate ?? 0) > 0,
    );
    const productionSalary = de?.fixedCosts?.productionSalary ?? 0;
    const managementSalary = de?.fixedCosts?.managementSalary ?? 0;
    const msg = getSalaryDoubleCountWarning({
      hasServiceDirectLabour,
      productionSalary,
      managementSalary,
    });
    if (msg) {
      warnings.push({
        code: "SERVICE_LABOR_DOUBLE_COUNT_RISK",
        message: msg,
        details: { productionSalary, managementSalary, productCount: products?.length ?? 0 },
      });
    }
  }

  // FIN-007 — Logistics double/triple count
  const productionLogistics = de?.variableCosts?.production?.logistics ?? 0;
  const affected: { id: string; name: string; cost: number; logisticsPerUnit: number }[] = [];
  for (const p of products || []) {
    const perUnitLogistics =
      (p?.logisticsCost ?? 0) +
      (p?.logisticsPerUnit ?? 0) +
      (p?.deliveryCostPerUnit ?? 0);
    if ((p?.cost ?? 0) > 0 && perUnitLogistics > 0 && productionLogistics > 0) {
      affected.push({
        id: p.id,
        name: p.name,
        cost: p.cost,
        logisticsPerUnit: perUnitLogistics,
      });
    }
  }
  if (affected.length > 0) {
    warnings.push({
      code: "LOGISTICS_DOUBLE_OR_TRIPLE_COUNT_RISK",
      message:
        "Logistics may be counted in product cost, per-unit logistics, AND production.logistics simultaneously.",
      details: { productionLogistics, affectedProducts: affected },
    });
  }

  return warnings;
}
