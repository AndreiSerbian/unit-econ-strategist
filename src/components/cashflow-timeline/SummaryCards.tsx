import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { TimelineSummary, PlanningPeriod } from './types';
import { useTranslation } from '@/i18n/useTranslation';

interface SummaryCardsProps {
  summary: TimelineSummary;
  currency: string;
  planningPeriod: PlanningPeriod;
  hasData: boolean;
}

const formatCurrency = (value: number, currency: string, locale: string) => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M ${currency}`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}K ${currency}`;
  }
  return `${value.toLocaleString(locale, { maximumFractionDigits: 0 })} ${currency}`;
};

export const SummaryCards = memo(({ summary, currency, planningPeriod, hasData }: SummaryCardsProps) => {
  const { t, language } = useTranslation();
  const locale = language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US';

  const isPositiveNPV = summary.npv >= 0;
  const isPositiveNet = summary.netCashFlow >= 0;

  if (!hasData) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            <p className="text-muted-foreground">{t('cashFlow.notEnoughData')}</p>
            <p className="text-xs text-muted-foreground max-w-[300px]">
              {t('cashFlow.notEnoughDataHint')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const periodShortKey =
    planningPeriod === 'week'
      ? 'cashFlowPeriods.weekShort'
      : planningPeriod === 'month'
      ? 'cashFlowPeriods.monthShort'
      : planningPeriod === 'quarter'
      ? 'cashFlowPeriods.quarterShort'
      : 'cashFlowPeriods.yearShort';

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {/* Total Inflow */}
      <Card className="bg-success/5 border-success/20">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 text-success mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">{t('cashFlow.inflow')}</span>
          </div>
          <p className="text-lg font-bold text-success">
            {formatCurrency(summary.totalInflow, currency, locale)}
          </p>
        </CardContent>
      </Card>

      {/* Total Outflow */}
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 text-destructive mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">{t('cashFlow.outflow')}</span>
          </div>
          <p className="text-lg font-bold text-destructive">
            {formatCurrency(summary.totalOutflow, currency, locale)}
          </p>
        </CardContent>
      </Card>

      {/* Net Cash Flow */}
      <Card className={isPositiveNet ? 'bg-primary/5 border-primary/20' : 'bg-destructive/5 border-destructive/20'}>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">{t('cashFlow.netCashFlow')}</span>
          </div>
          <p className={`text-lg font-bold ${isPositiveNet ? 'text-primary' : 'text-destructive'}`}>
            {formatCurrency(summary.netCashFlow, currency, locale)}
          </p>
        </CardContent>
      </Card>

      {/* NPV */}
      <Card className={isPositiveNPV ? 'bg-accent/10 border-accent/30' : 'bg-destructive/5 border-destructive/20'}>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-4 h-4" />
            <span className="text-xs font-medium">{t('cashFlow.npv')}</span>
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              PV
            </Badge>
          </div>
          <p className={`text-lg font-bold ${isPositiveNPV ? 'text-accent-foreground' : 'text-destructive'}`}>
            {formatCurrency(summary.npv, currency, locale)}
          </p>
        </CardContent>
      </Card>

      {/* Payback Period */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">{t('cashFlow.payback')}</span>
          </div>
          <p className="text-lg font-bold">
            {summary.paybackPeriod !== undefined
              ? t('cashFlow.paybackUnit', {
                  value: summary.paybackPeriod + 1,
                  unit: t(periodShortKey),
                })
              : '—'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

SummaryCards.displayName = 'SummaryCards';
