import { memo, useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Percent, Save, Package, Target, Trash2, Info, Activity } from "lucide-react";
import { DetailedExpensesForm } from "./DetailedExpensesForm";
import { KeyMetrics } from "./KeyMetrics";
import { NumericInput } from "@/components/ui/numeric-input";
import { LeadSourcesForm, LeadSource } from "./LeadSourcesForm";
import { SalesFunnel } from "./SalesFunnel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getBusinessTypeConfig, type BusinessType } from "@/config/businessTypeMetrics";

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
  // Business-type specific metrics
  churnRate?: number;           // SaaS: monthly churn rate %
  nrr?: number;                 // SaaS: Net Revenue Retention %
  expansionRevenue?: number;    // SaaS: Expansion/upsell revenue
  repeatRate?: number;          // E-commerce: repeat purchase rate %
  cartAbandonmentRate?: number; // E-commerce: cart abandonment %
  aov?: number;                 // E-commerce: Average Order Value
  utilizationRate?: number;     // Services: billable hours %
  billableHours?: number;       // Services: total billable hours
  projectMargin?: number;       // Services: average project margin %
  freeToPayConversion?: number; // Freemium: free to paid conversion %
  dauMau?: number;              // Freemium: DAU/MAU ratio %
  gmv?: number;                 // Marketplace/Sharing: Gross Merchandise Value
  takeRate?: number;            // Marketplace/Sharing: platform commission %
  liquidity?: number;           // Marketplace: successful transaction rate %
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
  businessType: BusinessType;
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
  businessType,
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
  const config = getBusinessTypeConfig(businessType);
  
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

        // SaaS: Автоматический расчёт NRR на основе Churn Rate и Expansion Revenue
        // NRR = (1 - Churn Rate) + (Expansion Revenue / MRR) * 100
        if (businessType === 'saas' && (field === "churnRate" || field === "expansionRevenue" || field === "revenue")) {
          const churnRate = field === "churnRate" ? value : (metrics.churnRate ?? 0);
          const expansionRevenue = field === "expansionRevenue" ? value : (metrics.expansionRevenue ?? 0);
          const mrr = field === "revenue" ? value : metrics.revenue;
          
          if (mrr > 0) {
            // NRR = (100 - Churn%) + (Expansion / MRR * 100)
            const calculatedNRR = (100 - churnRate) + (expansionRevenue / mrr * 100);
            onUpdateMetric("nrr", parseFloat(calculatedNRR.toFixed(1)));
          }
        }
      },
    [onUpdateMetric, metrics.revenue, metrics.totalClients, metrics.totalLeads, metrics.churnRate, metrics.expansionRevenue, businessType]
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
              {config.labels.revenue || 'Выручка и доходы'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {businessType === 'saas' ? 'MRR формируется из тарифных планов' : 'Общая выручка формируется автоматически из продуктов'}
              </p>
              <p className="text-xl font-bold font-mono text-primary">
                {metrics.revenue.toLocaleString("ru-RU")} {currency}
              </p>
              {productsRevenue > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Из продуктов: {productsRevenue.toLocaleString("ru-RU")} {currency}
                </p>
              )}
              {businessType === 'saas' && (
                <p className="text-sm text-muted-foreground">
                  ARR: <span className="font-mono font-semibold">{(metrics.revenue * 12).toLocaleString("ru-RU")} {currency}</span>
                </p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {config.labels.avgCheck || 'Средний чек'}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    {businessType === 'saas' ? 'ARPU = MRR / кол-во подписчиков' : 'Средний чек = выручка / кол-во клиентов'}
                  </TooltipContent>
                </Tooltip>
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
              {config.labels.clients || 'Клиенты'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-totalClients`}>{config.labels.clients || 'Всего клиентов'}</Label>
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

      {/* Business-type specific metrics */}
      {(businessType === 'saas' || businessType === 'ecommerce' || businessType === 'services' || 
        businessType === 'freemium' || businessType === 'sharing' || businessType === 'marketplace') && (
        <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              {businessType === 'saas' && 'SaaS-метрики'}
              {businessType === 'ecommerce' && 'E-commerce метрики'}
              {businessType === 'services' && 'Метрики услуг'}
              {businessType === 'freemium' && 'Freemium-метрики'}
              {businessType === 'sharing' && 'Sharing-метрики'}
              {businessType === 'marketplace' && 'Маркетплейс-метрики'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* SaaS specific */}
              {businessType === 'saas' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-churnRate`} className="flex items-center gap-1">
                      Churn Rate (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Процент подписчиков, которые отменяют подписку ежемесячно
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-churnRate`}
                      value={metrics.churnRate || 0}
                      onChange={handleMetricChange("churnRate")}
                      step="0.1"
                    />
                    {(metrics.churnRate ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Retention: {(100 - (metrics.churnRate || 0)).toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-nrr`} className="flex items-center gap-1">
                      NRR (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Net Revenue Retention — чистое удержание выручки с учётом апгрейдов и оттока
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-nrr`}
                      value={metrics.nrr || 0}
                      onChange={handleMetricChange("nrr")}
                      step="0.1"
                    />
                    {(metrics.nrr ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {(metrics.nrr || 0) >= 100 ? '✅ Положительный рост' : '⚠️ Негативный рост'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-expansionRevenue`} className="flex items-center gap-1">
                      Expansion Revenue
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Дополнительная выручка от апгрейдов и допродаж существующим клиентам
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-expansionRevenue`}
                      value={metrics.expansionRevenue || 0}
                      onChange={handleMetricChange("expansionRevenue")}
                    />
                    {metrics.revenue > 0 && (metrics.expansionRevenue || 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {((metrics.expansionRevenue || 0) / metrics.revenue * 100).toFixed(1)}% от MRR
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* E-commerce specific */}
              {businessType === 'ecommerce' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-repeatRate`} className="flex items-center gap-1">
                      Repeat Rate (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Доля клиентов, совершивших повторную покупку
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-repeatRate`}
                      value={metrics.repeatRate || 0}
                      onChange={handleMetricChange("repeatRate")}
                      step="0.1"
                    />
                    {metrics.totalClients > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Расч.: {metrics.returningClients > 0 ? ((metrics.returningClients / metrics.totalClients) * 100).toFixed(1) : 0}%
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-cartAbandonmentRate`} className="flex items-center gap-1">
                      Cart Abandonment (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Процент пользователей, бросивших корзину без оформления заказа
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-cartAbandonmentRate`}
                      value={metrics.cartAbandonmentRate || 0}
                      onChange={handleMetricChange("cartAbandonmentRate")}
                      step="0.1"
                    />
                    {(metrics.cartAbandonmentRate ?? 0) > 70 && (
                      <p className="text-xs text-amber-500">⚠️ Выше среднего (70%)</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-aov`} className="flex items-center gap-1">
                      AOV ({currency})
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Average Order Value — средняя стоимость заказа
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-aov`}
                      value={metrics.aov || metrics.avgCheck || 0}
                      onChange={handleMetricChange("aov")}
                    />
                  </div>
                </>
              )}

              {/* Services specific */}
              {businessType === 'services' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-utilizationRate`} className="flex items-center gap-1">
                      Utilization Rate (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Процент оплачиваемого времени от общего рабочего времени
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-utilizationRate`}
                      value={metrics.utilizationRate || 0}
                      onChange={handleMetricChange("utilizationRate")}
                      step="1"
                    />
                    {(metrics.utilizationRate ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {(metrics.utilizationRate || 0) >= 75 ? '✅ Хорошая загрузка' : '⚠️ Низкая загрузка'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-billableHours`} className="flex items-center gap-1">
                      Billable Hours
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Общее количество оплачиваемых часов в месяц
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-billableHours`}
                      value={metrics.billableHours || 0}
                      onChange={handleMetricChange("billableHours")}
                    />
                    {(metrics.billableHours ?? 0) > 0 && metrics.revenue > 0 && (
                      <p className="text-xs text-muted-foreground">
                        ~{(metrics.revenue / (metrics.billableHours || 1)).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}/час
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-projectMargin`} className="flex items-center gap-1">
                      Проектная маржа (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Средняя маржинальность проектов после вычета прямых затрат
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-projectMargin`}
                      value={metrics.projectMargin || 0}
                      onChange={handleMetricChange("projectMargin")}
                      step="1"
                    />
                  </div>
                </>
              )}

              {/* Freemium specific */}
              {businessType === 'freemium' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-freeToPayConversion`} className="flex items-center gap-1">
                      Free → Paid (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Конверсия из бесплатного плана в платный
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-freeToPayConversion`}
                      value={metrics.freeToPayConversion || 0}
                      onChange={handleMetricChange("freeToPayConversion")}
                      step="0.1"
                    />
                    {(metrics.freeToPayConversion ?? 0) >= 2 && (
                      <p className="text-xs text-green-500">✅ Отличная конверсия</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-dauMau`} className="flex items-center gap-1">
                      DAU/MAU (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Отношение дневных активных пользователей к месячным — показатель стикинесса
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-dauMau`}
                      value={metrics.dauMau || 0}
                      onChange={handleMetricChange("dauMau")}
                      step="0.1"
                    />
                    {(metrics.dauMau ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {(metrics.dauMau || 0) >= 20 ? '✅ Хорошая вовлечённость' : '⚠️ Низкая вовлечённость'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-churnRate`} className="flex items-center gap-1">
                      Churn Rate (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Процент платящих пользователей, отменяющих подписку
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-churnRate`}
                      value={metrics.churnRate || 0}
                      onChange={handleMetricChange("churnRate")}
                      step="0.1"
                    />
                  </div>
                </>
              )}

              {/* Sharing / Marketplace specific */}
              {(businessType === 'sharing' || businessType === 'marketplace') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-gmv`} className="flex items-center gap-1">
                      GMV ({currency})
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Gross Merchandise Value — общий объём транзакций на платформе
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-gmv`}
                      value={metrics.gmv || 0}
                      onChange={handleMetricChange("gmv")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-takeRate`} className="flex items-center gap-1">
                      Take Rate (%)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          Процент комиссии платформы от GMV
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      id={`${scenario}-takeRate`}
                      value={metrics.takeRate || 0}
                      onChange={handleMetricChange("takeRate")}
                      step="0.1"
                    />
                    {(metrics.gmv ?? 0) > 0 && (metrics.takeRate ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Комиссия: {((metrics.gmv || 0) * (metrics.takeRate || 0) / 100).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                      </p>
                    )}
                  </div>
                  {businessType === 'marketplace' && (
                    <div className="space-y-2">
                      <Label htmlFor={`${scenario}-liquidity`} className="flex items-center gap-1">
                        Liquidity (%)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            Процент успешно завершённых транзакций от общего числа листингов
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <NumericInput
                        id={`${scenario}-liquidity`}
                        value={metrics.liquidity || 0}
                        onChange={handleMetricChange("liquidity")}
                        step="1"
                      />
                    </div>
                  )}
                  {businessType === 'sharing' && (
                    <div className="space-y-2">
                      <Label htmlFor={`${scenario}-utilizationRate`} className="flex items-center gap-1">
                        Utilization Rate (%)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            Загрузка ресурсов — процент времени использования
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <NumericInput
                        id={`${scenario}-utilizationRate`}
                        value={metrics.utilizationRate || 0}
                        onChange={handleMetricChange("utilizationRate")}
                        step="1"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
