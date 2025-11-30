import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

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
  const calculateProfit = (metrics: Metrics) => {
    return metrics.revenue - metrics.fixedCosts - metrics.variableCosts - metrics.marketingCosts;
  };

  const revenueComparisonData = [
    {
      name: 'Текущая',
      выручка: currentMetrics.revenue,
      расходы: currentMetrics.fixedCosts + currentMetrics.variableCosts + currentMetrics.marketingCosts,
      прибыль: calculateProfit(currentMetrics),
    },
    {
      name: 'Сценарий А',
      выручка: scenarioA.revenue,
      расходы: scenarioA.fixedCosts + scenarioA.variableCosts + scenarioA.marketingCosts,
      прибыль: calculateProfit(scenarioA),
    },
    {
      name: 'Сценарий Б',
      выручка: scenarioB.revenue,
      расходы: scenarioB.fixedCosts + scenarioB.variableCosts + scenarioB.marketingCosts,
      прибыль: calculateProfit(scenarioB),
    },
  ];

  const clientsComparisonData = [
    {
      name: 'Текущая',
      новые: currentMetrics.newClients,
      повторные: currentMetrics.returningClients,
    },
    {
      name: 'Сценарий А',
      новые: scenarioA.newClients,
      повторные: scenarioA.returningClients,
    },
    {
      name: 'Сценарий Б',
      новые: scenarioB.newClients,
      повторные: scenarioB.returningClients,
    },
  ];

  const costsBreakdownData = [
    { name: 'Постоянные', value: currentMetrics.fixedCosts },
    { name: 'Переменные', value: currentMetrics.variableCosts },
    { name: 'Маркетинг', value: currentMetrics.marketingCosts },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Сравнение выручки, расходов и прибыли
          </CardTitle>
          <CardDescription>
            Анализ финансовых показателей по всем трем сценариям
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
              <Bar dataKey="выручка" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="расходы" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="прибыль" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Динамика клиентской базы</CardTitle>
            <CardDescription>Новые и повторные клиенты по сценариям</CardDescription>
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
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="повторные"
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
            <CardTitle>Структура расходов</CardTitle>
            <CardDescription>Распределение затрат в текущей ситуации</CardDescription>
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
