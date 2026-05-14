import { memo, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { getBusinessTypeConfig, resolveI18nText, type BusinessType } from "@/config/businessTypeMetrics";
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showFunnel, setShowFunnel] = useState(true);
  const config = getBusinessTypeConfig(businessType);

  const handleSaveOrSignIn = useCallback(() => {
    if (isAuthenticated) {
      onSave();
    } else {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth?redirect=${redirect}`);
    }
  }, [isAuthenticated, onSave, navigate, location.pathname, location.search]);
  
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

        // Авторасчёт Repeat Rate из соотношения повторных и общих клиентов
        if (field === "returningClients" || field === "totalClients") {
          const returningClients = field === "returningClients" ? value : metrics.returningClients;
          const totalClients = field === "totalClients" ? value : metrics.totalClients;
          
          const repeatRate = totalClients > 0 ? (returningClients / totalClients) * 100 : 0;
          onUpdateMetric("repeatRate", parseFloat(repeatRate.toFixed(1)));
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
    [onUpdateMetric, metrics.revenue, metrics.totalClients, metrics.returningClients, metrics.totalLeads, metrics.churnRate, metrics.expansionRevenue, businessType]
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
                {t("metricsForm.productsIntegration")}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onSyncProducts}
              >
                {t("metricsForm.sync")}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t("metricsForm.productsRevenue")}</p>
                <p className="font-mono font-semibold text-accent">
                  {productsRevenue.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">{t("metricsForm.productsCosts")}</p>
                <p className="font-mono font-semibold text-destructive">
                  {productsCosts.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {t("metricsForm.syncHint")}
            </p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              {config.labels.revenue || t("metricsForm.revenueAndIncome")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {businessType === 'saas' ? t("metricsForm.revenueMrrFromPlans") : t("metricsForm.revenueAutoFromProducts")}
              </p>
              <p className="text-xl font-bold font-mono text-primary">
                {metrics.revenue.toLocaleString("ru-RU")} {currency}
              </p>
              {productsRevenue > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {t("metricsForm.revenueFromProducts")} {productsRevenue.toLocaleString("ru-RU")} {currency}
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
                {config.labels.avgCheck || t("metricsForm.avgCheck")}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    {businessType === 'saas' ? t("metricsForm.avgCheckArpuTooltip") : t("metricsForm.avgCheckTooltip")}
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
              {config.labels.clients || t("metricsForm.clients")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-totalClients`}>{config.labels.clients || t("metricsForm.totalClients")}</Label>
              <NumericInput
                id={`${scenario}-totalClients`}
                value={metrics.totalClients}
                onChange={handleMetricChange("totalClients")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-newClients`}>{t("metricsForm.newClients")}</Label>
                <NumericInput
                  id={`${scenario}-newClients`}
                  value={metrics.newClients}
                  onChange={handleMetricChange("newClients")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-returningClients`}>{t("metricsForm.returningClients")}</Label>
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
              {t("metricsForm.conversionAndLtv")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`${scenario}-conversionRate`}>{t("metricsForm.conversionRate")}</Label>
              <NumericInput
                id={`${scenario}-conversionRate`}
                value={metrics.conversionRate}
                onChange={handleMetricChange("conversionRate")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-lifetime`} className="text-xs">
                  {t("metricsForm.customerLifetimeMonths")}
                </Label>
                <NumericInput
                  id={`${scenario}-lifetime`}
                  value={metrics.customerLifetimeMonths || 0}
                  onChange={handleMetricChange("customerLifetimeMonths")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${scenario}-frequency`} className="text-xs">
                  {t("metricsForm.purchaseFrequency")}
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
              {t("metricsForm.expenses")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t("metricsForm.fixedExpensesHint")}
              </p>
              <p className="text-lg font-bold font-mono text-destructive">
                {metrics.fixedCosts.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t("metricsForm.variableExpensesHint")}
              </p>
              <p className="text-lg font-bold font-mono text-warning">
                {metrics.variableCosts.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {t("metricsForm.marketingExpensesHint")}
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
              {businessType === 'saas' && t("metricsForm.saasMetrics")}
              {businessType === 'ecommerce' && t("metricsForm.ecommerceMetrics")}
              {businessType === 'services' && t("metricsForm.servicesMetrics")}
              {businessType === 'freemium' && t("metricsForm.freemiumMetrics")}
              {businessType === 'sharing' && t("metricsForm.sharingMetrics")}
              {businessType === 'marketplace' && t("metricsForm.marketplaceMetrics")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* SaaS specific */}
              {businessType === 'saas' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-churnRate`} className="flex items-center gap-1">
                      {t("metricsForm.churnRate")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.churnRateTooltip")}
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
                        {t("metricsForm.retentionLabel")}: {(100 - (metrics.churnRate || 0)).toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-nrr`} className="flex items-center gap-1">
                      {t("metricsForm.nrr")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.nrrTooltip")}
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
                        {(metrics.nrr || 0) >= 100 ? t("metricsForm.nrrPositive") : t("metricsForm.nrrNegative")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-expansionRevenue`} className="flex items-center gap-1">
                      {t("metricsForm.expansionRevenue")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.expansionRevenueTooltip")}
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
                        {t("metricsForm.expansionShareOfMrr", { percent: ((metrics.expansionRevenue || 0) / metrics.revenue * 100).toFixed(1) })}
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
                      {t("metricsForm.repeatRate")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.repeatRateTooltip")}
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
                        {t("metricsForm.repeatRateCalc", { percent: metrics.returningClients > 0 ? ((metrics.returningClients / metrics.totalClients) * 100).toFixed(1) : 0 })}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-cartAbandonmentRate`} className="flex items-center gap-1">
                      {t("metricsForm.cartAbandonment")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.cartAbandonmentTooltip")}
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
                      <p className="text-xs text-amber-500">{t("metricsForm.cartAbandonmentHigh")}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-aov`} className="flex items-center gap-1">
                      {t("metricsForm.aov", { currency })}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.aovTooltip")}
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
                      {t("metricsForm.utilizationRate")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.utilizationRateTooltip")}
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
                        {(metrics.utilizationRate || 0) >= 75 ? t("metricsForm.utilizationGood") : t("metricsForm.utilizationLow")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-billableHours`} className="flex items-center gap-1">
                      {t("metricsForm.billableHours")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.billableHoursTooltip")}
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
                        {t("metricsForm.perHour", { value: (metrics.revenue / (metrics.billableHours || 1)).toLocaleString("ru-RU", { maximumFractionDigits: 0 }), currency })}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-projectMargin`} className="flex items-center gap-1">
                      {t("metricsForm.projectMargin")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.projectMarginTooltip")}
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
                      {t("metricsForm.freeToPay")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.freeToPayTooltip")}
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
                      <p className="text-xs text-green-500">{t("metricsForm.freeToPayGreat")}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-dauMau`} className="flex items-center gap-1">
                      {t("metricsForm.dauMau")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.dauMauTooltip")}
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
                        {(metrics.dauMau || 0) >= 20 ? t("metricsForm.dauMauGood") : t("metricsForm.dauMauLow")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${scenario}-churnRate`} className="flex items-center gap-1">
                      {t("metricsForm.churnRate")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.freemiumChurnTooltip")}
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
                      {t("metricsForm.gmv", { currency })}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.gmvTooltip")}
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
                      {t("metricsForm.takeRate")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {t("metricsForm.takeRateTooltip")}
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
                        {t("metricsForm.takeRateCommission", { value: ((metrics.gmv || 0) * (metrics.takeRate || 0) / 100).toLocaleString("ru-RU", { maximumFractionDigits: 0 }), currency })}
                      </p>
                    )}
                  </div>
                  {businessType === 'marketplace' && (
                    <div className="space-y-2">
                      <Label htmlFor={`${scenario}-liquidity`} className="flex items-center gap-1">
                        {t("metricsForm.liquidity")}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            {t("metricsForm.liquidityTooltip")}
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
                        {t("metricsForm.utilizationRate")}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs">
                            {t("metricsForm.sharingUtilizationTooltip")}
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
          <CardTitle>{t("forms.totals")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("forms.totalRevenue")}</p>
              <p className="text-2xl font-bold text-primary font-mono">
                {metrics.revenue.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("forms.totalExpenses")}</p>
              <p className="text-2xl font-bold text-destructive font-mono">
                {(metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts).toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t("forms.totalProfit")}</p>
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
            {t("forms.clearScenario")}
          </Button>
        )}
        <Button 
          onClick={handleSaveOrSignIn}
          className={onClear && scenario !== "current" ? "flex-1" : "w-full"}
        >
          <Save className="w-4 h-4 mr-2" />
          {isAuthenticated ? t("forms.saveScenario") : t("forms.signInToSave")}
        </Button>
      </div>
    </div>
  );
});

MetricsForm.displayName = "MetricsForm";
