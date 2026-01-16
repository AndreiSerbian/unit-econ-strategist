import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, DollarSign, Users, Percent, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { LeadSource } from "@/hooks/useProject";

interface MarketingMetricsProps {
  marketingCosts: number;
  totalLeads: number;
  totalClients: number;
  newClients: number;
  conversionRate: number;
  revenue: number;
  leadSources: LeadSource[];
  currency: string;
  // From detailed expenses
  trafficPurchase?: number;
  contractorsPayment?: number;
  crmCosts?: number;
  marketingSalary?: number;
}

export const MarketingMetrics = memo(({
  marketingCosts,
  totalLeads,
  totalClients,
  newClients,
  conversionRate,
  revenue,
  leadSources,
  currency,
  trafficPurchase = 0,
  contractorsPayment = 0,
  crmCosts = 0,
  marketingSalary = 0,
}: MarketingMetricsProps) => {
  const metrics = useMemo(() => {
    // CPL - Cost Per Lead
    const cpl = totalLeads > 0 ? marketingCosts / totalLeads : 0;
    
    // CAC - Customer Acquisition Cost
    const cac = newClients > 0 ? marketingCosts / newClients : 0;
    
    // ROAS - Return on Ad Spend (только платный трафик)
    const paidCosts = leadSources
      .filter(s => s.type === 'paid')
      .reduce((sum, s) => sum + s.cost, 0);
    const paidLeads = leadSources
      .filter(s => s.type === 'paid')
      .reduce((sum, s) => sum + s.leads, 0);
    const paidConversionEstimate = totalLeads > 0 ? (paidLeads / totalLeads) * totalClients : 0;
    const paidRevenue = totalClients > 0 ? (paidConversionEstimate / totalClients) * revenue : 0;
    const roas = paidCosts > 0 ? paidRevenue / paidCosts : 0;
    
    // Marketing ROI
    const marketingRoi = marketingCosts > 0 ? ((revenue - marketingCosts) / marketingCosts) * 100 : 0;
    
    // Cost breakdown
    const totalVariableMarketing = trafficPurchase + contractorsPayment + crmCosts;
    const totalFixedMarketing = marketingSalary;
    
    return {
      cpl,
      cac,
      roas,
      marketingRoi,
      totalVariableMarketing,
      totalFixedMarketing,
      paidCosts,
    };
  }, [marketingCosts, totalLeads, totalClients, newClients, revenue, leadSources, trafficPurchase, contractorsPayment, crmCosts, marketingSalary]);

  // Source breakdown
  const sourceBreakdown = useMemo(() => {
    const grouped = {
      paid: { leads: 0, cost: 0 },
      organic: { leads: 0, cost: 0 },
      referral: { leads: 0, cost: 0 },
      direct: { leads: 0, cost: 0 },
    };
    
    leadSources.forEach(source => {
      grouped[source.type].leads += source.leads;
      grouped[source.type].cost += source.cost;
    });
    
    return grouped;
  }, [leadSources]);

  const formatNumber = (value: number) => value.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Маркетинговые метрики
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">CPL</span>
            </div>
            <p className="text-xl font-bold font-mono text-blue-500">
              {formatNumber(metrics.cpl)} {currency}
            </p>
            <p className="text-[10px] text-muted-foreground">Стоимость лида</p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">CAC</span>
            </div>
            <p className="text-xl font-bold font-mono text-purple-500">
              {formatNumber(metrics.cac)} {currency}
            </p>
            <p className="text-[10px] text-muted-foreground">Стоимость клиента</p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">ROAS</span>
            </div>
            <p className="text-xl font-bold font-mono text-green-500">
              {metrics.roas.toFixed(2)}x
            </p>
            <p className="text-[10px] text-muted-foreground">Возврат на рекламу</p>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Marketing ROI</span>
            </div>
            <p className={`text-xl font-bold font-mono ${metrics.marketingRoi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {metrics.marketingRoi.toFixed(0)}%
            </p>
            <p className="text-[10px] text-muted-foreground">Окупаемость маркетинга</p>
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-3">Структура расходов</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Закуп трафика</span>
                <span className="font-mono">{formatNumber(trafficPurchase)} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Подрядчики</span>
                <span className="font-mono">{formatNumber(contractorsPayment)} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CRM и инструменты</span>
                <span className="font-mono">{formatNumber(crmCosts)} {currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ЗП маркетинга (фикс)</span>
                <span className="font-mono">{formatNumber(marketingSalary)} {currency}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between text-sm font-medium">
                <span>Итого маркетинг</span>
                <span className="font-mono text-primary">{formatNumber(marketingCosts)} {currency}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-3">Источники трафика</p>
            <div className="space-y-2">
              {Object.entries(sourceBreakdown).map(([type, data]) => {
                const label = { paid: 'Платный', organic: 'Органика', referral: 'Реферал', direct: 'Прямой' }[type];
                const cplBySource = data.leads > 0 ? data.cost / data.leads : 0;
                
                if (data.leads === 0) return null;
                
                return (
                  <div key={type} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        type === 'paid' ? 'bg-red-500' :
                        type === 'organic' ? 'bg-green-500' :
                        type === 'referral' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono">{data.leads.toLocaleString()} лидов</span>
                      {data.cost > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (CPL: {formatNumber(cplBySource)})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conversion funnel mini */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-2xl font-bold font-mono">{totalLeads.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Лидов</p>
            </div>
            <ArrowUpRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-center flex-1">
              <p className="text-2xl font-bold font-mono text-primary">{conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Конверсия</p>
            </div>
            <ArrowUpRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-center flex-1">
              <p className="text-2xl font-bold font-mono text-green-500">{totalClients.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Клиентов</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MarketingMetrics.displayName = "MarketingMetrics";
