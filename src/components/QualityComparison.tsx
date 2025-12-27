import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Star, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { Product } from "./ProductsManagement";

interface Competitor {
  id: string;
  name: string;
  quality: number | null;
  revenue?: number | null;
  marketShare?: number | null;
}

interface QualityComparisonProps {
  products: Product[];
  competitors: Competitor[];
  companyName?: string;
}

export const QualityComparison = ({
  products,
  competitors,
  companyName = "Моя компания",
}: QualityComparisonProps) => {
  const [simulationMode, setSimulationMode] = useState(false);
  const [myQualityAdjustment, setMyQualityAdjustment] = useState(0);
  const [competitorAdjustments, setCompetitorAdjustments] = useState<Record<string, number>>({});

  // Calculate average quality of my products
  const myAverageQuality = useMemo(() => {
    if (products.length === 0) return 10;
    const totalQuality = products.reduce((sum, p) => sum + (p.quality ?? 10), 0);
    return totalQuality / products.length;
  }, [products]);

  // Calculate simulated quality
  const simulatedMyQuality = useMemo(() => {
    const adjusted = myAverageQuality + myQualityAdjustment;
    return Math.min(20, Math.max(1, adjusted));
  }, [myAverageQuality, myQualityAdjustment]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    const data = [
      {
        name: companyName,
        quality: simulationMode ? simulatedMyQuality : myAverageQuality,
        originalQuality: myAverageQuality,
        isMe: true,
      },
    ];

    competitors.forEach((comp) => {
      const originalQuality = comp.quality ?? 10;
      const adjustment = competitorAdjustments[comp.id] ?? 0;
      const simulatedQuality = simulationMode
        ? Math.min(20, Math.max(1, originalQuality + adjustment))
        : originalQuality;

      data.push({
        name: comp.name,
        quality: simulatedQuality,
        originalQuality: originalQuality,
        isMe: false,
      });
    });

    return data.sort((a, b) => b.quality - a.quality);
  }, [products, competitors, simulationMode, simulatedMyQuality, myAverageQuality, competitorAdjustments, companyName]);

  // Radar chart data for detailed comparison
  const radarData = useMemo(() => {
    const categories = ["Качество", "Стабильность", "Инновации", "Надежность", "Дизайн"];
    
    return categories.map((category, idx) => {
      const baseData: Record<string, string | number> = { category };
      
      // My company - derive scores from quality
      const myQuality = simulationMode ? simulatedMyQuality : myAverageQuality;
      baseData[companyName] = Math.min(20, Math.max(1, myQuality + (idx % 3 - 1) * 2));

      // Competitors
      competitors.slice(0, 3).forEach((comp) => {
        const originalQuality = comp.quality ?? 10;
        const adjustment = competitorAdjustments[comp.id] ?? 0;
        const quality = simulationMode
          ? Math.min(20, Math.max(1, originalQuality + adjustment))
          : originalQuality;
        baseData[comp.name] = Math.min(20, Math.max(1, quality + (idx % 3 - 1) * 2));
      });

      return baseData;
    });
  }, [myAverageQuality, simulatedMyQuality, competitors, simulationMode, competitorAdjustments, companyName]);

  const handleCompetitorAdjustment = (competitorId: string, value: number) => {
    setCompetitorAdjustments((prev) => ({
      ...prev,
      [competitorId]: value,
    }));
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 16) return "text-green-500";
    if (quality >= 11) return "text-yellow-500";
    return "text-red-500";
  };

  const getQualityBadge = (quality: number) => {
    if (quality >= 16) return { label: "Отлично", variant: "default" as const };
    if (quality >= 11) return { label: "Хорошо", variant: "secondary" as const };
    return { label: "Требует улучшения", variant: "destructive" as const };
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

  return (
    <div className="space-y-6">
      {/* Header with simulation toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Сравнение качества продукции
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="simulation-mode" className="text-sm">
                Режим моделирования
              </Label>
              <Switch
                id="simulation-mode"
                checked={simulationMode}
                onCheckedChange={setSimulationMode}
              />
              {simulationMode && (
                <Badge variant="outline" className="ml-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Симуляция
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Среднее качество (моя компания)</p>
              <div className="flex items-center gap-2 mt-1">
                <p className={`text-2xl font-bold ${getQualityColor(simulationMode ? simulatedMyQuality : myAverageQuality)}`}>
                  {(simulationMode ? simulatedMyQuality : myAverageQuality).toFixed(1)}
                </p>
                <span className="text-sm text-muted-foreground">/ 20</span>
                <Badge {...getQualityBadge(simulationMode ? simulatedMyQuality : myAverageQuality)} className="ml-2">
                  {getQualityBadge(simulationMode ? simulatedMyQuality : myAverageQuality).label}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Среднее качество конкурентов</p>
              <p className="text-2xl font-bold">
                {competitors.length > 0
                  ? (
                      competitors.reduce((sum, c) => {
                        const adj = competitorAdjustments[c.id] ?? 0;
                        return sum + ((c.quality ?? 10) + (simulationMode ? adj : 0));
                      }, 0) / competitors.length
                    ).toFixed(1)
                  : "—"}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Позиция по качеству</p>
              <p className="text-2xl font-bold">
                {chartData.findIndex((d) => d.isMe) + 1} из {chartData.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation controls */}
      {simulationMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Настройка сценария
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* My company adjustment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-medium">{companyName}</Label>
                <div className="flex items-center gap-2">
                  {myQualityAdjustment > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : myQualityAdjustment < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : null}
                  <span className={`font-mono ${myQualityAdjustment > 0 ? "text-green-500" : myQualityAdjustment < 0 ? "text-red-500" : ""}`}>
                    {myQualityAdjustment > 0 ? "+" : ""}
                    {myQualityAdjustment}
                  </span>
                </div>
              </div>
              <Slider
                value={[myQualityAdjustment]}
                onValueChange={([v]) => setMyQualityAdjustment(v)}
                min={-10}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Ухудшение (-10)</span>
                <span>Без изменений</span>
                <span>Улучшение (+10)</span>
              </div>
            </div>

            {/* Competitors adjustments */}
            {competitors.map((comp) => (
              <div key={comp.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{comp.name}</Label>
                  <div className="flex items-center gap-2">
                    {(competitorAdjustments[comp.id] ?? 0) > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (competitorAdjustments[comp.id] ?? 0) < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : null}
                    <span className={`font-mono ${(competitorAdjustments[comp.id] ?? 0) > 0 ? "text-green-500" : (competitorAdjustments[comp.id] ?? 0) < 0 ? "text-red-500" : ""}`}>
                      {(competitorAdjustments[comp.id] ?? 0) > 0 ? "+" : ""}
                      {competitorAdjustments[comp.id] ?? 0}
                    </span>
                  </div>
                </div>
                <Slider
                  value={[competitorAdjustments[comp.id] ?? 0]}
                  onValueChange={([v]) => handleCompetitorAdjustment(comp.id, v)}
                  min={-10}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Рейтинг качества</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" domain={[0, 20]} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [value.toFixed(1), "Качество"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="quality"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                  label={{ position: "right", fontSize: 12 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Многомерное сравнение</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 20]} tick={{ fontSize: 10 }} />
                <Radar
                  name={companyName}
                  dataKey={companyName}
                  stroke={COLORS[0]}
                  fill={COLORS[0]}
                  fillOpacity={0.3}
                />
                {competitors.slice(0, 3).map((comp, idx) => (
                  <Radar
                    key={comp.id}
                    name={comp.name}
                    dataKey={comp.name}
                    stroke={COLORS[(idx + 1) % COLORS.length]}
                    fill={COLORS[(idx + 1) % COLORS.length]}
                    fillOpacity={0.2}
                  />
                ))}
                <Legend />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Products quality breakdown */}
      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Качество по продуктам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.map((product) => {
                const quality = product.quality ?? 10;
                const badge = getQualityBadge(quality);
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${getQualityColor(quality)}`} />
                      <span className="font-medium truncate max-w-[150px]">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${getQualityColor(quality)}`}>
                        {quality}
                      </span>
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
