// Business model adapters for Cash Flow Timeline
// These convert existing business inputs into cashflow lines

import type { 
  AdapterLine, 
  PlanningPeriod, 
  LineCategory,
  SourceAdapter 
} from './types';
import { paymentDelayToPeriodShift } from './types';

// ============================================================
// MARKETPLACE ADAPTER
// ============================================================
export interface MarketplaceInput {
  categories: Array<{
    id: string;
    name: string;
    transactionsCount: number;
    avgCheck: number;
    takeRatePercent: number;
    gmvOverride?: number;
  }>;
  channels: Array<{
    id: string;
    name: string;
    discountPercent: number;
    returnRatePercent: number;
    paymentDelayDays: number;
  }>;
  categoryChannelStats: Array<{
    categoryId: string;
    channelId: string;
    sharePercent?: number;
    transactionsPerPeriod?: number;
    takeRateOverridePercent?: number;
  }>;
  horizonPeriods: number;
  planningPeriod: PlanningPeriod;
}

export function marketplaceAdapter(input: MarketplaceInput): AdapterLine[] {
  const lines: AdapterLine[] = [];
  const { categories, channels, categoryChannelStats, horizonPeriods, planningPeriod } = input;

  // Build channel lookup
  const channelMap = new Map(channels.map(ch => [ch.id, ch]));
  
  // Track totals per period
  const revenueByPeriod = new Array(horizonPeriods).fill(0);
  const refundsByPeriod = new Array(horizonPeriods).fill(0);
  const feesByPeriod = new Array(horizonPeriods).fill(0);

  for (const category of categories) {
    const gmvComputed = category.transactionsCount * category.avgCheck;
    const gmvUsed = category.gmvOverride ?? gmvComputed;
    
    // Get channel stats for this category
    const stats = categoryChannelStats.filter(s => s.categoryId === category.id);
    
    for (const stat of stats) {
      const channel = channelMap.get(stat.channelId);
      if (!channel) continue;

      // Calculate transactions for this channel
      const txChannel = stat.transactionsPerPeriod ?? 
        (category.transactionsCount * (stat.sharePercent ?? 0) / 100);
      
      if (txChannel <= 0 || category.transactionsCount <= 0) continue;

      const gmvChannel = (gmvUsed / category.transactionsCount) * txChannel;
      const netGmvChannel = gmvChannel * 
        (1 - (channel.discountPercent ?? 0) / 100) * 
        (1 - (channel.returnRatePercent ?? 0) / 100);
      
      const effectiveTakeRate = stat.takeRateOverridePercent ?? category.takeRatePercent;
      const platformRevenue = netGmvChannel * (effectiveTakeRate / 100);
      
      // Calculate refunds
      const refundsAmount = gmvChannel * (channel.returnRatePercent ?? 0) / 100 * (effectiveTakeRate / 100);
      
      // Calculate period shift from payment delay
      const periodShift = paymentDelayToPeriodShift(channel.paymentDelayDays, planningPeriod);

      // Distribute across periods (uniform for MVP)
      for (let p = 0; p < horizonPeriods; p++) {
        const targetPeriod = Math.min(p + periodShift, horizonPeriods - 1);
        revenueByPeriod[targetPeriod] += platformRevenue;
        refundsByPeriod[p] += refundsAmount;
      }
    }
  }

  // Create inflow line for platform revenue
  if (revenueByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Комиссия платформы',
      lineType: 'inflow',
      category: 'revenue',
      values: revenueByPeriod,
      sourceAdapter: 'marketplace',
    });
  }

  // Create outflow line for refunds (or reduce inflow)
  if (refundsByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Возвраты',
      lineType: 'outflow',
      category: 'refunds',
      values: refundsByPeriod,
      sourceAdapter: 'marketplace',
    });
  }

  return lines;
}

// ============================================================
// E-COMMERCE ADAPTER
// ============================================================
export interface EcommerceInput {
  products: Array<{
    id: string;
    name: string;
    price: number;
    cost: number;
    quantity: number;
    logisticsToClientPerUnit?: number;
  }>;
  channels: Array<{
    id: string;
    name: string;
    commissionPercent: number;
    returnRatePercent: number;
    paymentDelayDays: number;
  }>;
  productChannelAllocations: Array<{
    productId: string;
    channelId: string;
    quantity: number;
    priceOverride?: number;
  }>;
  horizonPeriods: number;
  planningPeriod: PlanningPeriod;
}

