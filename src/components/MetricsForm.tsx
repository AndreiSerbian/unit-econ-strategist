import { memo, useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Percent, Save, Package, Target, Trash2 } from "lucide-react";
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

// Экспортируем начальное состояние метрик для очистки сценариев
export const initialMetricsState: Metrics = {
  revenue: 0,
  totalClients: 0,
  newClients: 0,
  returningClients: 0,
  conversionRate: 0,
  avgCheck: 0,
  fixedCosts: 0,
  variableCosts: 0,
  marketingCosts: 0,
  detailedExpenses: defaultDetailedExpenses,
  customerLifetimeMonths: 0,
  purchaseFrequency: 0,
  totalLeads: 0,
  leadSources: [],
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
  onClear?: () => void;
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
  onClear,
  isAuthenticated,
  calculateProfit,
}: MetricsFormProps) => {
  const [showFunnel, setShowFunnel] = useState(true);
  
  const handleMetricChange = useCallback(
    (field: keyof Metrics) =>
      (value: number) => {
        onUpdateMetric(field, value);

        // Автоматический пересчет среднего чека
        if (field === "revenue" || field === "totalClients") {
          const revenue = field === "revenue" ? value : metrics.revenue;
          const totalClients = field === "totalClients" ? value : metrics.totalClients;

          const avg = revenue > 0 && totalClients > 0 ? revenue / totalClients : 0;
          onUpdateMetric("avgCheck", parseFloat(avg.toFixed(2)));
        }

        // Автоматический пересчет конверсии из воронки
        if (field === "totalClients") {
          const totalLeads = metrics.totalLeads ?? 0;
          if (totalLeads > 0 && value > 0) {
            const newConversion = (value / totalLeads) * 100;
            onUpdateMetric("conversionRate", parseFloat(newConversion.toFixed(2)));
          }
        }
      },
    [onUpdateMetric, metrics.revenue, metrics.totalClients, metrics.totalLeads]
  );

  const handleLeadSourcesChange = useCallback((sources: LeadSource[]) => {
    // Передаём источники наверх — CompanyMetrics сам пересчитает marketingCosts и totalLeads
    onUpdateLeadSources(sources);
  }, [onUpdateLeadSources]);

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
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Общая выручка формируется автоматически из продуктов
              </p>
              <p className="text-xl font-bold font-mono text-primary">
                {metrics.revenue.toLocaleString("ru-RU")} {currency}
              </p>
              {productsRevenue > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Из продуктов: {productsRevenue.toLocaleString("ru-RU")} {currency}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Средний чек считается как выручка / количество клиентов
              </p>
              <p className="text-xl font-bold font-mono text-secondary">
                {(metrics.avgCheck || 0).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
              </p>
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
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Постоянные расходы (из детализированных статей)
              </p>
              <p className="text-lg font-bold font-mono text-destructive">
                {metrics.fixedCosts.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Переменные расходы (из детализированных статей, включая материалы и налоги)
              </p>
              <p className="text-lg font-bold font-mono text-warning">
                {metrics.variableCosts.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Маркетинг (из детализированных статей и/или источников трафика)
              </p>
              <p className="text-lg font-bold font-mono text-primary">
                {metrics.marketingCosts.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Воронка продаж и источники трафика */}
      <LeadSourcesForm
        leadSources={metrics.leadSources || []}
        onChange={handleLeadSourcesChange}
        currency={currency}
        totalClients={metrics.totalClients}
        totalRevenue={metrics.revenue}
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
        hasLeadSources={(metrics.leadSources || []).length > 0}
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

      <div className="flex gap-3">
        {onClear && scenario !== "current" && (
          <Button 
            onClick={onClear}
            variant="outline"
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Очистить сценарий
          </Button>
        )}
        <Button 
          onClick={onSave}
          className={onClear && scenario !== "current" ? "flex-1" : "w-full"}
          disabled={!isAuthenticated}
        >
          <Save className="w-4 h-4 mr-2" />
          {isAuthenticated ? "Сохранить сценарий" : "Войдите для сохранения"}
        </Button>
      </div>
    </div>
  );
});

MetricsForm.displayName = "MetricsForm";
