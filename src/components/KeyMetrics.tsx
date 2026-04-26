import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, DollarSign, BarChart3 } from "lucide-react";
import { MetricInfoTooltip } from "@/components/ui/metric-info-tooltip";

interface DetailedExpenses {
  fixedCosts: {
    salaryOldClients: number;
    salaryNewClients: number;
    officeRent: number;
    warehouseRent: number;
    managementSalary: number;
    marketingSalary: number;
    productionSalary: number;
    internet: number;
    communication: number;
    banking: number;
    subscriptions: number;
    utilities: number;
    customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
  };
  variableCosts: {
    marketing: {
      trafficPurchase: number;
      contractorsPayment: number;
      crmCosts: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    salesPayroll: {
      bonusOldClients: number;
      bonusNewClients: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    production: {
      materials: number;
      curators: number;
      logistics: number;
      partnersPercent: number;
      equipmentRepair: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    other: {
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
  };
  taxRate: number;
  taxes: number;
}

interface Metrics {
  revenue: number;
  totalClients: number;
  newClients: number;
  returningClients: number;
  conversionRate: number;
  avgCheck: number;
  fixedCosts: number;
  variableCosts: number;
  marketingCosts: number;
  detailedExpenses?: DetailedExpenses;
  customerLifetimeMonths?: number;
  purchaseFrequency?: number;
}

interface KeyMetricsProps {
  metrics: Metrics;
  currency: string;
}

export const KeyMetrics = ({ metrics, currency }: KeyMetricsProps) => {
  const calculateCAC = () => {
    if (!metrics.detailedExpenses || metrics.newClients === 0) return 0;

    const marketing =
      metrics.detailedExpenses.variableCosts.marketing.trafficPurchase +
      metrics.detailedExpenses.variableCosts.marketing.contractorsPayment +
      metrics.detailedExpenses.variableCosts.marketing.crmCosts +
      metrics.detailedExpenses.variableCosts.marketing.customCategories.reduce(
        (sum, c) => sum + c.value,
        0
      );

    const salesCost =
      metrics.detailedExpenses.variableCosts.salesPayroll.bonusNewClients +
      metrics.detailedExpenses.variableCosts.salesPayroll.customCategories.reduce(
        (sum, c) => sum + c.value,
        0
      );

    return (marketing + salesCost) / metrics.newClients;
  };

  const calculateCPL = () => {
    if (!metrics.detailedExpenses) return 0;

    const marketing =
      metrics.detailedExpenses.variableCosts.marketing.trafficPurchase +
      metrics.detailedExpenses.variableCosts.marketing.contractorsPayment +
      metrics.detailedExpenses.variableCosts.marketing.crmCosts +
      metrics.detailedExpenses.variableCosts.marketing.customCategories.reduce(
        (sum, c) => sum + c.value,
        0
      );

    const leads = metrics.newClients / (metrics.conversionRate / 100 || 1);
    return leads > 0 ? marketing / leads : 0;
  };

  const calculateBreakeven = () => {
    if (!metrics.detailedExpenses) return 0;

    const fixedTotal =
      metrics.detailedExpenses.fixedCosts.salaryOldClients +
      metrics.detailedExpenses.fixedCosts.salaryNewClients +
      metrics.detailedExpenses.fixedCosts.officeRent +
      metrics.detailedExpenses.fixedCosts.warehouseRent +
      metrics.detailedExpenses.fixedCosts.managementSalary +
      metrics.detailedExpenses.fixedCosts.marketingSalary +
      metrics.detailedExpenses.fixedCosts.productionSalary +
      metrics.detailedExpenses.fixedCosts.internet +
      metrics.detailedExpenses.fixedCosts.communication +
      metrics.detailedExpenses.fixedCosts.banking +
      metrics.detailedExpenses.fixedCosts.subscriptions +
      metrics.detailedExpenses.fixedCosts.utilities +
      metrics.detailedExpenses.fixedCosts.customCategories.reduce((sum, c) => sum + c.value, 0);

    const variablePerClient = metrics.totalClients > 0 ? metrics.variableCosts / metrics.totalClients : 0;
    const contribution = metrics.avgCheck - variablePerClient;

    return contribution > 0 ? fixedTotal / contribution : 0;
  };

  const calculateProfitPerPayment = () => {
    if (metrics.totalClients === 0) return 0;
    const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
    const profit = metrics.revenue - totalCosts;
    return profit / metrics.totalClients;
  };

  const calculateProfitMargin = () => {
    if (metrics.revenue === 0) return 0;
    const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
    const profit = metrics.revenue - totalCosts;
    return (profit / metrics.revenue) * 100;
  };

  const hasLTVData = metrics.customerLifetimeMonths && metrics.purchaseFrequency;
  const calculateLTV = () => {
    if (!hasLTVData) return 0;
    return metrics.avgCheck * metrics.purchaseFrequency! * metrics.customerLifetimeMonths!;
  };

  const calculateLTVCACRatio = () => {
    const cac = calculateCAC();
    const ltv = calculateLTV();
    if (cac === 0) return 0;
    return ltv / cac;
  };

  return (
    <Card className="bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          🎯 Ключевые показатели
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-2 sm:grid-cols-2 ${hasLTVData ? 'lg:grid-cols-6' : 'lg:grid-cols-4'} gap-3 sm:gap-4`}>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>CAC</span>
              <MetricInfoTooltip metricKey="cac" />
            </p>
            <p className="text-lg sm:text-xl font-bold font-mono text-primary">
              {calculateCAC().toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Стоимость привлечения</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>CPL</span>
              <MetricInfoTooltip metricKey="cpl" />
            </p>
            <p className="text-lg sm:text-xl font-bold font-mono text-secondary">
              {calculateCPL().toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Стоимость лида</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              <span>Безубыточность</span>
              <MetricInfoTooltip metricKey="breakeven" />
            </p>
            <p className="text-lg sm:text-xl font-bold font-mono text-accent">
              {calculateBreakeven().toLocaleString("ru-RU", { maximumFractionDigits: 0 })} кл.
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Клиентов для окупаемости</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span>Прибыль</span>
              <MetricInfoTooltip metricKey="profitPerClient" />
            </p>
            <p className="text-lg sm:text-xl font-bold font-mono text-success">
              {calculateProfitPerPayment().toLocaleString("ru-RU", { maximumFractionDigits: 0 })}{" "}
              {currency}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Маржа: {calculateProfitMargin().toFixed(1)}%
            </p>
          </div>

          {hasLTVData && (
            <>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>LTV</span>
                  <MetricInfoTooltip metricKey="ltv" />
                </p>
                <p className="text-lg sm:text-xl font-bold font-mono text-primary">
                  {calculateLTV().toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Ценность клиента</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>LTV/CAC</span>
                  <MetricInfoTooltip metricKey="ltvCac" />
                </p>
                <p className={`text-lg sm:text-xl font-bold font-mono ${
                  calculateLTVCACRatio() < 1 ? 'text-destructive' : 
                  calculateLTVCACRatio() < 3 ? 'text-warning' : 'text-success'
                }`}>
                  {calculateLTVCACRatio().toFixed(2)}x
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Эффективность</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
