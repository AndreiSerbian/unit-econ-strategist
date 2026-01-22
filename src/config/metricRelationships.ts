/**
 * Metric Relationship Analyzer v3.2
 * Configuration for metric relationships across 7 business types
 */

import type { Metrics } from '@/hooks/useProject';
import type { BusinessType } from '@/config/businessTypeMetrics';

// Автоматическая синхронизация с реальным Metrics
export type BaseMetricKey = keyof Metrics;

// Только реально рассчитываемые derived метрики (которых НЕТ в Metrics)
export type DerivedMetricKey = 
  | 'cac'           // calculateCAC()
  | 'cpl'           // calculateCPL()
  | 'profit'        // calculateProfit()
  | 'profitMargin'  // calculateProfitMargin()
  | 'ltvCacRatio'   // LTV / CAC
  | 'breakeven'     // calculateBreakeven()
  | 'paybackPeriod' // calculatePaybackPeriod()
  | 'paybackOrders';// E-commerce: CAC / (AOV × margin)

export type MetricKey = BaseMetricKey | DerivedMetricKey;

export type RelationshipType = 
  | 'formula'       // A рассчитывается из B,C,D
  | 'ratio'         // A/B должно быть в диапазоне
  | 'threshold'     // A должно быть выше/ниже порога
  | 'correlation'   // A и B должны двигаться вместе
  | 'constraint';   // Бизнес-правило (например churn vs lifetime)

export type CheckStatus = 'ok' | 'warning' | 'contradiction' | 'missing';
export type Severity = 'info' | 'warning' | 'critical';

export interface MetricRelationship {
  id: string;
  from: MetricKey;
  to: MetricKey;
  type: RelationshipType;
  formulaLabel?: string;
  requiredMetrics?: MetricKey[];
  healthyRange?: [number, number];
  criticalThreshold?: number;
  severity: Severity;
  whyItMatters: string;
  businessTypes: BusinessType[];
}

export interface BusinessTypeRelationships {
  businessType: BusinessType;
  primaryRelationships: MetricRelationship[];
  secondaryRelationships: MetricRelationship[];
}

// ============================================================
// SHARED RELATIONSHIPS (применяются ко всем типам бизнеса)
// ============================================================

const sharedRelationships: MetricRelationship[] = [
  {
    id: 'revenue_clients_avgcheck',
    from: 'revenue',
    to: 'avgCheck',
    type: 'formula',
    formulaLabel: 'Revenue = totalClients × avgCheck',
    requiredMetrics: ['revenue', 'totalClients', 'avgCheck'],
    severity: 'critical',
    whyItMatters: 'Базовая формула выручки — если не сходится, данные некорректны',
    businessTypes: ['saas', 'ecommerce', 'production', 'services', 'freemium', 'sharing', 'marketplace']
  },
  {
    id: 'conversion_leads_clients',
    from: 'conversionRate',
    to: 'totalClients',
    type: 'formula',
    formulaLabel: 'totalClients = totalLeads × (conversionRate / 100)',
    requiredMetrics: ['conversionRate', 'totalLeads', 'totalClients'],
    severity: 'warning',
    whyItMatters: 'Воронка продаж — расхождение указывает на пропущенные лиды или клиентов',
    businessTypes: ['saas', 'ecommerce', 'production', 'services', 'freemium', 'sharing', 'marketplace']
  },
  {
    id: 'clients_split',
    from: 'totalClients',
    to: 'newClients',
    type: 'formula',
    formulaLabel: 'totalClients = newClients + returningClients',
    requiredMetrics: ['totalClients', 'newClients', 'returningClients'],
    severity: 'warning',
    whyItMatters: 'Структура клиентской базы должна сходиться',
    businessTypes: ['saas', 'ecommerce', 'production', 'services', 'freemium', 'sharing', 'marketplace']
  },
  {
    id: 'profit_margin_range',
    from: 'profitMargin',
    to: 'revenue',
    type: 'threshold',
    healthyRange: [5, 40],
    criticalThreshold: 0,
    severity: 'critical',
    whyItMatters: 'Отрицательная маржа — убыточная модель',
    businessTypes: ['saas', 'ecommerce', 'production', 'services', 'freemium', 'sharing', 'marketplace']
  },
  {
    id: 'cac_marketing_clients',
    from: 'cac',
    to: 'marketingCosts',
    type: 'formula',
    formulaLabel: 'CAC = marketingCosts / newClients',
    requiredMetrics: ['marketingCosts', 'newClients', 'totalClients'],
    severity: 'info',
    whyItMatters: 'Стоимость привлечения клиента — ключевой показатель unit-экономики',
    businessTypes: ['saas', 'ecommerce', 'production', 'services', 'freemium', 'sharing', 'marketplace']
  }
];

