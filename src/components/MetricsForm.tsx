import { memo, useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Percent, Save, Package, Target } from "lucide-react";
import { DetailedExpensesForm } from "./DetailedExpensesForm";
import { KeyMetrics } from "./KeyMetrics";
import { NumericInput } from "@/components/ui/numeric-input";
import { LeadSourcesForm, LeadSource } from "./LeadSourcesForm";
import { SalesFunnel } from "./SalesFunnel";

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
  totalLeads?: number;
  leadSources?: LeadSource[];
}

const defaultDetailedExpenses: DetailedExpenses = {
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
};

interface MetricsFormProps {
  metrics: Metrics;
  scenario: "current" | "scenarioA" | "scenarioB";
  productsRevenue: number;
  productsCosts: number;
  currency: string;
  onUpdateMetric: (field: keyof Metrics, value: number) => void;
  onUpdateDetailedExpenses: (expenses: DetailedExpenses) => void;
  onUpdateLeadSources: (sources: LeadSource[]) => void;
  onSyncProducts: () => void;
  onSave: () => void;
  isAuthenticated: boolean;
  calculateProfit: (metrics: Metrics) => number;
}

export const MetricsForm = memo(({
  metrics,
  scenario,
  productsRevenue,
  productsCosts,
  currency,
  onUpdateMetric,
  onUpdateDetailedExpenses,
  onUpdateLeadSources,
  onSyncProducts,
  onSave,
  isAuthenticated,
  calculateProfit,
}: MetricsFormProps) => {
  const [showFunnel, setShowFunnel] = useState(true);
  
  const handleMetricChange = useCallback((field: keyof Metrics) => (value: number) => {
    onUpdateMetric(field, value);
  }, [onUpdateMetric]);

  const handleLeadSourcesChange = useCallback((sources: LeadSource[]) => {
    onUpdateLeadSources(sources);
    // Автоматически пересчитываем общее количество лидов и затраты на маркетинг
    const totalLeads = sources.reduce((sum, s) => sum + s.leads, 0);
    const totalMarketingCost = sources.reduce((sum, s) => sum + s.cost, 0);
    onUpdateMetric("totalLeads", totalLeads);
    if (totalMarketingCost > 0) {
      onUpdateMetric("marketingCosts", totalMarketingCost);
    }
    // Автоматически пересчитываем конверсию
    if (totalLeads > 0 && metrics.totalClients > 0) {
      const newConversion = (metrics.totalClients / totalLeads) * 100;
      onUpdateMetric("conversionRate", parseFloat(newConversion.toFixed(2)));
    }
  }, [onUpdateLeadSources, onUpdateMetric, metrics.totalClients]);

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
                onClick={onSyncProducts}
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
                  {productsRevenue.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Себестоимость продуктов</p>
                <p className="font-mono font-semibold text-destructive">
                  {productsCosts.toLocaleString("ru-RU")} {currency}
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
                    (из продуктов: {productsRevenue.toLocaleString("ru-RU")} {currency})
                  </span>
                )}
              </Label>
              <NumericInput
                id={`${scenario}-revenue`}
                value={metrics.revenue}
                onChange={handleMetricChange("revenue")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-avgCheck`}>Средний чек ({currency})</Label>
              <NumericInput
                id={`${scenario}-avgCheck`}
                value={metrics.avgCheck}
                onChange={handleMetricChange("avgCheck")}
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
              <NumericInput
                id={`${scenario}-totalClients`}
                value={metrics.totalClients}
                onChange={handleMetricChange("totalClients")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-newClients`}>Новые</Label>
                <NumericInput
                  id={`${scenario}-newClients`}
                  value={metrics.newClients}
                  onChange={handleMetricChange("newClients")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-returningClients`}>Повторные</Label>
                <NumericInput
                  id={`${scenario}-returningClients`}
                  value={metrics.returningClients}
                  onChange={handleMetricChange("returningClients")}
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
              <NumericInput
                id={`${scenario}-conversionRate`}
                value={metrics.conversionRate}
                onChange={handleMetricChange("conversionRate")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-lifetime`} className="text-xs">
                  Срок жизни (мес)
                </Label>
                <NumericInput
                  id={`${scenario}-lifetime`}
                  value={metrics.customerLifetimeMonths || 0}
                  onChange={handleMetricChange("customerLifetimeMonths")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-frequency`} className="text-xs">
                  Покупок/мес
                </Label>
                <NumericInput
                  id={`${scenario}-frequency`}
                  value={metrics.purchaseFrequency || 0}
                  onChange={handleMetricChange("purchaseFrequency")}
                  step="0.1"
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
              <NumericInput
                id={`${scenario}-fixedCosts`}
                value={metrics.fixedCosts}
                onChange={handleMetricChange("fixedCosts")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-variableCosts`}>
                Переменные расходы ({currency})
                {productsCosts > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (из продуктов: {productsCosts.toLocaleString("ru-RU")} {currency})
                  </span>
                )}
              </Label>
              <NumericInput
                id={`${scenario}-variableCosts`}
                value={metrics.variableCosts}
                onChange={handleMetricChange("variableCosts")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-marketingCosts`}>Маркетинг ({currency})</Label>
              <NumericInput
                id={`${scenario}-marketingCosts`}
                value={metrics.marketingCosts}
                onChange={handleMetricChange("marketingCosts")}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Воронка продаж и источники трафика */}
      <LeadSourcesForm
        leadSources={metrics.leadSources || []}
        onChange={handleLeadSourcesChange}
        currency={currency}
      />

      {(metrics.totalLeads || 0) > 0 && (
        <SalesFunnel
          totalLeads={metrics.totalLeads || 0}
          totalClients={metrics.totalClients}
          conversionRate={metrics.conversionRate}
          leadSources={metrics.leadSources || []}
          marketingCosts={metrics.marketingCosts}
          currency={currency}
        />
      )}

      <DetailedExpensesForm
        expenses={metrics.detailedExpenses || defaultDetailedExpenses}
        onChange={onUpdateDetailedExpenses}
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
              <p className={`text-2xl font-bold font-mono ${calculateProfit(metrics) >= 0 ? "text-accent" : "text-destructive"}`}>
                {calculateProfit(metrics).toLocaleString("ru-RU")} {currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={onSave}
        className="w-full"
        disabled={!isAuthenticated}
      >
        <Save className="w-4 h-4 mr-2" />
        {isAuthenticated ? "Сохранить сценарий" : "Войдите для сохранения"}
      </Button>
    </div>
  );
});

MetricsForm.displayName = "MetricsForm";
