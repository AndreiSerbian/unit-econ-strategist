import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyMetrics } from "./CompanyMetrics";
import { CompetitorAnalysis } from "./CompetitorAnalysis";
import { GameTheoryMatrix } from "./GameTheoryMatrix";
import { StrategicRecommendations } from "./StrategicRecommendations";
import { AnimatedCard } from "./AnimatedCard";
import { BarChart3, Users, Brain, Target } from "lucide-react";
import { motion } from "framer-motion";

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto py-8 px-4">
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            Стратегический Анализ
          </h1>
          <p className="text-muted-foreground text-lg">
            Платформа для анализа юнит-экономики и теории игр
          </p>
        </motion.header>

        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Показатели</span>
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
            <AnimatedCard delay={0.1}>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Основные показатели бизнеса</CardTitle>
                  <CardDescription>
                    Внесите ключевые метрики вашей компании для расчета юнит-экономики
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompanyMetrics />
                </CardContent>
              </Card>
            </AnimatedCard>
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
                  <CompetitorAnalysis />
                </CardContent>
              </Card>
            </AnimatedCard>
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
