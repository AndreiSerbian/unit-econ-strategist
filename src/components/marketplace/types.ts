// Marketplace V2 Types

export type PlanningPeriod = 'week' | 'month' | 'quarter' | 'year';

export interface MarketplaceCategory {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  transactionsCount: number;
  avgCheck: number;
  gmvComputed: number;
  gmvOverride?: number | null;
  takeRatePercent: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryChannelStats {
  id: string;
  categoryId: string;
  channelId: string;
  transactionsPerPeriod?: number | null;
  sharePercent?: number | null;
  takeRateOverridePercent?: number | null;
  isActive: boolean;
}

export type DataStatus = 'ok' | 'not_enough_data' | 'mismatch' | 'shares_overflow';

export const getPeriodLabel = (period: PlanningPeriod): string => {
  switch (period) {
    case 'week': return 'неделю';
    case 'month': return 'месяц';
    case 'quarter': return 'квартал';
    case 'year': return 'год';
  }
};

export const getPeriodLabelShort = (period: PlanningPeriod): string => {
  switch (period) {
    case 'week': return 'нед';
    case 'month': return 'мес';
    case 'quarter': return 'кв';
    case 'year': return 'год';
  }
};
