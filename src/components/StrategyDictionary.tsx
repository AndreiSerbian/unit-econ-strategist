import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Zap, 
  Shield, 
  Users, 
  Layers,
  Award,
  BarChart3,
  Package
} from "lucide-react";

interface Strategy {
  id: string;
  name: string;
  icon: any;
  category: "offensive" | "defensive" | "cooperative" | "disruptive";
  description: string;
  whenToUse: string;
  risks: string;
  unitEconomicsImpact: {
    revenue: { direction: "increase" | "decrease" | "stable"; magnitude: "low" | "medium" | "high"; description: string };
    cac: { direction: "increase" | "decrease" | "stable"; magnitude: "low" | "medium" | "high"; description: string };
    ltv: { direction: "increase" | "decrease" | "stable"; magnitude: "low" | "medium" | "high"; description: string };
    margin: { direction: "increase" | "decrease" | "stable"; magnitude: "low" | "medium" | "high"; description: string };
  };
  examples: string[];
}

const strategies: Strategy[] = [
  {
    id: "price-war",
    name: "Ценовая война",
    icon: TrendingDown,
    category: "offensive",
    description: "Агрессивное снижение цен для захвата доли рынка и вытеснения конкурентов.",
    whenToUse: "Когда у вас есть существенные резервы и более низкие издержки, чем у конкурентов. Эффективно для вытеснения слабых игроков.",
    risks: "Падение маржинальности, возможная ценовая война со стороны конкурентов, снижение воспринимаемой ценности бренда.",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "high", description: "Рост объёма продаж за счёт низких цен" },
      cac: { direction: "decrease", magnitude: "medium", description: "Низкие цены привлекают клиентов с меньшими затратами" },
      ltv: { direction: "decrease", magnitude: "medium", description: "Клиенты привыкают к низким ценам, сложно повысить" },
      margin: { direction: "decrease", magnitude: "high", description: "Существенное падение рентабельности" },
    },
    examples: ["Xiaomi vs Samsung", "Ryanair vs традиционные авиакомпании", "Walmart vs локальные магазины"],
  },
  {
    id: "differentiation",
    name: "Дифференциация продукта",
    icon: Award,
    category: "offensive",
    description: "Создание уникальной ценности через качество, функции, бренд или сервис для снижения ценовой конкуренции.",
    whenToUse: "Когда можно создать реальную или воспринимаемую уникальность. Эффективно на зрелых рынках с информированными покупателями.",
    risks: "Высокие затраты на R&D и маркетинг, риск копирования конкурентами, возможность неприятия рынком.",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "medium", description: "Премиальные цены за уникальность" },
      cac: { direction: "increase", magnitude: "medium", description: "Требуется объяснять ценность дифференциации" },
      ltv: { direction: "increase", magnitude: "high", description: "Высокая лояльность и повторные покупки" },
      margin: { direction: "increase", magnitude: "high", description: "Премиум-цены при контролируемых издержках" },
    },
    examples: ["Apple в смартфонах", "Tesla в автомобилях", "Starbucks в кофе"],
  },
  {
    id: "market-penetration",
    name: "Проникновение на рынок",
    icon: Target,
    category: "offensive",
    description: "Интенсивное продвижение для быстрого захвата большой доли рынка, часто с временными убытками.",
    whenToUse: "При выходе на новый рынок или запуске нового продукта. Эффективно когда важен эффект сети или экономия на масштабе.",
    risks: "Большие первоначальные инвестиции, долгий период окупаемости, зависимость от внешнего финансирования.",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "high", description: "Быстрый рост за счёт агрессивной экспансии" },
      cac: { direction: "increase", magnitude: "high", description: "Массированные маркетинговые инвестиции" },
      ltv: { direction: "increase", magnitude: "medium", description: "Ранние клиенты становятся базой для роста" },
      margin: { direction: "decrease", magnitude: "high", description: "Отрицательная в начале, растёт со масштабом" },
    },
    examples: ["Uber при выходе на новые города", "Netflix в стриминге", "Amazon Prime"],
  },
  {
    id: "focus-niche",
    name: "Фокус на нишу",
    icon: Layers,
    category: "defensive",
    description: "Концентрация на узком сегменте рынка для доминирования при ограниченных ресурсах.",
    whenToUse: "Когда невозможно конкурировать на широком рынке. Эффективно для стартапов и малого бизнеса против крупных игроков.",
    risks: "Ограниченный потенциал роста, уязвимость к изменениям в нише, возможность входа крупных игроков.",
    unitEconomicsImpact: {
      revenue: { direction: "stable", magnitude: "low", description: "Ограничен размером ниши" },
      cac: { direction: "decrease", magnitude: "high", description: "Целевой маркетинг эффективнее массового" },
      ltv: { direction: "increase", magnitude: "high", description: "Высокая лояльность в узком сегменте" },
      margin: { direction: "increase", magnitude: "medium", description: "Премиум за специализацию" },
    },
    examples: ["Rolex в часах класса люкс", "Crossfit в фитнесе", "Trader Joe's в продуктах"],
  },
  {
    id: "cost-leadership",
    name: "Лидерство по издержкам",
    icon: TrendingDown,
    category: "offensive",
    description: "Достижение минимальных издержек в отрасли через масштаб, технологии и оптимизацию процессов.",
    whenToUse: "Когда можете достичь экономии на масштабе или имеете технологическое преимущество. Эффективно на price-sensitive рынках.",
    risks: "Гонка на дно по ценам, необходимость постоянных инвестиций в эффективность, уязвимость к технологическим прорывам.",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "medium", description: "Рост через volume при низких ценах" },
      cac: { direction: "decrease", magnitude: "low", description: "Цена как главный драйвер привлечения" },
      ltv: { direction: "stable", magnitude: "low", description: "Клиенты чувствительны к цене, низкая лояльность" },
      margin: { direction: "stable", magnitude: "medium", description: "Низкая наценка, но высокая операционная эффективность" },
    },
    examples: ["Costco в ритейле", "Southwest Airlines", "IKEA в мебели"],
  },
  {
    id: "quality-leadership",
    name: "Повышение качества",
    icon: TrendingUp,
    category: "offensive",
    description: "Инвестиции в качество продукта или сервиса для создания конкурентного преимущества и лояльности.",
    whenToUse: "На зрелых рынках где клиенты готовы платить за качество. Эффективно против низкоценовых конкурентов.",
    risks: "Высокие операционные издержки, долгий срок окупаемости, необходимость постоянного поддержания стандартов.",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "medium", description: "Премиальные цены за качество" },
      cac: { direction: "stable", magnitude: "medium", description: "Сарафанное радио снижает затраты" },
      ltv: { direction: "increase", magnitude: "high", description: "Высокая retention и повторные покупки" },
      margin: { direction: "increase", magnitude: "medium", description: "Премиум частично съедается издержками на качество" },
    },
    examples: ["Mercedes-Benz", "Four Seasons Hotels", "Patagonia в одежде"],
  },
  {
    id: "strategic-alliance",
    name: "Стратегический альянс",
    icon: Users,
    category: "cooperative",
    description: "Партнёрство с другими компаниями для совместного создания ценности и снижения конкуренции.",
    whenToUse: "Когда взаимная кооперация выгоднее конкуренции. Эффективно для выхода на новые рынки или технологического развития.",
    risks: "Конфликт интересов, утечка конфиденциальной информации, зависимость от партнёра, сложность управления.",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "medium", description: "Доступ к новым каналам и клиентам партнёра" },
      cac: { direction: "decrease", magnitude: "medium", description: "Совместный маркетинг и cross-selling" },
      ltv: { direction: "increase", magnitude: "medium", description: "Расширенная экосистема увеличивает ценность" },
      margin: { direction: "stable", magnitude: "low", description: "Revenue sharing снижает, но риски тоже ниже" },
    },
    examples: ["Spotify + Uber", "Apple + Nike", "Starbucks + Barnes & Noble"],
  },
  {
    id: "market-exit",
    name: "Защитная консолидация",
    icon: Shield,
    category: "defensive",
    description: "Укрепление позиций на текущем рынке, отказ от экспансии для защиты рентабельности.",
    whenToUse: "В условиях сильной конкуренции или ограниченных ресурсов. Когда экспансия несёт больше рисков, чем выгод.",
    risks: "Упущенные возможности роста, риск стагнации, уязвимость к рыночным изменениям.",
    unitEconomicsImpact: {
      revenue: { direction: "stable", magnitude: "low", description: "Фокус на удержании текущих клиентов" },
      cac: { direction: "decrease", magnitude: "high", description: "Минимальные затраты на привлечение" },
      ltv: { direction: "increase", magnitude: "medium", description: "Углубление работы с существующими клиентами" },
      margin: { direction: "increase", magnitude: "high", description: "Снижение expansion costs повышает прибыльность" },
    },
    examples: ["Kodak после цифровой революции", "BlackBerry фокус на enterprise", "Yahoo отказ от поисковых амбиций"],
  },
  {
    id: "innovation-disruption",
    name: "Подрывная инновация",
    icon: Zap,
    category: "disruptive",
    description: "Создание принципиально нового продукта или бизнес-модели, которая меняет правила игры в отрасли.",
    whenToUse: "Когда есть технологический прорыв или новая бизнес-модель. Эффективно против устоявшихся крупных игроков.",
    risks: "Огромные инвестиции, неопределённость принятия рынком, регуляторные барьеры, длительный период до прибыльности.",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "high", description: "Захват нового рынка или переформатирование старого" },
      cac: { direction: "increase", magnitude: "high", description: "Образование рынка требует больших затрат" },
      ltv: { direction: "increase", magnitude: "high", description: "Первопроходцы создают strong lock-in" },
      margin: { direction: "decrease", magnitude: "high", description: "Отрицательная на старте, экспоненциальный рост потом" },
    },
    examples: ["Netflix vs Blockbuster", "Airbnb vs отели", "Tesla vs традиционные автопроизводители"],
  },
  {
    id: "value-chain-integration",
    name: "Вертикальная интеграция",
    icon: Package,
    category: "offensive",
    description: "Контроль большей части цепочки создания стоимости через покупку поставщиков или дистрибуторов.",
    whenToUse: "Когда маржа поставщиков/дистрибуторов высока или качество их работы критично. Эффективно при стабильном спросе.",
    risks: "Огромные капитальные затраты, потеря гибкости, риск технологического устаревания активов, сложность управления.",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "medium", description: "Захват margin всей цепочки" },
      cac: { direction: "stable", magnitude: "low", description: "Контроль каналов сбыта может снизить" },
      ltv: { direction: "increase", magnitude: "medium", description: "Улучшение качества и customer experience" },
      margin: { direction: "increase", magnitude: "high", description: "Устранение посредников увеличивает margin" },
    },
    examples: ["Apple (дизайн + ритейл + сервисы)", "Zara (производство + ритейл)", "Tesla (производство + зарядная сеть)"],
  },
  {
    id: "freemium",
    name: "Freemium модель",
    icon: BarChart3,
    category: "offensive",
    description: "Бесплатная базовая версия для массового привлечения с монетизацией через премиум-функции.",
    whenToUse: "В digital продуктах с низкими предельными издержками и эффектом сети. Эффективно для быстрого роста user base.",
    risks: "Низкая конверсия в платящих (обычно 2-5%), сложность balance между free и premium, расходы на поддержку бесплатных пользователей.",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "medium", description: "Большая база × низкая конверсия" },
      cac: { direction: "decrease", magnitude: "high", description: "Virality и word-of-mouth снижают затраты" },
      ltv: { direction: "increase", magnitude: "high", description: "Постепенный upgrade path увеличивает lifetime" },
      margin: { direction: "stable", magnitude: "medium", description: "Зависит от conversion rate и ARPU premium users" },
    },
    examples: ["Spotify", "Dropbox", "LinkedIn"],
  },
];

