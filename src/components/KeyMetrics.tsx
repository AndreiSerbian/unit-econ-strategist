import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, DollarSign, BarChart3 } from "lucide-react";

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

  return (
    <Card className="bg-gradient-to-br from-accent/5 to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          🎯 Ключевые показатели
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" />
              CAC (Cost per Acquisition)
            </p>
            <p className="text-xl font-bold font-mono text-primary">
              {calculateCAC().toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
            </p>
            <p className="text-xs text-muted-foreground">Стоимость привлечения клиента</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              CPL (Cost per Lead)
            </p>
            <p className="text-xl font-bold font-mono text-secondary">
              {calculateCPL().toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
            </p>
            <p className="text-xs text-muted-foreground">Стоимость лида</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Точка безубыточности
            </p>
            <p className="text-xl font-bold font-mono text-accent">
              {calculateBreakeven().toLocaleString("ru-RU", { maximumFractionDigits: 0 })} кл.
            </p>
            <p className="text-xs text-muted-foreground">Клиентов для окупаемости</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Прибыль на оплату
            </p>
            <p className="text-xl font-bold font-mono text-success">
              {calculateProfitPerPayment().toLocaleString("ru-RU", { maximumFractionDigits: 0 })}{" "}
              {currency}
            </p>
            <p className="text-xs text-muted-foreground">
              Маржа: {calculateProfitMargin().toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