export function ecommerceAdapter(input: EcommerceInput): AdapterLine[] {
  const lines: AdapterLine[] = [];
  const { products, channels, productChannelAllocations, horizonPeriods, planningPeriod } = input;

  const productMap = new Map(products.map(p => [p.id, p]));
  const channelMap = new Map(channels.map(ch => [ch.id, ch]));

  const revenueByPeriod = new Array(horizonPeriods).fill(0);
  const cogsByPeriod = new Array(horizonPeriods).fill(0);
  const logisticsByPeriod = new Array(horizonPeriods).fill(0);
  const feesByPeriod = new Array(horizonPeriods).fill(0);
  const refundsByPeriod = new Array(horizonPeriods).fill(0);

  for (const alloc of productChannelAllocations) {
    const product = productMap.get(alloc.productId);
    const channel = channelMap.get(alloc.channelId);
    if (!product || !channel) continue;

    const price = alloc.priceOverride ?? product.price;
    const qty = alloc.quantity;
    
    const grossRevenue = price * qty;
    const cogs = product.cost * qty;
    const logistics = (product.logisticsToClientPerUnit ?? 0) * qty;
    const fees = grossRevenue * (channel.commissionPercent / 100);
    const refunds = grossRevenue * (channel.returnRatePercent / 100);

    const periodShift = paymentDelayToPeriodShift(channel.paymentDelayDays, planningPeriod);

    // Distribute uniformly across periods
    for (let p = 0; p < horizonPeriods; p++) {
      const targetPeriod = Math.min(p + periodShift, horizonPeriods - 1);
      revenueByPeriod[targetPeriod] += grossRevenue;
      cogsByPeriod[p] += cogs;
      logisticsByPeriod[p] += logistics;
      feesByPeriod[p] += fees;
      refundsByPeriod[p] += refunds;
    }
  }

  // If no allocations, use products directly
  if (productChannelAllocations.length === 0) {
    for (const product of products) {
      const grossRevenue = product.price * product.quantity;
      const cogs = product.cost * product.quantity;
      const logistics = (product.logisticsToClientPerUnit ?? 0) * product.quantity;

      for (let p = 0; p < horizonPeriods; p++) {
        revenueByPeriod[p] += grossRevenue;
        cogsByPeriod[p] += cogs;
        logisticsByPeriod[p] += logistics;
      }
    }
  }

  if (revenueByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Выручка от продаж',
      lineType: 'inflow',
      category: 'revenue',
      values: revenueByPeriod,
      sourceAdapter: 'ecommerce',
    });
  }

  if (cogsByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Себестоимость',
      lineType: 'outflow',
      category: 'cogs',
      values: cogsByPeriod,
      sourceAdapter: 'ecommerce',
    });
  }

  if (logisticsByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Логистика до клиента',
      lineType: 'outflow',
      category: 'logistics',
      values: logisticsByPeriod,
      sourceAdapter: 'ecommerce',
    });
  }

  if (feesByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Комиссии каналов',
      lineType: 'outflow',
      category: 'fees',
      values: feesByPeriod,
      sourceAdapter: 'ecommerce',
    });
  }

  if (refundsByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Возвраты',
      lineType: 'outflow',
      category: 'refunds',
      values: refundsByPeriod,
      sourceAdapter: 'ecommerce',
    });
  }

  return lines;
}

// ============================================================
// SERVICES ADAPTER
// ============================================================
export interface ServicesInput {
  services: Array<{
    id: string;
    name: string;
    price: number;
    cost: number;
    quantity: number; // projects/contracts per period
    billingModel: 'fixed_project' | 'hourly' | 'retainer';
    estimatedHoursPerProject?: number;
    hourlyRate?: number;
    retainerFee?: number;
    clientsCount?: number;
  }>;
  horizonPeriods: number;
  planningPeriod: PlanningPeriod;
}

