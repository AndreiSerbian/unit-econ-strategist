/**
 * Metric Analysis v3.2
 * Core analysis logic with safe derived metrics and production-ready guards
 */

import type { Metrics, Competitor } from '@/hooks/useProject';
import type { BusinessType } from '@/config/businessTypeMetrics';
import {
  type MetricKey,
  type DerivedMetricKey,
  type BaseMetricKey,
  type CheckStatus,
  type MetricRelationship,
  getRelationshipsForBusinessType
} from '@/config/metricRelationships';
import {
  calculateCAC,
  calculateCPL,
  calculateProfit,
  calculateProfitMargin,
  calculateBreakeven,
  calculateLTV,
  calculateLTVCACRatio,
  calculatePaybackPeriod
} from '@/utils/metricsCalculations';

// ============================================================
// CORE TYPES
// ============================================================

export interface MetricValue {
  value: number | null;
  missing: boolean;
  reason?: string;
}

export interface ConsistencyCheckResult {
  relationshipId: string;
  status: CheckStatus;
  message: string;
  currentValue?: number;
  expectedValue?: number;
  neededMetricsMissing?: MetricKey[];
}

export interface CompetitorComparisonResult {
  competitorId: string;
  competitorName: string;
  metricKey: MetricKey;
  myValue: number | null;
  competitorValue: number | null;
  gap: number | null; // Percentage difference
  insight: string;
}

export interface Hypothesis {
  id: string;
  title: string;
  description: string;
  relatedChecks: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  businessType: BusinessType;
  checks: ConsistencyCheckResult[];
  comparisons: CompetitorComparisonResult[];
  hypotheses: Hypothesis[];
  summary: {
    totalChecks: number;
    okCount: number;
    warningCount: number;
    contradictionCount: number;
    missingCount: number;
  };
}

// ============================================================
// SAFE METRIC EXTRACTION
// ============================================================

/**
 * Safely extract a base metric value from Metrics object
 * Returns { missing: true } if value is undefined/null, NOT if it's 0
 */
export function getMetricNumber(
  metrics: Partial<Metrics>,
  key: BaseMetricKey
): MetricValue {
  const value = metrics[key];
  
  if (value === undefined || value === null) {
    return { value: null, missing: true, reason: `${key} не указан` };
  }
  
  // 0 is a valid value, not missing
  if (typeof value === 'number') {
    return { value, missing: false };
  }
  
  // Handle non-numeric values (arrays, objects)
  return { value: null, missing: true, reason: `${key} имеет некорректный тип` };
}

/**
 * Calculate derived metrics with proper fallbacks and guards
 * NEVER uses || 0 pattern - missing !== 0
 */
