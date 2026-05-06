import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Percent, AlertTriangle } from 'lucide-react';
import { MetricValidationBadge } from '@/components/ui/metric-validation-badge';
import { useTranslation } from '@/i18n/useTranslation';
import type { ProductKPIs } from './types';

interface SaasKpiCardsProps {
  kpis: ProductKPIs;
  currency: string;
}

export function SaasKpiCards({ kpis, currency }: SaasKpiCardsProps) {
  const { t } = useTranslation();
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
  };

  const marginWarning = kpis.grossMarginPercent < 0
    ? { severity: 'error' as const, message: t('saasKpi.negativeMargin') }
    : kpis.grossMarginPercent < 10 && kpis.totalRevenue > 0
    ? { severity: 'warning' as const, message: t('saasKpi.lowMargin') }
    : null;

  const cards = [
    { label: t('saasKpi.subscriptionMRR'), value: kpis.subscriptionMRR, icon: TrendingUp, colorClass: 'text-primary', bgClass: 'bg-primary/10', suffix: currency },
    { label: t('saasKpi.oneTimeRevenue'), value: kpis.oneTimeRevenue, icon: ShoppingCart, colorClass: 'text-accent-foreground', bgClass: 'bg-accent', suffix: currency },
    { label: t('saasKpi.totalRevenue'), value: kpis.totalRevenue, icon: DollarSign, colorClass: 'text-primary', bgClass: 'bg-primary/10', suffix: currency },
    { label: t('saasKpi.variableCosts'), value: kpis.totalVariableCost, icon: TrendingDown, colorClass: 'text-destructive', bgClass: 'bg-destructive/10', suffix: currency },
    { label: t('saasKpi.grossProfit'), value: kpis.grossProfit, icon: TrendingUp, colorClass: kpis.grossProfit >= 0 ? 'text-primary' : 'text-destructive', bgClass: kpis.grossProfit >= 0 ? 'bg-primary/10' : 'bg-destructive/10', suffix: currency },
    { label: t('saasKpi.margin'), value: kpis.grossMarginPercent, icon: Percent, colorClass: kpis.grossMarginPercent >= 0 ? 'text-primary' : 'text-destructive', bgClass: kpis.grossMarginPercent >= 0 ? 'bg-primary/10' : 'bg-destructive/10', suffix: '%', decimals: 1 },
  ];

  const userCards = [
    { label: t('saasKpi.paidSubscribers'), value: kpis.totalSubscribers, icon: Users, colorClass: 'text-primary' },
    { label: t('saasKpi.freeUsers'), value: kpis.totalFreeTierUsers, icon: Users, colorClass: 'text-muted-foreground' },
    { label: t('saasKpi.oneTimeBuyers'), value: kpis.totalBuyers, icon: ShoppingCart, colorClass: 'text-accent-foreground' },
  ];

  return (
    <div className="space-y-4">
      {/* Margin warning */}
      {marginWarning && (
        <MetricValidationBadge 
          severity={marginWarning.severity} 
          message={marginWarning.message} 
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => (
          <Card key={card.label} className={`${card.bgClass} border-0`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <card.icon className={`w-4 h-4 ${card.colorClass}`} />
                <span className="text-xs text-muted-foreground truncate">{card.label}</span>
              </div>
              <p className={`text-lg font-semibold font-mono ${card.colorClass}`}>
                {formatCurrency(card.decimals ? parseFloat(card.value.toFixed(card.decimals)) : card.value)}
                <span className="text-xs ml-1">{card.suffix}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {userCards.map((card) => (
          <Card key={card.label} className="bg-muted/30 border-0">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <card.icon className={`w-4 h-4 ${card.colorClass}`} />
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-lg font-semibold font-mono">
                {card.value.toLocaleString('ru-RU')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
