import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Percent } from "lucide-react";

interface Metrics {
  revenue: number;
  totalClients: number;
  newClients: number;
  returningClients: number;
  conversionRate: number;
  avgCheck: number;
  fixedCosts: number;
  variableCosts: number;
  marketingCosts: number;
}

const initialMetrics: Metrics = {
  revenue: 0,
  totalClients: 0,
  newClients: 0,
  returningClients: 0,
  conversionRate: 0,
  avgCheck: 0,
  fixedCosts: 0,
  variableCosts: 0,
  marketingCosts: 0,
};

export const CompanyMetrics = () => {
  const [currentMetrics, setCurrentMetrics] = useState<Metrics>(initialMetrics);
  const [scenarioA, setScenarioA] = useState<Metrics>(initialMetrics);
  const [scenarioB, setScenarioB] = useState<Metrics>(initialMetrics);

  const updateMetric = (
    scenario: "current" | "scenarioA" | "scenarioB",
    field: keyof Metrics,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    const setter = scenario === "current" ? setCurrentMetrics : scenario === "scenarioA" ? setScenarioA : setScenarioB;
    setter((prev) => ({ ...prev, [field]: numValue }));
  };

  const calculateProfit = (metrics: Metrics) => {
    return metrics.revenue - metrics.fixedCosts - metrics.variableCosts - metrics.marketingCosts;
  };

  const MetricsForm = ({ 
    metrics, 
    scenario 
  }: { 
    metrics: Metrics; 
    scenario: "current" | "scenarioA" | "scenarioB" 
  }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Выручка и доходы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-revenue`}>Общая выручка (₽)</Label>
              <Input
                id={`${scenario}-revenue`}
                type="number"
                value={metrics.revenue || ""}
                onChange={(e) => updateMetric(scenario, "revenue", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-avgCheck`}>Средний чек (₽)</Label>
              <Input
                id={`${scenario}-avgCheck`}
                type="number"
                value={metrics.avgCheck || ""}
                onChange={(e) => updateMetric(scenario, "avgCheck", e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              Клиенты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-totalClients`}>Всего клиентов</Label>
              <Input
                id={`${scenario}-totalClients`}
                type="number"
                value={metrics.totalClients || ""}
                onChange={(e) => updateMetric(scenario, "totalClients", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-newClients`}>Новые</Label>
                <Input
                  id={`${scenario}-newClients`}
                  type="number"
                  value={metrics.newClients || ""}
                  onChange={(e) => updateMetric(scenario, "newClients", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-returningClients`}>Повторные</Label>
                <Input
                  id={`${scenario}-returningClients`}
                  type="number"
                  value={metrics.returningClients || ""}
                  onChange={(e) => updateMetric(scenario, "returningClients", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Percent className="w-4 h-4 text-accent" />
              Конверсия
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-conversionRate`}>Конверсия в оплату (%)</Label>
              <Input
                id={`${scenario}-conversionRate`}
                type="number"
                value={metrics.conversionRate || ""}
                onChange={(e) => updateMetric(scenario, "conversionRate", e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-destructive" />
              Расходы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-fixedCosts`}>Постоянные расходы (₽)</Label>
              <Input
                id={`${scenario}-fixedCosts`}
                type="number"
                value={metrics.fixedCosts || ""}
                onChange={(e) => updateMetric(scenario, "fixedCosts", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-variableCosts`}>Переменные расходы (₽)</Label>
              <Input
                id={`${scenario}-variableCosts`}
                type="number"
                value={metrics.variableCosts || ""}
                onChange={(e) => updateMetric(scenario, "variableCosts", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-marketingCosts`}>Маркетинг (₽)</Label>
              <Input
                id={`${scenario}-marketingCosts`}
                type="number"
                value={metrics.marketingCosts || ""}
                onChange={(e) => updateMetric(scenario, "marketingCosts", e.target.value)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle>Итоговые показатели</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Выручка</p>
              <p className="text-2xl font-bold text-primary font-mono">
                {metrics.revenue.toLocaleString("ru-RU")} ₽
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Общие расходы</p>
              <p className="text-2xl font-bold text-destructive font-mono">
                {(metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts).toLocaleString("ru-RU")} ₽
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Прибыль</p>
              <p className={`text-2xl font-bold font-mono ${calculateProfit(metrics) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {calculateProfit(metrics).toLocaleString("ru-RU")} ₽
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Tabs defaultValue="current" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="current">Текущая ситуация</TabsTrigger>
        <TabsTrigger value="scenarioA">Сценарий A</TabsTrigger>
        <TabsTrigger value="scenarioB">Сценарий Б</TabsTrigger>
      </TabsList>

      <TabsContent value="current" className="mt-6">
        <MetricsForm metrics={currentMetrics} scenario="current" />
      </TabsContent>

      <TabsContent value="scenarioA" className="mt-6">
        <MetricsForm metrics={scenarioA} scenario="scenarioA" />
      </TabsContent>

      <TabsContent value="scenarioB" className="mt-6">
        <MetricsForm metrics={scenarioB} scenario="scenarioB" />
      </TabsContent>
    </Tabs>
  );
};