export function getDerivedMetric(
  metrics: Partial<Metrics>,
  key: DerivedMetricKey
): MetricValue {
  switch (key) {
    case 'cac': {
      // ФИКС 1: Fallback на totalClients если newClients missing
      let clients = getMetricNumber(metrics, 'newClients');
      let clientSource: 'newClients' | 'totalClients' = 'newClients';
      
      if (clients.missing) {
        clients = getMetricNumber(metrics, 'totalClients');
        clientSource = 'totalClients';
        
        if (clients.missing) {
          return { value: null, missing: true, reason: 'Нет данных о клиентах (newClients и totalClients)' };
        }
      }
      
      if (clients.value === 0) {
        return { value: null, missing: true, reason: `${clientSource} = 0` };
      }
      
      const marketing = getMetricNumber(metrics, 'marketingCosts');
      if (marketing.missing) {
        return { value: null, missing: true, reason: 'marketingCosts не указан' };
      }
      
      // marketing.value = 0 is valid (free acquisition)
      const result: MetricValue = { 
        value: marketing.value! / clients.value!, 
        missing: false 
      };
      
      if (clientSource === 'totalClients') {
        result.reason = 'Использован totalClients вместо newClients';
      }
      
      return result;
    }

    case 'cpl': {
      const marketing = getMetricNumber(metrics, 'marketingCosts');
      const leads = getMetricNumber(metrics, 'totalLeads');
      
      if (marketing.missing) {
        return { value: null, missing: true, reason: 'marketingCosts не указан' };
      }
      if (leads.missing) {
        return { value: null, missing: true, reason: 'totalLeads не указан' };
      }
      if (leads.value === 0) {
        return { value: null, missing: true, reason: 'totalLeads = 0' };
      }
      
      return { value: marketing.value! / leads.value!, missing: false };
    }

    case 'profit': {
      const revenue = getMetricNumber(metrics, 'revenue');
      const fixed = getMetricNumber(metrics, 'fixedCosts');
      const variable = getMetricNumber(metrics, 'variableCosts');
      const marketing = getMetricNumber(metrics, 'marketingCosts');
      
      if (revenue.missing) {
        return { value: null, missing: true, reason: 'revenue не указан' };
      }
      
      // Costs default to 0 if missing (valid assumption)
      const totalCosts = 
        (fixed.missing ? 0 : fixed.value!) +
        (variable.missing ? 0 : variable.value!) +
        (marketing.missing ? 0 : marketing.value!);
      
      return { value: revenue.value! - totalCosts, missing: false };
    }

    case 'profitMargin': {
      const profit = getDerivedMetric(metrics, 'profit');
      const revenue = getMetricNumber(metrics, 'revenue');
      
      if (profit.missing) {
        return { value: null, missing: true, reason: `Profit: ${profit.reason}` };
      }
      if (revenue.missing) {
        return { value: null, missing: true, reason: 'revenue не указан' };
      }
      if (revenue.value === 0) {
        return { value: null, missing: true, reason: 'revenue = 0, маржа не определена' };
      }
      
      return { value: (profit.value! / revenue.value!) * 100, missing: false };
    }

    case 'ltvCacRatio': {
      // LTV is a base metric in Metrics interface
      const ltv = getMetricNumber(metrics, 'ltv');
      const cac = getDerivedMetric(metrics, 'cac');
      
      if (ltv.missing) {
        return { value: null, missing: true, reason: 'LTV не указан' };
      }
      if (cac.missing) {
        return { value: null, missing: true, reason: `CAC: ${cac.reason}` };
      }
      
      // ФИКС 3: CAC = 0 — валидное значение, но LTV/CAC не определено
      if (cac.value === 0) {
        return { 
          value: null, 
          missing: true, 
          reason: 'CAC = 0 (валидно: бесплатное привлечение), но LTV/CAC не определено (деление на ноль)' 
        };
      }
      
      return { value: ltv.value! / cac.value!, missing: false };
    }

    case 'breakeven': {
      const fixed = getMetricNumber(metrics, 'fixedCosts');
      const avgCheck = getMetricNumber(metrics, 'avgCheck');
      const variable = getMetricNumber(metrics, 'variableCosts');
      const clients = getMetricNumber(metrics, 'totalClients');
      
      if (fixed.missing) {
        return { value: null, missing: true, reason: 'fixedCosts не указан' };
      }
      if (avgCheck.missing) {
        return { value: null, missing: true, reason: 'avgCheck не указан' };
      }
      
      const variablePerClient = (clients.missing || clients.value === 0) 
        ? 0 
        : (variable.missing ? 0 : variable.value!) / clients.value!;
      
      const contribution = avgCheck.value! - variablePerClient;
      
      if (contribution <= 0) {
        return { value: null, missing: true, reason: 'Вклад на покрытие ≤ 0, breakeven не определён' };
      }
      
      return { value: fixed.value! / contribution, missing: false };
    }

    case 'paybackPeriod': {
      const cac = getDerivedMetric(metrics, 'cac');
      const avgCheck = getMetricNumber(metrics, 'avgCheck');
      const frequency = getMetricNumber(metrics, 'purchaseFrequency');
      
      if (cac.missing) {
        return { value: null, missing: true, reason: `CAC: ${cac.reason}` };
      }
      if (avgCheck.missing) {
        return { value: null, missing: true, reason: 'avgCheck не указан' };
      }
      if (frequency.missing) {
        return { value: null, missing: true, reason: 'purchaseFrequency не указан' };
      }
      if (frequency.value === 0) {
        return { value: null, missing: true, reason: 'purchaseFrequency = 0' };
      }
      
      const monthlyRevenue = avgCheck.value! * frequency.value!;
      const margin = getDerivedMetric(metrics, 'profitMargin');
      const marginRate = margin.missing ? 0.2 : margin.value! / 100; // Default 20%
      
      if (monthlyRevenue * marginRate <= 0) {
        return { value: null, missing: true, reason: 'Месячная прибыль ≤ 0' };
      }
      
      return { value: cac.value! / (monthlyRevenue * marginRate), missing: false };
    }

    case 'paybackOrders': {
      const cac = getDerivedMetric(metrics, 'cac');
      const avgCheck = getMetricNumber(metrics, 'avgCheck');
      const margin = getDerivedMetric(metrics, 'profitMargin');
      
      if (cac.missing) {
        return { value: null, missing: true, reason: `CAC: ${cac.reason}` };
      }
      if (avgCheck.missing) {
        return { value: null, missing: true, reason: 'avgCheck не указан' };
      }
      if (margin.missing) {
        return { value: null, missing: true, reason: `Margin: ${margin.reason}` };
      }
      
      const grossMargin = margin.value! / 100;
      if (grossMargin <= 0) {
        return { value: null, missing: true, reason: 'Отрицательная маржа' };
      }
      if (avgCheck.value === 0) {
        return { value: null, missing: true, reason: 'avgCheck = 0' };
      }
      
      return { value: cac.value! / (avgCheck.value! * grossMargin), missing: false };
    }

    default:
      return { value: null, missing: true, reason: `Неизвестная derived метрика: ${key}` };
  }
}

