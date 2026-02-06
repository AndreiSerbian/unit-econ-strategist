import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Package, Truck } from "lucide-react";
import type { ProductDistributionV2, SalesChannelV2, ProductChannelV2, PlanningPeriod } from "./types";
import { calculateChannelRevenue, getPeriodLabel, getPeriodMultiplier } from "./types";

interface NetRevenueSummaryProps {
  products: ProductDistributionV2[];
  channels: SalesChannelV2[];
  productChannels: ProductChannelV2[];
  planningPeriod: PlanningPeriod;
  currency: string;
}

export const NetRevenueSummary = ({
  products,
  channels,
  productChannels,
  planningPeriod,
  currency,
}: NetRevenueSummaryProps) => {
  const summary = useMemo(() => {
    let grossRevenue = 0;
    let netRevenue = 0;
    let totalUnits = 0;
    let totalDeliveryCost = 0;

    for (const product of products) {
      const linkedChannels = productChannels.filter(pc => pc.productId === product.id && pc.isActive);
      
      for (const link of linkedChannels) {
        const channel = channels.find(c => c.id === link.channelId);
        if (!channel || !channel.isActive) continue;
        
        const calculation = calculateChannelRevenue(product, channel, link, planningPeriod);
        const priceEffective = link.priceOverride ?? product.price;
        
        grossRevenue += priceEffective * calculation.expectedUnitsSold;
        netRevenue += calculation.revenueChannel;
        totalUnits += calculation.netUnits;
      }
      
      // Add delivery cost (only for sold units)
      const soldUnits = linkedChannels.reduce((sum, link) => {
        const channel = channels.find(c => c.id === link.channelId);
        if (!channel || !channel.isActive) return sum;
        const calc = calculateChannelRevenue(product, channel, link, planningPeriod);
        return sum + calc.netUnits;
      }, 0);
      
      totalDeliveryCost += soldUnits * (product.effectiveDeliveryCost || 0);
    }

    const netAfterDelivery = netRevenue - totalDeliveryCost;
    const margin = grossRevenue > 0 ? (netAfterDelivery / grossRevenue) * 100 : 0;

    return {
      grossRevenue,
      netRevenue,
      netAfterDelivery,
      totalDeliveryCost,
      totalUnits,
      margin,
    };
  }, [products, channels, productChannels, planningPeriod]);

  const periodMultiplier = getPeriodMultiplier(planningPeriod);
  const annualized = summary.netAfterDelivery * periodMultiplier;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-4 h-4 text-primary" />
          Сводка: Net Revenue за {getPeriodLabel(planningPeriod)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Gross Revenue</p>
            <p className="font-mono font-bold text-lg">
              {summary.grossRevenue.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-muted-foreground">{currency}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Net Revenue
            </p>
            <p className="font-mono font-bold text-lg text-primary">
              {summary.netRevenue.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-muted-foreground">после комиссий/скидок/возвратов</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Доставка
            </p>
            <p className="font-mono font-bold text-lg text-destructive">
              -{summary.totalDeliveryCost.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-muted-foreground">{currency}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Net - Доставка</p>
            <p className="font-mono font-bold text-lg text-accent">
              {summary.netAfterDelivery.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Маржа: {summary.margin.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Продано единиц</p>
              <p className="font-mono font-medium">
                {summary.totalUnits.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Годовой прогноз (×{periodMultiplier})</p>
            <p className="font-mono font-medium text-primary">
              {annualized.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} {currency}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
