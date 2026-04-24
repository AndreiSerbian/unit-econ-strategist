import { useState, useEffect } from "react";
import logoImage from "@/assets/logo-clean.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyMetrics } from "./CompanyMetrics";
import { CompetitorAnalysis } from "./CompetitorAnalysis";
import { GameTheoryMatrix } from "./GameTheoryMatrix";
import { MetricsCharts } from "./MetricsCharts";
import { CompetitorCharts } from "./CompetitorCharts";
import { ExportDialog } from "./ExportDialog";
import { AnimatedCard } from "./AnimatedCard";
import { ProductsManagement } from "./ProductsManagement";
import { ProductsCharts } from "./ProductsCharts";
import { ProductComparison } from "./ProductComparison";
import { RawMaterialsManager } from "./RawMaterialsManager";
import { ProductMaterialsAllocation } from "./ProductMaterialsAllocation";
import { LogisticsTariffs } from "./LogisticsTariffs";
import { SalesChannelsManager } from "./SalesChannelsManager";
import { ProductChannelBreakdown } from "./ProductChannelBreakdown";
import { ChannelAnalytics } from "./ChannelAnalytics";

import { ExpensesBreakdownCharts } from "./ExpensesBreakdownCharts";
import { KeyMetricsComparison } from "./KeyMetricsComparison";
import { ROICalculator } from "./ROICalculator";
import { CompetitorKeyMetricsComparison } from "./CompetitorKeyMetricsComparison";
import { CompetitiveScoreCalculator } from "./CompetitiveScoreCalculator";
import { LTVCalculator } from "./LTVCalculator";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { SWOTAnalysis } from "./SWOTAnalysis";
import { MarketOverview } from "./MarketOverview";
import { CompetitiveMap } from "./CompetitiveMap";
import { StrategyDictionary } from "./StrategyDictionary";
import { CompetitiveSimulator } from "./CompetitiveSimulator";
import { CompetitiveRanking } from "./CompetitiveRanking";
import { QualityComparison } from "./QualityComparison";
import { ScenarioComparison } from "./ScenarioComparison";
import { MetricHistoryChart } from "./MetricHistoryChart";
import { MetricForecasting } from "./MetricForecasting";
import { ActionPlanManager } from "./ActionPlanManager";
import { OnboardingFlow } from "./OnboardingFlow";
import { CustomerJourney } from "./CustomerJourney";
import { CashFlowDiagram } from "./CashFlowDiagram";
import { MarketingMetrics } from "./MarketingMetrics";
import AIAnalytics from "./AIAnalytics";
import { BusinessTypeMetricsComparison } from "./BusinessTypeMetricsComparison";
import { TokenSaasManager } from "./token-saas";
import { MarketplaceManager } from "./marketplace";
import { ServiceDeliveryPipeline, ServicesCharts, ServiceFlowExplainer, ServiceQualityAssessment } from "./services";
import { CashFlowTimelineManager } from "./cashflow-timeline";
import { SaasProductsManager } from "./saas-products";
import { MetricRelationshipAnalyzer } from "./MetricRelationshipAnalyzer";
import { ProjectSettings } from "./ProjectSettings";
import { StartupChecklist } from "./StartupChecklist";
import { SubjectiveEstimateBadge } from "./ui/subjective-estimate-badge";
import { SummarySection } from "./summary/SummarySection";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BarChart3, Users, Brain, LogOut, LogIn, Package, TrendingUp, Map, HelpCircle, Truck, CloudOff, Cloud, Save, Loader2, Trash2, Wallet, Building2, FileText, ChevronDown } from "lucide-react";
import { type BusinessType, getBusinessTypeConfig } from "@/config/businessTypeMetrics";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { calculateCAC, calculateCPL, calculateProfit, calculateProfitMargin, calculateBreakEvenDifference } from "@/utils/metricsCalculations";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { useSaasProducts } from "@/hooks/useSaasProducts";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useTokenSaas } from "@/hooks/useTokenSaas";
import { useNavigate } from "react-router-dom";

const ONBOARDING_KEY = "strategy-analysis-onboarding-completed";

