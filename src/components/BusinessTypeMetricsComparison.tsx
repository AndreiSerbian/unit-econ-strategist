import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, RefreshCcw, Clock, BarChart3, AlertCircle } from "lucide-react";
import { BusinessType } from "@/config/businessTypeMetrics";
import { Badge } from "@/components/ui/badge";

interface CompetitorData {
  id: string;
  name: string;
  revenue: number;
  totalClients?: number;
  newClients?: number;
  returningClients?: number;
  conversionRate?: number;
  avgCheck?: number;
  fixedCosts?: number;
  variableCosts?: number;
  marketingSpend: number;
  marketShare?: number;
  customerLifetimeMonths?: number;
  purchaseFrequency?: number;
  // Business-type specific
  churnRate?: number;
  nrr?: number;
  repeatRate?: number;
  utilizationRate?: number;
  billableHours?: number;
  takeRate?: number;
  freeToPayConversion?: number;
  projectMargin?: number;
}

interface MyCompanyData {
  name: string;
  revenue: number;
  totalClients?: number;
  newClients?: number;
  returningClients?: number;
  // Business-type specific
  churnRate?: number;
  nrr?: number;
  expansionRevenue?: number;
  repeatRate?: number;
  utilizationRate?: number;
  billableHours?: number;
  projectMargin?: number;
  takeRate?: number;
  freeToPayConversion?: number;
  customerLifetimeMonths?: number;
  purchaseFrequency?: number;
}

interface BusinessTypeMetricsComparisonProps {
  myCompany: MyCompanyData;
  competitors: CompetitorData[];
  businessType: BusinessType;
  currency: string;
}

// Benchmark ranges for different metrics
const BENCHMARKS: Record<string, { good: [number, number]; warning: [number, number]; label: string }> = {
  churnRate: { good: [0, 5], warning: [5, 10], label: "Churn Rate < 5% — отлично, 5-10% — средне" },
  nrr: { good: [100, 150], warning: [90, 100], label: "NRR > 100% — бизнес растёт без новых клиентов" },
  repeatRate: { good: [30, 100], warning: [15, 30], label: "Repeat Rate > 30% — хорошее удержание" },
  utilizationRate: { good: [70, 100], warning: [50, 70], label: "Utilization > 70% — эффективная загрузка" },
  freeToPayConversion: { good: [3, 100], warning: [1, 3], label: "Free→Paid > 3% — хорошая конверсия" },
  takeRate: { good: [15, 50], warning: [5, 15], label: "Take Rate 15-25% — стандарт для маркетплейсов" },
};

const getMetricStatus = (value: number, metricKey: string): "good" | "warning" | "bad" => {
  const benchmark = BENCHMARKS[metricKey];
  if (!benchmark) return "warning";
  
  // For churnRate, lower is better
  if (metricKey === "churnRate") {
    if (value <= benchmark.good[1]) return "good";
    if (value <= benchmark.warning[1]) return "warning";
    return "bad";
  }
  
  // For other metrics, higher is better
  if (value >= benchmark.good[0]) return "good";
  if (value >= benchmark.warning[0]) return "warning";
  return "bad";
};

const getStatusColor = (status: "good" | "warning" | "bad") => {
  switch (status) {
    case "good": return "hsl(var(--success))";
    case "warning": return "hsl(var(--warning))";
    case "bad": return "hsl(var(--destructive))";
  }
};

