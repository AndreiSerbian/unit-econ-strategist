import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  BarChart3, 
  Users, 
  Map, 
  TrendingUp, 
  Brain, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  Rocket
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

const steps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Добро пожаловать!",
    description: "Платформа для анализа юнит-экономики и конкурентной стратегии",
    icon: <Rocket className="w-12 h-12 text-primary" />,
    details: [
      "Рассчитывайте ключевые метрики бизнеса",
      "Сравнивайте сценарии развития",
      "Анализируйте конкурентов",
      "Применяйте теорию игр для стратегии"
    ]
  },
  {
    id: "products",
    title: "1. Продукты",
    description: "Начните с добавления ваших продуктов — это основа выручки",
    icon: <Package className="w-12 h-12 text-primary" />,
    details: [
      "Добавьте товары или услуги компании",
      "Укажите цену и себестоимость каждого продукта",
      "Задайте количество продаж",
      "Выручка рассчитается автоматически"
    ]
  },
  {
    id: "metrics",
    title: "2. Показатели компании",
    description: "Заполните метрики на основе данных о продуктах",
    icon: <BarChart3 className="w-12 h-12 text-primary" />,
    details: [
      "Синхронизируйте выручку из продуктов",
      "Добавьте расходы по категориям",
      "Создавайте сценарии A и B для сравнения",
      "Отслеживайте CAC, LTV, ROI и другие метрики"
    ]
  },
  {
    id: "competitors",
    title: "3. Конкуренты",
    description: "Добавьте информацию о конкурентах для сравнения",
    icon: <Users className="w-12 h-12 text-primary" />,
    details: [
      "Создайте профили конкурентов",
      "Укажите их продукты и цены",
      "Заполните показатели для сравнения",
      "Проведите SWOT-анализ"
    ]
  },
  {
    id: "market",
    title: "4. Рынок",
    description: "Оцените позицию компании на рынке",
    icon: <Map className="w-12 h-12 text-primary" />,
    details: [
      "Укажите размер и рост рынка",
      "Сравните доли рынка",
      "Визуализируйте конкурентную карту",
      "Определите лидеров отрасли"
    ]
  },
  {
    id: "analytics",
    title: "5. Аналитика",
    description: "Глубокий анализ и прогнозирование",
    icon: <TrendingUp className="w-12 h-12 text-primary" />,
    details: [
      "Отслеживайте историю метрик",
      "Прогнозируйте развитие бизнеса",
      "Создавайте планы действий",
      "Анализируйте чувствительность показателей"
    ]
  },
  {
    id: "theory",
    title: "6. Теория игр",
    description: "Стратегические модели конкуренции",
    icon: <Brain className="w-12 h-12 text-primary" />,
    details: [
      "Матрица теории игр",
      "Модели Курно и Бертрана",
      "Симулятор конкурентных сценариев",
      "Словарь конкурентных стратегий"
    ]
  }
];

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="text-center pb-2">
            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? "w-8 bg-primary" 
                      : index < currentStep 
                        ? "w-2 bg-primary/60" 
                        : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    {step.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl mb-2">{step.title}</CardTitle>
                    <CardDescription className="text-base sm:text-lg">
                      {step.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  {step.details.map((detail, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm sm:text-base">{detail}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Назад</span>
              </Button>

              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </span>

              <Button onClick={nextStep} className="gap-2">
                <span className="hidden sm:inline">
                  {currentStep === steps.length - 1 ? "Начать работу" : "Далее"}
                </span>
                <span className="sm:hidden">
                  {currentStep === steps.length - 1 ? "Начать" : "Далее"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {currentStep === 0 && (
              <div className="text-center mt-4">
                <Button variant="link" onClick={onComplete} className="text-muted-foreground">
                  Пропустить онбординг
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
