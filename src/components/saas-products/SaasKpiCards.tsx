import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Percent } from 'lucide-react';
import type { ProductKPIs } from './types';

interface SaasKpiCardsProps {
  kpis: ProductKPIs;
  currency: string;
}

export function SaasKpiCards({ kpis, currency }: SaasKpiCardsProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
  };

  const cards = [
    {
      label: 'MRR подписок',
      value: kpis.subscriptionMRR,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      suffix: currency,
    },
    {
      label: 'Разовые продажи',
      value: kpis.oneTimeRevenue,
      icon: ShoppingCart,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      suffix: currency,
    },
    {
      label: 'Общая выручка',
      value: kpis.totalRevenue,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      suffix: currency,
    },
    {
      label: 'Переменные расходы',
      value: kpis.totalVariableCost,
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      suffix: currency,
    },
    {
      label: 'Валовая прибыль',
      value: kpis.grossProfit,
      icon: TrendingUp,
      color: kpis.grossProfit >= 0 ? 'text-emerald-500' : 'text-red-500',
      bgColor: kpis.grossProfit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10',
      suffix: currency,
    },
    {
      label: 'Маржа',
      value: kpis.grossMarginPercent,
      icon: Percent,
      color: kpis.grossMarginPercent >= 0 ? 'text-teal-500' : 'text-red-500',
      bgColor: kpis.grossMarginPercent >= 0 ? 'bg-teal-500/10' : 'bg-red-500/10',
      suffix: '%',
      decimals: 1,
    },
  ];

  const userCards = [
    {
      label: 'Платных подписчиков',
      value: kpis.totalSubscribers,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Бесплатных пользователей',
      value: kpis.totalFreeTierUsers,
      icon: Users,
      color: 'text-gray-500',
    },
    {
      label: 'Разовых покупателей',
      value: kpis.totalBuyers,
      icon: ShoppingCart,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => (
          <Card key={card.label} className={`${card.bgColor} border-0`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <card.icon className={`w-4 h-4 ${card.color}`} />
                <span className="text-xs text-muted-foreground truncate">{card.label}</span>
              </div>
              <p className={`text-lg font-semibold font-mono ${card.color}`}>
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
                <card.icon className={`w-4 h-4 ${card.color}`} />
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
