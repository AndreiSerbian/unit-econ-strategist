import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Target, BarChart3, DollarSign } from "lucide-react";

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

interface KeyMetricsComparisonProps {
  currentMetrics: Metrics;
  scenarioA: Metrics;
  scenarioB: Metrics;
  currency: string;
}

export const KeyMetricsComparison = ({
  currentMetrics,
  scenarioA,
  scenarioB,
  currency,
}: KeyMetricsComparisonProps) => {
  const calculateCAC = (metrics: Metrics) => {
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

  const calculateCPL = (metrics: Metrics) => {
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

  const calculateBreakeven = (metrics: Metrics) => {
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

  const calculateProfitPerPayment = (metrics: Metrics) => {
    if (metrics.totalClients === 0) return 0;
    const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
    const profit = metrics.revenue - totalCosts;
    return profit / metrics.totalClients;
  };

  const calculateProfitMargin = (metrics: Metrics) => {
    if (metrics.revenue === 0) return 0;
    const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
    const profit = metrics.revenue - totalCosts;
    return (profit / metrics.revenue) * 100;
  };

  const comparisonData = [
    {
      scenario: "Текущий",
      CAC: Math.round(calculateCAC(currentMetrics)),
      CPL: Math.round(calculateCPL(currentMetrics)),
      "Точка безубыточности": Math.round(calculateBreakeven(currentMetrics)),
      "Прибыль на оплату": Math.round(calculateProfitPerPayment(currentMetrics)),
      "Маржа (%)": parseFloat(calculateProfitMargin(currentMetrics).toFixed(1)),
    },
    {
      scenario: "Сценарий A",
      CAC: Math.round(calculateCAC(scenarioA)),
      CPL: Math.round(calculateCPL(scenarioA)),
      "Точка безубыточности": Math.round(calculateBreakeven(scenarioA)),
      "Прибыль на оплату": Math.round(calculateProfitPerPayment(scenarioA)),
      "Маржа (%)": parseFloat(calculateProfitMargin(scenarioA).toFixed(1)),
    },
    {
      scenario: "Сценарий B",
      CAC: Math.round(calculateCAC(scenarioB)),
      CPL: Math.round(calculateCPL(scenarioB)),
      "Точка безубыточности": Math.round(calculateBreakeven(scenarioB)),
      "Прибыль на оплату": Math.round(calculateProfitPerPayment(scenarioB)),
      "Маржа (%)": parseFloat(calculateProfitMargin(scenarioB).toFixed(1)),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            📊 CAC и CPL по сценариям
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="CAC" fill="hsl(var(--primary))" name={`CAC (${currency})`} />
              <Bar dataKey="CPL" fill="hsl(var(--secondary))" name={`CPL (${currency})`} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            🎯 Точка безубыточности и прибыльность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="scenario" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="Точка безубыточности"
                fill="hsl(var(--accent))"
                name="Точка безубыточности (кл.)"
              />
              <Bar
                yAxisId="right"
                dataKey="Прибыль на оплату"
                fill="hsl(var(--success))"
                name={`Прибыль на оплату (${currency})`}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            💰 Сравнительная таблица показателей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Показатель</th>
                  <th className="text-right p-2 font-semibold">Текущий</th>
                  <th className="text-right p-2 font-semibold">Сценарий A</th>
                  <th className="text-right p-2 font-semibold">Сценарий B</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    CAC
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[0].CAC.toLocaleString()} {currency}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[1].CAC.toLocaleString()} {currency}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[2].CAC.toLocaleString()} {currency}
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    CPL
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[0].CPL.toLocaleString()} {currency}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[1].CPL.toLocaleString()} {currency}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[2].CPL.toLocaleString()} {currency}
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Точка безубыточности
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[0]["Точка безубыточности"].toLocaleString()} кл.
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[1]["Точка безубыточности"].toLocaleString()} кл.
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[2]["Точка безубыточности"].toLocaleString()} кл.
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Прибыль на оплату
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[0]["Прибыль на оплату"].toLocaleString()} {currency}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[1]["Прибыль на оплату"].toLocaleString()} {currency}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {comparisonData[2]["Прибыль на оплату"].toLocaleString()} {currency}
                  </td>
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="p-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Маржа прибыли
                  </td>
                  <td className="text-right p-2 font-mono">{comparisonData[0]["Маржа (%)"].toFixed(1)}%</td>
                  <td className="text-right p-2 font-mono">{comparisonData[1]["Маржа (%)"].toFixed(1)}%</td>
                  <td className="text-right p-2 font-mono">{comparisonData[2]["Маржа (%)"].toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
