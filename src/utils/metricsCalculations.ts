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

export const calculateCAC = (metrics: Metrics) => {
  if (!metrics.detailedExpenses || metrics.newClients === 0) return 0;

  const marketing =
    metrics.detailedExpenses.variableCosts.marketing.trafficPurchase +
    metrics.detailedExpenses.variableCosts.marketing.contractorsPayment +
    metrics.detailedExpenses.variableCosts.marketing.crmCosts +
    metrics.detailedExpenses.variableCosts.marketing.customCategories.reduce(
      (sum, c) => sum + c.value,
      0
    );

  const salesCost =
    metrics.detailedExpenses.variableCosts.salesPayroll.bonusNewClients +
    metrics.detailedExpenses.variableCosts.salesPayroll.customCategories.reduce(
      (sum, c) => sum + c.value,
      0
    );

  return (marketing + salesCost) / metrics.newClients;
};

export const calculateCPL = (metrics: Metrics) => {
  if (!metrics.detailedExpenses) return 0;

  const marketing =
    metrics.detailedExpenses.variableCosts.marketing.trafficPurchase +
    metrics.detailedExpenses.variableCosts.marketing.contractorsPayment +
    metrics.detailedExpenses.variableCosts.marketing.crmCosts +
    metrics.detailedExpenses.variableCosts.marketing.customCategories.reduce(
      (sum, c) => sum + c.value,
      0
    );

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

  const variablePerClient = metrics.totalClients > 0 ? metrics.variableCosts / metrics.totalClients : 0;
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

export const calculateLTV = (metrics: Metrics) => {
  if (!metrics.customerLifetimeMonths || !metrics.purchaseFrequency) return 0;
  return metrics.avgCheck * metrics.purchaseFrequency * metrics.customerLifetimeMonths;
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

export const calculatePaybackPeriod = (metrics: Metrics) => {
  const cac = calculateCAC(metrics);
  if (!metrics.customerLifetimeMonths || !metrics.purchaseFrequency || metrics.totalClients === 0) return 0;
  
  const monthlyRevenuePerClient = metrics.avgCheck * metrics.purchaseFrequency;
  const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
  const costPerClient = totalCosts / metrics.totalClients;
  const monthlyProfitPerClient = monthlyRevenuePerClient - (costPerClient / metrics.customerLifetimeMonths);
  
  if (monthlyProfitPerClient <= 0) return Infinity;
  return cac / monthlyProfitPerClient;
};
