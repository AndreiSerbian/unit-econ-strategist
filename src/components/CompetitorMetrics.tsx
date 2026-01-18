import { memo, useCallback, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Percent, Heart, Truck, Megaphone, BarChart3 } from "lucide-react";
import { DetailedExpensesForm } from "./DetailedExpensesForm";
import { KeyMetrics } from "./KeyMetrics";
import { NumericInput } from "@/components/ui/numeric-input";
import { LeadSourcesForm, LeadSource } from "./LeadSourcesForm";
import type { Metrics } from "@/hooks/useProject";

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
      logisticsMaterials?: number;
      logisticsProducts?: number;
      logisticsWarehouse?: number;
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

interface CompetitorData {
  id: string;
  name: string;
  revenue: number;
  totalClients?: number;
  newClients?: number;
  returningClients?: number;
  conversionRate?: number;
  avgCheck?: number;
  fixedCosts?: number;
  variableCosts?: number;
  marketingSpend: number;
  detailedExpenses?: DetailedExpenses;
  // LTV metrics (Этап 1)
  customerLifetimeMonths?: number;
  purchaseFrequency?: number;
  // Lead sources (Этап 2)
  leadSources?: LeadSource[];
  totalLeads?: number;
  // Logistics (Этап 5)
  logisticsMaterials?: number;
  logisticsProducts?: number;
  logisticsWarehouse?: number;
  // Business-type specific metrics
  churnRate?: number;
  nrr?: number;
  repeatRate?: number;
  utilizationRate?: number;
  projectMargin?: number;
  takeRate?: number;
  freeToPayConversion?: number;
}

interface CompetitorMetricsProps {
  competitor: CompetitorData;
  onUpdate: (updates: Partial<CompetitorData>) => void;
  currency: string;
  businessType?: string;
}

