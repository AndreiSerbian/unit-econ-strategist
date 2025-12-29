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
import { GitCompare, TrendingUp, Package, Share2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
}

interface CompetitorProduct {
  id: string;
  name: string;
  price: number;
  annualSales: number;
  annualRevenue: number;
  salesChannels: string[];
}

interface Competitor {
  id: string;
  name: string;
  revenue: number;
  marketShare: number;
  pricing: number;
  quality: number;
  marketingSpend: number;
  products: CompetitorProduct[];
}

interface ProductComparisonProps {
  products: Product[];
  competitors: Competitor[];
  currency: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
];

export const ProductComparison = ({ products, competitors, currency }: ProductComparisonProps) => {
  // Собираем все продукты конкурентов
  const allCompetitorProducts: (CompetitorProduct & { competitorName: string })[] = [];
  competitors.forEach((comp) => {
    (comp.products || []).forEach((prod) => {
      allCompetitorProducts.push({ ...prod, competitorName: comp.name });
    });
  });

  if (products.length === 0 && allCompetitorProducts.length === 0) {
    return null;
  }

  // 1. Сравнение средних цен - наши продукты vs средние цены конкурентов
  const avgOurPrice = products.length > 0 
    ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
    : 0;
  
  const avgCompetitorPrice = allCompetitorProducts.length > 0
    ? allCompetitorProducts.reduce((sum, p) => sum + p.price, 0) / allCompetitorProducts.length
    : 0;

  const priceComparisonData = [
    { 
      category: "Наши продукты",
      средняяЦена: parseFloat(avgOurPrice.toFixed(2)),
      количество: products.length,
    },
    {
      category: "Конкуренты",
      средняяЦена: parseFloat(avgCompetitorPrice.toFixed(2)),
      количество: allCompetitorProducts.length,
    },
  ];

  // 2. Детальное сравнение цен по продуктам
  const detailedPriceData = [
    ...products.map((p) => ({
      name: p.name.length > 12 ? p.name.substring(0, 12) + "..." : p.name,
      fullName: p.name,
      цена: p.price,
      источник: "Наши",
      type: "our",
    })),
    ...allCompetitorProducts.map((p) => ({
      name: p.name.length > 12 ? p.name.substring(0, 12) + "..." : p.name,
      fullName: `${p.name} (${p.competitorName})`,
      цена: p.price,
      источник: p.competitorName,
      type: "competitor",
    })),
  ].sort((a, b) => b.цена - a.цена);

  // 3. Сравнение объёмов продаж
  const totalOurSales = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalCompetitorSales = allCompetitorProducts.reduce((sum, p) => sum + p.annualSales, 0);

  const salesComparisonData = [
    {
      category: "Наши продукты",
      объём: totalOurSales,
      выручка: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
    },
    {
      category: "Конкуренты",
      объём: totalCompetitorSales,
      выручка: allCompetitorProducts.reduce((sum, p) => sum + p.annualRevenue, 0),
    },
  ];

  // Каналы продаж теперь управляются через ProductChannelAllocation
  const channelsComparisonData: { канал: string; наши: number; конкуренты: number }[] = [];

  // 5. Распределение по ценовым сегментам
  const allPrices = [
    ...products.map(p => ({ price: p.price, source: "Наши" })),
    ...allCompetitorProducts.map(p => ({ price: p.price, source: "Конкуренты" }))
  ];

  const maxPrice = Math.max(...allPrices.map(p => p.price));
  const segmentSize = maxPrice / 4;
  
  const priceSegments = [
    { segment: `0-${Math.round(segmentSize)}`, наши: 0, конкуренты: 0 },
    { segment: `${Math.round(segmentSize)}-${Math.round(segmentSize * 2)}`, наши: 0, конкуренты: 0 },
    { segment: `${Math.round(segmentSize * 2)}-${Math.round(segmentSize * 3)}`, наши: 0, конкуренты: 0 },
    { segment: `${Math.round(segmentSize * 3)}+`, наши: 0, конкуренты: 0 },
  ];

  allPrices.forEach(({ price, source }) => {
    const segmentIndex = Math.min(Math.floor(price / segmentSize), 3);
    if (source === "Наши") {
      priceSegments[segmentIndex].наши++;
    } else {
      priceSegments[segmentIndex].конкуренты++;
    }
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString("ru-RU")} {entry.dataKey.includes("ена") || entry.dataKey.includes("выручка") ? currency : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-primary" />
            Сравнительный анализ продуктов
          </CardTitle>
          <CardDescription>
            Прямое сопоставление ваших продуктов с продуктами конкурентов
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Сравнение средних цен */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4 text-primary" />
              Средние цены
            </CardTitle>
            <CardDescription>Сравнение средних цен продуктов</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <BarChart data={priceComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="средняяЦена" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-xs text-muted-foreground">Наша средняя цена</p>
                <p className="text-xl font-bold text-primary font-mono">
                  {avgOurPrice.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <p className="text-xs text-muted-foreground">Средняя цена конкурентов</p>
                <p className="text-xl font-bold text-secondary font-mono">
                  {avgCompetitorPrice.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Сравнение объёмов продаж */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4 text-secondary" />
              Объёмы продаж
            </CardTitle>
            <CardDescription>Сравнение объёмов и выручки</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <BarChart data={salesComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="объём" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="выручка" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Детальное сравнение цен по всем продуктам */}
      {detailedPriceData.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Детальное сравнение цен
            </CardTitle>
            <CardDescription>Все продукты с ценами (отсортировано по убыванию)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(400, detailedPriceData.length * 40)} className="text-xs sm:text-sm">
              <BarChart data={detailedPriceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--foreground))" className="text-xs" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={100}
                  stroke="hsl(var(--foreground))"
                  className="text-[10px] sm:text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="цена" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 8, 8, 0]}
                >
                  {detailedPriceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.type === "our" ? "hsl(var(--primary))" : "hsl(var(--secondary))"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm">Наши продукты</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-sm">Продукты конкурентов</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Сравнение каналов распределения */}
      {channelsComparisonData.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-success" />
              Каналы распределения
            </CardTitle>
            <CardDescription>
              Сравнение использования каналов продаж
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <BarChart data={channelsComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="канал" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="наши" name="Наши продукты" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="конкуренты" name="Продукты конкурентов" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Ценовые сегменты */}
      {priceSegments.some(s => s.наши > 0 || s.конкуренты > 0) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-warning" />
              Ценовые сегменты
            </CardTitle>
            <CardDescription>
              Распределение продуктов по ценовым диапазонам ({currency})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <BarChart data={priceSegments}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="segment" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="наши" name="Наши продукты" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="конкуренты" name="Продукты конкурентов" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
