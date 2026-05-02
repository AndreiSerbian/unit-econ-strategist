import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

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
}

interface MetricsChartsProps {
  currentMetrics: Metrics;
  scenarioA: Metrics;
  scenarioB: Metrics;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

export const MetricsCharts = ({ currentMetrics, scenarioA, scenarioB }: MetricsChartsProps) => {
  const { t } = useTranslation();
  const calculateProfit = (metrics: Metrics) => {
    return metrics.revenue - metrics.fixedCosts - metrics.variableCosts - metrics.marketingCosts;
  };

  const revenueComparisonData = [
    {
      name: t("charts.scenarioCurrent"),
      выручка: currentMetrics.revenue,
      расходы: currentMetrics.fixedCosts + currentMetrics.variableCosts + currentMetrics.marketingCosts,
      прибыль: calculateProfit(currentMetrics),
    },
    {
      name: t("charts.scenarioA"),
      выручка: scenarioA.revenue,
      расходы: scenarioA.fixedCosts + scenarioA.variableCosts + scenarioA.marketingCosts,
      прибыль: calculateProfit(scenarioA),
    },
    {
      name: t("charts.scenarioB"),
      выручка: scenarioB.revenue,
      расходы: scenarioB.fixedCosts + scenarioB.variableCosts + scenarioB.marketingCosts,
      прибыль: calculateProfit(scenarioB),
    },
  ];

  const clientsComparisonData = [
    {
      name: t("charts.scenarioCurrent"),
      новые: currentMetrics.newClients,
      повторные: currentMetrics.returningClients,
    },
    {
      name: t("charts.scenarioA"),
      новые: scenarioA.newClients,
      повторные: scenarioA.returningClients,
    },
    {
      name: t("charts.scenarioB"),
      новые: scenarioB.newClients,
      повторные: scenarioB.returningClients,
    },
  ];

  const costsBreakdownData = [
    { name: t("charts.costsFixed"), value: currentMetrics.fixedCosts },
    { name: t("charts.costsVariable"), value: currentMetrics.variableCosts },
    { name: t("charts.costsMarketing"), value: currentMetrics.marketingCosts },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t("charts.revenueComparisonTitle")}
          </CardTitle>
          <CardDescription>
            {t("charts.revenueComparisonDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350} className="text-xs sm:text-sm">
            <BarChart data={revenueComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="выручка" name={t("charts.legendRevenue")} fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="расходы" name={t("charts.legendExpenses")} fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="прибыль" name={t("charts.legendProfit")} fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.clientsTitle")}</CardTitle>
            <CardDescription>{t("charts.clientsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <LineChart data={clientsComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="новые"
                  name={t("charts.legendNew")}
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="повторные"
                  name={t("charts.legendReturning")}
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("charts.costsTitle")}</CardTitle>
            <CardDescription>{t("charts.costsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <PieChart>
                <Pie
                  data={costsBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costsBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
