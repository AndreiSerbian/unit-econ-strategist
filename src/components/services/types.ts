// Types for Services v2 module

export type BillingModel = 'fixed_project' | 'hourly' | 'retainer';
export type PlanningPeriod = 'week' | 'month' | 'quarter' | 'year';

export interface ServiceProduct {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number; // projects count for fixed_project
  
  // Existing fields
  hourlyRate?: number | null;
  hoursPerWeek?: number | null;
  utilization?: number | null; // legacy, mapped to billablePercent
  
  // New v2 fields
  billingModel?: BillingModel;
  planningPeriod?: PlanningPeriod;
  estimatedHoursPerProject?: number | null;
  plannedBillableHoursPerPeriod?: number | null;
  billablePercent?: number | null;
  allocationPercent?: number | null;
  retainerFee?: number | null;
  clientsCount?: number | null;
}

export interface ServiceCalculatedMetrics {
  billableHoursWeek: number;
  billableHoursPeriod: number;
  weeksPerPeriod: number;
  durationWeeksPerProject: number | null;
  maxProjectsPerPeriod: number | null;
  effectiveHourlyRate: number | null;
  revenuePeriod: number | null;
  isOverloaded: boolean;
  hasInsufficientData: boolean;
}

// Utility constants
export const WEEKS_PER_PERIOD: Record<PlanningPeriod, number> = {
  week: 1,
  month: 4.33,
  quarter: 13,
  year: 52,
};

export const PERIOD_LABELS: Record<PlanningPeriod, string> = {
  week: 'нед',
  month: 'мес',
  quarter: 'кв',
  year: 'год',
};

export const BILLING_MODEL_OPTIONS = [
  { value: 'fixed_project' as const, label: 'Фикс проект' },
  { value: 'hourly' as const, label: 'Почасовая' },
  { value: 'retainer' as const, label: 'Ретейнер' },
];

export const PLANNING_PERIOD_OPTIONS = [
  { value: 'week' as const, label: 'Неделя' },
  { value: 'month' as const, label: 'Месяц' },
  { value: 'quarter' as const, label: 'Квартал' },
  { value: 'year' as const, label: 'Год' },
];