// ============================================================
// EXPECTED ORDERS CALCULATION (E-COMMERCE)
// ============================================================

/**
 * Calculate expected number of orders per customer
 * 
 * ЭВРИСТИКА: expectedOrders = 1 / (1 - repeatRate)
 * При repeatRate = 0%  → 1 покупка
 * При repeatRate = 50% → 2 покупки
 * При repeatRate = 80% → 5 покупок
 * 
 * GUARD: При repeatRate >= 95% формула даёт нереалистичные значения (>20)
 */
export function calculateExpectedOrders(repeatRate: MetricValue): MetricValue {
  if (repeatRate.missing) {
    return { 
      value: 1, 
      missing: false, 
      reason: 'repeatRate не указан, используется fallback = 1' 
    };
  }
  
  const rate = repeatRate.value! / 100;
  
  // Guard: repeatRate >= 100% — невалидные данные
  if (rate >= 1) {
    return { value: null, missing: true, reason: 'repeatRate >= 100% — невалидное значение' };
  }
  
  // Guard: repeatRate >= 95% → cap at 20
  if (rate >= 0.95) {
    return { 
      value: 20,
      missing: false, 
      reason: 'repeatRate >= 95%, используется cap = 20 (эвристика)' 
    };
  }
  
  return { value: 1 / (1 - rate), missing: false };
}

// ============================================================
// CONSISTENCY CHECKS
// ============================================================

