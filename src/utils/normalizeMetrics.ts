// FIN-002 / FIN-003 — Legacy normalization for saved Metrics.
// Pure function: returns a normalized COPY without mutating the input.
// Recomputes aggregate `marketingCosts` and `variableCosts` from
// `detailedExpenses` so that legacy projects no longer carry contamination
// (e.g. taxes inside variableCosts, stale marketing aggregate).

interface ExpenseCategory {
  id: string;
  name: string;
  value: number;
  isCustom: boolean;
  countsAsAcquisitionCost?: boolean;
}

interface DetailedExpenses {
  fixedCosts: any;
  variableCosts: {
    marketing: {
      trafficPurchase: number;
      contractorsPayment: number;
      crmCosts: number;
      customCategories: ExpenseCategory[];
    };
    salesPayroll: {
      bonusOldClients: number;
      bonusNewClients: number;
      customCategories: ExpenseCategory[];
    };
    production: {
      materials: number;
      curators: number;
      logistics: number;
      partnersPercent: number;
      equipmentRepair: number;
      customCategories: ExpenseCategory[];
    };
    other: {
      customCategories: ExpenseCategory[];
    };
  };
  taxes: number;
}

interface Normalizable {
  variableCosts?: number;
  marketingCosts?: number;
  detailedExpenses?: DetailedExpenses;
  [k: string]: any;
}

export function sumDetailedMarketing(de: DetailedExpenses): number {
  const m = de.variableCosts.marketing;
  return (
    (m.trafficPurchase || 0) +
    (m.contractorsPayment || 0) +
    (m.crmCosts || 0) +
    (m.customCategories || []).reduce((s, c) => s + (c.value || 0), 0)
  );
}

export function sumDetailedVariableExcludingTaxesAndMarketing(de: DetailedExpenses): number {
  const sales =
    (de.variableCosts.salesPayroll.bonusOldClients || 0) +
    (de.variableCosts.salesPayroll.bonusNewClients || 0) +
    (de.variableCosts.salesPayroll.customCategories || []).reduce(
      (s, c) => s + (c.value || 0),
      0,
    );
  const prod =
    (de.variableCosts.production.materials || 0) +
    (de.variableCosts.production.curators || 0) +
    (de.variableCosts.production.logistics || 0) +
    (de.variableCosts.production.partnersPercent || 0) +
    (de.variableCosts.production.equipmentRepair || 0) +
    (de.variableCosts.production.customCategories || []).reduce(
      (s, c) => s + (c.value || 0),
      0,
    );
  const other = (de.variableCosts.other.customCategories || []).reduce(
    (s, c) => s + (c.value || 0),
    0,
  );
  return sales + prod + other;
}

export function normalizeMetrics<T extends Normalizable>(metrics: T): T {
  if (!metrics || !metrics.detailedExpenses) return metrics;
  const de = metrics.detailedExpenses;
  const marketingCosts = sumDetailedMarketing(de);
  const variableCosts = sumDetailedVariableExcludingTaxesAndMarketing(de);
  return {
    ...metrics,
    marketingCosts,
    variableCosts,
  };
}