export const CompetitorMetrics = memo(({ competitor, onUpdate, currency, businessType }: CompetitorMetricsProps) => {
  // Этап 3: Авторасчёт среднего чека
  const autoAvgCheck = 
    competitor.revenue > 0 && (competitor.totalClients || 0) > 0
      ? competitor.revenue / (competitor.totalClients || 1)
      : 0;

  // Этап 1: LTV расчёты
  const ltv = 
    autoAvgCheck * (competitor.purchaseFrequency || 1) * (competitor.customerLifetimeMonths || 1);
  
  const totalCosts = (competitor.fixedCosts || 0) + (competitor.variableCosts || 0) + competitor.marketingSpend;
  const cac = (competitor.totalClients || 0) > 0 && competitor.marketingSpend > 0
    ? competitor.marketingSpend / (competitor.totalClients || 1)
    : 0;
  
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  const churnRate = (competitor.customerLifetimeMonths || 0) > 0 
    ? (1 / (competitor.customerLifetimeMonths || 1)) * 100
    : 0;
  const retentionRate = 100 - churnRate;

  // Этап 2: Авторасчёт конверсии из лидов
  const totalLeads = competitor.totalLeads || 0;
  const autoConversion = 
    totalLeads > 0 && (competitor.totalClients || 0) > 0
      ? ((competitor.totalClients || 0) / totalLeads) * 100
      : 0;

  const cpl = totalLeads > 0 && competitor.marketingSpend > 0
    ? competitor.marketingSpend / totalLeads
    : 0;

  // Этап 5: Логистика
  const totalLogistics = 
    (competitor.logisticsMaterials || 0) + 
    (competitor.logisticsProducts || 0) + 
    (competitor.logisticsWarehouse || 0);

  const handleMetricChange = useCallback((field: string) => (value: number) => {
    const updates: Partial<CompetitorData> = { [field]: value };
    
    // Этап 3: Авторасчёт среднего чека при изменении выручки или клиентов
    if (field === "revenue" || field === "totalClients") {
      const revenue = field === "revenue" ? value : competitor.revenue;
      const clients = field === "totalClients" ? value : (competitor.totalClients || 0);
      if (revenue > 0 && clients > 0) {
        updates.avgCheck = parseFloat((revenue / clients).toFixed(2));
      } else {
        updates.avgCheck = 0;
      }
    }

    // Авторасчёт конверсии при изменении клиентов
    if (field === "totalClients") {
      const leads = competitor.totalLeads || 0;
      if (leads > 0 && value > 0) {
        updates.conversionRate = parseFloat(((value / leads) * 100).toFixed(2));
      } else {
        updates.conversionRate = 0;
      }
    }

    onUpdate(updates);
  }, [onUpdate, competitor.revenue, competitor.totalClients, competitor.totalLeads]);

  // Этап 2: Обработка изменения источников трафика
  const handleLeadSourcesChange = useCallback((sources: LeadSource[]) => {
    const newTotalLeads = sources.reduce((sum, s) => sum + s.leads, 0);
    const newMarketingCost = sources.reduce((sum, s) => sum + s.cost, 0);
    
    const updates: Partial<CompetitorData> = {
      leadSources: sources,
      totalLeads: newTotalLeads,
      marketingSpend: newMarketingCost,
    };

    // Авторасчёт конверсии
    if (newTotalLeads > 0 && (competitor.totalClients || 0) > 0) {
      updates.conversionRate = parseFloat((((competitor.totalClients || 0) / newTotalLeads) * 100).toFixed(2));
    } else {
      updates.conversionRate = 0;
    }

    onUpdate(updates);
  }, [onUpdate, competitor.totalClients]);

  const handleDetailedExpensesChange = useCallback((detailedExpenses: DetailedExpenses) => {
    const fixedCostsTotal =
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
      detailedExpenses.fixedCosts.customCategories.reduce((sum, cat) => sum + cat.value, 0);

    const variableCostsTotal =
      detailedExpenses.variableCosts.marketing.trafficPurchase +
      detailedExpenses.variableCosts.marketing.contractorsPayment +
      detailedExpenses.variableCosts.marketing.crmCosts +
      detailedExpenses.variableCosts.marketing.customCategories.reduce((sum, cat) => sum + cat.value, 0) +
      detailedExpenses.variableCosts.salesPayroll.bonusOldClients +
      detailedExpenses.variableCosts.salesPayroll.bonusNewClients +
      detailedExpenses.variableCosts.salesPayroll.customCategories.reduce((sum, cat) => sum + cat.value, 0) +
      detailedExpenses.variableCosts.production.materials +
      detailedExpenses.variableCosts.production.curators +
      detailedExpenses.variableCosts.production.logistics +
      (detailedExpenses.variableCosts.production.logisticsMaterials || 0) +
      (detailedExpenses.variableCosts.production.logisticsProducts || 0) +
      (detailedExpenses.variableCosts.production.logisticsWarehouse || 0) +
      detailedExpenses.variableCosts.production.partnersPercent +
      detailedExpenses.variableCosts.production.equipmentRepair +
      detailedExpenses.variableCosts.production.customCategories.reduce((sum, cat) => sum + cat.value, 0) +
      detailedExpenses.variableCosts.other.customCategories.reduce((sum, cat) => sum + cat.value, 0);

    const marketingCosts =
      detailedExpenses.variableCosts.marketing.trafficPurchase +
      detailedExpenses.variableCosts.marketing.contractorsPayment +
      detailedExpenses.variableCosts.marketing.crmCosts +
      detailedExpenses.variableCosts.marketing.customCategories.reduce((sum, cat) => sum + cat.value, 0);

    onUpdate({
      detailedExpenses,
      fixedCosts: fixedCostsTotal,
      variableCosts: variableCostsTotal,
      marketingSpend: marketingCosts,
      logisticsMaterials: detailedExpenses.variableCosts.production.logisticsMaterials || 0,
      logisticsProducts: detailedExpenses.variableCosts.production.logisticsProducts || 0,
      logisticsWarehouse: detailedExpenses.variableCosts.production.logisticsWarehouse || 0,
    });
  }, [onUpdate]);

  const competitorMetrics: Metrics = {
    revenue: competitor.revenue,
    totalClients: competitor.totalClients || 0,
    newClients: competitor.newClients || 0,
    returningClients: competitor.returningClients || 0,
    conversionRate: autoConversion || competitor.conversionRate || 0,
    avgCheck: autoAvgCheck || competitor.avgCheck || 0,
    fixedCosts: competitor.fixedCosts || 0,
    variableCosts: competitor.variableCosts || 0,
    marketingCosts: competitor.marketingSpend || 0,
    detailedExpenses: competitor.detailedExpenses,
    customerLifetimeMonths: competitor.customerLifetimeMonths,
    purchaseFrequency: competitor.purchaseFrequency,
    totalLeads: competitor.totalLeads,
    leadSources: competitor.leadSources,
  };

  // Определение здоровья LTV/CAC
  const getLtvCacHealth = () => {
    if (ltvCacRatio === 0) return { label: "—", color: "text-muted-foreground" };
    if (ltvCacRatio < 1) return { label: "Убыточно", color: "text-destructive" };
    if (ltvCacRatio < 3) return { label: "Рискованно", color: "text-warning" };
    return { label: "Здорово", color: "text-accent" };
  };

  const ltvHealth = getLtvCacHealth();

  return (
    <div className="space-y-4">
      {/* Основные показатели */}
      <Card className="bg-gradient-to-br from-muted/30 to-background">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">📊 Основные показатели: {competitor.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                <DollarSign className="w-3 h-3" />
                Общая выручка ({currency})
              </Label>
              <NumericInput
                value={competitor.revenue}
                onChange={handleMetricChange("revenue")}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                <Users className="w-3 h-3" />
                Всего клиентов
              </Label>
              <NumericInput
                value={competitor.totalClients || 0}
                onChange={handleMetricChange("totalClients")}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                <TrendingUp className="w-3 h-3" />
                Новых клиентов
              </Label>
              <NumericInput
                value={competitor.newClients || 0}
                onChange={handleMetricChange("newClients")}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                <Users className="w-3 h-3" />
                Повторных клиентов
              </Label>
              <NumericInput
                value={competitor.returningClients || 0}
                onChange={handleMetricChange("returningClients")}
                className="text-sm"
              />
            </div>

            {/* Этап 3: Авторасчёт среднего чека (только отображение) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                <DollarSign className="w-3 h-3" />
                Средний чек ({currency})
              </Label>
              <div className="h-9 px-3 py-2 border rounded-md bg-muted/50 flex items-center">
                <span className="font-mono text-sm">
                  {autoAvgCheck.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}
                </span>
                <span className="text-xs text-muted-foreground ml-2">(авто)</span>
              </div>
            </div>

            {/* Конверсия - авторасчёт из лидов */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                <Percent className="w-3 h-3" />
                Конверсия (%)
              </Label>
              <div className="h-9 px-3 py-2 border rounded-md bg-muted/50 flex items-center">
                <span className="font-mono text-sm">
                  {autoConversion.toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%
                </span>
                <span className="text-xs text-muted-foreground ml-2">(авто)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Этап 1: LTV-метрики */}
      <Card className="bg-gradient-to-br from-accent/5 to-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-accent" />
            LTV и удержание
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Срок жизни клиента (мес)</Label>
              <NumericInput
                value={competitor.customerLifetimeMonths || 0}
                onChange={handleMetricChange("customerLifetimeMonths")}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Покупок в месяц</Label>
              <NumericInput
                value={competitor.purchaseFrequency || 0}
                onChange={handleMetricChange("purchaseFrequency")}
                step="0.1"
                className="text-sm"
              />
            </div>
          </div>

          {/* LTV расчётные показатели */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">LTV</p>
              <p className="font-bold font-mono text-accent">
                {ltv > 0 ? ltv.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) : "—"} {ltv > 0 ? currency : ""}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">CAC</p>
              <p className="font-bold font-mono text-destructive">
                {cac > 0 ? cac.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) : "—"} {cac > 0 ? currency : ""}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">LTV/CAC</p>
              <p className={`font-bold font-mono ${ltvHealth.color}`}>
                {ltvCacRatio > 0 ? ltvCacRatio.toFixed(2) : "—"}
              </p>
              <p className={`text-[10px] ${ltvHealth.color}`}>{ltvHealth.label}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Retention</p>
              <p className="font-bold font-mono">
                {retentionRate > 0 ? `${retentionRate.toFixed(1)}%` : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Метрики, специфичные для типа бизнеса */}
      {businessType && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              {businessType === 'saas' && "SaaS-метрики"}
              {businessType === 'ecommerce' && "E-commerce метрики"}
              {businessType === 'services' && "Метрики услуг"}
              {businessType === 'freemium' && "Freemium-метрики"}
              {(businessType === 'sharing' || businessType === 'marketplace') && "Платформенные метрики"}
              {businessType === 'production' && "Производственные метрики"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* SaaS: Churn Rate, NRR */}
              {businessType === 'saas' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Churn Rate (%)</Label>
                    <NumericInput
                      value={competitor.churnRate || 0}
                      onChange={handleMetricChange("churnRate")}
                      step="0.1"
                      className="text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">Процент оттока клиентов в месяц</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">NRR - Net Revenue Retention (%)</Label>
                    <NumericInput
                      value={competitor.nrr || 0}
                      onChange={handleMetricChange("nrr")}
                      step="0.1"
                      className="text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">Чистое удержание выручки ({">"} 100% = рост)</p>
                  </div>
                </>
              )}

              {/* E-commerce: Repeat Rate */}
              {businessType === 'ecommerce' && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Repeat Rate (%)</Label>
                  <NumericInput
                    value={competitor.repeatRate || 0}
                    onChange={handleMetricChange("repeatRate")}
                    step="0.1"
                    className="text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">Доля повторных покупателей</p>
                </div>
              )}

              {/* Services: Utilization Rate, Project Margin */}
              {businessType === 'services' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Utilization Rate (%)</Label>
                    <NumericInput
                      value={competitor.utilizationRate || 0}
                      onChange={handleMetricChange("utilizationRate")}
                      step="0.1"
                      className="text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">Загрузка специалистов</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Project Margin (%)</Label>
                    <NumericInput
                      value={competitor.projectMargin || 0}
                      onChange={handleMetricChange("projectMargin")}
                      step="0.1"
                      className="text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">Средняя маржа проектов</p>
                  </div>
                </>
              )}

              {/* Freemium: Free→Paid Conversion, Churn Rate */}
              {businessType === 'freemium' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Free → Paid (%)</Label>
                    <NumericInput
                      value={competitor.freeToPayConversion || 0}
                      onChange={handleMetricChange("freeToPayConversion")}
                      step="0.1"
                      className="text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">Конверсия из бесплатного в платный</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Churn Rate (%)</Label>
                    <NumericInput
                      value={competitor.churnRate || 0}
                      onChange={handleMetricChange("churnRate")}
                      step="0.1"
                      className="text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">Процент оттока платящих</p>
                  </div>
                </>
              )}

              {/* Sharing / Marketplace: Take Rate, Utilization */}
              {(businessType === 'sharing' || businessType === 'marketplace') && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Take Rate (%)</Label>
                    <NumericInput
                      value={competitor.takeRate || 0}
                      onChange={handleMetricChange("takeRate")}
                      step="0.1"
                      className="text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">Комиссия платформы</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm">Utilization (%)</Label>
                    <NumericInput
                      value={competitor.utilizationRate || 0}
                      onChange={handleMetricChange("utilizationRate")}
                      step="0.1"
                      className="text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">Загрузка ресурсов</p>
                  </div>
                </>
              )}

              {/* Production: Repeat Rate */}
              {businessType === 'production' && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Repeat Rate (%)</Label>
                  <NumericInput
                    value={competitor.repeatRate || 0}
                    onChange={handleMetricChange("repeatRate")}
                    step="0.1"
                    className="text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">Доля повторных заказов</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Этап 2: Источники трафика */}
      <LeadSourcesForm
        leadSources={competitor.leadSources || []}
        onChange={handleLeadSourcesChange}
        currency={currency}
        totalClients={competitor.totalClients}
        totalRevenue={competitor.revenue}
      />

      {/* Метрики источников */}
      {totalLeads > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" />
              Метрики трафика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Всего лидов</p>
                <p className="font-bold font-mono">{totalLeads.toLocaleString("ru-RU")}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">CPL</p>
                <p className="font-bold font-mono">
                  {cpl > 0 ? `${cpl.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ${currency}` : "—"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Конверсия</p>
                <p className="font-bold font-mono">
                  {autoConversion > 0 ? `${autoConversion.toFixed(2)}%` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Этап 5: Логистика */}
      <Card className="bg-gradient-to-br from-warning/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-4 h-4 text-warning" />
            Структура логистики
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Сырьё → производство ({currency})</Label>
              <NumericInput
                value={competitor.logisticsMaterials || 0}
                onChange={handleMetricChange("logisticsMaterials")}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Продукты → клиент ({currency})</Label>
              <NumericInput
                value={competitor.logisticsProducts || 0}
                onChange={handleMetricChange("logisticsProducts")}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Склад и точки ({currency})</Label>
              <NumericInput
                value={competitor.logisticsWarehouse || 0}
                onChange={handleMetricChange("logisticsWarehouse")}
                className="text-sm"
              />
            </div>
          </div>

          {totalLogistics > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Итого логистика</p>
                <p className="font-bold font-mono">{totalLogistics.toLocaleString("ru-RU")} {currency}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">% от выручки</p>
                <p className="font-bold font-mono">
                  {competitor.revenue > 0 
                    ? `${((totalLogistics / competitor.revenue) * 100).toFixed(1)}%`
                    : "—"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">На клиента</p>
                <p className="font-bold font-mono">
                  {(competitor.totalClients || 0) > 0 
                    ? `${(totalLogistics / (competitor.totalClients || 1)).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ${currency}`
                    : "—"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">% перем. расходов</p>
                <p className="font-bold font-mono">
                  {(competitor.variableCosts || 0) > 0 
                    ? `${((totalLogistics / (competitor.variableCosts || 1)) * 100).toFixed(1)}%`
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Детализированные расходы и ключевые метрики */}
      {competitor.detailedExpenses && (
        <>
          <DetailedExpensesForm
            expenses={competitor.detailedExpenses}
            onChange={handleDetailedExpensesChange}
            revenue={competitor.revenue}
            currency={currency}
          />

          <KeyMetrics metrics={competitorMetrics} currency={currency} />
        </>
      )}
    </div>
  );
});

CompetitorMetrics.displayName = "CompetitorMetrics";
