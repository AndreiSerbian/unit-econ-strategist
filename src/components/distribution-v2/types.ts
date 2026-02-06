// Distribution V2 Types - Dropshipping/Distribution Module
// Goal: Correct net revenue and unit economics without double-counting logistics

export type PlanningPeriod = 'week' | 'month' | 'quarter' | 'year';
export type PricingModel = 'sum' | 'max';

// Raw Materials with shipment-based logistics
export interface RawMaterialV2 {
  id: string;
  projectId: string;
  name: string;
  unitCost: number;
  unitType: string; // piece, kg, liter, meter, etc.
  weightPerUnit: number; // kg
  volumePerUnit: number; // m³
  shipmentSize: number; // units per shipment (prevents /0)
  supplierName?: string;
  leadTimeDays?: number;
  // Linked logistics tariff
  logisticsTariffId?: string;
  distanceKm?: number;
  // Calculated (derived)
  shippingCostPerUnit?: number;
}

// Logistics Tariffs (for raw materials shipping)
export interface LogisticsTariffV2 {
  id: string;
  projectId: string;
  name: string;
  carrierName?: string;
  baseCost: number; // per shipment (tooltip: "фикс за отправку")
  costPerKg: number;
  costPerM3: number;
  costPerKm: number;
  pricingModel: PricingModel; // 'sum' = add all, 'max' = take max of weight/volume
  minCharge: number;
  currency: string;
  notes?: string;
}

// Delivery Tariffs (for customer delivery)
export interface DeliveryTariffV2 {
  id: string;
  projectId: string;
  name: string;
  deliveryType: 'standard' | 'express' | 'pickup' | 'economy' | 'same_day';
  baseCost: number; // per delivery
  costPerKg: number;
  costPerM3: number;
  pricingModel: PricingModel;
  minCharge: number;
  avgDistanceKm?: number; // optional, for averaged tariffs
  currency: string;
  notes?: string;
}

// Sales Channels V2 with discount and fixed commission
export interface SalesChannelV2 {
  id: string;
  projectId: string;
  name: string;
  channelType: 'direct' | 'marketplace' | 'wholesale' | 'retail' | 'affiliate';
  commissionPercent: number; // 0-100
  commissionFixed: number; // fixed fee per sale (EUR/USD)
  discountPercent: number; // 0-100
  paymentTermsDays: number;
  returnsPercent: number; // 0-100
  currency: string;
  isActive: boolean;
  notes?: string;
}

// Product-Channel link for net revenue calculation
export interface ProductChannelV2 {
  id: string;
  productId: string;
  channelId: string;
  priceOverride?: number; // nullable, uses product.price if null
  channelSharePercent: number; // 0-100
  isActive: boolean;
}

// Extended Product fields for distribution
export interface ProductDistributionV2 {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number; // units_per_period
  weightKg: number;
  volumeM3: number;
  deliveryTariffId?: string;
  manualDeliveryOverride: boolean;
  manualDeliveryCost: number;
  // Calculated
  computedDeliveryCost?: number;
  effectiveDeliveryCost?: number; // manual if override, else computed
}

// Net revenue calculation per channel
export interface ChannelRevenueCalculation {
  channelId: string;
  channelName: string;
  productId: string;
  productName: string;
  // Inputs
  priceEffective: number; // price_override ?? product.price
  discountPercent: number;
  commissionPercent: number;
  commissionFixed: number;
  returnsPercent: number;
  channelSharePercent: number;
  unitsPerPeriod: number;
  // Calculated
  netPrice: number; // price * (1 - discount%)
  netAfterCommission: number; // netPrice * (1 - commission%) - commissionFixed
  expectedUnitsSold: number; // unitsPerPeriod * share%
  expectedReturnedUnits: number; // expectedUnitsSold * returns%
  netUnits: number; // expectedUnitsSold - expectedReturnedUnits
  revenueChannel: number; // netAfterCommission * netUnits
}

// Calculation helpers
export const calculateRawMaterialShippingCost = (
  material: RawMaterialV2,
  tariff: LogisticsTariffV2 | undefined
): number => {
  if (!tariff || material.shipmentSize <= 0) return 0;

  const totalWeight = material.weightPerUnit * material.shipmentSize;
  const totalVolume = material.volumePerUnit * material.shipmentSize;
  const distance = material.distanceKm || 0;

  let variableCost: number;
  if (tariff.pricingModel === 'max') {
    const weightCost = totalWeight * tariff.costPerKg + (distance * tariff.costPerKm);
    const volumeCost = totalVolume * tariff.costPerM3 + (distance * tariff.costPerKm);
    variableCost = Math.max(weightCost, volumeCost);
  } else {
    // 'sum' model
    variableCost = 
      totalWeight * tariff.costPerKg + 
      totalVolume * tariff.costPerM3 + 
      distance * tariff.costPerKm;
  }

  const shippingTotal = Math.max(tariff.baseCost + variableCost, tariff.minCharge);
  return shippingTotal / material.shipmentSize; // per unit
};

export const calculateDeliveryCostPerUnit = (
  product: ProductDistributionV2,
  tariff: DeliveryTariffV2 | undefined
): number => {
  if (!tariff) return 0;

  let variableCost: number;
  if (tariff.pricingModel === 'max') {
    const weightCost = product.weightKg * tariff.costPerKg;
    const volumeCost = product.volumeM3 * tariff.costPerM3;
    variableCost = Math.max(weightCost, volumeCost);
  } else {
    variableCost = 
      product.weightKg * tariff.costPerKg + 
      product.volumeM3 * tariff.costPerM3;
  }

  return Math.max(tariff.baseCost + variableCost, tariff.minCharge);
};

export const calculateChannelRevenue = (
  product: ProductDistributionV2,
  channel: SalesChannelV2,
  productChannel: ProductChannelV2,
  planningPeriod: PlanningPeriod
): ChannelRevenueCalculation => {
  const priceEffective = productChannel.priceOverride ?? product.price;
  const netPrice = priceEffective * (1 - channel.discountPercent / 100);
  const netAfterCommission = 
    netPrice * (1 - channel.commissionPercent / 100) - channel.commissionFixed;
  
  const expectedUnitsSold = product.quantity * (productChannel.channelSharePercent / 100);
  const expectedReturnedUnits = expectedUnitsSold * (channel.returnsPercent / 100);
  const netUnits = expectedUnitsSold - expectedReturnedUnits;
  const revenueChannel = Math.max(0, netAfterCommission * netUnits);

  return {
    channelId: channel.id,
    channelName: channel.name,
    productId: product.id,
    productName: product.name,
    priceEffective,
    discountPercent: channel.discountPercent,
    commissionPercent: channel.commissionPercent,
    commissionFixed: channel.commissionFixed,
    returnsPercent: channel.returnsPercent,
    channelSharePercent: productChannel.channelSharePercent,
    unitsPerPeriod: product.quantity,
    netPrice,
    netAfterCommission,
    expectedUnitsSold,
    expectedReturnedUnits,
    netUnits,
    revenueChannel,
  };
};

// Period multiplier for annualization
export const getPeriodMultiplier = (period: PlanningPeriod): number => {
  switch (period) {
    case 'week': return 52;
    case 'month': return 12;
    case 'quarter': return 4;
    case 'year': return 1;
  }
};

export const getPeriodLabel = (period: PlanningPeriod): string => {
  switch (period) {
    case 'week': return 'неделю';
    case 'month': return 'месяц';
    case 'quarter': return 'квартал';
    case 'year': return 'год';
  }
};