export const BusinessTypeMetricsComparison = ({
  myCompany,
  competitors,
  businessType,
  currency,
}: BusinessTypeMetricsComparisonProps) => {
  
  // Define metrics to compare based on business type
  const getMetricsConfig = () => {
    switch (businessType) {
      case 'saas':
        return {
          title: "SaaS-метрики: Churn Rate и NRR",
          icon: "💻",
          metrics: [
            { key: 'churnRate', label: 'Churn Rate', suffix: '%', lowerIsBetter: true },
            { key: 'nrr', label: 'NRR', suffix: '%', lowerIsBetter: false },
          ],
          description: "Сравнение ключевых SaaS-метрик удержания и роста выручки",
        };
      case 'ecommerce':
        return {
          title: "E-commerce метрики: Repeat Rate",
          icon: "🛒",
          metrics: [
            { key: 'repeatRate', label: 'Repeat Rate', suffix: '%', lowerIsBetter: false },
          ],
          description: "Сравнение доли повторных покупателей",
        };
      case 'services':
        return {
          title: "Метрики услуг: Utilization Rate",
          icon: "💼",
          metrics: [
            { key: 'utilizationRate', label: 'Utilization Rate', suffix: '%', lowerIsBetter: false },
            { key: 'projectMargin', label: 'Project Margin', suffix: '%', lowerIsBetter: false },
          ],
          description: "Сравнение загрузки и маржинальности проектов",
        };
      case 'freemium':
        return {
          title: "Freemium метрики: Free→Paid конверсия",
          icon: "🎁",
          metrics: [
            { key: 'freeToPayConversion', label: 'Free → Paid', suffix: '%', lowerIsBetter: false },
            { key: 'churnRate', label: 'Churn Rate', suffix: '%', lowerIsBetter: true },
          ],
          description: "Сравнение конверсии из бесплатной версии и удержания",
        };
      case 'sharing':
      case 'marketplace':
        return {
          title: "Платформенные метрики: Take Rate и Utilization",
          icon: businessType === 'sharing' ? "🔄" : "🏪",
          metrics: [
            { key: 'takeRate', label: 'Take Rate', suffix: '%', lowerIsBetter: false },
            { key: 'utilizationRate', label: 'Utilization', suffix: '%', lowerIsBetter: false },
          ],
          description: "Сравнение комиссии платформы и загрузки ресурсов",
        };
      case 'production':
        return {
          title: "Производство: Repeat Rate и Маржа",
          icon: "🏭",
          metrics: [
            { key: 'repeatRate', label: 'Repeat Rate', suffix: '%', lowerIsBetter: false },
          ],
          description: "Сравнение доли повторных заказов",
        };
      default:
        return null;
    }
  };

  const config = getMetricsConfig();
  
  if (!config) {
    return null;
  }

  // Calculate repeat rate from returning clients if not provided directly
  const calculateRepeatRate = (company: { returningClients?: number; totalClients?: number; repeatRate?: number }) => {
    if (company.repeatRate !== undefined) return company.repeatRate;
    if (!company.totalClients || company.totalClients === 0) return 0;
    return ((company.returningClients || 0) / company.totalClients) * 100;
  };

  // Build comparison data
  const comparisonData = [
    {
      company: myCompany.name || "Моя компания",
      isMyCompany: true,
      ...config.metrics.reduce((acc, metric) => {
        let value = 0;
        if (metric.key === 'repeatRate') {
          value = calculateRepeatRate(myCompany);
        } else {
          value = (myCompany as any)[metric.key] ?? 0;
        }
        return { ...acc, [metric.label]: parseFloat(value.toFixed(1)) };
      }, {}),
    },
    ...competitors.map((competitor) => ({
      company: competitor.name,
      isMyCompany: false,
      ...config.metrics.reduce((acc, metric) => {
        let value = 0;
        if (metric.key === 'repeatRate') {
          value = calculateRepeatRate(competitor);
        } else {
          value = (competitor as any)[metric.key] ?? 0;
        }
        return { ...acc, [metric.label]: parseFloat(value.toFixed(1)) };
      }, {}),
    })),
  ];

  // Check if any company has data for these metrics
  const hasData = comparisonData.some((item) =>
    config.metrics.some((metric) => (item as any)[metric.label] > 0)
  );

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <span>{config.icon}</span>
          {config.title}
        </CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasData ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-muted">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Нет данных для сравнения</p>
              <p className="text-xs text-muted-foreground mt-1">
                Заполните специфичные метрики ({config.metrics.map(m => m.label).join(', ')}) 
                для вашей компании и конкурентов
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Benchmarks info */}
            <div className="flex flex-wrap gap-2">
              {config.metrics.map((metric) => {
                const benchmark = BENCHMARKS[metric.key];
                if (!benchmark) return null;
                return (
                  <Badge key={metric.key} variant="outline" className="text-xs font-normal">
                    💡 {benchmark.label}
                  </Badge>
                );
              })}
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="company" 
                  type="category" 
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Legend />
                {config.metrics.map((metric, idx) => (
                  <Bar
                    key={metric.key}
                    dataKey={metric.label}
                    fill={COLORS[idx % COLORS.length]}
                    name={`${metric.label} (${metric.suffix})`}
                    radius={[0, 4, 4, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>

            {/* Detailed table with status indicators */}
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-xs sm:text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold">Компания</th>
                    {config.metrics.map((metric) => (
                      <th key={metric.key} className="text-right p-2 font-semibold">
                        {metric.label}
                      </th>
                    ))}
                    <th className="text-center p-2 font-semibold">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item, idx) => {
                    // Calculate overall status based on primary metric
                    const primaryMetricKey = config.metrics[0].key;
                    const primaryValue = (item as any)[config.metrics[0].label] || 0;
                    const status = getMetricStatus(primaryValue, primaryMetricKey);
                    
                    return (
                      <tr 
                        key={idx} 
                        className={`border-b hover:bg-muted/50 ${item.isMyCompany ? "bg-primary/5" : ""}`}
                      >
                        <td className="p-2 font-semibold">
                          {item.isMyCompany && "🏠 "}
                          {item.company}
                        </td>
                        {config.metrics.map((metric) => {
                          const value = (item as any)[metric.label] || 0;
                          const metricStatus = getMetricStatus(value, metric.key);
                          return (
                            <td 
                              key={metric.key} 
                              className="text-right p-2 font-mono"
                              style={{ color: value > 0 ? getStatusColor(metricStatus) : undefined }}
                            >
                              {value > 0 ? `${value}${metric.suffix}` : "—"}
                            </td>
                          );
                        })}
                        <td className="text-center p-2">
                          {primaryValue > 0 && (
                            <Badge 
                              variant={status === "good" ? "default" : status === "warning" ? "secondary" : "destructive"}
                              className="text-xs"
                            >
                              {status === "good" ? "✓ Хорошо" : status === "warning" ? "⚠ Средне" : "✗ Низко"}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
