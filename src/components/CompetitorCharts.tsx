import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";

interface Competitor {
  id: string;
  name: string;
  revenue: number;
  marketShare: number;
  pricing: number;
  quality: number;
  marketingSpend: number;
}

interface CompetitorChartsProps {
  competitors: Competitor[];
}

export const CompetitorCharts = ({ competitors }: CompetitorChartsProps) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Сравнение выручки и маркетинговых расходов
          </CardTitle>
          <CardDescription>
            Финансовые показатели конкурентов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
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
              <Bar dataKey="выручка" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="маркетинг" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Доля рынка</CardTitle>
            <CardDescription>Распределение рыночных долей</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
                <Bar dataKey="доляРынка" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {radarData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Многофакторный анализ</CardTitle>
              <CardDescription>Сравнение по ключевым показателям</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="competitor" stroke="hsl(var(--foreground))" />
                  <PolarRadiusAxis stroke="hsl(var(--foreground))" />
                  <Radar
                    name="Цена"
                    dataKey="цена"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Качество"
                    dataKey="качество"
                    stroke="hsl(var(--secondary))"
                    fill="hsl(var(--secondary))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Доля рынка"
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
    </div>
  );
};
