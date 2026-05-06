import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Users, Package, TrendingUp, Share2 } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

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

interface CompetitorChartsProps {
  competitors: Competitor[];
  currency?: string;
}

const getCurrencySymbol = (curr: string) => {
  switch (curr) {
    case "USD": return "$";
    case "EUR": return "€";
    case "MDL": return "L";
    case "RUB":
    default: return "₽";
  }
};

export const CompetitorCharts = ({ competitors, currency = "RUB" }: CompetitorChartsProps) => {
  const { t } = useTranslation();
  const currencySymbol = getCurrencySymbol(currency);

  if (competitors.length === 0) {
    return null;
  }

  const revenueData = competitors.map(c => ({
    name: c.name,
    выручка: c.revenue,
    маркетинг: c.marketingSpend,
  }));

  const marketShareData = competitors.map(c => ({
    name: c.name,
    доляРынка: c.marketShare,
  }));

  const radarData = competitors.slice(0, 3).map(c => ({
    competitor: c.name,
    цена: c.pricing / 1000, // Нормализация для визуализации
    качество: c.quality,
    доляРынка: c.marketShare,
    маркетинг: c.marketingSpend / 100000, // Нормализация
  }));

  // Products analysis data
  const hasProducts = competitors.some(c => c.products && c.products.length > 0);

  const productsComparisonData = hasProducts 
    ? competitors.flatMap(c => 
        (c.products || []).map(p => ({
          competitor: c.name,
          product: p.name,
          price: p.price,
          sales: p.annualSales,
          revenue: p.annualRevenue,
        }))
      )
    : [];

  // Average price per competitor
  const avgPriceData = competitors
    .filter(c => c.products && c.products.length > 0)
    .map(c => ({
      name: c.name,
      средняяЦена: c.products.reduce((sum, p) => sum + p.price, 0) / c.products.length,
      продуктов: c.products.length,
    }));

  // Total sales volume per competitor
  const salesVolumeData = competitors
    .filter(c => c.products && c.products.length > 0)
    .map(c => ({
      name: c.name,
      продажиШт: c.products.reduce((sum, p) => sum + p.annualSales, 0),
      выручка: c.products.reduce((sum, p) => sum + p.annualRevenue, 0),
    }));

  // Sales channels distribution
  const channelsData: { [key: string]: number } = {};
  competitors.forEach(c => {
    (c.products || []).forEach(p => {
      p.salesChannels.forEach(channel => {
        channelsData[channel] = (channelsData[channel] || 0) + 1;
      });
    });
  });

  const channelsPieData = Object.entries(channelsData).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--success))',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            {t("competitorCharts.revenueTitle")}
          </CardTitle>
          <CardDescription>
            {t("competitorCharts.revenueDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350} className="text-xs sm:text-sm">
            <BarChart data={revenueData}>
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
              <Bar dataKey="выручка" name={t("competitorCharts.revenue")} fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="маркетинг" name={t("competitorCharts.marketing")} fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("competitorCharts.marketShareTitle")}</CardTitle>
            <CardDescription>{t("competitorCharts.marketShareDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
              <BarChart data={marketShareData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="доляРынка" name={t("competitorCharts.marketShare")} fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {radarData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("competitorCharts.multifactorTitle")}</CardTitle>
              <CardDescription>{t("competitorCharts.multifactorDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="competitor" stroke="hsl(var(--foreground))" />
                  <PolarRadiusAxis stroke="hsl(var(--foreground))" />
                  <Radar
                    name={t("competitorCharts.price")}
                    dataKey="цена"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name={t("competitorCharts.quality")}
                    dataKey="качество"
                    stroke="hsl(var(--secondary))"
                    fill="hsl(var(--secondary))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name={t("competitorCharts.marketShare")}
                    dataKey="доляРынка"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent))"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {hasProducts && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Анализ продуктов конкурентов
              </CardTitle>
              <CardDescription>
                Детальное сравнение продуктовых линеек
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {avgPriceData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    Средние цены продуктов
                  </CardTitle>
                  <CardDescription>Сравнение ценовой политики</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
                    <BarChart data={avgPriceData}>
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
                      <Bar dataKey="средняяЦена" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-xs text-muted-foreground text-center">
                    {avgPriceData.map(d => (
                      <span key={d.name} className="inline-block mx-2">
                        {d.name}: {d.продуктов} продукт{d.продуктов > 1 ? 'ов' : ''}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {salesVolumeData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="w-4 h-4 text-accent" />
                    Объёмы продаж
                  </CardTitle>
                  <CardDescription>Годовые продажи в штуках</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
                    <BarChart data={salesVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => value.toLocaleString('ru-RU')}
                      />
                      <Legend />
                      <Bar dataKey="продажиШт" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {channelsPieData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-success" />
                  Распределение каналов продаж
                </CardTitle>
                <CardDescription>
                  Частота использования различных каналов продаж среди всех продуктов конкурентов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350} className="text-xs sm:text-sm">
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

          {productsComparisonData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Выручка по продуктам
                </CardTitle>
                <CardDescription>
                  Годовая выручка всех продуктов конкурентов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400} className="text-xs sm:text-sm">
                  <BarChart data={salesVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => value.toLocaleString('ru-RU') + ' ' + currencySymbol}
                    />
                    <Legend />
                    <Bar dataKey="выручка" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