export function servicesAdapter(input: ServicesInput): AdapterLine[] {
  const lines: AdapterLine[] = [];
  const { services, horizonPeriods } = input;

  const revenueByPeriod = new Array(horizonPeriods).fill(0);
  const costByPeriod = new Array(horizonPeriods).fill(0);

  for (const service of services) {
    let periodRevenue = 0;
    let periodCost = service.cost * service.quantity;

    if (service.billingModel === 'fixed_project') {
      periodRevenue = service.price * service.quantity;
    } else if (service.billingModel === 'hourly') {
      const hours = (service.estimatedHoursPerProject ?? 0) * service.quantity;
      periodRevenue = hours * (service.hourlyRate ?? 0);
    } else if (service.billingModel === 'retainer') {
      periodRevenue = (service.retainerFee ?? 0) * (service.clientsCount ?? 0);
    }

    // Distribute uniformly across periods
    for (let p = 0; p < horizonPeriods; p++) {
      revenueByPeriod[p] += periodRevenue;
      costByPeriod[p] += periodCost;
    }
  }

  if (revenueByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Выручка от услуг',
      lineType: 'inflow',
      category: 'revenue',
      values: revenueByPeriod,
      sourceAdapter: 'services',
    });
  }

  if (costByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Прямые затраты',
      lineType: 'outflow',
      category: 'cogs',
      values: costByPeriod,
      sourceAdapter: 'services',
    });
  }

  return lines;
}

// ============================================================
// SAAS ADAPTER (Product → Plans model)
// ============================================================
export interface SaasPlanInput {
  id: string;
  name: string;
  billingType: 'subscription' | 'one_time';
  priceEur: number;
  subscribers: number; // for subscription: subscribers, for one_time: buyers
  newSubscribersPerPeriod: number;
  costPerSubscriberPerMonthEur: number;
  isFreePlan: boolean;
  churnRatePercent: number | null;
  costPerBuyerEur: number | null;
}

export interface SaasProductInput {
  id: string;
  name: string;
  planningPeriod: 'week' | 'month' | 'quarter' | 'year';
  plans: SaasPlanInput[];
}

export interface SaasInput {
  products: SaasProductInput[];
  horizonPeriods: number;
  planningPeriod: PlanningPeriod;
}

export function saasAdapter(input: SaasInput): AdapterLine[] {
  const lines: AdapterLine[] = [];
  const { products, horizonPeriods } = input;

  const subscriptionRevenueByPeriod = new Array(horizonPeriods).fill(0);
  const oneTimeRevenueByPeriod = new Array(horizonPeriods).fill(0);
  const variableCostByPeriod = new Array(horizonPeriods).fill(0);

  for (const product of products) {
    for (const plan of product.plans) {
      if (plan.billingType === 'subscription') {
        // Track subscribers over time with churn
        let subscribers = plan.subscribers;
        const churnRate = plan.churnRatePercent ?? 0;
        
        for (let p = 0; p < horizonPeriods; p++) {
          // Calculate revenue (free plans contribute 0)
          if (!plan.isFreePlan) {
            subscriptionRevenueByPeriod[p] += subscribers * plan.priceEur;
          }
          
          // Variable cost applies to ALL subscribers including free tier
          variableCostByPeriod[p] += subscribers * plan.costPerSubscriberPerMonthEur;
          
          // Apply churn and add new subscribers for next period
          if (p < horizonPeriods - 1) {
            subscribers = subscribers * (1 - churnRate / 100) + plan.newSubscribersPerPeriod;
          }
        }
      } else {
        // One-time purchase: buyers per period
        const buyersPerPeriod = plan.subscribers;
        const revenuePerPeriod = buyersPerPeriod * plan.priceEur;
        const costPerPeriod = buyersPerPeriod * (plan.costPerBuyerEur ?? 0);
        
        for (let p = 0; p < horizonPeriods; p++) {
          oneTimeRevenueByPeriod[p] += revenuePerPeriod;
          variableCostByPeriod[p] += costPerPeriod;
        }
      }
    }
  }

  if (subscriptionRevenueByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Подписочная выручка (MRR)',
      lineType: 'inflow',
      category: 'revenue',
      values: subscriptionRevenueByPeriod,
      sourceAdapter: 'saas',
    });
  }

  if (oneTimeRevenueByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Разовые покупки',
      lineType: 'inflow',
      category: 'revenue',
      values: oneTimeRevenueByPeriod,
      sourceAdapter: 'saas',
    });
  }

  if (variableCostByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Переменные расходы (SaaS)',
      lineType: 'outflow',
      category: 'cogs',
      values: variableCostByPeriod,
      sourceAdapter: 'saas',
    });
  }

  return lines;
}

