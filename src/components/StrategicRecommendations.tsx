import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Lightbulb, TrendingUp, Target, Download } from "lucide-react";

export const StrategicRecommendations = () => {
  const recommendations = [
    {
      priority: "Высокий",
      category: "Ценообразование",
      title: "Оптимизация ценовой стратегии",
      description: "Рекомендуется сохранить текущий уровень цен и сфокусироваться на повышении ценности предложения.",
      impact: "Увеличение прибыли на 15-20%",
      timeframe: "1-2 месяца",
      actions: [
        "Провести анализ ценовой эластичности спроса",
        "Разработать программу лояльности для удержания клиентов",
        "Создать премиальный сегмент продукции"
      ],
      type: "success"
    },
    {
      priority: "Высокий",
      category: "Качество",
      title: "Инвестиции в качество продукта",
      description: "Повышение качества - доминирующая стратегия с наилучшими долгосрочными результатами.",
      impact: "Рост доли рынка на 10-15%",
      timeframe: "3-6 месяцев",
      actions: [
        "Внедрить систему контроля качества",
        "Обучить персонал новым стандартам",
        "Получить сертификаты качества"
      ],
      type: "success"
    },
    {
      priority: "Средний",
      category: "Маркетинг",
      title: "Оптимизация маркетинговых расходов",
      description: "Необходимо пересмотреть структуру маркетинговых затрат для повышения ROI.",
      impact: "Снижение CAC на 25-30%",
      timeframe: "2-3 месяца",
      actions: [
        "Перераспределить бюджет в пользу эффективных каналов",
        "Внедрить аналитику и attribution-модели",
        "Автоматизировать маркетинговые процессы"
      ],
      type: "warning"
    },
    {
      priority: "Средний",
      category: "Операционная эффективность",
      title: "Снижение постоянных расходов",
      description: "Оптимизация ФОТ и других постоянных расходов без потери качества сервиса.",
      impact: "Экономия 500,000 - 1,000,000 ₽/мес",
      timeframe: "3-4 месяца",
      actions: [
        "Провести аудит всех постоянных расходов",
        "Автоматизировать рутинные процессы",
        "Оптимизировать структуру команды"
      ],
      type: "info"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Высокий":
        return "bg-destructive/20 text-destructive border-destructive";
      case "Средний":
        return "bg-warning/20 text-warning border-warning";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      default:
        return <Lightbulb className="w-5 h-5 text-info" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Стратегический план действий</CardTitle>
              <CardDescription className="mt-2">
                Персонализированные рекомендации на основе анализа ваших данных и конкурентной среды
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Экспорт
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">Потенциал роста</span>
              </div>
              <p className="text-2xl font-bold text-success font-mono">+35%</p>
              <p className="text-xs text-muted-foreground mt-1">при внедрении всех рекомендаций</p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Приоритетных задач</span>
              </div>
              <p className="text-2xl font-bold text-primary font-mono">4</p>
              <p className="text-xs text-muted-foreground mt-1">требуют немедленного внимания</p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Срок реализации</span>
              </div>
              <p className="text-2xl font-bold text-accent font-mono">3-6 мес</p>
              <p className="text-xs text-muted-foreground mt-1">средний период внедрения</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {recommendations.map((rec, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getTypeIcon(rec.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <CardDescription>{rec.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Категория</p>
                  <p className="font-semibold text-sm">{rec.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ожидаемый эффект</p>
                  <p className="font-semibold text-sm text-success">{rec.impact}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Срок реализации</p>
                  <p className="font-semibold text-sm">{rec.timeframe}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-3">План действий:</h4>
                <ul className="space-y-2">
                  {rec.actions.map((action, actionIdx) => (
                    <li key={actionIdx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full md:w-auto" variant="default">
                Начать внедрение
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            Дополнительные инсайты
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-info/10 rounded-lg border border-info/20">
            <h4 className="font-semibold text-sm mb-2">Конкурентное преимущество</h4>
            <p className="text-sm text-muted-foreground">
              Ваша текущая позиция на рынке позволяет избежать ценовых войн и сфокусироваться на 
              создании уникальной ценности для клиентов через повышение качества продукта и сервиса.
            </p>
          </div>
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <h4 className="font-semibold text-sm mb-2">Возможности роста</h4>
            <p className="text-sm text-muted-foreground">
              Анализ показывает потенциал увеличения доли рынка за счет улучшения customer experience 
              и развития программ лояльности. Это создаст барьеры для входа новых конкурентов.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
