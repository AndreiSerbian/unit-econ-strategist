import { useState, useEffect } from "react";
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
import { CurrencySelector } from "./CurrencySelector";
import { ExpensesBreakdownCharts } from "./ExpensesBreakdownCharts";
import { KeyMetricsComparison } from "./KeyMetricsComparison";
import { ROICalculator } from "./ROICalculator";
import { CompetitorKeyMetricsComparison } from "./CompetitorKeyMetricsComparison";
import { CompetitorROICalculator } from "./CompetitorROICalculator";
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
import { ScenarioSummary } from "./ScenarioSummary";
import { MetricHistoryChart } from "./MetricHistoryChart";
import { MetricForecasting } from "./MetricForecasting";
import { ActionPlanManager } from "./ActionPlanManager";
import { OnboardingFlow } from "./OnboardingFlow";
import AIAnalytics from "./AIAnalytics";
import { BarChart3, Users, Brain, LogOut, LogIn, Package, TrendingUp, Map, HelpCircle, Truck, CloudOff, Cloud, Save, Loader2, Trash2 } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

const ONBOARDING_KEY = "strategy-analysis-onboarding-completed";

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

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

  const [showClearDialog, setShowClearDialog] = useState(false);

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
 
  const manualLogistics = Math.max(
    0,
    productionLogisticsExpense - autoLogisticsTotal
  );
 
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
        
        if (options.cost) {
          updates.cost = calculateMaterialCostPerUnit(productId);
        }
        if (options.weight) {
          updates.weightPerUnit = calculateProductWeightFromMaterials(productId);
        }
        if (options.volume) {
          updates.volumePerUnit = calculateProductVolumeFromMaterials(productId);
        }
        
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
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent leading-tight">
                Стратегический Анализ
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-1">
                Платформа для анализа юнит-экономики и теории игр
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShowOnboarding}
                title="Показать онбординг"
              >
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
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  <span className="ml-1 hidden sm:inline">Сохранить</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="ml-1 hidden sm:inline">Очистить</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Очистить данные</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearProducts}>
                      <Package className="w-4 h-4 mr-2" />
                      Продукты
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={clearMaterials}>
                      <Truck className="w-4 h-4 mr-2" />
                      Сырьё
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={clearSalesChannels}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Каналы продаж
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={clearMetrics}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Показатели
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={clearCompetitors}>
                      <Users className="w-4 h-4 mr-2" />
                      Конкуренты
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Очистить всё
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
                          <AlertDialogAction 
                            onClick={clearAllData}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
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

        <Tabs defaultValue="products" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="products" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
              <Package className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-sm">Продукты</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-sm">Показатели</span>
            </TabsTrigger>
            <TabsTrigger value="competitors" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
              <Users className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-sm">Конкуренты</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
              <Map className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-sm">Рынок</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-sm">Аналитика</span>
            </TabsTrigger>
            <TabsTrigger value="game-theory" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
              <Brain className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-sm">Теория</span>
            </TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB - First in order */}
          <TabsContent value="products" className="space-y-6">
            <AnimatedCard delay={0.05}>
              <CurrencySelector
                currency={currency}
                onCurrencyChange={updateCurrency}
                isAuthenticated={!!user}
              />
            </AnimatedCard>

            <AnimatedCard delay={0.1}>
              <RawMaterialsManager
                materials={materials}
                setMaterials={setMaterials}
                currency={currency}
                tariffs={logisticsTariffs}
              />
            </AnimatedCard>

            <AnimatedCard delay={0.12}>
              <LogisticsTariffs
                tariffs={logisticsTariffs}
                setTariffs={setLogisticsTariffs}
                currency={currency}
              />
            </AnimatedCard>

            <AnimatedCard delay={0.14}>
              <SalesChannelsManager
                channels={salesChannels}
                setChannels={setSalesChannels}
                currency={currency}
              />
            </AnimatedCard>

            <AnimatedCard delay={0.18}>
              <ProductsManagement
                products={products}
                saveProduct={saveProduct}
                updateProduct={updateProduct}
                deleteProduct={deleteProduct}
                isAuthenticated={!!user}
                currency={currency}
                tariffs={logisticsTariffs}
              />
            </AnimatedCard>

            {products.length > 0 && (
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

            {products.length > 0 && salesChannels.length > 0 && (
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

            {products.length > 0 && salesChannels.length > 0 && productChannelAllocations.length > 0 && (
              <AnimatedCard delay={0.24}>
                <ChannelAnalytics
                  products={products}
                  channels={salesChannels}
                  allocations={productChannelAllocations}
                  currency={currency}
                />
              </AnimatedCard>
            )}
 
            {products.length > 0 && (
              <AnimatedCard delay={0.23}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Структура логистики
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                      Автоматический расчёт логистики по сырью и продуктам плюс ручные расходы
                      склада и доставки.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                          Итого логистика
                        </p>
                        <p className="text-lg sm:text-xl font-mono font-semibold">
                          {(productionLogisticsExpense || autoLogisticsTotal).toLocaleString("ru-RU", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          {currency}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {currentMetrics.revenue > 0 && (productionLogisticsExpense || autoLogisticsTotal) > 0
                            ? `${logisticsVsRevenue.toFixed(1)}% от выручки`
                            : "Доля в выручке будет показана после заполнения продаж"}
                        </p>
                      </div>
 
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                          Сырьё → производство
                        </p>
                        <p className="text-base sm:text-lg font-mono font-semibold">
                          {totalMaterialLogistics.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {logisticsSplitTotal > 0
                            ? `${getLogisticsShare(totalMaterialLogistics).toFixed(1)}% общей логистики`
                            : "0% общей логистики"}
                        </p>
                      </div>
 
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                          Продукты → клиент
                        </p>
                        <p className="text-base sm:text-lg font-mono font-semibold">
                          {totalProductLogistics.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {logisticsSplitTotal > 0
                            ? `${getLogisticsShare(totalProductLogistics).toFixed(1)}% общей логистики`
                            : "0% общей логистики"}
                        </p>
                      </div>
 
                      <div className="space-y-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                          Ручные расходы склада и доставки
                        </p>
                        <p className="text-base sm:text-lg font-mono font-semibold">
                          {manualLogistics.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {logisticsSplitTotal > 0
                            ? `${getLogisticsShare(manualLogistics).toFixed(1)}% общей логистики`
                            : "0% общей логистики"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            )}
 
            {products.length > 0 && (
              <AnimatedCard delay={0.25}>
                <ProductsCharts products={products} currency={currency} />
              </AnimatedCard>
            )}
 
            {(products.length > 0 || competitors.some(c => (c.products || []).length > 0)) && (
              <AnimatedCard delay={0.3}>
                <ProductComparison 
                  products={products} 
                  competitors={competitors} 
                  currency={currency} 
                />
              </AnimatedCard>
            )}
          </TabsContent>

          {/* METRICS TAB - Second */}
          <TabsContent value="metrics" className="space-y-6">
            <AnimatedCard delay={0.1}>
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
                  />
                </CardContent>
              </Card>
            </AnimatedCard>

            {(currentMetrics.revenue > 0 || scenarioA.revenue > 0 || scenarioB.revenue > 0) && (
              <AnimatedCard delay={0.2}>
                <MetricsCharts
                  currentMetrics={currentMetrics}
                  scenarioA={scenarioA}
                  scenarioB={scenarioB}
                />
              </AnimatedCard>
            )}

            {currentMetrics.detailedExpenses && (
              <AnimatedCard delay={0.3}>
                <ExpensesBreakdownCharts 
                  expenses={currentMetrics.detailedExpenses} 
                  currency={currency} 
                />
              </AnimatedCard>
            )}

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
            
            {currentMetrics.detailedExpenses && (
              <AnimatedCard delay={0.7}>
                <SensitivityAnalysis
                  baseMetrics={currentMetrics}
                  currency={currency}
                />
              </AnimatedCard>
            )}
          </TabsContent>

          {/* COMPETITORS TAB */}
          <TabsContent value="competitors" className="space-y-6">
            <AnimatedCard delay={0.05}>
              <CurrencySelector
                currency={currency}
                onCurrencyChange={updateCurrency}
                isAuthenticated={!!user}
              />
            </AnimatedCard>

            <AnimatedCard delay={0.1}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Анализ конкурентов</CardTitle>
                  <CardDescription>
                    Добавьте информацию о конкурентах для сравнительного анализа. Все данные вводятся в выбранной валюте.
                  </CardDescription>
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
                  />
                </CardContent>
              </Card>
            </AnimatedCard>

            {competitors.length > 0 && (
              <AnimatedCard delay={0.2}>
                <CompetitorCharts competitors={competitors} currency={currency} />
              </AnimatedCard>
            )}

            {competitors.some((c) => c.detailedExpenses) && currentMetrics.detailedExpenses && (
              <AnimatedCard delay={0.3}>
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
                    marketShare: 0,
                    pricing: 0,
                    quality: 0,
                    products: [],
                  }}
                  competitors={competitors}
                  currency={currency}
                />
              </AnimatedCard>
            )}
            
            {competitors.some((c) => c.detailedExpenses) && currentMetrics.detailedExpenses && (
              <AnimatedCard delay={0.4}>
                <CompetitorROICalculator
                  myCompany={{
                    name: "Моя компания",
                    revenue: currentMetrics.revenue,
                    fixedCosts: currentMetrics.fixedCosts,
                    variableCosts: currentMetrics.variableCosts,
                    marketingCosts: currentMetrics.marketingCosts,
                  }}
                  competitors={competitors.filter(c => c.detailedExpenses)}
                  currency={currency}
                />
              </AnimatedCard>
            )}
            
            {competitors.length > 0 && (
              <AnimatedCard delay={0.5}>
                <CompetitiveScoreCalculator
                  myCompany={{
                    name: "Моя компания",
                    revenue: currentMetrics.revenue,
                    marketShare: 0,
                    pricing: currentMetrics.avgCheck,
                    quality: products.length > 0 
                      ? Math.round(products.reduce((sum, p) => sum + (p.quality ?? 10), 0) / products.length)
                      : 10,
                    marketingSpend: currentMetrics.marketingCosts,
                  }}
                  competitors={competitors}
                  currency={currency}
                />
              </AnimatedCard>
            )}
            
            {competitors.length > 0 && (
              <AnimatedCard delay={0.55}>
                <QualityComparison
                  products={products}
                  competitors={competitors}
                  companyName="Моя компания"
                />
              </AnimatedCard>
            )}

            {competitors.length > 0 && (
              <AnimatedCard delay={0.6}>
                <SWOTAnalysis
                  projectId={projectId}
                  myCompany={{ name: "Моя компания" }}
                  competitors={competitors.map(c => ({ id: c.id, name: c.name }))}
                />
              </AnimatedCard>
            )}
          </TabsContent>

          {/* MARKET TAB */}
          <TabsContent value="market" className="space-y-6">
            <AnimatedCard delay={0.1}>
              <MarketOverview
                projectId={projectId}
                myCompanyRevenue={currentMetrics.revenue}
                competitors={competitors}
                currency={currency}
              />
            </AnimatedCard>

            {competitors.some(c => c.detailedExpenses && c.customerLifetimeMonths && c.purchaseFrequency) && 
             currentMetrics.detailedExpenses && currentMetrics.customerLifetimeMonths && currentMetrics.purchaseFrequency && (
              <AnimatedCard delay={0.2}>
                <CompetitiveMap
                  myCompany={{
                    name: "Моя компания",
                    revenue: currentMetrics.revenue,
                    marketShare: 0,
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
                  competitors={competitors}
                  currency={currency}
                />
              </AnimatedCard>
            )}

            {competitors.length > 0 && (
              <AnimatedCard delay={0.3}>
                <CompetitiveRanking
                  myCompany={currentMetrics}
                  competitors={competitors}
                  currency={currency}
                />
              </AnimatedCard>
            )}
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <AnimatedCard delay={0.1}>
              <MetricHistoryChart
                projectId={projectId}
                scenarioType="current"
                currentMetrics={currentMetrics.detailedExpenses ? {
                  revenue: currentMetrics.revenue,
                  cac: calculateCAC(currentMetrics),
                  cpl: calculateCPL(currentMetrics),
                  profit: calculateProfit(currentMetrics),
                  profitMargin: calculateProfitMargin(currentMetrics),
                  breakEven: calculateBreakEvenDifference(currentMetrics)
                } : undefined}
              />
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <MetricForecasting
                projectId={projectId}
                scenarioType="current"
              />
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <ScenarioSummary
                projectId={projectId}
                scenarioType="current"
                scenarioLabel="Текущая ситуация"
                metrics={currentMetrics.detailedExpenses ? {
                  revenue: currentMetrics.revenue,
                  profit: calculateProfit(currentMetrics),
                  profitMargin: calculateProfitMargin(currentMetrics),
                  cac: calculateCAC(currentMetrics),
                  breakEven: calculateBreakEvenDifference(currentMetrics)
                } : undefined}
              />
            </AnimatedCard>

            {scenarioA.detailedExpenses && (
              <AnimatedCard delay={0.4}>
                <ScenarioSummary
                  projectId={projectId}
                  scenarioType="scenarioA"
                  scenarioLabel="Сценарий А"
                  metrics={{
                    revenue: scenarioA.revenue,
                    profit: calculateProfit(scenarioA),
                    profitMargin: calculateProfitMargin(scenarioA),
                    cac: calculateCAC(scenarioA),
                    breakEven: calculateBreakEvenDifference(scenarioA)
                  }}
                />
              </AnimatedCard>
            )}

            {scenarioB.detailedExpenses && (
              <AnimatedCard delay={0.5}>
                <ScenarioSummary
                  projectId={projectId}
                  scenarioType="scenarioB"
                  scenarioLabel="Сценарий Б"
                  metrics={{
                    revenue: scenarioB.revenue,
                    profit: calculateProfit(scenarioB),
                    profitMargin: calculateProfitMargin(scenarioB),
                    cac: calculateCAC(scenarioB),
                    breakEven: calculateBreakEvenDifference(scenarioB)
                  }}
                />
              </AnimatedCard>
            )}

            <AnimatedCard delay={0.6}>
              <ActionPlanManager
                projectId={projectId}
                currentMetrics={currentMetrics.detailedExpenses ? {
                  profitMargin: calculateProfitMargin(currentMetrics),
                  cac: calculateCAC(currentMetrics),
                  breakEven: calculateBreakEvenDifference(currentMetrics)
                } : undefined}
              />
            </AnimatedCard>

            <AnimatedCard delay={0.7}>
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
                  id: c.id,
                  name: c.name,
                  revenue: c.revenue || 0,
                  marketShare: c.marketShare || 0,
                  quality: c.quality || 0,
                }))}
                products={products.map(p => ({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  cost: p.cost,
                  quantity: p.quantity,
                }))}
              />
            </AnimatedCard>
          </TabsContent>

          {/* GAME THEORY TAB */}
          <TabsContent value="game-theory" className="space-y-6">
            <AnimatedCard delay={0.1}>
              <GameTheoryMatrix />
            </AnimatedCard>

            <AnimatedCard delay={0.2}>
              <StrategyDictionary />
            </AnimatedCard>

            <AnimatedCard delay={0.3}>
              <CompetitiveSimulator
                myCompany={currentMetrics}
                competitors={competitors}
                currency={currency}
              />
            </AnimatedCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
