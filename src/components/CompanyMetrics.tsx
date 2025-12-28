import { useCallback, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsForm, initialMetricsState } from "./MetricsForm";
import { LeadSource } from "./LeadSourcesForm";
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

interface CompanyMetricsProps {
  currentMetrics: Metrics;
  setCurrentMetrics: Dispatch<SetStateAction<Metrics>>;
  scenarioA: Metrics;
  setScenarioA: Dispatch<SetStateAction<Metrics>>;
  scenarioB: Metrics;
  setScenarioB: Dispatch<SetStateAction<Metrics>>;
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
  const calculateProfit = useCallback((metrics: Metrics) => {
    return metrics.revenue - metrics.fixedCosts - metrics.variableCosts - metrics.marketingCosts;
  }, []);

  useEffect(() => {
    setCurrentMetrics(prev => {
      const nextRevenue = productsRevenue;
      const avgCheck = prev.totalClients > 0 && nextRevenue > 0
        ? nextRevenue / prev.totalClients
        : 0;
      
      // Only update if values actually changed to prevent infinite loops
      if (prev.revenue === nextRevenue && prev.avgCheck === avgCheck) {
        return prev;
      }
      
      return {
        ...prev,
        revenue: nextRevenue,
        avgCheck,
      };
    });
  }, [productsRevenue, setCurrentMetrics]);

  const updateDetailedExpenses = useCallback((
    scenario: "current" | "scenarioA" | "scenarioB",
    detailedExpenses: DetailedExpenses
  ) => {
    const setter = scenario === "current" ? setCurrentMetrics : scenario === "scenarioA" ? setScenarioA : setScenarioB;
    const current = scenario === "current" ? currentMetrics : scenario === "scenarioA" ? scenarioA : scenarioB;
    
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
  }, [currentMetrics, scenarioA, scenarioB, setCurrentMetrics, setScenarioA, setScenarioB]);

  // Создаём стабильные колбеки для каждого сценария
  const handleCurrentMetricUpdate = useCallback((field: keyof Metrics, value: number) => {
    setCurrentMetrics((prev) => ({ ...prev, [field]: value }));
  }, [setCurrentMetrics]);
 
  const handleScenarioAMetricUpdate = useCallback((field: keyof Metrics, value: number) => {
    setScenarioA((prev) => ({ ...prev, [field]: value }));
  }, [setScenarioA]);
 
  const handleScenarioBMetricUpdate = useCallback((field: keyof Metrics, value: number) => {
    setScenarioB((prev) => ({ ...prev, [field]: value }));
  }, [setScenarioB]);
 
  const handleCurrentExpensesUpdate = useCallback((expenses: DetailedExpenses) => {
    updateDetailedExpenses("current", expenses);
  }, [updateDetailedExpenses]);
 
  const handleScenarioAExpensesUpdate = useCallback((expenses: DetailedExpenses) => {
    updateDetailedExpenses("scenarioA", expenses);
  }, [updateDetailedExpenses]);
 
  const handleScenarioBExpensesUpdate = useCallback((expenses: DetailedExpenses) => {
    updateDetailedExpenses("scenarioB", expenses);
  }, [updateDetailedExpenses]);
 
  const handleCurrentSync = useCallback(() => syncProductsToMetrics("current"), [syncProductsToMetrics]);
  const handleScenarioASync = useCallback(() => syncProductsToMetrics("scenarioA"), [syncProductsToMetrics]);
  const handleScenarioBSync = useCallback(() => syncProductsToMetrics("scenarioB"), [syncProductsToMetrics]);
 
  const handleCurrentSave = useCallback(() => saveScenario("current", currentMetrics), [saveScenario, currentMetrics]);
  const handleScenarioASave = useCallback(() => saveScenario("scenarioA", scenarioA), [saveScenario, scenarioA]);
  const handleScenarioBSave = useCallback(() => saveScenario("scenarioB", scenarioB), [saveScenario, scenarioB]);
 
  const handleCurrentLeadSourcesUpdate = useCallback((sources: LeadSource[]) => {
    setCurrentMetrics((prev) => ({ ...prev, leadSources: sources }));
  }, [setCurrentMetrics]);
 
  const handleScenarioALeadSourcesUpdate = useCallback((sources: LeadSource[]) => {
    setScenarioA((prev) => ({ ...prev, leadSources: sources }));
  }, [setScenarioA]);
 
  const handleScenarioBLeadSourcesUpdate = useCallback((sources: LeadSource[]) => {
    setScenarioB((prev) => ({ ...prev, leadSources: sources }));
  }, [setScenarioB]);

  // Очистка сценариев
  const handleClearScenarioA = useCallback(() => {
    setScenarioA(initialMetricsState);
  }, [setScenarioA]);

  const handleClearScenarioB = useCallback(() => {
    setScenarioB(initialMetricsState);
  }, [setScenarioB]);

  return (
    <div className="space-y-12">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Текущий</TabsTrigger>
          <TabsTrigger value="scenarioA">Сценарий A</TabsTrigger>
          <TabsTrigger value="scenarioB">Сценарий B</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-6">
          <MetricsForm
            metrics={currentMetrics}
            scenario="current"
            productsRevenue={productsRevenue}
            productsCosts={productsCosts}
            currency={currency}
            onUpdateMetric={handleCurrentMetricUpdate}
            onUpdateDetailedExpenses={handleCurrentExpensesUpdate}
            onUpdateLeadSources={handleCurrentLeadSourcesUpdate}
            onSyncProducts={handleCurrentSync}
            onSave={handleCurrentSave}
            isAuthenticated={isAuthenticated}
            calculateProfit={calculateProfit}
          />
        </TabsContent>

        <TabsContent value="scenarioA" className="mt-6">
          <MetricsForm
            metrics={scenarioA}
            scenario="scenarioA"
            productsRevenue={productsRevenue}
            productsCosts={productsCosts}
            currency={currency}
            onUpdateMetric={handleScenarioAMetricUpdate}
            onUpdateDetailedExpenses={handleScenarioAExpensesUpdate}
            onUpdateLeadSources={handleScenarioALeadSourcesUpdate}
            onSyncProducts={handleScenarioASync}
            onSave={handleScenarioASave}
            onClear={handleClearScenarioA}
            isAuthenticated={isAuthenticated}
            calculateProfit={calculateProfit}
          />
        </TabsContent>

        <TabsContent value="scenarioB" className="mt-6">
          <MetricsForm
            metrics={scenarioB}
            scenario="scenarioB"
            productsRevenue={productsRevenue}
            productsCosts={productsCosts}
            currency={currency}
            onUpdateMetric={handleScenarioBMetricUpdate}
            onUpdateDetailedExpenses={handleScenarioBExpensesUpdate}
            onUpdateLeadSources={handleScenarioBLeadSourcesUpdate}
            onSyncProducts={handleScenarioBSync}
            onSave={handleScenarioBSave}
            onClear={handleClearScenarioB}
            isAuthenticated={isAuthenticated}
            calculateProfit={calculateProfit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
