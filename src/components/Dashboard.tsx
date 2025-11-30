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
      <div className="container mx-auto py-8 px-4">
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Стратегический Анализ
            </h1>
            <div className="flex items-center gap-2">
              <ExportDialog data={exportData} />
              {user ? (
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Выход
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Вход
                </Button>
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Платформа для анализа юнит-экономики и теории игр
          </p>
          {user && (
            <p className="text-sm text-muted-foreground mt-2">
              Вход выполнен как {user.email}
            </p>
          )}
        </motion.header>

        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Показатели</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Продукты</span>
            </TabsTrigger>
            <TabsTrigger value="competitors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Конкуренты</span>
            </TabsTrigger>
            <TabsTrigger value="game-theory" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Теория игр</span>
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Стратегия</span>
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
                  />
                </CardContent>
              </Card>
            </AnimatedCard>

            {competitors.length > 0 && (
              <AnimatedCard delay={0.2}>
                <CompetitorCharts competitors={competitors} />
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