const ImpactIndicator = ({ 
  direction, 
  magnitude 
}: { 
  direction: "increase" | "decrease" | "stable"; 
  magnitude: "low" | "medium" | "high" 
}) => {
  const getIcon = () => {
    if (direction === "increase") return <TrendingUp className="w-4 h-4" />;
    if (direction === "decrease") return <TrendingDown className="w-4 h-4" />;
    return <div className="w-4 h-4 flex items-center justify-center">→</div>;
  };

  const getColor = () => {
    if (direction === "stable") return "text-muted-foreground";
    return magnitude === "high" ? "text-primary font-bold" : magnitude === "medium" ? "text-secondary" : "text-muted-foreground";
  };

  const getLabel = () => {
    if (direction === "stable") return "Стабильно";
    const mag = magnitude === "high" ? "+++" : magnitude === "medium" ? "++" : "+";
    return direction === "increase" ? mag : `-${mag.replace(/\+/g, "")}`;
  };

  return (
    <div className={`flex items-center gap-1 ${getColor()}`}>
      {getIcon()}
      <span className="text-sm font-mono">{getLabel()}</span>
    </div>
  );
};

export const StrategyDictionary = () => {
  const categorizedStrategies = {
    offensive: strategies.filter(s => s.category === "offensive"),
    defensive: strategies.filter(s => s.category === "defensive"),
    cooperative: strategies.filter(s => s.category === "cooperative"),
    disruptive: strategies.filter(s => s.category === "disruptive"),
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          📚 Справочник конкурентных стратегий
        </CardTitle>
        <CardDescription>
          Библиотека стратегий с анализом влияния на юнит-экономику вашего бизнеса
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="offensive" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="offensive">Наступательные ({categorizedStrategies.offensive.length})</TabsTrigger>
            <TabsTrigger value="defensive">Защитные ({categorizedStrategies.defensive.length})</TabsTrigger>
            <TabsTrigger value="cooperative">Кооперативные ({categorizedStrategies.cooperative.length})</TabsTrigger>
            <TabsTrigger value="disruptive">Подрывные ({categorizedStrategies.disruptive.length})</TabsTrigger>
          </TabsList>

          {Object.entries(categorizedStrategies).map(([category, strategyList]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {strategyList.map((strategy) => {
                const Icon = strategy.icon;
                return (
                  <Card key={strategy.id} className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{strategy.name}</CardTitle>
                            <CardDescription className="mt-1">{strategy.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize whitespace-nowrap">
                          {category === "offensive" && "Наступательная"}
                          {category === "defensive" && "Защитная"}
                          {category === "cooperative" && "Кооперативная"}
                          {category === "disruptive" && "Подрывная"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-success" />
                            Когда использовать
                          </h4>
                          <p className="text-sm text-muted-foreground">{strategy.whenToUse}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-destructive" />
                            Риски
                          </h4>
                          <p className="text-sm text-muted-foreground">{strategy.risks}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-3">Влияние на юнит-экономику</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="p-3 rounded-lg bg-card border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-muted-foreground">Выручка</span>
                              <ImpactIndicator 
                                direction={strategy.unitEconomicsImpact.revenue.direction} 
                                magnitude={strategy.unitEconomicsImpact.revenue.magnitude} 
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{strategy.unitEconomicsImpact.revenue.description}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-card border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-muted-foreground">CAC</span>
                              <ImpactIndicator 
                                direction={strategy.unitEconomicsImpact.cac.direction} 
                                magnitude={strategy.unitEconomicsImpact.cac.magnitude} 
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{strategy.unitEconomicsImpact.cac.description}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-card border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-muted-foreground">LTV</span>
                              <ImpactIndicator 
                                direction={strategy.unitEconomicsImpact.ltv.direction} 
                                magnitude={strategy.unitEconomicsImpact.ltv.magnitude} 
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{strategy.unitEconomicsImpact.ltv.description}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-card border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-muted-foreground">Маржа</span>
                              <ImpactIndicator 
                                direction={strategy.unitEconomicsImpact.margin.direction} 
                                magnitude={strategy.unitEconomicsImpact.margin.magnitude} 
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{strategy.unitEconomicsImpact.margin.description}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Примеры из практики</h4>
                        <div className="flex flex-wrap gap-2">
                          {strategy.examples.map((example, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {example}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
