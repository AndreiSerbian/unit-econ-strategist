import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Percent, Save } from "lucide-react";

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

interface CompanyMetricsProps {
  currentMetrics: Metrics;
  setCurrentMetrics: (metrics: Metrics) => void;
  scenarioA: Metrics;
  setScenarioA: (metrics: Metrics) => void;
  scenarioB: Metrics;
  setScenarioB: (metrics: Metrics) => void;
  saveScenario: (scenarioType: string, metrics: Metrics) => Promise<void>;
  isAuthenticated: boolean;
  currency: string;
}

export const CompanyMetrics = ({
  currentMetrics,
  setCurrentMetrics,
  scenarioA,
  setScenarioA,
  scenarioB,
  setScenarioB,
  saveScenario,
  isAuthenticated,
  currency,
}: CompanyMetricsProps) => {
  const updateMetric = (
    scenario: "current" | "scenarioA" | "scenarioB",
    field: keyof Metrics,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    const setter = scenario === "current" ? setCurrentMetrics : scenario === "scenarioA" ? setScenarioA : setScenarioB;
    const current = scenario === "current" ? currentMetrics : scenario === "scenarioA" ? scenarioA : scenarioB;
    setter({ ...current, [field]: numValue });
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
              <Label htmlFor={`${scenario}-revenue`}>Общая выручка ({currency})</Label>
              <Input
                id={`${scenario}-revenue`}
                type="number"
                value={metrics.revenue || ""}
                onChange={(e) => updateMetric(scenario, "revenue", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-avgCheck`}>Средний чек ({currency})</Label>
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
              <Label htmlFor={`${scenario}-fixedCosts`}>Постоянные расходы ({currency})</Label>
              <Input
                id={`${scenario}-fixedCosts`}
                type="number"
                value={metrics.fixedCosts || ""}
                onChange={(e) => updateMetric(scenario, "fixedCosts", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-variableCosts`}>Переменные расходы ({currency})</Label>
              <Input
                id={`${scenario}-variableCosts`}
                type="number"
                value={metrics.variableCosts || ""}
                onChange={(e) => updateMetric(scenario, "variableCosts", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-marketingCosts`}>Маркетинг ({currency})</Label>
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
                {metrics.revenue.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Общие расходы</p>
              <p className="text-2xl font-bold text-destructive font-mono">
                {(metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts).toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Прибыль</p>
              <p className={`text-2xl font-bold font-mono ${calculateProfit(metrics) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {calculateProfit(metrics).toLocaleString("ru-RU")} {currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAuthenticated && (
        <Button 
          onClick={() => saveScenario(scenario, metrics)} 
          className="w-full"
          variant="gradient"
        >
          <Save className="w-4 h-4 mr-2" />
          Сохранить сценарий
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-6">Текущая ситуация</h2>
        <MetricsForm metrics={currentMetrics} scenario="current" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Сценарий A</h2>
        <MetricsForm metrics={scenarioA} scenario="scenarioA" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Сценарий Б</h2>
        <MetricsForm metrics={scenarioB} scenario="scenarioB" />
      </div>
    </div>
  );
};