function checkFormulaRelationship(
  metrics: Partial<Metrics>,
  relationship: MetricRelationship
): ConsistencyCheckResult {
  const required = relationship.requiredMetrics ?? [relationship.from, relationship.to];
  const missingMetrics: MetricKey[] = [];
  
  // Check all required metrics
  for (const key of required) {
    const isDerived = ['cac', 'cpl', 'profit', 'profitMargin', 'ltvCacRatio', 'breakeven', 'paybackPeriod', 'paybackOrders'].includes(key);
    const value = isDerived 
      ? getDerivedMetric(metrics, key as DerivedMetricKey)
      : getMetricNumber(metrics, key as BaseMetricKey);
    
    if (value.missing) {
      missingMetrics.push(key);
    }
  }
  
  if (missingMetrics.length > 0) {
    return {
      relationshipId: relationship.id,
      status: 'missing',
      message: `Нет данных: ${missingMetrics.join(', ')}`,
      neededMetricsMissing: missingMetrics
    };
  }
  
  // Special case: E-commerce payback
  if (relationship.id === 'ecom_cac_payback') {
    return checkEcomPayback(metrics);
  }
  
  // Special case: Revenue = clients × avgCheck
  if (relationship.id === 'revenue_clients_avgcheck') {
    const revenue = getMetricNumber(metrics, 'revenue');
    const clients = getMetricNumber(metrics, 'totalClients');
    const avgCheck = getMetricNumber(metrics, 'avgCheck');
    
    if (clients.value === 0 || avgCheck.value === 0) {
      return {
        relationshipId: relationship.id,
        status: 'ok',
        message: 'Клиенты или средний чек = 0, проверка пропущена'
      };
    }
    
    const expected = clients.value! * avgCheck.value!;
    const actual = revenue.value!;
    
    if (actual === 0) {
      return {
        relationshipId: relationship.id,
        status: 'missing',
        message: 'Revenue = 0, проверка формулы невозможна'
      };
    }
    
    const diff = Math.abs(expected - actual) / actual;
    
    if (diff <= 0.05) {
      return { relationshipId: relationship.id, status: 'ok', message: 'Формула сходится (±5%)' };
    }
    if (diff <= 0.15) {
      return { 
        relationshipId: relationship.id, 
        status: 'warning', 
        message: `Расхождение ${(diff * 100).toFixed(1)}%`,
        currentValue: actual,
        expectedValue: expected
      };
    }
    return { 
      relationshipId: relationship.id, 
      status: 'contradiction', 
      message: `Критическое расхождение ${(diff * 100).toFixed(1)}%`,
      currentValue: actual,
      expectedValue: expected
    };
  }
  
  // Special case: SaaS churn vs lifetime
  if (relationship.id === 'saas_churn_lifetime') {
    const churn = getMetricNumber(metrics, 'churnRate');
    const lifetime = getMetricNumber(metrics, 'customerLifetimeMonths');
    
    const expectedLifetime = 100 / churn.value!;
    const actualLifetime = lifetime.value!;
    
    // Allow 30% tolerance
    const diff = Math.abs(expectedLifetime - actualLifetime) / expectedLifetime;
    
    if (diff <= 0.3) {
      return { relationshipId: relationship.id, status: 'ok', message: 'Churn и Lifetime согласованы' };
    }
    
    return {
      relationshipId: relationship.id,
      status: 'contradiction',
      message: `Churn ${churn.value}% → ожидаемый lifetime ~${expectedLifetime.toFixed(0)} мес, указано ${actualLifetime}`,
      currentValue: actualLifetime,
      expectedValue: expectedLifetime
    };
  }
  
  // Default: formula check passed
  return {
    relationshipId: relationship.id,
    status: 'ok',
    message: 'Данные согласованы'
  };
}