// ============================================================
// SHARING ADAPTER
// ============================================================
export interface SharingInput {
  assets: Array<{
    id: string;
    name: string;
    gmv: number; // gross merchandise value per period
    takeRate: number; // platform commission percent
    utilizationRate: number; // percent
    maintenanceCost: number; // per period
  }>;
  horizonPeriods: number;
  planningPeriod: PlanningPeriod;
}

export function sharingAdapter(input: SharingInput): AdapterLine[] {
  const lines: AdapterLine[] = [];
  const { assets, horizonPeriods } = input;

  const revenueByPeriod = new Array(horizonPeriods).fill(0);
  const costByPeriod = new Array(horizonPeriods).fill(0);

  for (const asset of assets) {
    const effectiveGmv = asset.gmv * (asset.utilizationRate / 100);
    const platformRevenue = effectiveGmv * (asset.takeRate / 100);

    for (let p = 0; p < horizonPeriods; p++) {
      revenueByPeriod[p] += platformRevenue;
      costByPeriod[p] += asset.maintenanceCost;
    }
  }

  if (revenueByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Комиссия платформы',
      lineType: 'inflow',
      category: 'revenue',
      values: revenueByPeriod,
      sourceAdapter: 'sharing',
    });
  }

  if (costByPeriod.some(v => v > 0)) {
    lines.push({
      name: 'Затраты на обслуживание',
      lineType: 'outflow',
      category: 'cogs',
      values: costByPeriod,
      sourceAdapter: 'sharing',
    });
  }

  return lines;
}

// ============================================================
// EXPENSES ADAPTER (Common for all business types)
// ============================================================
export interface ExpensesInput {
  fixedCosts: {
    salaries: number;
    rent: number;
    other: number;
  };
  /**
   * FIN-002 — Marketing is acquisition-related (variable), not fixed.
   * Emitted as its own variable outflow line, not inside fixedCosts.
   */
  variableMarketing?: number;
  taxes: number;
  horizonPeriods: number;
}

export function expensesAdapter(input: ExpensesInput): AdapterLine[] {
  const lines: AdapterLine[] = [];
  const { fixedCosts, variableMarketing = 0, taxes, horizonPeriods } = input;

  if (fixedCosts.salaries > 0) {
    lines.push({
      name: 'ФОТ',
      lineType: 'outflow',
      category: 'salaries',
      values: new Array(horizonPeriods).fill(fixedCosts.salaries),
      sourceAdapter: null,
    });
  }

  if (fixedCosts.rent > 0) {
    lines.push({
      name: 'Аренда',
      lineType: 'outflow',
      category: 'rent',
      values: new Array(horizonPeriods).fill(fixedCosts.rent),
      sourceAdapter: null,
    });
  }

  // FIN-002 — Marketing as its own variable outflow line, never as fixed.
  if (variableMarketing > 0) {
    lines.push({
      name: 'Маркетинг',
      lineType: 'outflow',
      category: 'marketing',
      values: new Array(horizonPeriods).fill(variableMarketing),
      sourceAdapter: null,
    });
  }

  if (fixedCosts.other > 0) {
    lines.push({
      name: 'Прочие расходы',
      lineType: 'outflow',
      category: 'other',
      values: new Array(horizonPeriods).fill(fixedCosts.other),
      sourceAdapter: null,
    });
  }

  if (taxes > 0) {
    lines.push({
      name: 'Налоги',
      lineType: 'outflow',
      category: 'taxes',
      values: new Array(horizonPeriods).fill(taxes),
      sourceAdapter: null,
    });
  }

  return lines;
}
