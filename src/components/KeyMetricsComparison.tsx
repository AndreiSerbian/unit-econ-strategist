import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Target, BarChart3, DollarSign } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t } = useTranslation();

  const calculateCAC = (metrics: Metrics) => {
    if (!metrics.detailedExpenses || metrics.newClients === 0) return 0;
    const marketing =
      metrics.detailedExpenses.variableCosts.marketing.trafficPurchase +
      metrics.detailedExpenses.variableCosts.marketing.contractorsPayment +
      metrics.detailedExpenses.variableCosts.marketing.crmCosts +
      metrics.detailedExpenses.variableCosts.marketing.customCategories.reduce((s, c) => s + c.value, 0);
    const salesCost =
      metrics.detailedExpenses.variableCosts.salesPayroll.bonusNewClients +
      metrics.detailedExpenses.variableCosts.salesPayroll.customCategories.reduce((s, c) => s + c.value, 0);
    return (marketing + salesCost) / metrics.newClients;
  };

  const calculateCPL = (metrics: Metrics) => {
    if (!metrics.detailedExpenses) return 0;
    const marketing =
      metrics.detailedExpenses.variableCosts.marketing.trafficPurchase +
      metrics.detailedExpenses.variableCosts.marketing.contractorsPayment +
      metrics.detailedExpenses.variableCosts.marketing.crmCosts +
      metrics.detailedExpenses.variableCosts.marketing.customCategories.reduce((s, c) => s + c.value, 0);
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
      metrics.detailedExpenses.fixedCosts.customCategories.reduce((s, c) => s + c.value, 0);
    const variablePerClient = metrics.totalClients > 0 ? metrics.variableCosts / metrics.totalClients : 0;
    const contribution = metrics.avgCheck - variablePerClient;
    return contribution > 0 ? fixedTotal / contribution : 0;
  };

  const calculateProfitPerPayment = (metrics: Metrics) => {
    if (metrics.totalClients === 0) return 0;
    const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
    return (metrics.revenue - totalCosts) / metrics.totalClients;
  };

  const calculateProfitMargin = (metrics: Metrics) => {
    if (metrics.revenue === 0) return 0;
    const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
    return ((metrics.revenue - totalCosts) / metrics.revenue) * 100;
  };

  const breakevenName = t("comparison.breakevenLabel");
  const profitPerPaymentName = t("comparison.profitPerPayment");
  const marginName = t("comparison.marginPercent");

  const comparisonData = [
    {
      scenario: t("comparison.scenarioCurrent"),
      CAC: Math.round(calculateCAC(currentMetrics)),
      CPL: Math.round(calculateCPL(currentMetrics)),
      [breakevenName]: Math.round(calculateBreakeven(currentMetrics)),
      [profitPerPaymentName]: Math.round(calculateProfitPerPayment(currentMetrics)),
      [marginName]: parseFloat(calculateProfitMargin(currentMetrics).toFixed(1)),
    },
    {
      scenario: t("comparison.scenarioA"),
      CAC: Math.round(calculateCAC(scenarioA)),
      CPL: Math.round(calculateCPL(scenarioA)),
      [breakevenName]: Math.round(calculateBreakeven(scenarioA)),
      [profitPerPaymentName]: Math.round(calculateProfitPerPayment(scenarioA)),
      [marginName]: parseFloat(calculateProfitMargin(scenarioA).toFixed(1)),
    },
    {
      scenario: t("comparison.scenarioB"),
      CAC: Math.round(calculateCAC(scenarioB)),
      CPL: Math.round(calculateCPL(scenarioB)),
      [breakevenName]: Math.round(calculateBreakeven(scenarioB)),
      [profitPerPaymentName]: Math.round(calculateProfitPerPayment(scenarioB)),
      [marginName]: parseFloat(calculateProfitMargin(scenarioB).toFixed(1)),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {t("comparison.chartCacCplTitle")}
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
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            {t("comparison.chartBreakevenProfitTitle")}
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
              <Bar yAxisId="left" dataKey={breakevenName} fill="hsl(var(--accent))" name={t("comparison.breakevenUnits")} />
              <Bar yAxisId="right" dataKey={profitPerPaymentName} fill="hsl(var(--success))" name={`${profitPerPaymentName} (${currency})`} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            {t("comparison.tableTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">{t("comparison.colIndicator")}</th>
                  <th className="text-right p-2 font-semibold">{t("comparison.scenarioCurrent")}</th>
                  <th className="text-right p-2 font-semibold">{t("comparison.scenarioA")}</th>
                  <th className="text-right p-2 font-semibold">{t("comparison.scenarioB")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 flex items-center gap-1"><Target className="w-3 h-3" />CAC</td>
                  <td className="text-right p-2 font-mono">{comparisonData[0].CAC.toLocaleString()} {currency}</td>
                  <td className="text-right p-2 font-mono">{comparisonData[1].CAC.toLocaleString()} {currency}</td>
                  <td className="text-right p-2 font-mono">{comparisonData[2].CAC.toLocaleString()} {currency}</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" />CPL</td>
                  <td className="text-right p-2 font-mono">{comparisonData[0].CPL.toLocaleString()} {currency}</td>
                  <td className="text-right p-2 font-mono">{comparisonData[1].CPL.toLocaleString()} {currency}</td>
                  <td className="text-right p-2 font-mono">{comparisonData[2].CPL.toLocaleString()} {currency}</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" />{breakevenName}</td>
                  <td className="text-right p-2 font-mono">{(comparisonData[0][breakevenName] as number).toLocaleString()} {t("comparison.units")}</td>
                  <td className="text-right p-2 font-mono">{(comparisonData[1][breakevenName] as number).toLocaleString()} {t("comparison.units")}</td>
                  <td className="text-right p-2 font-mono">{(comparisonData[2][breakevenName] as number).toLocaleString()} {t("comparison.units")}</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 flex items-center gap-1"><DollarSign className="w-3 h-3" />{profitPerPaymentName}</td>
                  <td className="text-right p-2 font-mono">{(comparisonData[0][profitPerPaymentName] as number).toLocaleString()} {currency}</td>
                  <td className="text-right p-2 font-mono">{(comparisonData[1][profitPerPaymentName] as number).toLocaleString()} {currency}</td>
                  <td className="text-right p-2 font-mono">{(comparisonData[2][profitPerPaymentName] as number).toLocaleString()} {currency}</td>
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="p-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{marginName}</td>
                  <td className="text-right p-2 font-mono">{(comparisonData[0][marginName] as number).toFixed(1)}%</td>
                  <td className="text-right p-2 font-mono">{(comparisonData[1][marginName] as number).toFixed(1)}%</td>
                  <td className="text-right p-2 font-mono">{(comparisonData[2][marginName] as number).toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