// ===== Shared market share calculation =====
function useMarketShares<T extends { revenue?: number | null; marketShare?: number | null }>(myRevenue: number, competitors: T[]) {
  const totalRevenue = myRevenue + competitors.reduce((sum, c) => sum + (c.revenue || 0), 0);
  const myMarketShare = totalRevenue > 0 ? (myRevenue / totalRevenue) * 100 : 0;
  const competitorsWithShare = competitors.map(c => ({
    ...c,
    marketShare: totalRevenue > 0 ? ((c.revenue || 0) / totalRevenue) * 100 : (c.marketShare || 0),
  }));
  return { totalRevenue, myMarketShare, competitorsWithShare };
}

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const {
    projectId,
    currentMetrics,
    setCurrentMetrics,
    scenarioA,
    setScenarioA,
    scenarioB,
    setScenarioB,
    competitors,
    setCompetitors,
    products,
    setProducts,
    materials,
    setMaterials,
    productMaterials,
    setProductMaterials,
    currency,
    businessType,
    loading,
    hasUnsavedChanges,
    lastSavedAt,
    isSaving,
    logisticsTariffs,
    setLogisticsTariffs,
    salesChannels,
    setSalesChannels,
    productChannelAllocations,
    setProductChannelAllocations,
    saveScenario,
    saveCompetitor,
    updateCompetitor,
    deleteCompetitor,
    saveProduct,
    updateProduct,
    deleteProduct,
    updateCurrency,
    updateBusinessType,
    calculateProductsRevenue,
    calculateProductsCosts,
    calculateMaterialCostPerUnit,
    calculateTotalMaterialsCost,
    calculateLogisticsCostPerUnit,
    calculateTotalLogisticsCost,
    calculateTotalMaterialLogistics,
    calculateTotalProductLogistics,
    calculateProductWeightFromMaterials,
    calculateProductVolumeFromMaterials,
    syncProductsToMetrics,
    addCompetitorProduct,
    deleteCompetitorProduct,
    saveAllToCloud,
    clearProducts,
    clearMaterials,
    clearCompetitors,
    clearMetrics,
    clearSalesChannels,
    clearAllData,
  } = useProject(user?.id);

  // SaaS Products for the new Product -> Plans model
  const { products: saasProducts, aggregateKPIs: saasAggregateKPIs } = useSaasProducts(projectId || '');

  // Marketplace categories for revenue bridge
  const { totals: marketplaceTotals } = useMarketplace(projectId || undefined);

  // Token SaaS for revenue bridge
  const tokenSaas = useTokenSaas(projectId || undefined, 'current');
  const tokenScenarioMetrics = tokenSaas.calculateScenarioMetrics();

  // Shared market share calculation
  const { myMarketShare, competitorsWithShare } = useMarketShares(currentMetrics.revenue, competitors);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  // ===== REVENUE BRIDGE =====
  useEffect(() => {
    if (businessType !== 'saas' || !saasAggregateKPIs) return;
    const saasRevenue = saasAggregateKPIs.totalRevenue || 0;
    if (saasRevenue > 0 && saasRevenue !== currentMetrics.revenue) {
      setCurrentMetrics(prev => ({ ...prev, revenue: saasRevenue }));
    }
  }, [businessType, saasAggregateKPIs?.totalRevenue]);

  useEffect(() => {
    if (businessType !== 'marketplace' || !marketplaceTotals) return;
    const mktRevenue = marketplaceTotals.totalPlatformRevenue || 0;
    if (mktRevenue > 0 && mktRevenue !== currentMetrics.revenue) {
      setCurrentMetrics(prev => ({ ...prev, revenue: mktRevenue }));
    }
  }, [businessType, marketplaceTotals?.totalPlatformRevenue]);

  useEffect(() => {
    if (businessType !== 'token_saas') return;
    const tokenRevenue = tokenScenarioMetrics?.totalPackageRevenue || 0;
    if (tokenRevenue > 0 && tokenRevenue !== currentMetrics.revenue) {
      setCurrentMetrics(prev => ({ ...prev, revenue: tokenRevenue }));
    }
  }, [businessType, tokenScenarioMetrics?.totalPackageRevenue]);

  const handleOnboardingComplete = (selectedType: BusinessType) => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    updateBusinessType(selectedType);
    setShowOnboarding(false);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'только что';
    if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const totalMaterialLogistics = calculateTotalMaterialLogistics();
  const totalProductLogistics = calculateTotalProductLogistics();
  const autoLogisticsTotal = totalMaterialLogistics + totalProductLogistics;

  const productionLogisticsExpense =
    currentMetrics.detailedExpenses?.variableCosts.production.logistics ?? 0;

  const manualLogistics = Math.max(0, productionLogisticsExpense - autoLogisticsTotal);
  const logisticsSplitTotal = autoLogisticsTotal + manualLogistics;

  const getLogisticsShare = (value: number) =>
    logisticsSplitTotal > 0 ? (value / logisticsSplitTotal) * 100 : 0;

  const logisticsVsRevenue =
    currentMetrics.revenue > 0 && productionLogisticsExpense > 0
      ? (productionLogisticsExpense / currentMetrics.revenue) * 100
      : 0;

  const handleSyncProductFromMaterials = (
    productId: string,
    options: { cost?: boolean; weight?: boolean; volume?: boolean }
  ) => {
    setProducts(
      products.map((product) => {
        if (product.id !== productId) return product;
        const updates: Partial<typeof product> = {};
        if (options.cost) updates.cost = calculateMaterialCostPerUnit(productId);
        if (options.weight) updates.weightPerUnit = calculateProductWeightFromMaterials(productId);
        if (options.volume) updates.volumePerUnit = calculateProductVolumeFromMaterials(productId);
        return { ...product, ...updates };
      })
    );
  };

  const handleApplyMaterialsExpenses = () => {
    if (!currentMetrics.detailedExpenses) return;

    const totalMaterialsCost = calculateTotalMaterialsCost();
    const totalLogisticsCost = calculateTotalLogisticsCost();

    const detailedExpenses = {
      ...currentMetrics.detailedExpenses,
      variableCosts: {
        ...currentMetrics.detailedExpenses.variableCosts,
        production: {
          ...currentMetrics.detailedExpenses.variableCosts.production,
          materials: totalMaterialsCost,
          logistics: totalLogisticsCost,
        },
      },
    };

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
      detailedExpenses.fixedCosts.customCategories.reduce((sum: number, c: any) => sum + c.value, 0);

    const marketingTotal =
      detailedExpenses.variableCosts.marketing.trafficPurchase +
      detailedExpenses.variableCosts.marketing.contractorsPayment +
      detailedExpenses.variableCosts.marketing.crmCosts +
      detailedExpenses.variableCosts.marketing.customCategories.reduce((sum: number, c: any) => sum + c.value, 0);

    const salesTotal =
      detailedExpenses.variableCosts.salesPayroll.bonusOldClients +
      detailedExpenses.variableCosts.salesPayroll.bonusNewClients +
      detailedExpenses.variableCosts.salesPayroll.customCategories.reduce((sum: number, c: any) => sum + c.value, 0);

    const productionTotal =
      detailedExpenses.variableCosts.production.materials +
      detailedExpenses.variableCosts.production.curators +
      detailedExpenses.variableCosts.production.logistics +
      detailedExpenses.variableCosts.production.partnersPercent +
      detailedExpenses.variableCosts.production.equipmentRepair +
      detailedExpenses.variableCosts.production.customCategories.reduce((sum: number, c: any) => sum + c.value, 0);

    const otherTotal =
      detailedExpenses.variableCosts.other.customCategories.reduce((sum: number, c: any) => sum + c.value, 0) +
      detailedExpenses.taxes;

    const variableTotal = salesTotal + productionTotal + otherTotal;

    setCurrentMetrics({
      ...currentMetrics,
      fixedCosts: fixedTotal,
      variableCosts: variableTotal,
      marketingCosts: marketingTotal,
      detailedExpenses,
    });
  };

  const exportData = {
    scenarios: {
      current: currentMetrics,
      scenarioA,
      scenarioB,
    },
    competitors,
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
        <motion.header 
          className="mb-4 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="Unit Economics Platform" 
                className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto"
              />
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                Платформа для анализа юнит-экономики и теории игр
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {(() => {
                const config = getBusinessTypeConfig(businessType);
                const currencySymbols: Record<string, string> = {
                  RUB: "₽", USD: "$", EUR: "€", KZT: "₸", BYN: "Br", UAH: "₴",
                };
                return (
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent">
                      <span>{config.icon}</span>
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                      <span>{currencySymbols[currency] || currency}</span>
                      <span>{currency}</span>
                    </div>
                  </div>
                );
              })()}
              <ProjectSettings
                currentBusinessType={businessType}
                onBusinessTypeChange={updateBusinessType}
                currency={currency}
                onCurrencyChange={updateCurrency}
              />
              <Button variant="ghost" size="sm" onClick={handleShowOnboarding} title="Показать онбординг">
                <HelpCircle className="w-4 h-4" />
              </Button>
              <ExportDialog data={exportData} />
              {user ? (
                <Button variant="outline" size="sm" onClick={signOut} className="whitespace-nowrap">
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Выход</span>
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="whitespace-nowrap">
                  <LogIn className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Вход</span>
                </Button>
              )}
            </div>
          </div>
          {user && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Вход выполнен как {user.email}
              </p>
              <div className="flex items-center gap-2">
                {hasUnsavedChanges ? (
                  <span className="flex items-center gap-1 text-xs text-amber-500">
                    <CloudOff className="w-3 h-3" />
                    Есть несохранённые изменения
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <Cloud className="w-3 h-3" />
                    Данные синхронизированы
                  </span>
                )}
                {lastSavedAt && (
                  <span className="text-xs text-muted-foreground">
                    • Сохранено {formatLastSaved(lastSavedAt)}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveAllToCloud()}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="h-6 px-2 text-xs"
                >
                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  <span className="ml-1 hidden sm:inline">Сохранить</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs text-destructive hover:text-destructive">
                      <Trash2 className="w-3 h-3" />
                      <span className="ml-1 hidden sm:inline">Очистить</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Очистить данные</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearProducts}><Package className="w-4 h-4 mr-2" />Продукты</DropdownMenuItem>
                    <DropdownMenuItem onClick={clearMaterials}><Truck className="w-4 h-4 mr-2" />Сырьё</DropdownMenuItem>
                    <DropdownMenuItem onClick={clearSalesChannels}><TrendingUp className="w-4 h-4 mr-2" />Каналы продаж</DropdownMenuItem>
                    <DropdownMenuItem onClick={clearMetrics}><BarChart3 className="w-4 h-4 mr-2" />Показатели</DropdownMenuItem>
                    <DropdownMenuItem onClick={clearCompetitors}><Users className="w-4 h-4 mr-2" />Конкуренты</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />Очистить всё
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Очистить все данные?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие удалит все введённые данные: продукты, сырьё, показатели, конкурентов и каналы продаж. Данные в облаке не будут удалены до следующего сохранения.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={clearAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Очистить всё
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </motion.header>

        {(() => {
          const businessConfig = getBusinessTypeConfig(businessType);
          const { features } = businessConfig;

          return (
            <Tabs defaultValue="company" className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 h-auto p-1 gap-1">
                <TabsTrigger value="company" className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs min-h-[48px]">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="text-[9px] sm:text-xs leading-tight text-center break-words">Моя компания</span>
                </TabsTrigger>
                <TabsTrigger value="metrics" className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs min-h-[48px]">
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span className="text-[9px] sm:text-xs leading-tight text-center">Показатели</span>
                </TabsTrigger>
                <TabsTrigger value="cashflow" className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs min-h-[48px]">
                  <Wallet className="w-4 h-4 shrink-0" />
                  <span className="text-[9px] sm:text-xs leading-tight text-center">Cash Flow</span>
                </TabsTrigger>
                <TabsTrigger value="competitors" className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs min-h-[48px]">
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="text-[9px] sm:text-xs leading-tight text-center">Конкуренты</span>
                </TabsTrigger>
                <TabsTrigger value="market" className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs min-h-[48px]">
                  <Map className="w-4 h-4 shrink-0" />
                  <span className="text-[9px] sm:text-xs leading-tight text-center">Рынок</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs min-h-[48px]">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="text-[9px] sm:text-xs leading-tight text-center">Итоги</span>
                </TabsTrigger>
                <TabsTrigger value="theory" className="flex flex-col items-center gap-0.5 py-2 px-1 text-xs min-h-[48px]">
                  <Brain className="w-4 h-4 shrink-0" />
                  <span className="text-[9px] sm:text-xs leading-tight text-center">Теория</span>
                </TabsTrigger>
              </TabsList>

              {/* ===== TAB 1: МОЯ КОМПАНИЯ (input only) ===== */}
              <TabsContent value="company" className="space-y-6">

                {/* Raw materials */}
                {features.hasRawMaterials && (
                  <AnimatedCard delay={0.1}>
                    <RawMaterialsManager materials={materials} setMaterials={setMaterials} currency={currency} tariffs={logisticsTariffs} />
                  </AnimatedCard>
                )}

                {/* Logistics tariffs */}
                {features.hasLogistics && (
                  <AnimatedCard delay={0.12}>
                    <LogisticsTariffs tariffs={logisticsTariffs} setTariffs={setLogisticsTariffs} currency={currency} />
                  </AnimatedCard>
                )}

                {/* Sales channels */}
                {features.hasSalesChannels && (
                  <AnimatedCard delay={0.14}>
                    <SalesChannelsManager channels={salesChannels} setChannels={setSalesChannels} currency={currency} />
                  </AnimatedCard>
                )}

                {/* Marketplace manager */}
                {businessType === 'marketplace' && (
                  <AnimatedCard delay={0.16}>
                    <MarketplaceManager
                      projectId={projectId}
                      channels={salesChannels}
                      currency={currency}
                      planningPeriod={'month' as 'week' | 'month' | 'quarter' | 'year'}
                    />
                  </AnimatedCard>
                )}

                {/* Product/service managers */}
                {businessType === 'token_saas' ? (
                  <AnimatedCard delay={0.18}>
                    <TokenSaasManager projectId={projectId || ''} scenarioType="current" />
                  </AnimatedCard>
                ) : businessType === 'saas' ? (
                  <AnimatedCard delay={0.18}>
                    <SaasProductsManager projectId={projectId || ''} currency={currency} salesChannels={salesChannels} />
                  </AnimatedCard>
                ) : businessType !== 'marketplace' ? (
                  <AnimatedCard delay={0.18}>
                    <ProductsManagement
                      products={products}
                      saveProduct={saveProduct}
                      updateProduct={updateProduct}
                      deleteProduct={deleteProduct}
                      isAuthenticated={!!user}
                      currency={currency}
                      tariffs={logisticsTariffs}
                      businessType={businessType}
                    />
                  </AnimatedCard>
                ) : null}

                {/* Material allocation */}
                {features.hasRawMaterials && products.length > 0 && (
                  <AnimatedCard delay={0.2}>
                    <ProductMaterialsAllocation
                      products={products}
                      materials={materials}
                      productMaterials={productMaterials}
                      setProductMaterials={setProductMaterials}
                      currency={currency}
                      onSyncProduct={handleSyncProductFromMaterials}
                      onApplyMaterialsExpenses={handleApplyMaterialsExpenses}
                      totalMaterialsCost={calculateTotalMaterialsCost()}
                      calculateMaterialCostPerUnit={calculateMaterialCostPerUnit}
                      calculateProductWeightFromMaterials={calculateProductWeightFromMaterials}
                      calculateProductVolumeFromMaterials={calculateProductVolumeFromMaterials}
                    />
                  </AnimatedCard>
                )}

                {/* Channel allocation */}
                {features.hasSalesChannels && products.length > 0 && salesChannels.length > 0 && (
                  <AnimatedCard delay={0.22}>
                    <ProductChannelBreakdown
                      products={products}
                      channels={salesChannels}
                      allocations={productChannelAllocations}
                      setAllocations={setProductChannelAllocations}
                      currency={currency}
                    />
                  </AnimatedCard>
                )}

                {/* Channel analytics (local preview) */}
                {features.hasSalesChannels && products.length > 0 && salesChannels.length > 0 && productChannelAllocations.length > 0 && (
                  <AnimatedCard delay={0.24}>
                    <ChannelAnalytics
                      products={products}
                      channels={salesChannels}
                      allocations={productChannelAllocations}
                      currency={currency}
                    />
                  </AnimatedCard>
                )}

                {/* Logistics breakdown (local preview) */}
                {features.hasLogistics && products.length > 0 && (
                  <AnimatedCard delay={0.23}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          Структура логистики
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                          Автоматический расчёт логистики по сырью и продуктам плюс ручные расходы склада и доставки.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Итого логистика</p>
                            <p className="text-lg sm:text-xl font-mono font-semibold">
                              {(productionLogisticsExpense || autoLogisticsTotal).toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {currentMetrics.revenue > 0 && (productionLogisticsExpense || autoLogisticsTotal) > 0
                                ? `${logisticsVsRevenue.toFixed(1)}% от выручки`
                                : "Доля в выручке будет показана после заполнения продаж"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Сырьё → производство</p>
                            <p className="text-base sm:text-lg font-mono font-semibold">
                              {totalMaterialLogistics.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {logisticsSplitTotal > 0 ? `${getLogisticsShare(totalMaterialLogistics).toFixed(1)}% общей логистики` : "0% общей логистики"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Продукты → клиент</p>
                            <p className="text-base sm:text-lg font-mono font-semibold">
                              {totalProductLogistics.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {logisticsSplitTotal > 0 ? `${getLogisticsShare(totalProductLogistics).toFixed(1)}% общей логистики` : "0% общей логистики"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Ручные расходы склада и доставки</p>
                            <p className="text-base sm:text-lg font-mono font-semibold">
                              {manualLogistics.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {logisticsSplitTotal > 0 ? `${getLogisticsShare(manualLogistics).toFixed(1)}% общей логистики` : "0% общей логистики"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                )}

                {/* Service delivery pipeline */}
                {businessType === 'services' && (
                  <AnimatedCard delay={0.245}>
                    <ServiceDeliveryPipeline currency={currency} />
                  </AnimatedCard>
                )}

                {/* Product/service charts (local preview only) */}
                {products.length > 0 && businessType === 'services' ? (
                  <AnimatedCard delay={0.25}>
                    <ServicesCharts products={products} currency={currency} />
                  </AnimatedCard>
                ) : products.length > 0 ? (
                  <AnimatedCard delay={0.25}>
                    <ProductsCharts products={products} currency={currency} />
                  </AnimatedCard>
                ) : null}

                {/* Company metrics input (scenario tabs with expenses/leads/metrics) */}
                <AnimatedCard delay={0.28}>
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Основные показатели бизнеса</CardTitle>
                      <CardDescription>
                        Внесите ключевые метрики вашей компании для расчета юнит-экономики.
                        {products.length > 0 && " Используйте кнопку синхронизации для загрузки данных из продуктов."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CompanyMetrics
                        currentMetrics={currentMetrics}
                        setCurrentMetrics={setCurrentMetrics}
                        scenarioA={scenarioA}
                        setScenarioA={setScenarioA}
                        scenarioB={scenarioB}
                        setScenarioB={setScenarioB}
                        saveScenario={saveScenario}
                        isAuthenticated={!!user}
                        currency={currency}
                        productsRevenue={calculateProductsRevenue()}
                        productsCosts={calculateProductsCosts()}
                        syncProductsToMetrics={syncProductsToMetrics}
                        businessType={businessType}
                      />
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </TabsContent>
              {/* ===== TAB 2: ПОКАЗАТЕЛИ (derived company analytics) ===== */}
              <TabsContent value="metrics" className="space-y-6">
                {/* Service flow explainer */}
                {businessType === 'services' && (
                  <AnimatedCard delay={0.05}>
                    <ServiceFlowExplainer />
                  </AnimatedCard>
                )}

                {/* Metrics charts */}
                {(currentMetrics.revenue > 0 || scenarioA.revenue > 0 || scenarioB.revenue > 0) && (
                  <AnimatedCard delay={0.2}>
                    <MetricsCharts currentMetrics={currentMetrics} scenarioA={scenarioA} scenarioB={scenarioB} />
                  </AnimatedCard>
                )}

                {/* Expenses breakdown */}
                {currentMetrics.detailedExpenses && (
                  <AnimatedCard delay={0.3}>
                    <ExpensesBreakdownCharts expenses={currentMetrics.detailedExpenses} currency={currency} />
                  </AnimatedCard>
                )}

                {/* Key metrics comparison */}
                {currentMetrics.detailedExpenses && scenarioA.detailedExpenses && scenarioB.detailedExpenses && (
                  <AnimatedCard delay={0.4}>
                    <KeyMetricsComparison
                      currentMetrics={currentMetrics}
                      scenarioA={scenarioA}
                      scenarioB={scenarioB}
                      currency={currency}
                    />
                  </AnimatedCard>
                )}

                {/* ROI Calculator */}
                {currentMetrics.detailedExpenses && scenarioA.detailedExpenses && scenarioB.detailedExpenses && (
                  <AnimatedCard delay={0.5}>
                    <ROICalculator
                      currentMetrics={currentMetrics}
                      scenarioA={scenarioA}
                      scenarioB={scenarioB}
                      currency={currency}
                    />
                  </AnimatedCard>
                )}

                {/* LTV Calculator */}
                <AnimatedCard delay={0.6}>
                  <LTVCalculator
                    currentMetrics={currentMetrics}
                    setCurrentMetrics={setCurrentMetrics}
                    scenarioA={scenarioA}
                    setScenarioA={setScenarioA}
                    scenarioB={scenarioB}
                    setScenarioB={setScenarioB}
                    currency={currency}
                  />
                </AnimatedCard>

                {/* Sensitivity Analysis */}
                {currentMetrics.detailedExpenses && (
                  <AnimatedCard delay={0.7}>
                    <SensitivityAnalysis baseMetrics={currentMetrics} currency={currency} />
                  </AnimatedCard>
                )}

                {/* Marketing Metrics (MOVED from Analytics) */}
                {currentMetrics.detailedExpenses && (
                  <AnimatedCard delay={0.75}>
                    <MarketingMetrics
                      marketingCosts={currentMetrics.marketingCosts}
                      totalLeads={currentMetrics.totalLeads || 0}
                      totalClients={currentMetrics.totalClients}
                      newClients={currentMetrics.newClients}
                      conversionRate={currentMetrics.conversionRate}
                      revenue={currentMetrics.revenue}
                      leadSources={currentMetrics.leadSources || []}
                      currency={currency}
                      trafficPurchase={currentMetrics.detailedExpenses.variableCosts.marketing.trafficPurchase}
                      contractorsPayment={currentMetrics.detailedExpenses.variableCosts.marketing.contractorsPayment}
                      crmCosts={currentMetrics.detailedExpenses.variableCosts.marketing.crmCosts}
                      marketingSalary={currentMetrics.detailedExpenses.fixedCosts.marketingSalary}
                    />
                  </AnimatedCard>
                )}

                {/* Customer Journey (MOVED from Analytics) */}
                {(currentMetrics.totalLeads || 0) > 0 && (
                  <AnimatedCard delay={0.8}>
                    <CustomerJourney
                      leadSources={currentMetrics.leadSources || []}
                      totalLeads={currentMetrics.totalLeads || 0}
                      totalClients={currentMetrics.totalClients}
                      newClients={currentMetrics.newClients}
                      returningClients={currentMetrics.returningClients}
                      conversionRate={currentMetrics.conversionRate}
                      churnRate={currentMetrics.churnRate || 0}
                      currency={currency}
                    />
                  </AnimatedCard>
                )}

                {/* Cash Flow Diagram (MOVED from Analytics — summary view) */}
                {currentMetrics.revenue > 0 && (
                  <AnimatedCard delay={0.85}>
                    <CashFlowDiagram
                      revenue={currentMetrics.revenue}
                      totalClients={currentMetrics.totalClients}
                      newClients={currentMetrics.newClients}
                      returningClients={currentMetrics.returningClients}
                      leadSources={currentMetrics.leadSources || []}
                      detailedExpenses={currentMetrics.detailedExpenses}
                      fixedCosts={currentMetrics.fixedCosts}
                      variableCosts={currentMetrics.variableCosts}
                      marketingCosts={currentMetrics.marketingCosts}
                      currency={currency}
                    />
                  </AnimatedCard>
                )}
              </TabsContent>

              {/* ===== TAB 3: CASH FLOW ===== */}
              <TabsContent value="cashflow" className="space-y-6">
                <AnimatedCard delay={0.1}>
                  <CashFlowTimelineManager
                    projectId={projectId}
                    currency={currency}
                    businessType={businessType}
                    ecommerceData={
                      (businessType === 'ecommerce' || businessType === 'production') ? {
                        products: products.map(p => ({
                          id: p.id, name: p.name, price: p.price, cost: p.cost,
                          quantity: p.quantity, logisticsToClientPerUnit: p.logisticsToClientPerUnit,
                        })),
                        channels: salesChannels.map(ch => ({
                          id: ch.id, name: ch.name, commissionPercent: ch.commissionPercent,
                          returnRatePercent: ch.returnRatePercent, paymentDelayDays: ch.paymentDelayDays,
                        })),
                        productChannelAllocations: productChannelAllocations.map(a => ({
                          productId: a.productId, channelId: a.channelId, quantity: a.quantity, priceOverride: a.priceOverride,
                        })),
                        horizonPeriods: 12, planningPeriod: 'month',
                      } : undefined
                    }
                    servicesData={
                      businessType === 'services' ? {
                        services: products.map(p => ({
                          id: p.id, name: p.name, price: p.price, cost: p.cost, quantity: p.quantity,
                          billingModel: p.billingModel || 'fixed_project',
                          estimatedHoursPerProject: p.estimatedHoursPerProject ?? undefined,
                          hourlyRate: p.hourlyRate ?? undefined,
                          retainerFee: p.retainerFee ?? undefined,
                          clientsCount: p.clientsCount ?? undefined,
                        })),
                        horizonPeriods: 12, planningPeriod: 'month',
                      } : undefined
                    }
                    saasData={
                      (businessType === 'saas' || businessType === 'freemium') ? {
                        products: saasProducts.map(p => ({
                          id: p.id, name: p.name, planningPeriod: p.planning_period,
                          plans: p.plans.map(plan => ({
                            id: plan.id, name: plan.name, billingType: plan.billing_type,
                            priceEur: plan.price_eur, subscribers: plan.subscribers,
                            newSubscribersPerPeriod: plan.new_subscribers_per_period,
                            costPerSubscriberPerMonthEur: plan.cost_per_subscriber_per_month_eur,
                            isFreePlan: plan.is_free_plan, churnRatePercent: plan.churn_rate_percent,
                            costPerBuyerEur: plan.cost_per_buyer_eur,
                          })),
                        })),
                        horizonPeriods: 12, planningPeriod: 'month',
                      } : undefined
                    }
                    sharingData={
                      businessType === 'sharing' ? {
                        assets: products.map(p => ({
                          id: p.id, name: p.name, gmv: p.gmv ?? 0, takeRate: p.takeRate ?? 0,
                          utilizationRate: p.utilizationRate ?? 0, maintenanceCost: p.cost,
                        })),
                        horizonPeriods: 12, planningPeriod: 'month',
                      } : undefined
                    }
                    expensesData={
                      currentMetrics.detailedExpenses ? {
                        fixedCosts: {
                          salaries: (
                            currentMetrics.detailedExpenses.fixedCosts.salaryOldClients +
                            currentMetrics.detailedExpenses.fixedCosts.salaryNewClients +
                            currentMetrics.detailedExpenses.fixedCosts.managementSalary +
                            currentMetrics.detailedExpenses.fixedCosts.marketingSalary +
                            currentMetrics.detailedExpenses.fixedCosts.productionSalary
                          ),
                          rent: (
                            currentMetrics.detailedExpenses.fixedCosts.officeRent +
                            currentMetrics.detailedExpenses.fixedCosts.warehouseRent
                          ),
                          marketing: currentMetrics.marketingCosts,
                          other: (
                            currentMetrics.detailedExpenses.fixedCosts.internet +
                            currentMetrics.detailedExpenses.fixedCosts.communication +
                            currentMetrics.detailedExpenses.fixedCosts.banking +
                            currentMetrics.detailedExpenses.fixedCosts.subscriptions +
                            currentMetrics.detailedExpenses.fixedCosts.utilities
                          ),
                        },
                        taxes: currentMetrics.detailedExpenses.taxes,
                        horizonPeriods: 12,
                      } : undefined
                    }
                  />
                </AnimatedCard>
              </TabsContent>

              {/* ===== TAB 4: КОНКУРЕНТЫ (input only, minimal charts) ===== */}
              <TabsContent value="competitors" className="space-y-6">
                <AnimatedCard delay={0.1}>
                  <Card className="shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <CardTitle>Анализ конкурентов</CardTitle>
                          <CardDescription>
                            Добавьте информацию о конкурентах для сравнительного анализа. Все данные вводятся в выбранной валюте.
                          </CardDescription>
                        </div>
                        <SubjectiveEstimateBadge />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CompetitorAnalysis
                        competitors={competitors}
                        saveCompetitor={saveCompetitor}
                        updateCompetitor={updateCompetitor}
                        deleteCompetitor={deleteCompetitor}
                        addCompetitorProduct={addCompetitorProduct}
                        deleteCompetitorProduct={deleteCompetitorProduct}
                        isAuthenticated={!!user}
                        currency={currency}
                        businessType={businessType}
                      />
                    </CardContent>
                  </Card>
                </AnimatedCard>

                {/* Basic competitor charts — local input preview only */}
                {competitors.length > 0 && (
                  <AnimatedCard delay={0.2}>
                    <CompetitorCharts competitors={competitors} currency={currency} />
                  </AnimatedCard>
                )}
              </TabsContent>

              {/* ===== TAB 5: РЫНОК (all comparative analytics) ===== */}
              <TabsContent value="market" className="space-y-6">
                <div className="flex items-center justify-end -mb-2">
                  <SubjectiveEstimateBadge label="Раздел основан на экспертных оценках" />
                </div>
                <AnimatedCard delay={0.1}>
                  <MarketOverview
                    projectId={projectId}
                    myCompanyRevenue={currentMetrics.revenue}
                    competitors={competitors}
                    currency={currency}
                  />
                </AnimatedCard>

                {/* Competitive Map */}
                {competitors.some(c => c.detailedExpenses && c.customerLifetimeMonths && c.purchaseFrequency) &&
                 currentMetrics.detailedExpenses && currentMetrics.customerLifetimeMonths && currentMetrics.purchaseFrequency && (
                  <AnimatedCard delay={0.2}>
                    <CompetitiveMap
                      myCompany={{
                        name: "Моя компания",
                        revenue: currentMetrics.revenue,
                        marketShare: myMarketShare,
                        totalClients: currentMetrics.totalClients,
                        newClients: currentMetrics.newClients,
                        returningClients: currentMetrics.returningClients,
                        conversionRate: currentMetrics.conversionRate,
                        avgCheck: currentMetrics.avgCheck,
                        fixedCosts: currentMetrics.fixedCosts,
                        variableCosts: currentMetrics.variableCosts,
                        marketingCosts: currentMetrics.marketingCosts,
                        detailedExpenses: currentMetrics.detailedExpenses,
                        customerLifetimeMonths: currentMetrics.customerLifetimeMonths,
                        purchaseFrequency: currentMetrics.purchaseFrequency,
                      }}
                      competitors={competitorsWithShare}
                      currency={currency}
                    />
                  </AnimatedCard>
                )}

                {/* Competitive Ranking */}
                {competitors.length > 0 && (
                  <AnimatedCard delay={0.3}>
                    <CompetitiveRanking
                      myCompany={{ ...currentMetrics, marketShare: myMarketShare }}
                      competitors={competitorsWithShare}
                      currency={currency}
                    />
                  </AnimatedCard>
                )}

                {/* Competitive Score Calculator (MOVED from Competitors) */}
                {competitors.length > 0 && (
                  <AnimatedCard delay={0.35}>
                    <CompetitiveScoreCalculator
                      myCompany={{
                        name: "Моя компания",
                        revenue: currentMetrics.revenue || 0,
                        marketShare: myMarketShare,
                        pricing: currentMetrics.avgCheck || 0,
                        quality: products.length > 0
                          ? Math.round(products.reduce((sum, p) => sum + (p.quality ?? 10), 0) / products.length)
                          : 10,
                        marketingSpend: currentMetrics.marketingCosts || 0,
                      }}
                      competitors={competitorsWithShare}
                      currency={currency}
                    />
                  </AnimatedCard>
                )}

                {/* Competitor Key Metrics Comparison (MOVED from Competitors) */}
                {competitors.some((c) => c.detailedExpenses) && currentMetrics.detailedExpenses && (
                  <AnimatedCard delay={0.4}>
                    <CompetitorKeyMetricsComparison
                      myCompany={{
                        id: "my-company",
                        name: "Моя компания",
                        revenue: currentMetrics.revenue,
                        totalClients: currentMetrics.totalClients,
                        newClients: currentMetrics.newClients,
                        returningClients: currentMetrics.returningClients,
                        conversionRate: currentMetrics.conversionRate,
                        avgCheck: currentMetrics.avgCheck,
                        fixedCosts: currentMetrics.fixedCosts,
                        variableCosts: currentMetrics.variableCosts,
                        marketingSpend: currentMetrics.marketingCosts,
                        detailedExpenses: currentMetrics.detailedExpenses,
                        marketShare: 0, pricing: 0, quality: 0, products: [],
                      }}
                      competitors={competitors}
                      currency={currency}
                    />
                  </AnimatedCard>
                )}

                {/* Business type metrics comparison (MOVED from Competitors) */}
                {competitors.length > 0 && (
                  <AnimatedCard delay={0.45}>
                    <BusinessTypeMetricsComparison
                      myCompany={{
                        name: "Моя компания",
                        revenue: currentMetrics.revenue,
                        totalClients: currentMetrics.totalClients,
                        newClients: currentMetrics.newClients,
                        returningClients: currentMetrics.returningClients,
                        churnRate: (currentMetrics as any).churnRate,
                        nrr: (currentMetrics as any).nrr,
                        expansionRevenue: (currentMetrics as any).expansionRevenue,
                        repeatRate: (currentMetrics as any).repeatRate,
                        utilizationRate: (currentMetrics as any).utilizationRate,
                        billableHours: (currentMetrics as any).billableHours,
                        projectMargin: (currentMetrics as any).projectMargin,
                        takeRate: (currentMetrics as any).takeRate,
                        freeToPayConversion: (currentMetrics as any).freeToPayConversion,
                        customerLifetimeMonths: currentMetrics.customerLifetimeMonths,
                        purchaseFrequency: currentMetrics.purchaseFrequency,
                      }}
                      competitors={competitors}
                      businessType={businessType}
                      currency={currency}
                    />
                  </AnimatedCard>
                )}

                {/* Quality comparison (MOVED from Competitors) */}
                {competitors.length > 0 && businessType === 'services' && (
                  <AnimatedCard delay={0.5}>
                    <ServiceQualityAssessment products={products} competitors={competitors} companyName="Моя компания" />
                  </AnimatedCard>
                )}
                {competitors.length > 0 && businessType !== 'services' && (
                  <AnimatedCard delay={0.5}>
                    <QualityComparison products={products} competitors={competitors} companyName="Моя компания" />
                  </AnimatedCard>
                )}

                {/* SWOT Analysis (MOVED from Competitors) */}
                {competitors.length > 0 && (
                  <AnimatedCard delay={0.55}>
                    <SWOTAnalysis
                      projectId={projectId}
                      myCompany={{ name: "Моя компания" }}
                      competitors={competitors.map(c => ({ id: c.id, name: c.name }))}
                    />
                  </AnimatedCard>
                )}

                {/* Product Comparison (MOVED from Products tab) */}
                {(products.length > 0 || competitors.some(c => (c.products || []).length > 0)) && (
                  <AnimatedCard delay={0.6}>
                    <ProductComparison products={products} competitors={competitors} currency={currency} />
                  </AnimatedCard>
                )}

                {/* Metric Relationship Analyzer (MOVED from Analytics) */}
                <AnimatedCard delay={0.65}>
                  <MetricRelationshipAnalyzer
                    metrics={currentMetrics}
                    competitors={competitors}
                    businessType={businessType}
                    currency={currency}
                  />
                </AnimatedCard>
              </TabsContent>

              {/* ===== TAB 6: ИТОГИ (executive summary) ===== */}
              <TabsContent value="summary" className="space-y-6">
                {/* Executive summary cards (Company / CashFlow / Risks / Recommendations) */}
                <AnimatedCard delay={0.05}>
                  <SummarySection
                    metrics={currentMetrics}
                    projectId={projectId}
                    currency={currency}
                  />
                </AnimatedCard>

                {/* Scenario Comparison (merged from 3× ScenarioSummary) */}
                <AnimatedCard delay={0.1}>
                  <ScenarioComparison
                    projectId={projectId}
                    currency={currency}
                    scenarios={[
                      {
                        type: "current",
                        label: "Текущая ситуация",
                        hasData: !!currentMetrics.detailedExpenses,
                        metrics: currentMetrics.detailedExpenses ? {
                          revenue: currentMetrics.revenue,
                          profit: calculateProfit(currentMetrics),
                          profitMargin: calculateProfitMargin(currentMetrics),
                          cac: calculateCAC(currentMetrics),
                          breakEven: calculateBreakEvenDifference(currentMetrics),
                        } : undefined,
                      },
                      {
                        type: "scenarioA",
                        label: "Сценарий А",
                        hasData: !!scenarioA.detailedExpenses,
                        metrics: scenarioA.detailedExpenses ? {
                          revenue: scenarioA.revenue,
                          profit: calculateProfit(scenarioA),
                          profitMargin: calculateProfitMargin(scenarioA),
                          cac: calculateCAC(scenarioA),
                          breakEven: calculateBreakEvenDifference(scenarioA),
                        } : undefined,
                      },
                      {
                        type: "scenarioB",
                        label: "Сценарий Б",
                        hasData: !!scenarioB.detailedExpenses,
                        metrics: scenarioB.detailedExpenses ? {
                          revenue: scenarioB.revenue,
                          profit: calculateProfit(scenarioB),
                          profitMargin: calculateProfitMargin(scenarioB),
                          cac: calculateCAC(scenarioB),
                          breakEven: calculateBreakEvenDifference(scenarioB),
                        } : undefined,
                      },
                    ]}
                  />
                </AnimatedCard>

                {/* Action Plan Manager */}
                <AnimatedCard delay={0.3}>
                  <ActionPlanManager
                    projectId={projectId}
                    currentMetrics={currentMetrics.detailedExpenses ? {
                      profitMargin: calculateProfitMargin(currentMetrics),
                      cac: calculateCAC(currentMetrics),
                      breakEven: calculateBreakEvenDifference(currentMetrics),
                    } : undefined}
                  />
                </AnimatedCard>

                {/* AI Analytics */}
                <AnimatedCard delay={0.4}>
                  <AIAnalytics
                    metrics={{
                      revenue: currentMetrics.revenue,
                      profit: calculateProfit(currentMetrics),
                      profitMargin: calculateProfitMargin(currentMetrics),
                      cac: calculateCAC(currentMetrics),
                      ltv: currentMetrics.ltv || 0,
                      ltvCacRatio: (currentMetrics.ltv && calculateCAC(currentMetrics)) ? currentMetrics.ltv / calculateCAC(currentMetrics) : 0,
                      breakEvenPoint: calculateBreakEvenDifference(currentMetrics),
                      conversionRate: currentMetrics.conversionRate,
                      totalClients: currentMetrics.totalClients,
                      avgCheck: currentMetrics.avgCheck,
                      marketingCosts: currentMetrics.marketingCosts,
                    }}
                    competitors={competitors.map(c => ({
                      id: c.id, name: c.name,
                      revenue: c.revenue || 0, marketShare: c.marketShare || 0, quality: c.quality || 0,
                    }))}
                    products={products.map(p => ({
                      id: p.id, name: p.name, price: p.price, cost: p.cost, quantity: p.quantity,
                    }))}
                  />
                </AnimatedCard>

                {/* Collapsible: additional analytics */}
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full flex items-center justify-between">
                      <span>Дополнительно: история и прогноз</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-6 mt-4">
                    <AnimatedCard delay={0.05}>
                      <MetricHistoryChart
                        projectId={projectId}
                        scenarioType="current"
                        currentMetrics={currentMetrics.detailedExpenses ? {
                          revenue: currentMetrics.revenue,
                          cac: calculateCAC(currentMetrics),
                          cpl: calculateCPL(currentMetrics),
                          profit: calculateProfit(currentMetrics),
                          profitMargin: calculateProfitMargin(currentMetrics),
                          breakEven: calculateBreakEvenDifference(currentMetrics),
                        } : undefined}
                      />
                    </AnimatedCard>

                    <AnimatedCard delay={0.1}>
                      <MetricForecasting projectId={projectId} scenarioType="current" />
                    </AnimatedCard>
                  </CollapsibleContent>
                </Collapsible>
              </TabsContent>

              {/* ===== TAB 7: ТЕОРИЯ (game theory, reference) ===== */}
              <TabsContent value="theory" className="space-y-6">
                <AnimatedCard delay={0.1}>
                  <GameTheoryMatrix />
                </AnimatedCard>

                <AnimatedCard delay={0.2}>
                  <StrategyDictionary />
                </AnimatedCard>

                <AnimatedCard delay={0.3}>
                  <CompetitiveSimulator myCompany={currentMetrics} competitors={competitors} currency={currency} />
                </AnimatedCard>
              </TabsContent>
            </Tabs>
          );
        })()}
      </div>
    </div>
  );
};
