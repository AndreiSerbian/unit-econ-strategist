import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Percent, Save, Package } from "lucide-react";
import { DetailedExpensesForm } from "./DetailedExpensesForm";
import { KeyMetrics } from "./KeyMetrics";

interface ExpenseCategory {
  id: string;
  name: string;
  value: number;
  isCustom: boolean;
}

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
    customCategories: ExpenseCategory[];
  };
  variableCosts: {
    marketing: {
      trafficPurchase: number;
      contractorsPayment: number;
      crmCosts: number;
      customCategories: ExpenseCategory[];
    };
    salesPayroll: {
      bonusOldClients: number;
      bonusNewClients: number;
      customCategories: ExpenseCategory[];
    };
    production: {
      materials: number;
      curators: number;
      logistics: number;
      partnersPercent: number;
      equipmentRepair: number;
      customCategories: ExpenseCategory[];
    };
    other: {
      customCategories: ExpenseCategory[];
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
  productsRevenue: number;
  productsCosts: number;
  syncProductsToMetrics: (scenarioType: "current" | "scenarioA" | "scenarioB") => void;
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
  productsRevenue,
  productsCosts,
  syncProductsToMetrics,
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

  const updateDetailedExpenses = (
    scenario: "current" | "scenarioA" | "scenarioB",
    detailedExpenses: DetailedExpenses
  ) => {
    const setter = scenario === "current" ? setCurrentMetrics : scenario === "scenarioA" ? setScenarioA : setScenarioB;
    const current = scenario === "current" ? currentMetrics : scenario === "scenarioA" ? scenarioA : scenarioB;
    
    // Calculate totals from detailed expenses
    const fixedTotal =
      detailedExpenses.fixedCosts.salaryOldClients +
      detailedExpenses.fixedCosts.salaryNewClients +
      detailedExpenses.fixedCosts.officeRent +
      detailedExpenses.fixedCosts.warehouseRent +
      detailedExpenses.fixedCosts.managementSalary +
      detailedExpenses.fixedCosts.marketingSalary +
      detailedExpenses.fixedCosts.productionSalary +
      detailedExpenses.fixedCosts.internet +
      detailedExpenses.fixedCosts.communication +
      detailedExpenses.fixedCosts.banking +
      detailedExpenses.fixedCosts.subscriptions +
      detailedExpenses.fixedCosts.utilities +
      detailedExpenses.fixedCosts.customCategories.reduce((sum, c) => sum + c.value, 0);

    const marketingTotal =
      detailedExpenses.variableCosts.marketing.trafficPurchase +
      detailedExpenses.variableCosts.marketing.contractorsPayment +
      detailedExpenses.variableCosts.marketing.crmCosts +
      detailedExpenses.variableCosts.marketing.customCategories.reduce((sum, c) => sum + c.value, 0);

    const salesTotal =
      detailedExpenses.variableCosts.salesPayroll.bonusOldClients +
      detailedExpenses.variableCosts.salesPayroll.bonusNewClients +
      detailedExpenses.variableCosts.salesPayroll.customCategories.reduce((sum, c) => sum + c.value, 0);

    const productionTotal =
      detailedExpenses.variableCosts.production.materials +
      detailedExpenses.variableCosts.production.curators +
      detailedExpenses.variableCosts.production.logistics +
      detailedExpenses.variableCosts.production.partnersPercent +
      detailedExpenses.variableCosts.production.equipmentRepair +
      detailedExpenses.variableCosts.production.customCategories.reduce((sum, c) => sum + c.value, 0);

    const otherTotal =
      detailedExpenses.variableCosts.other.customCategories.reduce((sum, c) => sum + c.value, 0) +
      detailedExpenses.taxes;

    const variableTotal = salesTotal + productionTotal + otherTotal;

    setter({
      ...current,
      fixedCosts: fixedTotal,
      variableCosts: variableTotal,
      marketingCosts: marketingTotal,
      detailedExpenses,
    });
  };

  const MetricsForm = ({ 
    metrics, 
    scenario 
  }: { 
    metrics: Metrics; 
    scenario: "current" | "scenarioA" | "scenarioB" 
  }) => {
    const revenueFromProducts = productsRevenue;
    const costsFromProducts = productsCosts;

    return (
    <div className="space-y-6">
      {productsRevenue > 0 && (
        <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-accent" />
                Интеграция с продуктами
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => syncProductsToMetrics(scenario)}
              >
                Синхронизировать
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Выручка из продуктов</p>
                <p className="font-mono font-semibold text-accent">
                  {revenueFromProducts.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Себестоимость продуктов</p>
                <p className="font-mono font-semibold text-destructive">
                  {costsFromProducts.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Нажмите "Синхронизировать" чтобы автоматически обновить выручку и переменные расходы
            </p>
          </CardContent>
        </Card>
      )}
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
              <Label htmlFor={`${scenario}-revenue`}>
                Общая выручка ({currency})
                {productsRevenue > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (из продуктов: {revenueFromProducts.toLocaleString("ru-RU")} {currency})
                  </span>
                )}
              </Label>
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
              Конверсия и LTV
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-lifetime`} className="text-xs">
                  Срок жизни (мес)
                </Label>
                <Input
                  id={`${scenario}-lifetime`}
                  type="number"
                  value={metrics.customerLifetimeMonths || ""}
                  onChange={(e) => updateMetric(scenario, "customerLifetimeMonths", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-frequency`} className="text-xs">
                  Покупок/мес
                </Label>
                <Input
                  id={`${scenario}-frequency`}
                  type="number"
                  step="0.1"
                  value={metrics.purchaseFrequency || ""}
                  onChange={(e) => updateMetric(scenario, "purchaseFrequency", e.target.value)}
                  placeholder="0"
                />
              </div>
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
              <Label htmlFor={`${scenario}-variableCosts`}>
                Переменные расходы ({currency})
                {productsCosts > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (из продуктов: {costsFromProducts.toLocaleString("ru-RU")} {currency})
                  </span>
                )}
              </Label>
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

      <DetailedExpensesForm
        expenses={metrics.detailedExpenses || {
          fixedCosts: {
            salaryOldClients: 0,
            salaryNewClients: 0,
            officeRent: 0,
            warehouseRent: 0,
            managementSalary: 0,
            marketingSalary: 0,
            productionSalary: 0,
            internet: 0,
            communication: 0,
            banking: 0,
            subscriptions: 0,
            utilities: 0,
            customCategories: [],
          },
          variableCosts: {
            marketing: {
              trafficPurchase: 0,
              contractorsPayment: 0,
              crmCosts: 0,
              customCategories: [],
            },
            salesPayroll: {
              bonusOldClients: 0,
              bonusNewClients: 0,
              customCategories: [],
            },
            production: {
              materials: 0,
              curators: 0,
              logistics: 0,
              partnersPercent: 0,
              equipmentRepair: 0,
              customCategories: [],
            },
            other: {
              customCategories: [],
            },
          },
          taxRate: 15,
          taxes: 0,
        }}
        onChange={(newExpenses) => updateDetailedExpenses(scenario, newExpenses)}
        revenue={metrics.revenue}
        currency={currency}
      />

      <KeyMetrics metrics={metrics} currency={currency} />

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

      <Button 
        onClick={() => saveScenario(scenario, metrics)} 
        className="w-full"
        variant="gradient"
      >
        <Save className="w-4 h-4 mr-2" />
        Сохранить сценарий
      </Button>
    </div>
  );
  };

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