function checkEcomPayback(metrics: Partial<Metrics>): ConsistencyCheckResult {
  const cac = getDerivedMetric(metrics, 'cac');
  const aov = getMetricNumber(metrics, 'avgCheck');
  const margin = getDerivedMetric(metrics, 'profitMargin');
  const repeatRate = getMetricNumber(metrics, 'repeatRate');
  
  if (cac.missing || aov.missing || margin.missing) {
    const missing: MetricKey[] = [];
    if (cac.missing) missing.push('cac');
    if (aov.missing) missing.push('avgCheck');
    if (margin.missing) missing.push('profitMargin');
    return { 
      relationshipId: 'ecom_cac_payback', 
      status: 'missing', 
      message: `Нет данных: ${missing.join(', ')}`,
      neededMetricsMissing: missing
    };
  }
  
  const grossMargin = margin.value! / 100;
  if (grossMargin <= 0) {
    return { 
      relationshipId: 'ecom_cac_payback', 
      status: 'contradiction', 
      message: 'Отрицательная маржа — модель убыточна' 
    };
  }
  
  if (aov.value === 0) {
    return {
      relationshipId: 'ecom_cac_payback',
      status: 'missing',
      message: 'avgCheck = 0'
    };
  }
  
  const paybackOrders = cac.value! / (aov.value! * grossMargin);
  const expectedOrders = calculateExpectedOrders(repeatRate);
  
  // ФИКС 2: Если repeatRate missing → не может быть ok
  const isIncompleteEstimate = repeatRate.missing;
  
  if (paybackOrders <= expectedOrders.value!) {
    if (isIncompleteEstimate) {
      return {
        relationshipId: 'ecom_cac_payback',
        status: 'warning',
        message: `Окупаемость за ${paybackOrders.toFixed(1)} покупок (оценка неполная: repeatRate не указан)`,
        currentValue: paybackOrders,
        neededMetricsMissing: ['repeatRate']
      };
    }
    
    return {
      relationshipId: 'ecom_cac_payback',
      status: 'ok',
      message: `Окупаемость за ${paybackOrders.toFixed(1)} покупок — в норме`,
      currentValue: paybackOrders
    };
  }
  
  // paybackOrders > expectedOrders
  if (isIncompleteEstimate) {
    return {
      relationshipId: 'ecom_cac_payback',
      status: 'warning',
      message: `CAC окупается за ${paybackOrders.toFixed(1)} покупок, ожидается ~1 (оценка неполная)`,
      currentValue: paybackOrders,
      neededMetricsMissing: ['repeatRate']
    };
  }
  
  const severity = paybackOrders > expectedOrders.value! * 2 ? 'contradiction' : 'warning';
  return {
    relationshipId: 'ecom_cac_payback',
    status: severity as CheckStatus,
    message: `CAC окупается за ${paybackOrders.toFixed(1)} покупок, ожидается ${expectedOrders.value!.toFixed(1)}`,
    currentValue: paybackOrders,
    expectedValue: expectedOrders.value!
  };
}

function checkThresholdRelationship(
  metrics: Partial<Metrics>,
  relationship: MetricRelationship
): ConsistencyCheckResult {
  const isDerived = ['cac', 'cpl', 'profit', 'profitMargin', 'ltvCacRatio', 'breakeven', 'paybackPeriod', 'paybackOrders'].includes(relationship.from);
  const value = isDerived 
    ? getDerivedMetric(metrics, relationship.from as DerivedMetricKey)
    : getMetricNumber(metrics, relationship.from as BaseMetricKey);
  
  if (value.missing) {
    return {
      relationshipId: relationship.id,
      status: 'missing',
      message: value.reason || `${relationship.from} не указан`,
      neededMetricsMissing: [relationship.from]
    };
  }
  
  const v = value.value!;
  const [min, max] = relationship.healthyRange || [0, Infinity];
  const critical = relationship.criticalThreshold;
  
  // Check critical first
  if (critical !== undefined && v < critical) {
    return {
      relationshipId: relationship.id,
      status: 'contradiction',
      message: `${relationship.from} = ${v.toFixed(1)} ниже критического порога ${critical}`,
      currentValue: v
    };
  }
  
  // Check healthy range
  if (v >= min && v <= max) {
    return {
      relationshipId: relationship.id,
      status: 'ok',
      message: `${relationship.from} = ${v.toFixed(1)} в норме (${min}-${max})`,
      currentValue: v
    };
  }
  
  return {
    relationshipId: relationship.id,
    status: 'warning',
    message: `${relationship.from} = ${v.toFixed(1)} вне диапазона ${min}-${max}`,
    currentValue: v
  };
}

