import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, Globe, BarChart3, PieChart, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";

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
  const [marketData, setMarketData] = useState<MarketData>({
    marketSize: 0,
    marketGrowthRate: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadMarketOverview();
    }
  }, [projectId]);

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
        setMarketData({
          marketSize: Number(data.market_size) || 0,
          marketGrowthRate: Number(data.market_growth_rate) || 0,
        });
      }
    } catch (error: any) {
      console.error("Error loading market overview:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveMarketOverview = async () => {
    if (!projectId) {
      toast.error("Требуется авторизация");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("market_overview").upsert({
        project_id: projectId,
        market_size: marketData.marketSize,
        market_growth_rate: marketData.marketGrowthRate,
      });

      if (error) throw error;
      toast.success("Обзор рынка сохранен");
    } catch (error: any) {
      console.error("Error saving market overview:", error);
      toast.error("Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof MarketData, value: string) => {
    setMarketData({ ...marketData, [field]: parseFloat(value) || 0 });
  };

  // Calculate total analyzed revenue
  const totalAnalyzedRevenue = myCompanyRevenue + competitors.reduce((sum, c) => sum + c.revenue, 0);
  const analyzedMarketShare = marketData.marketSize > 0 ? (totalAnalyzedRevenue / marketData.marketSize) * 100 : 0;
  const unanalyzedMarketShare = 100 - analyzedMarketShare;

  // Market share distribution data
  const marketShareData = [
    { name: "Моя компания", value: myCompanyRevenue, share: marketData.marketSize > 0 ? (myCompanyRevenue / marketData.marketSize) * 100 : 0 },
    ...competitors.map(c => ({
      name: c.name,
      value: c.revenue,
      share: marketData.marketSize > 0 ? (c.revenue / marketData.marketSize) * 100 : 0,
    })),
    { name: "Остальной рынок", value: marketData.marketSize - totalAnalyzedRevenue, share: unanalyzedMarketShare },
  ].filter(item => item.value > 0);

  // Market growth projection (3 years)
  const growthProjection = [
    { year: "Текущий", size: marketData.marketSize },
    { year: "Год +1", size: marketData.marketSize * (1 + marketData.marketGrowthRate / 100) },
    { year: "Год +2", size: marketData.marketSize * Math.pow(1 + marketData.marketGrowthRate / 100, 2) },
    { year: "Год +3", size: marketData.marketSize * Math.pow(1 + marketData.marketGrowthRate / 100, 3) },
  ];

  // Company revenue projections
  const revenueProjections = [
    {
      year: "Текущий",
      myCompany: myCompanyRevenue,
      ...competitors.reduce((acc, c) => ({ ...acc, [c.name]: c.revenue }), {}),
    },
    {
      year: "Год +1",
      myCompany: myCompanyRevenue * (1 + marketData.marketGrowthRate / 100),
      ...competitors.reduce((acc, c) => ({ ...acc, [c.name]: c.revenue * (1 + marketData.marketGrowthRate / 100) }), {}),
    },
    {
      year: "Год +2",
      myCompany: myCompanyRevenue * Math.pow(1 + marketData.marketGrowthRate / 100, 2),
      ...competitors.reduce((acc, c) => ({ ...acc, [c.name]: c.revenue * Math.pow(1 + marketData.marketGrowthRate / 100, 2) }), {}),
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          🌍 Обзор рынка
        </CardTitle>
        <CardDescription>
          Анализ размера рынка и расчёт доли анализируемых компаний
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="market-size" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Размер рынка ({currency})
              </Label>
              <Input
                id="market-size"
                type="number"
                min="0"
                value={marketData.marketSize || ""}
                onChange={(e) => updateField("marketSize", e.target.value)}
                placeholder="Например: 1000000000"
              />
              <p className="text-xs text-muted-foreground">
                Общий объём рынка в денежном выражении
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="growth-rate" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Темп роста рынка (% в год)
              </Label>
              <Input
                id="growth-rate"
                type="number"
                step="0.1"
                value={marketData.marketGrowthRate || ""}
                onChange={(e) => updateField("marketGrowthRate", e.target.value)}
                placeholder="Например: 15"
              />
              <p className="text-xs text-muted-foreground">
                Ожидаемый годовой рост рынка
              </p>
            </div>

            {projectId && (
              <Button onClick={saveMarketOverview} disabled={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Сохранение..." : "Сохранить"}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-card border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Анализируемая доля рынка
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Моя компания:</span>
                  <span className="font-mono font-semibold">
                    {myCompanyRevenue.toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Конкуренты:</span>
                  <span className="font-mono font-semibold">
                    {competitors.reduce((sum, c) => sum + c.revenue, 0).toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-sm font-semibold">Всего анализируем:</span>
                  <span className="font-mono font-bold text-primary">
                    {totalAnalyzedRevenue.toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
                {marketData.marketSize > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-primary/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Доля рынка:</span>
                      <span className="font-mono font-bold text-primary text-xl">
                        {analyzedMarketShare.toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      от общего размера рынка
                    </p>
                  </div>
                )}
              </div>
            </div>

            {marketData.marketSize > 0 && marketData.marketGrowthRate > 0 && (
              <div className="p-4 rounded-lg bg-card border">
                <h3 className="font-semibold mb-2 text-sm">Прогноз через 3 года:</h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Размер рынка:</span>
                    <span className="font-mono font-semibold text-sm">
                      {growthProjection[3].size.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Рост в {marketData.marketGrowthRate}% годовых:</span>
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
              <h3 className="text-lg font-semibold mb-4">Распределение долей рынка</h3>
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
                    formatter={(value: number) => `${value.toLocaleString("ru-RU")} ${currency}`}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            {marketData.marketGrowthRate > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Прогноз роста рынка</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={growthProjection}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="year" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        formatter={(value: number) => value.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " " + currency}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="size" name="Размер рынка" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Прогноз выручки компаний</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueProjections}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="year" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        formatter={(value: number) => value.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " " + currency}
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Legend />
                      <Bar dataKey="myCompany" name="Моя компания" fill="hsl(var(--primary))" />
                      {competitors.map((c, idx) => (
                        <Bar key={c.id} dataKey={c.name} name={c.name} fill={COLORS[(idx + 1) % COLORS.length]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Прогноз при условии роста всех компаний темпом рынка ({marketData.marketGrowthRate}%)
                  </p>
                </div>
              </>
            )}

            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-semibold mb-2 text-sm">💡 Интерпретация:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <span className="font-semibold">Анализируемая доля {analyzedMarketShare.toFixed(1)}%</span> — охват вашего анализа от общего рынка</li>
                <li>• <span className="font-semibold">Остальной рынок {unanalyzedMarketShare.toFixed(1)}%</span> — потенциал для роста и захвата доли</li>
                {marketData.marketGrowthRate > 0 && (
                  <li>• При росте рынка в <span className="font-semibold">{marketData.marketGrowthRate}%</span> ежегодно через 3 года рынок вырастет на <span className="font-semibold">{((Math.pow(1 + marketData.marketGrowthRate / 100, 3) - 1) * 100).toFixed(0)}%</span></li>
                )}
              </ul>
            </div>
          </div>
        )}

        {(!projectId) && (
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-center">
            <p className="text-sm text-warning">
              Авторизуйтесь для сохранения данных обзора рынка
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
