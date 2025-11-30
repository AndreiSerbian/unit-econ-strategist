import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyMetrics } from "./CompanyMetrics";
import { CompetitorAnalysis } from "./CompetitorAnalysis";
import { GameTheoryMatrix } from "./GameTheoryMatrix";
import { StrategicRecommendations } from "./StrategicRecommendations";
import { MetricsCharts } from "./MetricsCharts";
import { CompetitorCharts } from "./CompetitorCharts";
import { ExportDialog } from "./ExportDialog";
import { AnimatedCard } from "./AnimatedCard";
import { ProductsManagement } from "./ProductsManagement";
import { ProductsCharts } from "./ProductsCharts";
import { ProductComparison } from "./ProductComparison";
import { CurrencySelector } from "./CurrencySelector";
import { ExpensesBreakdownCharts } from "./ExpensesBreakdownCharts";
import { KeyMetricsComparison } from "./KeyMetricsComparison";
import { ROICalculator } from "./ROICalculator";
import { CompetitorKeyMetricsComparison } from "./CompetitorKeyMetricsComparison";
import { CompetitorROICalculator } from "./CompetitorROICalculator";
import { CompetitiveScoreCalculator } from "./CompetitiveScoreCalculator";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
import { SWOTAnalysis } from "./SWOTAnalysis";
import { BarChart3, Users, Brain, Target, LogOut, LogIn, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProject";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    currentMetrics,
    setCurrentMetrics,
    scenarioA,
    setScenarioA,
    scenarioB,
    setScenarioB,
    competitors,
    setCompetitors,
    products,
    currency,
    saveScenario,
    saveCompetitor,
    deleteCompetitor,
    saveProduct,
    deleteProduct,
    updateCurrency,
    calculateProductsRevenue,
    calculateProductsCosts,
    syncProductsToMetrics,
    addCompetitorProduct,
    deleteCompetitorProduct,
    projectId,
  } = useProject(user?.id);

  const exportData = {
    scenarios: {
      current: currentMetrics,
      scenarioA,
      scenarioB,
    },
    competitors,
  };

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
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              Вход выполнен как {user.email}
            </p>
          )}
        </motion.header>

        <Tabs defaultValue="metrics" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="metrics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-sm">Показатели</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
              <Package className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-sm">Продукты</span>
            </TabsTrigger>
            <TabsTrigger value="competitors" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
              <Users className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-sm">Конкуренты</span>
            </TabsTrigger>
            <TabsTrigger value="game-theory" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
              <Brain className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-sm">Теория</span>
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-xs sm:text-sm">
              <Target className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-sm">Стратегия</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-6">
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
                  <CardTitle>Основные показатели бизнеса</CardTitle>
                  <CardDescription>
                    Внесите ключевые метрики вашей компании для расчета юнит-экономики
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
            
            {currentMetrics.detailedExpenses && (
              <AnimatedCard delay={0.6}>
                <SensitivityAnalysis
                  baseMetrics={currentMetrics}
                  currency={currency}
                />
              </AnimatedCard>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <AnimatedCard delay={0.1}>
              <ProductsManagement
                products={products}
                saveProduct={saveProduct}
                deleteProduct={deleteProduct}
                isAuthenticated={!!user}
                currency={currency}
              />
            </AnimatedCard>

            {products.length > 0 && (
              <AnimatedCard delay={0.2}>
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

          <TabsContent value="competitors" className="space-y-6">
            <AnimatedCard delay={0.1}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Анализ конкурентов</CardTitle>
                  <CardDescription>
                    Добавьте информацию о конкурентах для сравнительного анализа
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompetitorAnalysis
                    competitors={competitors}
                    saveCompetitor={saveCompetitor}
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
                <CompetitorCharts competitors={competitors} />
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
                    quality: 8,
                    marketingSpend: currentMetrics.marketingCosts,
                  }}
                  competitors={competitors}
                  currency={currency}
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

          <TabsContent value="game-theory" className="space-y-6">
            <AnimatedCard delay={0.1}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Матрица теории игр</CardTitle>
                  <CardDescription>
                    Анализ стратегических взаимодействий с конкурентами
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GameTheoryMatrix />
                </CardContent>
              </Card>
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6">
            <AnimatedCard delay={0.1}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Стратегические рекомендации</CardTitle>
                  <CardDescription>
                    Оптимальные стратегии на основе анализа данных
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StrategicRecommendations />
                </CardContent>
              </Card>
            </AnimatedCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
