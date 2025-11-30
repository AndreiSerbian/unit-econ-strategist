import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Percent } from "lucide-react";
import { DetailedExpensesForm } from "./DetailedExpensesForm";
import { KeyMetrics } from "./KeyMetrics";
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
}

interface CompetitorMetricsProps {
  competitor: CompetitorData;
  onUpdate: (updates: Partial<CompetitorData>) => void;
  currency: string;
}

export const CompetitorMetrics = ({ competitor, onUpdate, currency }: CompetitorMetricsProps) => {
  const handleMetricChange = (field: string, value: number) => {
    onUpdate({ [field]: value });
  };

  const handleDetailedExpensesChange = (detailedExpenses: DetailedExpenses) => {
    // Пересчитываем общие суммы
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
    });
  };

  const competitorMetrics: Metrics = {
    revenue: competitor.revenue,
    totalClients: competitor.totalClients || 0,
    newClients: competitor.newClients || 0,
    returningClients: competitor.returningClients || 0,
    conversionRate: competitor.conversionRate || 0,
    avgCheck: competitor.avgCheck || 0,
    fixedCosts: competitor.fixedCosts || 0,
    variableCosts: competitor.variableCosts || 0,
    marketingCosts: competitor.marketingSpend || 0,
    detailedExpenses: competitor.detailedExpenses,
  };

  return (
    <div className="space-y-4">
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
              <Input
                type="number"
                value={competitor.revenue}
                onChange={(e) => handleMetricChange("revenue", Number(e.target.value))}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                <Users className="w-3 h-3" />
                Всего клиентов
              </Label>
              <Input
                type="number"
                value={competitor.totalClients || 0}
                onChange={(e) => handleMetricChange("totalClients", Number(e.target.value))}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                <TrendingUp className="w-3 h-3" />
                Новых клиентов
              </Label>
              <Input
                type="number"
                value={competitor.newClients || 0}
                onChange={(e) => handleMetricChange("newClients", Number(e.target.value))}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                <Users className="w-3 h-3" />
                Повторных клиентов
              </Label>
              <Input
                type="number"
                value={competitor.returningClients || 0}
                onChange={(e) => handleMetricChange("returningClients", Number(e.target.value))}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                <Percent className="w-3 h-3" />
                Конверсия (%)
              </Label>
              <Input
                type="number"
                value={competitor.conversionRate || 0}
                onChange={(e) => handleMetricChange("conversionRate", Number(e.target.value))}
                step="0.1"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                <DollarSign className="w-3 h-3" />
                Средний чек ({currency})
              </Label>
              <Input
                type="number"
                value={competitor.avgCheck || 0}
                onChange={(e) => handleMetricChange("avgCheck", Number(e.target.value))}
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
};