function checkRatioRelationship(
  metrics: Partial<Metrics>,
  relationship: MetricRelationship
): ConsistencyCheckResult {
  const isDerived = ['cac', 'cpl', 'profit', 'profitMargin', 'ltvCacRatio', 'breakeven', 'paybackPeriod', 'paybackOrders'].includes(relationship.from);
  const value = isDerived 
    ? getDerivedMetric(metrics, relationship.from as DerivedMetricKey)
    : getMetricNumber(metrics, relationship.from as BaseMetricKey);
  
  if (value.missing) {
    return {
      relationshipId: relationship.id,
      status: 'missing',
      message: value.reason || `${relationship.from} не определён`,
      neededMetricsMissing: [relationship.from]
    };
  }
  
  const v = value.value!;
  const [min, max] = relationship.healthyRange || [0, Infinity];
  const critical = relationship.criticalThreshold;
  
  if (critical !== undefined && v < critical) {
    return {
      relationshipId: relationship.id,
      status: 'contradiction',
      message: `${relationship.from} = ${v.toFixed(2)} ниже критического ${critical}`,
      currentValue: v
    };
  }
  
  if (v >= min && v <= max) {
    return {
      relationshipId: relationship.id,
      status: 'ok',
      message: `${relationship.from} = ${v.toFixed(2)} в здоровом диапазоне`,
      currentValue: v
    };
  }
  
  return {
    relationshipId: relationship.id,
    status: 'warning',
    message: `${relationship.from} = ${v.toFixed(2)} вне оптимума (${min}-${max})`,
    currentValue: v
  };
}

export function validateMetricConsistency(
  metrics: Partial<Metrics>,
  businessType: BusinessType
): ConsistencyCheckResult[] {
  const { primaryRelationships, secondaryRelationships } = getRelationshipsForBusinessType(businessType);
  const allRelationships = [...primaryRelationships, ...secondaryRelationships];
  
  return allRelationships.map(relationship => {
    switch (relationship.type) {
      case 'formula':
        return checkFormulaRelationship(metrics, relationship);
      case 'threshold':
        return checkThresholdRelationship(metrics, relationship);
      case 'ratio':
        return checkRatioRelationship(metrics, relationship);
      case 'constraint':
        return checkFormulaRelationship(metrics, relationship); // Same logic
      case 'correlation':
        // Correlation checks are informational
        return {
          relationshipId: relationship.id,
          status: 'ok' as CheckStatus,
          message: relationship.whyItMatters
        };
      default:
        return {
          relationshipId: relationship.id,
          status: 'ok' as CheckStatus,
          message: 'Проверка не реализована'
        };
    }
  });
}

// ============================================================
// COMPETITOR COMPARISON
// ============================================================

/**
 * Get metric value from competitor, checking both base columns and metrics JSONB
 * Base columns: revenue, marketShare, pricing, quality, marketingSpend
 * All other fields come from the persisted JSONB metrics
 */
function getCompetitorMetricValue(
  competitor: Competitor,
  key: MetricKey
): MetricValue {
  // Base columns in competitors table
  const baseColumns = ['revenue', 'marketShare', 'pricing', 'quality', 'marketingSpend'];
  
  let value: number | null | undefined;
  
  if (baseColumns.includes(key)) {
    // Read from base competitor columns
    value = (competitor as any)[key];
  } else {
    // Read from competitor object (which is populated from JSONB metrics)
    value = (competitor as any)[key];
  }
  
  if (value === undefined || value === null) {
    return { value: null, missing: true, reason: `${key} не указан` };
  }
  
  if (typeof value === 'number') {
    return { value, missing: false };
  }
  
  return { value: null, missing: true, reason: `${key} имеет некорректный тип` };
}

