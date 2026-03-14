import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { AlertCircle } from "lucide-react";
import { Product } from "../ProductsManagement";
import { ServiceProduct, ServiceCalculatedMetrics, WEEKS_PER_PERIOD } from "./types";

type PlanningPeriod = 'week' | 'month' | 'quarter' | 'year';
type BillingModel = 'fixed_project' | 'hourly' | 'retainer';

const calculateServiceMetrics = (product: Product): { revenue: number; cost: number; effectiveRate: number | null; billingModel: string } => {
  const billingModel = (product.billingModel ?? 'fixed_project') as BillingModel;
  const planningPeriod = (product.planningPeriod ?? 'month') as PlanningPeriod;
  const hoursPerWeek = product.hoursPerWeek ?? 40;
  const billablePercent = product.billablePercent ?? (product.utilization ?? 100);
  const allocationPercent = product.allocationPercent ?? 100;
  const weeksPerPeriod = WEEKS_PER_PERIOD[planningPeriod];

  const effectiveHoursPerWeek = hoursPerWeek * (allocationPercent / 100);
  const billableHoursPeriod = effectiveHoursPerWeek * (billablePercent / 100) * weeksPerPeriod;

  let revenue = 0;
  let effectiveRate: number | null = null;

  if (billingModel === 'fixed_project') {
    revenue = (product.price ?? 0) * (product.quantity ?? 0);
    const estimatedHours = product.estimatedHoursPerProject;
    if (estimatedHours && estimatedHours > 0 && product.price) {
      effectiveRate = product.price / estimatedHours;
    }
  } else if (billingModel === 'hourly') {
    const hourlyRate = product.hourlyRate ?? 0;
    const plannedHours = product.plannedBillableHoursPerPeriod ?? billableHoursPeriod;
    revenue = hourlyRate * plannedHours;
    effectiveRate = hourlyRate;
  } else if (billingModel === 'retainer') {
    const retainerFee = product.retainerFee ?? 0;
    const clientsCount = product.clientsCount ?? 0;
    revenue = retainerFee * clientsCount;
    if (clientsCount > 0 && billableHoursPeriod > 0) {
      effectiveRate = retainerFee / (billableHoursPeriod / clientsCount);
    }
  }

  const BILLING_LABELS: Record<string, string> = {
    fixed_project: 'Фиксированный проект',
    hourly: 'Почасовая оплата',
    retainer: 'Абонентское сопровождение',
  };

  return {
    revenue,
    cost: product.cost ?? 0,
    effectiveRate,
    billingModel: BILLING_LABELS[billingModel] || billingModel,
  };
};

interface ServicesChartsProps {
  products: Product[];
  currency: string;
}

const NoDataMessage = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
    <p className="text-sm">{message}</p>
  </div>
);

export const ServicesCharts = ({ products, currency }: ServicesChartsProps) => {
  const chartData = useMemo(() => {
    return products.map((p) => {
      const metrics = calculateServiceMetrics(p);
      return {
        name: p.name || "Без названия",
        revenue: metrics.revenue,
        cost: metrics.cost,
        profit: metrics.revenue - metrics.cost,
        effectiveRate: metrics.effectiveRate,
        billingModel: metrics.billingModel,
      };
    });
  }, [products]);

  const hasRevenue = chartData.some((d) => d.revenue > 0);
  const hasCost = chartData.some((d) => d.cost > 0);
  const hasRates = chartData.some((d) => d.effectiveRate !== null && d.effectiveRate > 0);

  // Profitability by billing model
  const modelData = useMemo(() => {
    const map: Record<string, { revenue: number; cost: number; count: number }> = {};
    chartData.forEach((d) => {
      if (!map[d.billingModel]) map[d.billingModel] = { revenue: 0, cost: 0, count: 0 };
      map[d.billingModel].revenue += d.revenue;
      map[d.billingModel].cost += d.cost;
      map[d.billingModel].count += 1;
    });
    return Object.entries(map).map(([model, data]) => ({
      name: model,
      revenue: data.revenue,
      cost: data.cost,
      profit: data.revenue - data.cost,
      margin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue * 100) : 0,
    }));
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* Revenue / Cost / Profit by service */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Выручка / Себестоимость / Прибыль по услугам</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasRevenue && !hasCost ? (
            <NoDataMessage message="Недостаточно данных — заполните параметры услуг" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString("ru-RU")} ${currency}`, ""]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Выручка" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Себестоимость" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Прибыль" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Effective hourly rate comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Эффективная ставка в час</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasRates ? (
            <NoDataMessage message="Недостаточно данных — заполните цену и трудоёмкость услуг" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={chartData.filter((d) => d.effectiveRate !== null)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(0)} ${currency}/ч`, "Ставка"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="effectiveRate"
                  name="Эфф. ставка"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                  label={{ position: "right", fontSize: 11 }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Profitability by billing model */}
      {modelData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Прибыльность по модели оплаты</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={modelData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "margin"
                      ? `${value.toFixed(1)}%`
                      : `${value.toLocaleString("ru-RU")} ${currency}`,
                    name === "margin" ? "Маржа" : name,
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Выручка" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Прибыль" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
