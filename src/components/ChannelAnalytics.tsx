import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, PieChart as PieChartIcon } from "lucide-react";
import { SalesChannel, ProductChannelAllocation } from "./SalesChannelsManager";
import { Product } from "./ProductsManagement";

interface ChannelAnalyticsProps {
  products: Product[];
  channels: SalesChannel[];
  allocations: ProductChannelAllocation[];
  currency: string;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(200, 80%, 50%)",
  "hsl(0, 70%, 55%)",
];

export const ChannelAnalytics = ({
  products,
  channels,
  allocations,
  currency,
}: ChannelAnalyticsProps) => {
  const calculateChannelMetrics = (
    product: Product,
    channel: SalesChannel,
    allocation: ProductChannelAllocation
  ) => {
    const price = allocation.priceOverride ?? product.price;
    const discountedPrice = price * (1 - (channel.discountPercent || 0) / 100);
    const revenue = discountedPrice * allocation.quantity;
    
    const commission = revenue * (channel.commissionPercent / 100);
    const fulfillment = channel.fulfillmentCostPerUnit * allocation.quantity;
    const logistics = channel.logisticsCostPerUnit * allocation.quantity;
    const productCost = product.cost * allocation.quantity;
    
    const returnLoss = revenue * (channel.returnRatePercent / 100);
    const returnHandlingCost = (channel.fulfillmentCostPerUnit + channel.logisticsCostPerUnit) * 
      allocation.quantity * (channel.returnRatePercent / 100);
    
    const totalCosts = commission + fulfillment + logistics + productCost + returnLoss + returnHandlingCost;
    const netMargin = revenue - totalCosts;
    const marginPercent = revenue > 0 ? (netMargin / revenue) * 100 : 0;
    
    return {
      revenue,
      commission,
      fulfillment,
      logistics,
      productCost,
      returnLoss,
      netMargin,
      marginPercent,
      quantity: allocation.quantity,
    };
  };

  // Aggregate data by channel
  const channelData = channels.map((channel) => {
    const channelAllocations = allocations.filter((a) => a.channelId === channel.id);
    
    let totalRevenue = 0;
    let totalMargin = 0;
    let totalQuantity = 0;
    let totalCommission = 0;
    let totalFulfillment = 0;
    let totalReturns = 0;

    channelAllocations.forEach((allocation) => {
      const product = products.find((p) => p.id === allocation.productId);
      if (!product) return;

      const metrics = calculateChannelMetrics(product, channel, allocation);
      totalRevenue += metrics.revenue;
      totalMargin += metrics.netMargin;
      totalQuantity += metrics.quantity;
      totalCommission += metrics.commission;
      totalFulfillment += metrics.fulfillment + metrics.logistics;
      totalReturns += metrics.returnLoss;
    });

    const marginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

    return {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      revenue: totalRevenue,
      margin: totalMargin,
      marginPercent,
      quantity: totalQuantity,
      commission: totalCommission,
      fulfillment: totalFulfillment,
      returns: totalReturns,
    };
  }).filter((c) => c.revenue > 0);

  // Calculate totals
  const totals = channelData.reduce(
    (acc, c) => ({
      revenue: acc.revenue + c.revenue,
      margin: acc.margin + c.margin,
      quantity: acc.quantity + c.quantity,
      commission: acc.commission + c.commission,
      fulfillment: acc.fulfillment + c.fulfillment,
      returns: acc.returns + c.returns,
    }),
    { revenue: 0, margin: 0, quantity: 0, commission: 0, fulfillment: 0, returns: 0 }
  );

  const avgMarginPercent = totals.revenue > 0 ? (totals.margin / totals.revenue) * 100 : 0;

  // Prepare chart data
  const pieData = channelData.map((c, i) => ({
    name: c.name,
    value: c.revenue,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const barData = channelData.map((c) => ({
    name: c.name.length > 12 ? c.name.substring(0, 12) + "..." : c.name,
    fullName: c.name,
    Маржа: c.marginPercent,
    margin: c.margin,
  }));

  // Get recommendations
  const getRecommendations = () => {
    const recommendations: { type: "success" | "warning" | "danger"; text: string }[] = [];

    // Find best performing channel
    const bestChannel = channelData.reduce(
      (best, c) => (c.marginPercent > best.marginPercent ? c : best),
      { marginPercent: -Infinity, name: "" }
    );
    if (bestChannel.name && bestChannel.marginPercent > 0) {
      recommendations.push({
        type: "success",
        text: `${bestChannel.name} — самый маржинальный канал (${bestChannel.marginPercent.toFixed(1)}%). Рассмотрите увеличение объёма.`,
      });
    }

    // Find low margin channels
    const lowMarginChannels = channelData.filter((c) => c.marginPercent < 10 && c.marginPercent >= 0);
    lowMarginChannels.forEach((c) => {
      recommendations.push({
        type: "warning",
        text: `${c.name} имеет низкую маржу (${c.marginPercent.toFixed(1)}%). Проверьте комиссии и себестоимость.`,
      });
    });

    // Find negative margin channels
    const negativeChannels = channelData.filter((c) => c.marginPercent < 0);
    negativeChannels.forEach((c) => {
      recommendations.push({
        type: "danger",
        text: `${c.name} убыточен (${c.marginPercent.toFixed(1)}%). Требуется срочный пересмотр условий или отказ от канала.`,
      });
    });

    // Check concentration
    const maxChannelShare = channelData.reduce(
      (max, c) => Math.max(max, (c.revenue / totals.revenue) * 100),
      0
    );
    if (maxChannelShare > 70 && channelData.length > 1) {
      recommendations.push({
        type: "warning",
        text: `Высокая концентрация продаж (${maxChannelShare.toFixed(0)}% в одном канале). Диверсифицируйте каналы для снижения рисков.`,
      });
    }

    return recommendations;
  };

  if (channelData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Аналитика каналов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PieChartIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет данных для анализа</p>
            <p className="text-sm">Распределите продукты по каналам для получения аналитики</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recommendations = getRecommendations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-primary" />
          Аналитика каналов продаж
        </CardTitle>
        <CardDescription>
          Распределение продаж и сравнение маржинальности по каналам
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-primary/5 border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Общая выручка</p>
            <p className="text-xl font-bold font-mono mt-1">
              {totals.revenue.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/5 border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Чистая маржа</p>
            <p className={`text-xl font-bold font-mono mt-1 ${totals.margin >= 0 ? "text-green-600" : "text-destructive"}`}>
              {totals.margin.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/5 border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Средняя маржа</p>
            <p className="text-xl font-bold font-mono mt-1">
              {avgMarginPercent.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 rounded-lg bg-destructive/5 border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Потери</p>
            <p className="text-xl font-bold font-mono mt-1 text-destructive">
              {(totals.commission + totals.fulfillment + totals.returns).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart - revenue distribution */}
          <div>
            <h3 className="text-sm font-medium mb-4">Распределение выручки</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toLocaleString("ru-RU")} ${currency}`,
                    "Выручка",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart - margin comparison */}
          <div>
            <h3 className="text-sm font-medium mb-4">Маржинальность по каналам (%)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[-20, 50]} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value.toFixed(1)}% (${props.payload.margin?.toLocaleString("ru-RU")} ${currency})`,
                    "Маржа",
                  ]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Bar
                  dataKey="Маржа"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Рекомендации</h3>
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  rec.type === "success"
                    ? "bg-green-500/10 border-green-500/20"
                    : rec.type === "warning"
                    ? "bg-yellow-500/10 border-yellow-500/20"
                    : "bg-destructive/10 border-destructive/20"
                } border`}
              >
                {rec.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : rec.type === "warning" ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm">{rec.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Cost breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Структура затрат по каналам</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground">Комиссии каналов</p>
              <p className="text-lg font-bold font-mono text-destructive">
                {totals.commission.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totals.revenue > 0 ? ((totals.commission / totals.revenue) * 100).toFixed(1) : 0}% от выручки
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground">Фулфилмент и логистика</p>
              <p className="text-lg font-bold font-mono text-destructive">
                {totals.fulfillment.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totals.revenue > 0 ? ((totals.fulfillment / totals.revenue) * 100).toFixed(1) : 0}% от выручки
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground">Потери от возвратов</p>
              <p className="text-lg font-bold font-mono text-destructive">
                {totals.returns.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {totals.revenue > 0 ? ((totals.returns / totals.revenue) * 100).toFixed(1) : 0}% от выручки
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
