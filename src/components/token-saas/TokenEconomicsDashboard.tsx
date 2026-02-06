import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Coins, Activity, PieChart, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend } from 'recharts';
import type { TokenPackage, OperationCatalogItem, CompositeOperation, OperationUsageForecast } from './types';

interface TokenEconomicsDashboardProps {
  packages: TokenPackage[];
  operations: OperationCatalogItem[];
  compositeOperations: CompositeOperation[];
  usageForecasts: OperationUsageForecast[];
  scenarioType: string;
  itValueUsd: number;
  calculateScenarioMetrics: () => {
    totalPackageRevenue: number;
    totalITSold: number;
    totalOperationsApiCost: number;
    totalOperationsUserPrice: number;
    totalITConsumed: number;
    platformProfit: number;
    itUtilizationPercent: number;
  };
  calculateOperationMetrics: (op: OperationCatalogItem) => {
    userPriceUsd: number;
    marginUsd: number;
    marginPercent: number;
    itCost: number;
  };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))'];

export function TokenEconomicsDashboard({
  packages,
  operations,
  compositeOperations,
  usageForecasts,
  scenarioType,
  itValueUsd,
  calculateScenarioMetrics,
  calculateOperationMetrics,
}: TokenEconomicsDashboardProps) {
  const metrics = calculateScenarioMetrics();

  const hasData = packages.length > 0 || operations.length > 0;
  const hasUsageData = usageForecasts.length > 0 && usageForecasts.some(f => f.expected_usage > 0);

  // Package revenue chart data
  const packageRevenueData = packages.map(pkg => ({
    name: pkg.name,
    revenue: pkg.price_usd * pkg.expected_sales,
    sales: pkg.expected_sales,
    itSold: pkg.it_amount * pkg.expected_sales,
  }));

  // Operation type distribution
  const opTypeData = operations.reduce((acc, op) => {
    const key = op.operation_type;
    if (!acc[key]) {
      acc[key] = { type: key, count: 0, totalItCost: 0 };
    }
    acc[key].count += 1;
    acc[key].totalItCost += op.base_it_cost;
    return acc;
  }, {} as Record<string, { type: string; count: number; totalItCost: number }>);

  const opTypePieData = Object.values(opTypeData).map(d => ({
    name: d.type,
    value: d.count,
    itCost: d.totalItCost,
  }));

  // Profit health status
  const profitMargin = metrics.totalPackageRevenue > 0 
    ? (metrics.platformProfit / metrics.totalPackageRevenue) * 100 
    : 0;

  const getHealthStatus = () => {
    if (!hasData) return { label: 'Нет данных', color: 'text-muted-foreground', icon: AlertTriangle };
    if (metrics.platformProfit < 0) return { label: 'Убыток', color: 'text-destructive', icon: TrendingDown };
    if (profitMargin < 20) return { label: 'Низкая маржа', color: 'text-warning', icon: AlertTriangle };
    if (profitMargin < 40) return { label: 'Нормально', color: 'text-primary', icon: TrendingUp };
    return { label: 'Отлично', color: 'text-accent', icon: TrendingUp };
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="w-4 h-4" />
              Выручка от пакетов
            </div>
            <p className="text-2xl font-bold text-primary">
              ${metrics.totalPackageRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {packages.reduce((s, p) => s + p.expected_sales, 0)} продаж
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Coins className="w-4 h-4" />
              IT продано
            </div>
            <p className="text-2xl font-bold">
              {metrics.totalITSold.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ${(metrics.totalITSold * itValueUsd).toFixed(2)} номинал
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Activity className="w-4 h-4" />
              API затраты
            </div>
            <p className="text-2xl font-bold text-destructive">
              ${metrics.totalOperationsApiCost.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalITConsumed.toFixed(0)} IT использовано
            </p>
          </CardContent>
        </Card>

        <Card className={metrics.platformProfit >= 0 ? 'bg-accent/5' : 'bg-destructive/5'}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <HealthIcon className={`w-4 h-4 ${healthStatus.color}`} />
              Прибыль платформы
            </div>
            <p className={`text-2xl font-bold ${metrics.platformProfit >= 0 ? 'text-accent' : 'text-destructive'}`}>
              ${metrics.platformProfit.toFixed(2)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={metrics.platformProfit >= 0 ? 'default' : 'destructive'} className="text-[10px]">
                {healthStatus.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {profitMargin.toFixed(1)}% маржа
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IT Utilization */}
      {hasUsageData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Утилизация токенов
            </CardTitle>
            <CardDescription>
              Какой процент проданных IT используется
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Использовано: {metrics.totalITConsumed.toLocaleString()} IT</span>
                <span>Продано: {metrics.totalITSold.toLocaleString()} IT</span>
              </div>
              <Progress value={Math.min(metrics.itUtilizationPercent, 100)} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{metrics.itUtilizationPercent.toFixed(1)}% использовано</span>
                {metrics.itUtilizationPercent > 100 && (
                  <Badge variant="destructive" className="text-[10px]">
                    ⚠️ Перерасход IT!
                  </Badge>
                )}
                {metrics.itUtilizationPercent < 50 && (
                  <Badge variant="secondary" className="text-[10px]">
                    💡 Низкая активность
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Package Revenue Chart */}
          {packageRevenueData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">📦 Выручка по пакетам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={packageRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? `$${value.toLocaleString()}` : value.toLocaleString(),
                        name === 'revenue' ? 'Выручка' : name === 'sales' ? 'Продаж' : 'IT продано'
                      ]}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Operation Types Distribution */}
          {opTypePieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">⚡ Типы операций</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={opTypePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {opTypePieData.map((_, index) => (
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
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasData && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Coins className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Добавьте пакеты токенов и операции для расчёта юнит-экономики
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
