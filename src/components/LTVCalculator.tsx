import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TrendingUp, DollarSign, AlertTriangle, CheckCircle2, Calendar, Repeat } from "lucide-react";
import { calculateLTV, calculateLTVCACRatio, calculateChurnRate, calculateRetentionRate, calculatePaybackPeriod, calculateCAC } from "@/utils/metricsCalculations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface DetailedExpenses {
  fixedCosts: {
    salaryOldClients: number;
    salaryNewClients: number;
    officeRent: number;
    warehouseRent: number;
    managementSalary: number;
    marketingSalary: number;
    productionSalary: number;
    internet: number;
    communication: number;
    banking: number;
    subscriptions: number;
    utilities: number;
    customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
  };
  variableCosts: {
    marketing: {
      trafficPurchase: number;
      contractorsPayment: number;
      crmCosts: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    salesPayroll: {
      bonusOldClients: number;
      bonusNewClients: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    production: {
      materials: number;
      curators: number;
      logistics: number;
      partnersPercent: number;
      equipmentRepair: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    other: {
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
  };
  taxRate: number;
  taxes: number;
}

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
  detailedExpenses?: DetailedExpenses;
  customerLifetimeMonths?: number;
  purchaseFrequency?: number;
}

interface LTVCalculatorProps {
  currentMetrics: Metrics;
  setCurrentMetrics: (metrics: Metrics) => void;
  scenarioA: Metrics;
  setScenarioA: (metrics: Metrics) => void;
  scenarioB: Metrics;
  setScenarioB: (metrics: Metrics) => void;
  currency: string;
}

export const LTVCalculator = ({
  currentMetrics,
  setCurrentMetrics,
  scenarioA,
  setScenarioA,
  scenarioB,
  setScenarioB,
  currency,
}: LTVCalculatorProps) => {
  const updateLTVParam = (
    scenario: "current" | "scenarioA" | "scenarioB",
    field: "customerLifetimeMonths" | "purchaseFrequency",
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    const setter = scenario === "current" ? setCurrentMetrics : scenario === "scenarioA" ? setScenarioA : setScenarioB;
    const current = scenario === "current" ? currentMetrics : scenario === "scenarioA" ? scenarioA : scenarioB;
    setter({ ...current, [field]: numValue });
  };

  const getLTVRatioStatus = (ratio: number) => {
    if (ratio < 1) return { color: "text-destructive", icon: AlertTriangle, label: "Убыточная модель" };
    if (ratio < 3) return { color: "text-warning", icon: AlertTriangle, label: "Зона риска" };
    return { color: "text-success", icon: CheckCircle2, label: "Здоровая экономика" };
  };

  const scenarios = [
    { name: "Текущая", metrics: currentMetrics, setter: setCurrentMetrics, key: "current" as const },
    { name: "Сценарий A", metrics: scenarioA, setter: setScenarioA, key: "scenarioA" as const },
    { name: "Сценарий Б", metrics: scenarioB, setter: setScenarioB, key: "scenarioB" as const },
  ];

  const hasAnyLTVData = scenarios.some(s => s.metrics.customerLifetimeMonths && s.metrics.purchaseFrequency);

  const comparisonData = scenarios
    .filter(s => s.metrics.customerLifetimeMonths && s.metrics.purchaseFrequency && s.metrics.detailedExpenses)
    .map(s => ({
      name: s.name,
      LTV: calculateLTV(s.metrics),
      CAC: calculateCAC(s.metrics),
      ratio: calculateLTVCACRatio(s.metrics),
    }));

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          📊 Анализ пожизненной ценности клиента (LTV)
        </CardTitle>
        <CardDescription>
          Оцените долгосрочную ценность клиентов и эффективность их привлечения
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {scenarios.map((scenario, index) => {
          const ltv = calculateLTV(scenario.metrics);
          const cac = calculateCAC(scenario.metrics);
          const ltvCacRatio = calculateLTVCACRatio(scenario.metrics);
          const churnRate = calculateChurnRate(scenario.metrics);
          const retentionRate = calculateRetentionRate(scenario.metrics);
          const paybackPeriod = calculatePaybackPeriod(scenario.metrics);
          const status = getLTVRatioStatus(ltvCacRatio);
          const StatusIcon = status.icon;

          return (
            <div key={index} className="space-y-4 p-4 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold">{scenario.name}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`${scenario.key}-lifetime`} className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Средний срок жизни клиента (месяцев)
                  </Label>
                  <Input
                    id={`${scenario.key}-lifetime`}
                    type="number"
                    min="0"
                    step="1"
                    value={scenario.metrics.customerLifetimeMonths || ""}
                    onChange={(e) => updateLTVParam(scenario.key, "customerLifetimeMonths", e.target.value)}
                    placeholder="Например: 12"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`${scenario.key}-frequency`} className="flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    Частота покупок в месяц
                  </Label>
                  <Input
                    id={`${scenario.key}-frequency`}
                    type="number"
                    min="0"
                    step="0.1"
                    value={scenario.metrics.purchaseFrequency || ""}
                    onChange={(e) => updateLTVParam(scenario.key, "purchaseFrequency", e.target.value)}
                    placeholder="Например: 2"
                  />
                </div>
              </div>

              {scenario.metrics.customerLifetimeMonths && scenario.metrics.purchaseFrequency && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">LTV</p>
                      <p className="text-xl font-bold text-primary font-mono">
                        {ltv.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Пожизненная ценность</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <StatusIcon className={`w-3 h-3 ${status.color}`} />
                        LTV/CAC
                      </p>
                      <p className={`text-xl font-bold font-mono ${status.color}`}>
                        {ltvCacRatio.toFixed(2)}x
                      </p>
                      <p className={`text-xs mt-1 ${status.color}`}>{status.label}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20">
                      <p className="text-xs text-muted-foreground mb-1">Churn Rate</p>
                      <p className="text-xl font-bold text-destructive font-mono">
                        {churnRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Отток в месяц</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                      <p className="text-xs text-muted-foreground mb-1">Retention</p>
                      <p className="text-xl font-bold text-success font-mono">
                        {retentionRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Удержание</p>
                    </div>
                  </div>

                  {scenario.metrics.detailedExpenses && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Период окупаемости
                          </p>
                          <p className="text-2xl font-bold text-secondary font-mono mt-1">
                            {paybackPeriod === Infinity ? "∞" : paybackPeriod.toFixed(1)} мес
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">CAC</p>
                          <p className="text-lg font-semibold text-muted-foreground font-mono">
                            {cac.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {hasAnyLTVData && comparisonData.length > 1 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Сравнение сценариев</h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                <Bar dataKey="LTV" name="LTV" fill="hsl(var(--primary))" />
                <Bar dataKey="CAC" name="CAC" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Сценарий</th>
                    <th className="text-right py-2 px-4">LTV</th>
                    <th className="text-right py-2 px-4">CAC</th>
                    <th className="text-right py-2 px-4">LTV/CAC</th>
                    <th className="text-left py-2 px-4">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((data, idx) => {
                    const status = getLTVRatioStatus(data.ratio);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 px-4 font-medium">{data.name}</td>
                        <td className="text-right py-2 px-4 font-mono">
                          {data.LTV.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                        </td>
                        <td className="text-right py-2 px-4 font-mono">
                          {data.CAC.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                        </td>
                        <td className={`text-right py-2 px-4 font-mono font-bold ${status.color}`}>
                          {data.ratio.toFixed(2)}x
                        </td>
                        <td className={`py-2 px-4 flex items-center gap-2 ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-semibold mb-2 text-sm">💡 Интерпретация LTV/CAC:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <span className="text-destructive font-semibold">&lt; 1</span> — Убыточная модель: стоимость привлечения превышает ценность клиента</li>
                <li>• <span className="text-warning font-semibold">1-3</span> — Зона риска: бизнес может быть окупаем, но запас прочности низкий</li>
                <li>• <span className="text-success font-semibold">&gt; 3</span> — Здоровая экономика: клиенты приносят значительно больше, чем стоят</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
