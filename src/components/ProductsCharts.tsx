import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Package } from "lucide-react";
import { useTranslation } from "@/i18n";

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
}

interface ProductsChartsProps {
  products: Product[];
  currency: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
];

export const ProductsCharts = ({ products, currency }: ProductsChartsProps) => {
  const { t } = useTranslation();

  if (products.length === 0) {
    return null;
  }

  const profitabilityData = products.map((product) => {
    const revenue = product.price * product.quantity;
    const totalCost = product.cost * product.quantity;
    const profit = revenue - totalCost;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0;

    return {
      name: product.name.length > 15 ? product.name.substring(0, 15) + "..." : product.name,
      fullName: product.name,
      revenue,
      cost: totalCost,
      profit,
      profitMargin: parseFloat(profitMargin as string),
    };
  });

  const revenueStructureData = products
    .map((product) => ({
      name: product.name,
      value: product.price * product.quantity,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const profitShareData = products
    .map((product) => {
      const profit = (product.price - product.cost) * product.quantity;
      return {
        name: product.name,
        value: Math.max(0, profit),
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const avgPriceData = products.map((p) => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + "..." : p.name,
    fullName: p.name,
    price: p.price,
    cost: p.cost,
  }));

  const salesVolumeData = products.map((p) => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + "..." : p.name,
    fullName: p.name,
    quantity: p.quantity,
    revenue: p.price * p.quantity,
  }));

  const totalRevenue = revenueStructureData.reduce((sum, item) => sum + item.value, 0);
  const totalProfit = profitShareData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{payload[0].payload.fullName || payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => {
            const isQuantity = entry.dataKey === "quantity";
            const isPercent = entry.dataKey === "profitMargin";
            const unit = isQuantity ? t("productsCharts.units") : isPercent ? "%" : currency;

            return (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value.toLocaleString("ru-RU")} {unit}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalRevenue > 0 ? ((data.value / totalRevenue) * 100).toFixed(1) : 0;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.name}</p>
          <p className="text-sm">
            {t("productsCharts.revenueLabel")} {data.value.toLocaleString("ru-RU")} {currency}
          </p>
          <p className="text-sm text-muted-foreground">{t("productsCharts.shareLabel")} {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const ProfitPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalProfit > 0 ? ((data.value / totalProfit) * 100).toFixed(1) : 0;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.name}</p>
          <p className="text-sm">
            {t("productsCharts.profitLabel")} {data.value.toLocaleString("ru-RU")} {currency}
          </p>
          <p className="text-sm text-muted-foreground">{t("productsCharts.shareLabel")} {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            {t("productsCharts.profitabilityTitle")}
          </CardTitle>
          <CardDescription>{t("productsCharts.profitabilityDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400} className="text-xs sm:text-sm">
            <BarChart data={profitabilityData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="revenue" name={t("productsCharts.revenue")} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name={t("productsCharts.cost")} fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name={t("productsCharts.profit")} fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-secondary" />
            {t("productsCharts.comparisonTitle")}
          </CardTitle>
          <CardDescription>
            {t("productsCharts.comparisonDesc")}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-secondary" />
              {t("productsCharts.pricingTitle")}
            </CardTitle>
            <CardDescription>{t("productsCharts.pricingDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <BarChart data={avgPriceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="price" name={t("productsCharts.price")} fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="cost" name={t("productsCharts.cost")} fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4 text-accent" />
              {t("productsCharts.salesVolumeTitle")}
            </CardTitle>
            <CardDescription>{t("productsCharts.salesVolumeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <BarChart data={salesVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--foreground))"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="quantity" name={t("productsCharts.quantity")} fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revenueStructureData.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-secondary" />
                {t("productsCharts.revenueStructureTitle")}
              </CardTitle>
              <CardDescription>{t("productsCharts.revenueStructureDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <PieChart>
                  <Pie
                    data={revenueStructureData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueStructureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold">{t("productsCharts.totalRevenue")}</p>
                <p className="text-2xl font-bold text-primary font-mono">
                  {totalRevenue.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {profitShareData.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                {t("productsCharts.profitShareTitle")}
              </CardTitle>
              <CardDescription>{t("productsCharts.profitShareDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <PieChart>
                  <Pie
                    data={profitShareData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {profitShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ProfitPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold">{t("productsCharts.totalProfit")}</p>
                <p className={`text-2xl font-bold font-mono ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>
                  {totalProfit.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t("productsCharts.marginTitle")}</CardTitle>
          <CardDescription>{t("productsCharts.marginDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profitabilityData
              .sort((a, b) => b.profitMargin - a.profitMargin)
              .map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{product.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("productsCharts.revenueLabel")} {product.revenue.toLocaleString("ru-RU")} {currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold font-mono ${
                        product.profitMargin >= 30
                          ? "text-success"
                          : product.profitMargin >= 10
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    >
                      {product.profitMargin}%
                    </p>
                    <p className="text-xs text-muted-foreground">{t("productsCharts.margin")}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