export function compareWithCompetitors(
  myMetrics: Partial<Metrics>,
  competitors: Competitor[],
  businessType: BusinessType
): CompetitorComparisonResult[] {
  const results: CompetitorComparisonResult[] = [];
  const metricsToCompare: MetricKey[] = ['revenue', 'avgCheck', 'conversionRate', 'marketShare', 'quality'];
  
  // Add business-specific metrics
  if (businessType === 'saas') {
    metricsToCompare.push('churnRate', 'nrr');
  } else if (businessType === 'freemium') {
    metricsToCompare.push('freeToPayConversion', 'churnRate');
  } else if (businessType === 'ecommerce') {
    metricsToCompare.push('repeatRate');
  } else if (businessType === 'services') {
    metricsToCompare.push('utilizationRate', 'projectMargin');
  } else if (businessType === 'marketplace' || businessType === 'sharing') {
    metricsToCompare.push('takeRate', 'utilizationRate');
  } else if (businessType === 'production') {
    metricsToCompare.push('repeatRate');
  }
  
  for (const competitor of competitors) {
    for (const key of metricsToCompare) {
      const myValue = getMetricNumber(myMetrics, key as BaseMetricKey);
      const competitorValue = getCompetitorMetricValue(competitor, key);
      
      // Skip if either value is missing
      if (myValue.missing || competitorValue.missing) continue;
      
      // Avoid division by zero
      if (competitorValue.value === 0) continue;
      
      const gap = ((myValue.value! - competitorValue.value!) / competitorValue.value!) * 100;
      
      let insight = '';
      if (gap > 20) {
        insight = `Вы опережаете ${competitor.name} на ${gap.toFixed(0)}%`;
      } else if (gap < -20) {
        insight = `${competitor.name} опережает вас на ${Math.abs(gap).toFixed(0)}%`;
      } else {
        insight = `Примерный паритет с ${competitor.name}`;
      }
      
      results.push({
        competitorId: competitor.id,
        competitorName: competitor.name,
        metricKey: key,
        myValue: myValue.value,
        competitorValue: competitorValue.value,
        gap,
        insight
      });
    }
  }
  
  return results;
}

// ============================================================
// HYPOTHESIS GENERATION
// ============================================================

export function generateHypotheses(
  checks: ConsistencyCheckResult[],
  comparisons: CompetitorComparisonResult[]
): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];
  
  // From contradictions
  const contradictions = checks.filter(c => c.status === 'contradiction');
  for (const c of contradictions) {
    hypotheses.push({
      id: `hyp_${c.relationshipId}`,
      title: 'Критическое несоответствие данных',
      description: c.message,
      relatedChecks: [c.relationshipId],
      priority: 'high'
    });
  }
  
  // From warnings
  const warnings = checks.filter(c => c.status === 'warning');
  for (const w of warnings.slice(0, 3)) {
    hypotheses.push({
      id: `hyp_${w.relationshipId}`,
      title: 'Требует внимания',
      description: w.message,
      relatedChecks: [w.relationshipId],
      priority: 'medium'
    });
  }
  
  // From competitor gaps
  const significantGaps = comparisons.filter(c => c.gap !== null && Math.abs(c.gap) > 30);
  for (const g of significantGaps.slice(0, 2)) {
    hypotheses.push({
      id: `hyp_gap_${g.competitorId}_${g.metricKey}`,
      title: g.gap! > 0 ? 'Конкурентное преимущество' : 'Отставание от конкурента',
      description: g.insight,
      relatedChecks: [],
      priority: g.gap! < -30 ? 'high' : 'low'
    });
  }
  
  return hypotheses;
}

// ============================================================
// MAIN ANALYSIS FUNCTION
// ============================================================

export function analyzeMetrics(
  metrics: Partial<Metrics>,
  competitors: Competitor[],
  businessType: BusinessType
): AnalysisResult {
  const checks = validateMetricConsistency(metrics, businessType);
  const comparisons = compareWithCompetitors(metrics, competitors, businessType);
  const hypotheses = generateHypotheses(checks, comparisons);
  
  return {
    businessType,
    checks,
    comparisons,
    hypotheses,
    summary: {
      totalChecks: checks.length,
      okCount: checks.filter(c => c.status === 'ok').length,
      warningCount: checks.filter(c => c.status === 'warning').length,
      contradictionCount: checks.filter(c => c.status === 'contradiction').length,
      missingCount: checks.filter(c => c.status === 'missing').length
    }
  };
}
