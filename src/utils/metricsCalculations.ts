interface DetailedExpenses {
  fixedCosts: {
    salaryOldClients: number;
    salaryNewClients: number;
    officeRent: number;
    warehouseRent: number;
    managementSalary: number;
    marketingSalary: number;
    productionSalary: number;
    internet: number;
    communication: number;
    banking: number;
    subscriptions: number;
    utilities: number;
    customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
  };
  variableCosts: {
    marketing: {
      trafficPurchase: number;
      contractorsPayment: number;
      crmCosts: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    salesPayroll: {
      bonusOldClients: number;
      bonusNewClients: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    production: {
      materials: number;
      curators: number;
      logistics: number;
      partnersPercent: number;
      equipmentRepair: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    other: {
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
  };
  taxRate: number;
  taxes: number;
}

interface Metrics {
  revenue: number;
  totalClients: number;
  newClients: number;
  returningClients: number;
  conversionRate: number;
  avgCheck: number;
  fixedCosts: number;
  variableCosts: number;
  marketingCosts: number;
  detailedExpenses?: DetailedExpenses;
  customerLifetimeMonths?: number;
  purchaseFrequency?: number;
}

// =====================================================================
// Normalized cost helpers (FIN-001, FIN-003, FIN-010, FIN-011)
// Single source-of-truth math used by CAC / LTV / Payback.
// =====================================================================

/**
 * Detailed marketing spend (variable bucket only).
 * Excludes `marketingSalary` which is fixed.
 */
const sumDetailedMarketing = (m: Metrics): number => {
  const d = m.detailedExpenses;
  if (!d) return 0;
  return (
    d.variableCosts.marketing.trafficPurchase +
    d.variableCosts.marketing.contractorsPayment +
    d.variableCosts.marketing.crmCosts +
    d.variableCosts.marketing.customCategories.reduce((s, c) => s + c.value, 0)
  );
};

/**
 * Sales commissions paid for newly acquired customers only.
 * (Bonuses tied to retained/old clients are NOT acquisition.)
 */
const sumSalesCommissionsForNewClients = (m: Metrics): number => {
  const d = m.detailedExpenses;
  if (!d) return 0;
  return (
    d.variableCosts.salesPayroll.bonusNewClients +
    d.variableCosts.salesPayroll.customCategories.reduce((s, c) => s + c.value, 0)
  );
};

/**
 * FIN-001 — Acquisition spend: ONE explicit number used by CAC.
 * Picks max(aggregate marketingCosts, detailed marketing) so that
 * partial fills of either bucket cannot double-count, then adds
 * sales commissions for new customers.
 */
export const getAcquisitionSpend = (m: Metrics): number => {
  const aggregateMarketing = m.marketingCosts || 0;
  const detailedMarketing = sumDetailedMarketing(m);
  const selectedMarketing = Math.max(aggregateMarketing, detailedMarketing);
  return selectedMarketing + sumSalesCommissionsForNewClients(m);
};

/**
 * Returns variable costs net of taxes (FIN-003) and marketing
 * (already accounted for separately via marketingCosts/acquisitionSpend).
 */
export const getNetVariableCosts = (m: Metrics): number => {
  const taxes = m.detailedExpenses?.taxes ?? 0;
  // m.variableCosts may still include taxes for legacy data; subtract here.
  // Marketing is in marketingCosts, never inside aggregate variableCosts.
  return Math.max(0, (m.variableCosts || 0) - taxes);
};

/**
 * Contribution margin % = (Revenue − net variable costs) / Revenue.
 * Returns null if revenue is zero (caller decides fallback).
 */
export const getContributionMarginPct = (m: Metrics): number | null => {
  if (!m.revenue || m.revenue <= 0) return null;
  const cm = m.revenue - getNetVariableCosts(m);
  return cm / m.revenue;
};

// =====================================================================
// Public metrics
// =====================================================================

/**
 * FIN-001 — CAC = acquisitionSpend / newAcquiredCustomers.
 * Falls back to totalClients when newClients is zero (legacy data).
 */
export const calculateCAC = (metrics: Metrics) => {
  const clientsForCAC = metrics.newClients > 0 ? metrics.newClients : metrics.totalClients;
  if (clientsForCAC <= 0) return 0;
  return getAcquisitionSpend(metrics) / clientsForCAC;
};

export const calculateCPL = (metrics: Metrics) => {
  if (!metrics.detailedExpenses) return 0;
  const marketing = sumDetailedMarketing(metrics);
  const leads = metrics.newClients / (metrics.conversionRate / 100 || 1);
  return leads > 0 ? marketing / leads : 0;
};

export const calculateBreakeven = (metrics: Metrics) => {
  if (!metrics.detailedExpenses) return 0;

  const fixedTotal =
    metrics.detailedExpenses.fixedCosts.salaryOldClients +
    metrics.detailedExpenses.fixedCosts.salaryNewClients +
    metrics.detailedExpenses.fixedCosts.officeRent +
    metrics.detailedExpenses.fixedCosts.warehouseRent +
    metrics.detailedExpenses.fixedCosts.managementSalary +
    metrics.detailedExpenses.fixedCosts.marketingSalary +
    metrics.detailedExpenses.fixedCosts.productionSalary +
    metrics.detailedExpenses.fixedCosts.internet +
    metrics.detailedExpenses.fixedCosts.communication +
    metrics.detailedExpenses.fixedCosts.banking +
    metrics.detailedExpenses.fixedCosts.subscriptions +
    metrics.detailedExpenses.fixedCosts.utilities +
    metrics.detailedExpenses.fixedCosts.customCategories.reduce((sum, c) => sum + c.value, 0);

  const netVariable = getNetVariableCosts(metrics);
  const variablePerClient = metrics.totalClients > 0 ? netVariable / metrics.totalClients : 0;
  const contribution = metrics.avgCheck - variablePerClient;

  return contribution > 0 ? fixedTotal / contribution : 0;
};

export const calculateProfitPerPayment = (metrics: Metrics) => {
  if (metrics.totalClients === 0) return 0;
  const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
  const profit = metrics.revenue - totalCosts;
  return profit / metrics.totalClients;
};

export const calculateProfit = (metrics: Metrics) => {
  const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
  return metrics.revenue - totalCosts;
};

export const calculateProfitMargin = (metrics: Metrics) => {
  if (metrics.revenue === 0) return 0;
  const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
  const profit = metrics.revenue - totalCosts;
  return (profit / metrics.revenue) * 100;
};

export const calculateBreakEvenDifference = (metrics: Metrics) => {
  const breakeven = calculateBreakeven(metrics);
  return metrics.totalClients - breakeven;
};

/**
 * FIN-010 — Margin-aware LTV.
 * LTV = avgCheck × frequency × lifetime × contributionMarginPct.
 * If margin cannot be computed (no revenue), falls back to revenue-based
 * LTV so existing UI never silently shows 0 — but should be flagged.
 */
export const calculateLTV = (metrics: Metrics) => {
  if (!metrics.customerLifetimeMonths || !metrics.purchaseFrequency) return 0;
  const revenueBased =
    metrics.avgCheck * metrics.purchaseFrequency * metrics.customerLifetimeMonths;
  const marginPct = getContributionMarginPct(metrics);
  if (marginPct === null) return revenueBased; // no margin data → revenue-based fallback
  if (marginPct <= 0) return 0; // negative/zero margin: no economic value
  return revenueBased * marginPct;
};

export const calculateLTVCACRatio = (metrics: Metrics) => {
  const cac = calculateCAC(metrics);
  const ltv = calculateLTV(metrics);
  if (cac === 0) return 0;
  return ltv / cac;
};

export const calculateChurnRate = (metrics: Metrics) => {
  if (!metrics.customerLifetimeMonths || metrics.customerLifetimeMonths === 0) return 0;
  return (1 / metrics.customerLifetimeMonths) * 100;
};

export const calculateRetentionRate = (metrics: Metrics) => {
  return 100 - calculateChurnRate(metrics);
};

/**
 * FIN-011 — Standard Payback Period.
 *   Payback = CAC / monthlyContributionMarginPerCustomer
 * Where monthlyContributionMarginPerCustomer = avgCheck × frequency × CM%.
 * Safe-guarded against zero or negative margin.
 */
export const calculatePaybackPeriod = (metrics: Metrics) => {
  const cac = calculateCAC(metrics);
  if (cac <= 0) return 0;
  if (!metrics.purchaseFrequency || !metrics.avgCheck) return Infinity;

  const marginPct = getContributionMarginPct(metrics) ?? 0;
  const monthlyCM = metrics.avgCheck * metrics.purchaseFrequency * marginPct;
  if (monthlyCM <= 0) return Infinity;
  return cac / monthlyCM;
};
