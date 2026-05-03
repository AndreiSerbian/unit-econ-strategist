import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Trophy, TrendingUp, Settings } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface Competitor {
  id: string;
  name: string;
  revenue: number;
  marketShare: number;
  pricing: number;
  quality: number;
  marketingSpend: number;
}

interface CompetitiveScoreCalculatorProps {
  myCompany: {
    name: string;
    revenue: number;
    marketShare: number;
    pricing: number;
    quality: number;
    marketingSpend: number;
  };
  competitors: Competitor[];
  currency: string;
}

export const CompetitiveScoreCalculator = ({
  myCompany,
  competitors,
  currency,
}: CompetitiveScoreCalculatorProps) => {
  const { t, language } = useTranslation();
  const numLocale = language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : "en-US";
  const [weights, setWeights] = useState({
    quality: 25,
    pricing: 25,
    marketing: 25,
    marketShare: 25,
  });

  const updateWeight = (key: keyof typeof weights, value: number) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Normalizes a value to 0-100 scale.
   * Returns 50 when all values are equal (fair middle ground).
   */
  const normalizeValue = (value: number, min: number, max: number) => {
    if (max === min) return 50; // All equal = everyone gets average score
    return ((value - min) / (max - min)) * 100;
  };

  const calculateCompetitiveScore = () => {
    const allCompanies = [
      { ...myCompany, id: "my-company" },
      ...competitors,
    ];

    // Находим min/max для нормализации
    const qualities = allCompanies.map(c => c.quality);
    const pricings = allCompanies.map(c => c.pricing);
    const marketings = allCompanies.map(c => c.marketingSpend);
    const marketShares = allCompanies.map(c => c.marketShare);

    const minQuality = Math.min(...qualities);
    const maxQuality = Math.max(...qualities);
    const minPricing = Math.min(...pricings);
    const maxPricing = Math.max(...pricings);
    const minMarketing = Math.min(...marketings);
    const maxMarketing = Math.max(...marketings);
    const minMarketShare = Math.min(...marketShares);
    const maxMarketShare = Math.max(...marketShares);

    // Рассчитываем интегральный показатель для каждой компании
    const scores = allCompanies.map((company) => {
      // Нормализуем значения (0-100)
      const normalizedQuality = normalizeValue(company.quality, minQuality, maxQuality);
      // Для цены - чем ниже, тем лучше (инвертируем)
      const normalizedPricing = 100 - normalizeValue(company.pricing, minPricing, maxPricing);
      const normalizedMarketing = normalizeValue(company.marketingSpend, minMarketing, maxMarketing);
      const normalizedMarketShare = normalizeValue(company.marketShare, minMarketShare, maxMarketShare);

      // Взвешенная сумма
      const totalWeight = weights.quality + weights.pricing + weights.marketing + weights.marketShare;
      const score =
        (normalizedQuality * weights.quality +
          normalizedPricing * weights.pricing +
          normalizedMarketing * weights.marketing +
          normalizedMarketShare * weights.marketShare) /
        totalWeight;

      return {
        name: company.name,
        score: Math.round(score * 10) / 10,
        quality: Math.round(normalizedQuality * 10) / 10,
        pricing: Math.round(normalizedPricing * 10) / 10,
        marketing: Math.round(normalizedMarketing * 10) / 10,
        marketShare: Math.round(normalizedMarketShare * 10) / 10,
        rawData: {
          quality: company.quality,
          pricing: company.pricing,
          marketingSpend: company.marketingSpend,
          marketShare: company.marketShare,
        },
      };
    });

    // Сортируем по убыванию интегрального показателя
    return scores.sort((a, b) => b.score - a.score);
  };

  const scores = calculateCompetitiveScore();
  const totalWeight = weights.quality + weights.pricing + weights.marketing + weights.marketShare;

  // Данные для радарной диаграммы (сравнение топ-3 компаний)
  const radarData = [
    {
      metric: t("competitiveScore.radarQuality"),
      ...scores.slice(0, 3).reduce((acc, company, idx) => {
        acc[company.name] = company.quality;
        return acc;
      }, {} as any),
    },
    {
      metric: t("competitiveScore.radarPricing"),
      ...scores.slice(0, 3).reduce((acc, company, idx) => {
        acc[company.name] = company.pricing;
        return acc;
      }, {} as any),
    },
    {
      metric: t("competitiveScore.radarMarketing"),
      ...scores.slice(0, 3).reduce((acc, company, idx) => {
        acc[company.name] = company.marketing;
        return acc;
      }, {} as any),
    },
    {
      metric: t("competitiveScore.radarMarketShare"),
      ...scores.slice(0, 3).reduce((acc, company, idx) => {
        acc[company.name] = company.marketShare;
        return acc;
      }, {} as any),
    },
  ];

  const CHART_COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(220 70% 50%)",
    "hsl(280 70% 50%)",
  ];

  const hasIncompleteData = myCompany.revenue === 0 && myCompany.marketingSpend === 0 && myCompany.pricing === 0;

  return (
    <div className="space-y-6">
      {hasIncompleteData && (
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            {t("competitiveScore.incompleteWarning")}
          </p>
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            {t("competitiveScore.weightsTitle")}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {t("competitiveScore.weightsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm sm:text-base">{t("competitiveScore.qualityWeight")}</Label>
                <span className="text-sm font-mono font-semibold text-primary">
                  {weights.quality}% ({((weights.quality / totalWeight) * 100).toFixed(0)}%)
                </span>
              </div>
              <Slider
                value={[weights.quality]}
                onValueChange={(value) => updateWeight("quality", value[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm sm:text-base">{t("competitiveScore.pricingWeight")}</Label>
                <span className="text-sm font-mono font-semibold text-secondary">
                  {weights.pricing}% ({((weights.pricing / totalWeight) * 100).toFixed(0)}%)
                </span>
              </div>
              <Slider
                value={[weights.pricing]}
                onValueChange={(value) => updateWeight("pricing", value[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm sm:text-base">{t("competitiveScore.marketingWeight")}</Label>
                <span className="text-sm font-mono font-semibold text-accent">
                  {weights.marketing}% ({((weights.marketing / totalWeight) * 100).toFixed(0)}%)
                </span>
              </div>
              <Slider
                value={[weights.marketing]}
                onValueChange={(value) => updateWeight("marketing", value[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm sm:text-base">{t("competitiveScore.marketShareWeight")}</Label>
                <span className="text-sm font-mono font-semibold text-success">
                  {weights.marketShare}% ({((weights.marketShare / totalWeight) * 100).toFixed(0)}%)
                </span>
              </div>
              <Slider
                value={[weights.marketShare]}
                onValueChange={(value) => updateWeight("marketShare", value[0])}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("competitiveScore.weightsTotal")}</span>
              <span className="text-lg font-bold font-mono">{totalWeight}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
            🏆 Рейтинг конкурентоспособности
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Интегральный показатель конкурентоспособности на основе заданных весов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400} className="text-xs sm:text-sm">
            <BarChart data={scores} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={120} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold mb-2">{data.name}</p>
                        <p className="text-sm mb-1">
                          Интегральный показатель: <span className="font-bold">{data.score}</span>
                        </p>
                        <div className="text-xs space-y-1 mt-2 pt-2 border-t">
                          <p>Качество: {data.quality} (факт: {data.rawData.quality}/20)</p>
                          <p>Цена: {data.pricing} (факт: {data.rawData.pricing.toLocaleString()} {currency})</p>
                          <p>Маркетинг: {data.marketing} (факт: {data.rawData.marketingSpend.toLocaleString()} {currency})</p>
                          <p>Доля рынка: {data.marketShare} (факт: {data.rawData.marketShare}%)</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            🎯 Сравнительный анализ топ-3 компаний
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Многомерное сравнение лидеров по всем параметрам (нормализованные значения 0-100)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400} className="text-xs sm:text-sm">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              {scores.slice(0, 3).map((company, index) => (
                <Radar
                  key={company.name}
                  name={company.name}
                  dataKey={company.name}
                  stroke={CHART_COLORS[index]}
                  fill={CHART_COLORS[index]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">📊 Детальный рейтинг компаний</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[700px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Место</th>
                  <th className="text-left p-2 font-semibold">Компания</th>
                  <th className="text-right p-2 font-semibold">Интегральный показатель</th>
                  <th className="text-right p-2 font-semibold">Качество</th>
                  <th className="text-right p-2 font-semibold">Цена</th>
                  <th className="text-right p-2 font-semibold">Маркетинг</th>
                  <th className="text-right p-2 font-semibold">Доля рынка</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((company, index) => (
                  <tr
                    key={company.name}
                    className={`border-b hover:bg-muted/50 ${
                      company.name === myCompany.name ? "bg-primary/5 font-medium" : ""
                    }`}
                  >
                    <td className="p-2">
                      {index === 0 && <span className="text-lg">🥇</span>}
                      {index === 1 && <span className="text-lg">🥈</span>}
                      {index === 2 && <span className="text-lg">🥉</span>}
                      {index > 2 && <span className="font-mono">{index + 1}</span>}
                    </td>
                    <td className="p-2 font-medium">{company.name}</td>
                    <td className="text-right p-2">
                      <span className="font-bold font-mono text-primary">{company.score}</span>
                    </td>
                    <td className="text-right p-2 font-mono">{company.quality}</td>
                    <td className="text-right p-2 font-mono">{company.pricing}</td>
                    <td className="text-right p-2 font-mono">{company.marketing}</td>
                    <td className="text-right p-2 font-mono">{company.marketShare}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
