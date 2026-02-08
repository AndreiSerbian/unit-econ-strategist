import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Percent, AlertTriangle } from 'lucide-react';
import { MetricValidationBadge } from '@/components/ui/metric-validation-badge';
import type { ProductKPIs } from './types';

interface SaasKpiCardsProps {
  kpis: ProductKPIs;
  currency: string;
}

export function SaasKpiCards({ kpis, currency }: SaasKpiCardsProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
  };

  // Margin validation
  const marginWarning = kpis.grossMarginPercent < 0 
    ? { severity: 'error' as const, message: 'Отрицательная маржа — убыточная модель' }
    : kpis.grossMarginPercent < 10 && kpis.totalRevenue > 0
    ? { severity: 'warning' as const, message: 'Низкая маржа (<10%)' }
    : null;

  const cards = [
    {
      label: 'MRR подписок',
      value: kpis.subscriptionMRR,
      icon: TrendingUp,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10',
      suffix: currency,
    },
    {
      label: 'Разовые продажи',
      value: kpis.oneTimeRevenue,
      icon: ShoppingCart,
      colorClass: 'text-accent-foreground',
      bgClass: 'bg-accent',
      suffix: currency,
    },
    {
      label: 'Общая выручка',
      value: kpis.totalRevenue,
      icon: DollarSign,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10',
      suffix: currency,
    },
    {
      label: 'Переменные расходы',
      value: kpis.totalVariableCost,
      icon: TrendingDown,
      colorClass: 'text-destructive',
      bgClass: 'bg-destructive/10',
      suffix: currency,
    },
    {
      label: 'Валовая прибыль',
      value: kpis.grossProfit,
      icon: TrendingUp,
      colorClass: kpis.grossProfit >= 0 ? 'text-primary' : 'text-destructive',
      bgClass: kpis.grossProfit >= 0 ? 'bg-primary/10' : 'bg-destructive/10',
      suffix: currency,
    },
    {
      label: 'Маржа',
      value: kpis.grossMarginPercent,
      icon: Percent,
      colorClass: kpis.grossMarginPercent >= 0 ? 'text-primary' : 'text-destructive',
      bgClass: kpis.grossMarginPercent >= 0 ? 'bg-primary/10' : 'bg-destructive/10',
      suffix: '%',
      decimals: 1,
    },
  ];

  const userCards = [
    {
      label: 'Платных подписчиков',
      value: kpis.totalSubscribers,
      icon: Users,
      colorClass: 'text-primary',
    },
    {
      label: 'Бесплатных пользователей',
      value: kpis.totalFreeTierUsers,
      icon: Users,
      colorClass: 'text-muted-foreground',
    },
    {
      label: 'Разовых покупателей',
      value: kpis.totalBuyers,
      icon: ShoppingCart,
      colorClass: 'text-accent-foreground',
    },
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
