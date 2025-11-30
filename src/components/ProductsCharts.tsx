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
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Package, Share2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  salesChannels: string[];
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
  if (products.length === 0) {
    return null;
  }

  // Подготовка данных для графика прибыльности
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

  // Подготовка данных для круговой диаграммы выручки
  const revenueStructureData = products
    .map((product) => ({
      name: product.name,
      value: product.price * product.quantity,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Подготовка данных для доли в прибыли
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

  // Средние цены продуктов
  const avgPriceData = products.map((p) => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + "..." : p.name,
    fullName: p.name,
    цена: p.price,
    себестоимость: p.cost,
  }));

  // Объёмы продаж
  const salesVolumeData = products.map((p) => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + "..." : p.name,
    fullName: p.name,
    количество: p.quantity,
    выручка: p.price * p.quantity,
  }));

  // Каналы продаж
  const channelsData: { [key: string]: number } = {};
  products.forEach((p) => {
    (p.salesChannels || []).forEach((channel) => {
      channelsData[channel] = (channelsData[channel] || 0) + 1;
    });
  });

  const channelsPieData = Object.entries(channelsData).map(([name, value]) => ({
    name,
    value,
  }));

  const hasChannels = channelsPieData.length > 0;

  const totalRevenue = revenueStructureData.reduce((sum, item) => sum + item.value, 0);
  const totalProfit = profitShareData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{payload[0].payload.fullName || payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString("ru-RU")} {entry.name === "profitMargin" ? "%" : currency}
            </p>
          ))}
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
            Выручка: {data.value.toLocaleString("ru-RU")} {currency}
          </p>
          <p className="text-sm text-muted-foreground">Доля: {percentage}%</p>
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
            Прибыль: {data.value.toLocaleString("ru-RU")} {currency}
          </p>
          <p className="text-sm text-muted-foreground">Доля: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* График прибыльности */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Прибыльность продуктов
          </CardTitle>
          <CardDescription>Выручка, себестоимость и прибыль по каждому продукту</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
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
              <Bar dataKey="revenue" name="Выручка" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="Себестоимость" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Прибыль" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Новые графики для сравнения */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-secondary" />
            Сравнительный анализ продуктов
          </CardTitle>
          <CardDescription>
            Детальное сравнение цен, объёмов и каналов продаж
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Средние цены */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-secondary" />
              Ценообразование
            </CardTitle>
            <CardDescription>Сравнение цен и себестоимости</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
                <Bar dataKey="цена" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="себестоимость" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Объёмы продаж */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4 text-accent" />
              Объёмы продаж
            </CardTitle>
            <CardDescription>Количество проданных единиц</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
                <Bar dataKey="количество" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Каналы продаж */}
      {hasChannels && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-success" />
              Каналы распределения
            </CardTitle>
            <CardDescription>
              Распределение продуктов по каналам продаж
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={channelsPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {channelsPieData.map((entry, index) => (
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
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {channelsPieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">
                    {entry.name}: <span className="font-semibold">{entry.value}</span> продукт{entry.value > 1 ? 'ов' : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Структура выручки */}
        {revenueStructureData.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-secondary" />
                Структура выручки
              </CardTitle>
              <CardDescription>Распределение выручки по продуктам</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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
                <p className="text-sm font-semibold">Общая выручка:</p>
                <p className="text-2xl font-bold text-primary font-mono">
                  {totalRevenue.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Доля в общей прибыли */}
        {profitShareData.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Доля в общей прибыли
              </CardTitle>
              <CardDescription>Вклад каждого продукта в прибыль</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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
                <p className="text-sm font-semibold">Общая прибыль:</p>
                <p className={`text-2xl font-bold font-mono ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>
                  {totalProfit.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Таблица маржинальности */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Маржинальность продуктов</CardTitle>
          <CardDescription>Процент прибыли от выручки</CardDescription>
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
                      Выручка: {product.revenue.toLocaleString("ru-RU")} {currency}
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
                    <p className="text-xs text-muted-foreground">маржа</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