// ============================================================
// SAAS-SPECIFIC RELATIONSHIPS
// ============================================================

const saasRelationships: MetricRelationship[] = [
  {
    id: 'saas_churn_lifetime',
    from: 'churnRate',
    to: 'customerLifetimeMonths',
    type: 'constraint',
    formulaLabel: 'customerLifetimeMonths ≈ 1 / (churnRate / 100)',
    requiredMetrics: ['churnRate', 'customerLifetimeMonths'],
    severity: 'critical',
    whyItMatters: 'Churn 8% несовместим с lifetime 24 мес — данные противоречивы',
    businessTypes: ['saas']
  },
  {
    id: 'saas_ltv_cac_ratio',
    from: 'ltvCacRatio',
    to: 'ltv',
    type: 'ratio',
    healthyRange: [3, 10],
    criticalThreshold: 1,
    severity: 'critical',
    whyItMatters: 'LTV/CAC < 3 — модель неэффективна, > 10 — недоинвестируете в рост',
    businessTypes: ['saas']
  },
  {
    id: 'saas_nrr_churn',
    from: 'nrr',
    to: 'churnRate',
    type: 'formula',
    formulaLabel: 'NRR = (100 - churnRate) + (expansionRevenue / MRR × 100)',
    requiredMetrics: ['nrr', 'churnRate', 'expansionRevenue', 'revenue'],
    severity: 'warning',
    whyItMatters: 'NRR > 100% компенсирует churn за счёт expansion',
    businessTypes: ['saas']
  },
  {
    id: 'saas_payback_period',
    from: 'paybackPeriod',
    to: 'cac',
    type: 'threshold',
    healthyRange: [6, 18],
    criticalThreshold: 24,
    severity: 'warning',
    whyItMatters: 'Payback > 24 мес — слишком долгая окупаемость клиента',
    businessTypes: ['saas']
  }
];

// ============================================================
// E-COMMERCE RELATIONSHIPS
// ============================================================

const ecommerceRelationships: MetricRelationship[] = [
  {
    id: 'ecom_cac_payback',
    from: 'paybackOrders',
    to: 'avgCheck',
    type: 'formula',
    formulaLabel: 'paybackOrders = CAC / (AOV × grossMargin)',
    requiredMetrics: ['cac', 'avgCheck', 'profitMargin', 'repeatRate'],
    healthyRange: [1, 2],
    criticalThreshold: 3,
    severity: 'critical',
    whyItMatters: 'При низком Repeat Rate высокий paybackOrders означает убыточную модель',
    businessTypes: ['ecommerce']
  },
  {
    id: 'ecom_repeat_rate',
    from: 'repeatRate',
    to: 'returningClients',
    type: 'formula',
    formulaLabel: 'repeatRate = (returningClients / totalClients) × 100',
    requiredMetrics: ['repeatRate', 'returningClients', 'totalClients'],
    severity: 'warning',
    whyItMatters: 'Repeat Rate показывает лояльность — расхождение указывает на ошибку в данных',
    businessTypes: ['ecommerce']
  },
  {
    id: 'ecom_logistics_margin',
    from: 'profitMargin',
    to: 'variableCosts',
    type: 'correlation',
    severity: 'warning',
    whyItMatters: 'Высокая маржа без учёта логистики может быть завышена',
    businessTypes: ['ecommerce', 'production']
  },
  {
    id: 'ecom_ltv_basic',
    from: 'ltv',
    to: 'avgCheck',
    type: 'formula',
    formulaLabel: 'LTV = avgCheck × purchaseFrequency × customerLifetimeMonths',
    requiredMetrics: ['ltv', 'avgCheck', 'purchaseFrequency', 'customerLifetimeMonths'],
    severity: 'info',
    whyItMatters: 'LTV определяет максимально допустимый CAC',
    businessTypes: ['ecommerce']
  }
];

// ============================================================
// MARKETPLACE RELATIONSHIPS
// ============================================================

const marketplaceRelationships: MetricRelationship[] = [
  {
    id: 'mp_gmv_revenue',
    from: 'revenue',
    to: 'takeRate',
    type: 'formula',
    formulaLabel: 'Revenue = GMV × (takeRate / 100)',
    requiredMetrics: ['revenue', 'takeRate'],
    severity: 'critical',
    whyItMatters: 'Выручка маркетплейса = комиссия от GMV',
    businessTypes: ['marketplace']
  },
  {
    id: 'mp_take_rate_range',
    from: 'takeRate',
    to: 'revenue',
    type: 'threshold',
    healthyRange: [5, 25],
    criticalThreshold: 30,
    severity: 'warning',
    whyItMatters: 'Take Rate > 25% отпугивает продавцов',
    businessTypes: ['marketplace']
  },
  {
    id: 'mp_liquidity',
    from: 'conversionRate',
    to: 'totalClients',
    type: 'threshold',
    healthyRange: [2, 15],
    criticalThreshold: 1,
    severity: 'warning',
    whyItMatters: 'Низкая конверсия = проблемы с ликвидностью маркетплейса',
    businessTypes: ['marketplace']
  }
];

