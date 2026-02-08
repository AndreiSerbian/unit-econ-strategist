// Types for Cash Flow Timeline module

export type PlanningPeriod = 'week' | 'month' | 'quarter' | 'year';
export type ScenarioType = 'current' | 'optimistic' | 'pessimistic';
export type LineType = 'inflow' | 'outflow';
export type LineCategory = 'revenue' | 'cogs' | 'logistics' | 'fees' | 'refunds' | 'marketing' | 'salaries' | 'rent' | 'taxes' | 'other';
export type LineSource = 'manual' | 'linked';
export type SourceAdapter = 'marketplace' | 'ecommerce' | 'services' | 'saas' | 'sharing' | null;

export interface CashFlowTimeline {
  id: string;
  projectId: string;
  scenarioType: ScenarioType;
  name: string;
  planningPeriod: PlanningPeriod;
  horizonPeriods: number;
  discountRateAnnual: number;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CashFlowLine {
  id: string;
  timelineId: string;
  name: string;
  lineType: LineType;
  category: LineCategory;
  source: LineSource;
  sourceAdapter?: SourceAdapter;
  formulaConfig?: Record<string, any>;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed / joined
  points?: CashFlowPoint[];
}

export interface CashFlowPoint {
  id: string;
  lineId: string;
  periodIndex: number;
  amount: number;
  isOverride: boolean;
  notes?: string;
  createdAt: string;
}

// Computed metrics per period
export interface PeriodMetrics {
  periodIndex: number;
  periodLabel: string;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  presentValue: number;
}

// Summary metrics
export interface TimelineSummary {
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  npv: number;
  irr?: number; // Optional, complex to compute
  paybackPeriod?: number;
}

// Adapter output format
export interface AdapterLine {
  name: string;
  lineType: LineType;
  category: LineCategory;
  values: number[]; // One value per period
  sourceAdapter: SourceAdapter;
}

// Period labels
export const PERIOD_LABELS: Record<PlanningPeriod, string> = {
  week: 'Неделя',
  month: 'Месяц',
  quarter: 'Квартал',
  year: 'Год',
};

// Category labels
export const CATEGORY_LABELS: Record<LineCategory, string> = {
  revenue: 'Выручка',
  cogs: 'Себестоимость',
  logistics: 'Логистика',
  fees: 'Комиссии',
  refunds: 'Возвраты',
  marketing: 'Маркетинг',
  salaries: 'ФОТ',
  rent: 'Аренда',
  taxes: 'Налоги',
  other: 'Прочее',
};

// Helper: Convert annual discount rate to period rate
export function getPeriodicRate(annualRate: number, period: PlanningPeriod): number {
  const periodsPerYear: Record<PlanningPeriod, number> = {
    week: 52,
    month: 12,
    quarter: 4,
    year: 1,
  };
  const n = periodsPerYear[period];
  // r_period = (1 + r_annual)^(1/n) - 1
  return Math.pow(1 + annualRate / 100, 1 / n) - 1;
}

// Helper: Compute present value
export function computePresentValue(amount: number, periodIndex: number, periodRate: number): number {
  if (periodRate <= 0) return amount;
  return amount / Math.pow(1 + periodRate, periodIndex);
}

// Helper: Generate period labels
export function generatePeriodLabels(
  period: PlanningPeriod, 
  horizonPeriods: number, 
  startDate?: string
): string[] {
  const labels: string[] = [];
  const start = startDate ? new Date(startDate) : new Date();
  
  for (let i = 0; i < horizonPeriods; i++) {
    if (period === 'week') {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + i * 7);
      labels.push(`W${i + 1}`);
    } else if (period === 'month') {
      const monthDate = new Date(start);
      monthDate.setMonth(start.getMonth() + i);
      labels.push(monthDate.toLocaleString('ru-RU', { month: 'short' }));
    } else if (period === 'quarter') {
      labels.push(`Q${i + 1}`);
    } else {
      labels.push(`Y${i + 1}`);
    }
  }
  
  return labels;
}

// Helper: Convert payment delay days to period shift
export function paymentDelayToPeriodShift(delayDays: number, period: PlanningPeriod): number {
  const daysPerPeriod: Record<PlanningPeriod, number> = {
    week: 7,
    month: 30,
    quarter: 90,
    year: 365,
  };
  return Math.round(delayDays / daysPerPeriod[period]);
}
