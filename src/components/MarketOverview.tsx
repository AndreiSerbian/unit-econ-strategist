import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, Globe, BarChart3, PieChart, Save, Calculator, Edit3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { useTranslation } from "@/i18n/useTranslation";

interface Competitor {
  id: string;
  name: string;
  revenue: number;
  marketShare: number;
}

interface MarketOverviewProps {
  projectId: string | null;
  myCompanyRevenue: number;
  competitors: Competitor[];
  currency: string;
}

interface MarketData {
  marketSize: number;
  marketGrowthRate: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--success))'];

export const MarketOverview = ({ projectId, myCompanyRevenue, competitors, currency }: MarketOverviewProps) => {
  const { t, language } = useTranslation();
  const localeMap: Record<string, string> = { ru: "ru-RU", en: "en-US", ro: "ro-RO" };
  const locale = localeMap[language] ?? "en-US";
  const [marketData, setMarketData] = useState<MarketData>({
    marketSize: 0,
    marketGrowthRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isAutoCalculated, setIsAutoCalculated] = useState(true);

  // Автоматический расчёт объёма рынка на основе выручки и долей
  const calculateMarketSize = () => {
    // Собираем все компании с известной выручкой и долей рынка
    const companiesWithData: { revenue: number; marketShare: number }[] = [];

    // Добавляем конкурентов с данными
    competitors.forEach(c => {
      if (c.revenue > 0 && c.marketShare > 0) {
        companiesWithData.push({ revenue: c.revenue, marketShare: c.marketShare });
      }
    });

    if (companiesWithData.length === 0) {
      return 0;
    }

    // Рассчитываем объём рынка как среднее от (выручка / доля) для каждой компании
    const estimates = companiesWithData.map(c => c.revenue / (c.marketShare / 100));
    const avgMarketSize = estimates.reduce((sum, e) => sum + e, 0) / estimates.length;

    return Math.round(avgMarketSize);
  };

  const autoMarketSize = calculateMarketSize();

  useEffect(() => {
    if (projectId) {
      loadMarketOverview();
    }
  }, [projectId]);

  // Автоматически обновляем объём рынка при изменении данных (если включен автоподсчёт)
  useEffect(() => {
    if (isAutoCalculated && autoMarketSize > 0) {
      setMarketData(prev => ({ ...prev, marketSize: autoMarketSize }));
    }
  }, [autoMarketSize, isAutoCalculated]);

  const loadMarketOverview = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("market_overview")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const savedMarketSize = Number(data.market_size) || 0;
        setMarketData({
          marketSize: savedMarketSize,
          marketGrowthRate: Number(data.market_growth_rate) || 0,
        });
        // Если сохранённое значение отличается от авто-рассчитанного, выключаем авторасчёт
        if (savedMarketSize > 0 && autoMarketSize > 0 && Math.abs(savedMarketSize - autoMarketSize) > autoMarketSize * 0.1) {
          setIsAutoCalculated(false);
        }
      }
    } catch (error: any) {
      console.error("Error loading market overview:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveMarketOverview = async () => {
    if (!projectId) {
      toast.error(t("marketOverview.requireAuth"));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("market_overview").upsert({
        project_id: projectId,
        market_size: marketData.marketSize,
        market_growth_rate: marketData.marketGrowthRate,
      }, { onConflict: 'project_id' });

      if (error) throw error;
      toast.success(t("marketOverview.saved"));
    } catch (error: any) {
      console.error("Error saving market overview:", error);
      toast.error(t("marketOverview.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof MarketData, value: string) => {
    if (field === 'marketSize') {
      setIsAutoCalculated(false); // Отключаем авторасчёт при ручном вводе
    }
    setMarketData({ ...marketData, [field]: parseFloat(value) || 0 });
  };

  const enableAutoCalculation = () => {
    setIsAutoCalculated(true);
    if (autoMarketSize > 0) {
      setMarketData(prev => ({ ...prev, marketSize: autoMarketSize }));
    }
  };

  // Calculate total analyzed revenue
  const totalAnalyzedRevenue = myCompanyRevenue + competitors.reduce((sum, c) => sum + c.revenue, 0);
  const analyzedMarketShare = marketData.marketSize > 0 ? (totalAnalyzedRevenue / marketData.marketSize) * 100 : 0;
  const unanalyzedMarketShare = 100 - analyzedMarketShare;

  // Market share distribution data
  const marketShareData = [
    { name: t("marketOverview.myCompanySeries"), value: myCompanyRevenue, share: marketData.marketSize > 0 ? (myCompanyRevenue / marketData.marketSize) * 100 : 0 },
    ...competitors.map(c => ({
      name: c.name,
      value: c.revenue,
      share: marketData.marketSize > 0 ? (c.revenue / marketData.marketSize) * 100 : 0,
    })),
    { name: t("marketOverview.otherMarket"), value: marketData.marketSize - totalAnalyzedRevenue, share: unanalyzedMarketShare },
  ].filter(item => item.value > 0);

  // Market growth projection (3 years)
  const growthProjection = [
    { year: t("marketOverview.yearCurrent"), size: marketData.marketSize },
    { year: t("marketOverview.yearPlus1"), size: marketData.marketSize * (1 + marketData.marketGrowthRate / 100) },
    { year: t("marketOverview.yearPlus2"), size: marketData.marketSize * Math.pow(1 + marketData.marketGrowthRate / 100, 2) },
    { year: t("marketOverview.yearPlus3"), size: marketData.marketSize * Math.pow(1 + marketData.marketGrowthRate / 100, 3) },
  ];

  // Company revenue projections
  const revenueProjections = [
    {
      year: t("marketOverview.yearCurrent"),
      myCompany: myCompanyRevenue,
      ...competitors.reduce((acc, c) => ({ ...acc, [c.name]: c.revenue }), {}),
    },
    {
      year: t("marketOverview.yearPlus1"),
      myCompany: myCompanyRevenue * (1 + marketData.marketGrowthRate / 100),
      ...competitors.reduce((acc, c) => ({ ...acc, [c.name]: c.revenue * (1 + marketData.marketGrowthRate / 100) }), {}),
    },
    {
      year: t("marketOverview.yearPlus2"),
      myCompany: myCompanyRevenue * Math.pow(1 + marketData.marketGrowthRate / 100, 2),
      ...competitors.reduce((acc, c) => ({ ...acc, [c.name]: c.revenue * Math.pow(1 + marketData.marketGrowthRate / 100, 2) }), {}),
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          {t("marketOverview.title")}
        </CardTitle>
        <CardDescription>
          {t("marketOverview.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="market-size" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t("marketOverview.marketSize", { currency })}
                </Label>
                <div className="flex items-center gap-2">
                  <Calculator className={`w-4 h-4 ${isAutoCalculated ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Switch
                    checked={isAutoCalculated}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        enableAutoCalculation();
                      } else {
                        setIsAutoCalculated(false);
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{t("marketOverview.auto")}</span>
                </div>
              </div>
              <Input
                id="market-size"
                type="number"
                min="0"
                value={marketData.marketSize || ""}
                onChange={(e) => updateField("marketSize", e.target.value)}
                placeholder={t("marketOverview.marketSizePlaceholder")}
                disabled={isAutoCalculated}
                className={isAutoCalculated ? "bg-muted" : ""}
              />
              {isAutoCalculated ? (
                <p className="text-xs text-primary flex items-center gap-1">
                  <Calculator className="w-3 h-3" />
                  {t("marketOverview.autoCalcHint")}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  {t("marketOverview.manualHint")}
                </p>
              )}
              {autoMarketSize > 0 && !isAutoCalculated && (
                <Button variant="outline" size="sm" onClick={enableAutoCalculation} className="text-xs">
                  <Calculator className="w-3 h-3 mr-1" />
                  {t("marketOverview.useAuto", { value: autoMarketSize.toLocaleString(locale), currency })}
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="growth-rate" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t("marketOverview.growthRate")}
              </Label>
              <Input
                id="growth-rate"
                type="number"
                step="0.1"
                value={marketData.marketGrowthRate || ""}
                onChange={(e) => updateField("marketGrowthRate", e.target.value)}
                placeholder={t("marketOverview.growthPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">
                {t("marketOverview.growthHint")}
              </p>
            </div>

            {projectId && (
              <Button onClick={saveMarketOverview} disabled={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {loading ? t("marketOverview.saving") : t("marketOverview.save")}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-card border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                {t("marketOverview.analyzedShareTitle")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("marketOverview.myCompany")}</span>
                  <span className="font-mono font-semibold">
                    {myCompanyRevenue.toLocaleString(locale)} {currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("marketOverview.competitorsLabel")}</span>
                  <span className="font-mono font-semibold">
                    {competitors.reduce((sum, c) => sum + c.revenue, 0).toLocaleString(locale)} {currency}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-sm font-semibold">{t("marketOverview.totalAnalyzed")}</span>
                  <span className="font-mono font-bold text-primary">
                    {totalAnalyzedRevenue.toLocaleString(locale)} {currency}
                  </span>
                </div>
                {marketData.marketSize > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-primary/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">{t("marketOverview.marketShare")}</span>
                      <span className="font-mono font-bold text-primary text-xl">
                        {analyzedMarketShare.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("marketOverview.fromTotal")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {marketData.marketSize > 0 && marketData.marketGrowthRate > 0 && (
              <div className="p-4 rounded-lg bg-card border">
                <h3 className="font-semibold mb-2 text-sm">{t("marketOverview.forecast3y")}</h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{t("marketOverview.marketSizeShort")}</span>
                    <span className="font-mono font-semibold text-sm">
                      {growthProjection[3].size.toLocaleString(locale, { maximumFractionDigits: 0 })} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{t("marketOverview.growthAnnual", { rate: marketData.marketGrowthRate })}</span>
                    <span className="font-mono font-semibold text-success text-sm">
                      +{((growthProjection[3].size - marketData.marketSize) / marketData.marketSize * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {marketData.marketSize > 0 && totalAnalyzedRevenue > 0 && (
          <div className="space-y-6 mt-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("marketOverview.distributionTitle")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={marketShareData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.share.toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {marketShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString(locale)} ${currency}`}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            {marketData.marketGrowthRate > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("marketOverview.growthForecastTitle")}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={growthProjection}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="year" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        formatter={(value: number) => value.toLocaleString(locale, { maximumFractionDigits: 0 }) + " " + currency}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="size" name={t("marketOverview.marketSizeSeries")} stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("marketOverview.revenueForecastTitle")}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueProjections}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="year" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        formatter={(value: number) => value.toLocaleString(locale, { maximumFractionDigits: 0 }) + " " + currency}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Legend />
                      <Bar dataKey="myCompany" name={t("marketOverview.myCompanySeries")} fill="hsl(var(--primary))" />
                      {competitors.map((c, idx) => (
                        <Bar key={c.id} dataKey={c.name} name={c.name} fill={COLORS[(idx + 1) % COLORS.length]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {t("marketOverview.forecastNote", { rate: marketData.marketGrowthRate })}
                  </p>
                </div>
              </>
            )}

            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-semibold mb-2 text-sm">{t("marketOverview.interpretationTitle")}</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <span className="font-semibold">{t("marketOverview.analyzedShareNote", { value: analyzedMarketShare.toFixed(1) })}</span>{t("marketOverview.analyzedShareDesc")}</li>
                <li>• <span className="font-semibold">{t("marketOverview.remainingShareNote", { value: unanalyzedMarketShare.toFixed(1) })}</span>{t("marketOverview.remainingShareDesc")}</li>
                {marketData.marketGrowthRate > 0 && (
                  <li>• {t("marketOverview.growthInterpretation", { rate: marketData.marketGrowthRate, growth: ((Math.pow(1 + marketData.marketGrowthRate / 100, 3) - 1) * 100).toFixed(0) })}</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {(!projectId) && (
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-center">
            <p className="text-sm text-warning">
              {t("marketOverview.authRequiredHint")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