// ============================================================
// PRODUCTION RELATIONSHIPS
// ============================================================

const productionRelationships: MetricRelationship[] = [
  {
    id: 'prod_margin_materials',
    from: 'profitMargin',
    to: 'variableCosts',
    type: 'correlation',
    severity: 'warning',
    whyItMatters: 'Рост цен на сырьё напрямую влияет на маржу',
    businessTypes: ['production']
  },
  {
    id: 'prod_breakeven',
    from: 'breakeven',
    to: 'fixedCosts',
    type: 'formula',
    formulaLabel: 'Breakeven = fixedCosts / (avgCheck - variablePerClient)',
    requiredMetrics: ['fixedCosts', 'avgCheck', 'variableCosts', 'totalClients'],
    severity: 'critical',
    whyItMatters: 'Точка безубыточности определяет минимальный объём продаж',
    businessTypes: ['production', 'ecommerce']
  }
];

// ============================================================
// SERVICES RELATIONSHIPS
// ============================================================

const servicesRelationships: MetricRelationship[] = [
  {
    id: 'srv_utilization_margin',
    from: 'utilizationRate',
    to: 'profitMargin',
    type: 'correlation',
    healthyRange: [60, 85],
    criticalThreshold: 50,
    severity: 'warning',
    whyItMatters: 'Загрузка < 60% — избыточные мощности, > 85% — риск выгорания',
    businessTypes: ['services']
  },
  {
    id: 'srv_project_margin',
    from: 'projectMargin',
    to: 'avgCheck',
    type: 'threshold',
    healthyRange: [20, 50],
    criticalThreshold: 10,
    severity: 'critical',
    whyItMatters: 'Маржа проекта < 20% — высокий риск убыточности',
    businessTypes: ['services']
  }
];

// ============================================================
// FREEMIUM RELATIONSHIPS
// ============================================================

const freemiumRelationships: MetricRelationship[] = [
  {
    id: 'frm_free_to_paid',
    from: 'freeToPayConversion',
    to: 'totalClients',
    type: 'threshold',
    healthyRange: [2, 10],
    criticalThreshold: 1,
    severity: 'critical',
    whyItMatters: 'Конверсия free→paid < 2% — модель неэффективна',
    businessTypes: ['freemium']
  },
  {
    id: 'frm_cac_effective',
    from: 'cac',
    to: 'freeToPayConversion',
    type: 'formula',
    formulaLabel: 'Effective CAC = marketingCosts / (freeUsers × freeToPayConversion)',
    requiredMetrics: ['marketingCosts', 'totalClients', 'freeToPayConversion'],
    severity: 'warning',
    whyItMatters: 'Реальный CAC выше номинального из-за бесплатных пользователей',
    businessTypes: ['freemium']
  }
];

// ============================================================
// SHARING RELATIONSHIPS
// ============================================================

const sharingRelationships: MetricRelationship[] = [
  {
    id: 'shr_utilization',
    from: 'utilizationRate',
    to: 'revenue',
    type: 'threshold',
    healthyRange: [30, 70],
    criticalThreshold: 20,
    severity: 'warning',
    whyItMatters: 'Утилизация < 30% — избыток активов, > 70% — дефицит в пиковые часы',
    businessTypes: ['sharing']
  }
];

// ============================================================
// AGGREGATE ALL RELATIONSHIPS BY BUSINESS TYPE
// ============================================================

export function getRelationshipsForBusinessType(businessType: BusinessType): BusinessTypeRelationships {
  const allRelationships = [
    ...sharedRelationships,
    ...saasRelationships,
    ...ecommerceRelationships,
    ...marketplaceRelationships,
    ...productionRelationships,
    ...servicesRelationships,
    ...freemiumRelationships,
    ...sharingRelationships
  ];

  const applicable = allRelationships.filter(r => r.businessTypes.includes(businessType));
  
  // Primary = critical + warning, Secondary = info
  const primary = applicable.filter(r => r.severity === 'critical' || r.severity === 'warning');
  const secondary = applicable.filter(r => r.severity === 'info');

  return {
    businessType,
    primaryRelationships: primary,
    secondaryRelationships: secondary
  };
}

export function getAllRelationships(): MetricRelationship[] {
  return [
    ...sharedRelationships,
    ...saasRelationships,
    ...ecommerceRelationships,
    ...marketplaceRelationships,
    ...productionRelationships,
    ...servicesRelationships,
    ...freemiumRelationships,
    ...sharingRelationships
  ];
}
