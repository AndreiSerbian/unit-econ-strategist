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
  Package,
} from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

type Direction = "increase" | "decrease" | "stable";
type Magnitude = "low" | "medium" | "high";

interface ImpactCell {
  direction: Direction;
  magnitude: Magnitude;
  description: string;
}

interface Strategy {
  id: string;
  icon: any;
  category: "offensive" | "defensive" | "cooperative" | "disruptive";
  unitEconomicsImpact: {
    revenue: ImpactCell;
    cac: ImpactCell;
    ltv: ImpactCell;
    margin: ImpactCell;
  };
  examples: string[];
}

// Localised name/desc/when/risks live in dictionary under `strategies.<id>.*`.
// Impact micro-descriptions remain in source (RU) for now — they fall back to RU
// only inside this expandable section; high-level UI labels are fully translated.
const strategies: Strategy[] = [
  {
    id: "price-war",
    icon: TrendingDown,
    category: "offensive",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "high", description: "Рост объёма продаж за счёт низких цен" },
      cac: { direction: "decrease", magnitude: "medium", description: "Низкие цены привлекают клиентов с меньшими затратами" },
      ltv: { direction: "decrease", magnitude: "medium", description: "Клиенты привыкают к низким ценам, сложно повысить" },
      margin: { direction: "decrease", magnitude: "high", description: "Существенное падение рентабельности" },
    },
    examples: ["Xiaomi vs Samsung", "Ryanair vs traditional airlines", "Walmart vs local stores"],
  },
  {
    id: "differentiation",
    icon: Award,
    category: "offensive",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "medium", description: "Премиальные цены за уникальность" },
      cac: { direction: "increase", magnitude: "medium", description: "Требуется объяснять ценность дифференциации" },
      ltv: { direction: "increase", magnitude: "high", description: "Высокая лояльность и повторные покупки" },
      margin: { direction: "increase", magnitude: "high", description: "Премиум-цены при контролируемых издержках" },
    },
    examples: ["Apple", "Tesla", "Starbucks"],
  },
  {
    id: "market-penetration",
    icon: Target,
    category: "offensive",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "high", description: "Быстрый рост за счёт агрессивной экспансии" },
      cac: { direction: "increase", magnitude: "high", description: "Массированные маркетинговые инвестиции" },
      ltv: { direction: "increase", magnitude: "medium", description: "Ранние клиенты становятся базой для роста" },
      margin: { direction: "decrease", magnitude: "high", description: "Отрицательная в начале, растёт со масштабом" },
    },
    examples: ["Uber", "Netflix", "Amazon Prime"],
  },
  {
    id: "focus-niche",
    icon: Layers,
    category: "defensive",
    unitEconomicsImpact: {
      revenue: { direction: "stable", magnitude: "low", description: "Ограничен размером ниши" },
      cac: { direction: "decrease", magnitude: "high", description: "Целевой маркетинг эффективнее массового" },
      ltv: { direction: "increase", magnitude: "high", description: "Высокая лояльность в узком сегменте" },
      margin: { direction: "increase", magnitude: "medium", description: "Премиум за специализацию" },
    },
    examples: ["Rolex", "Crossfit", "Trader Joe's"],
  },
  {
    id: "cost-leadership",
    icon: TrendingDown,
    category: "offensive",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "medium", description: "Рост через volume при низких ценах" },
      cac: { direction: "decrease", magnitude: "low", description: "Цена как главный драйвер привлечения" },
      ltv: { direction: "stable", magnitude: "low", description: "Клиенты чувствительны к цене, низкая лояльность" },
      margin: { direction: "stable", magnitude: "medium", description: "Низкая наценка, но высокая операционная эффективность" },
    },
    examples: ["Costco", "Southwest Airlines", "IKEA"],
  },
  {
    id: "quality-leadership",
    icon: TrendingUp,
    category: "offensive",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "medium", description: "Премиальные цены за качество" },
      cac: { direction: "stable", magnitude: "medium", description: "Сарафанное радио снижает затраты" },
      ltv: { direction: "increase", magnitude: "high", description: "Высокая retention и повторные покупки" },
      margin: { direction: "increase", magnitude: "medium", description: "Премиум частично съедается издержками на качество" },
    },
    examples: ["Mercedes-Benz", "Four Seasons", "Patagonia"],
  },
  {
    id: "strategic-alliance",
    icon: Users,
    category: "cooperative",
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
    icon: Shield,
    category: "defensive",
    unitEconomicsImpact: {
      revenue: { direction: "stable", magnitude: "low", description: "Фокус на удержании текущих клиентов" },
      cac: { direction: "decrease", magnitude: "high", description: "Минимальные затраты на привлечение" },
      ltv: { direction: "increase", magnitude: "medium", description: "Углубление работы с существующими клиентами" },
      margin: { direction: "increase", magnitude: "high", description: "Снижение expansion costs повышает прибыльность" },
    },
    examples: ["Kodak", "BlackBerry (enterprise)", "Yahoo"],
  },
  {
    id: "innovation-disruption",
    icon: Zap,
    category: "disruptive",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "high", description: "Захват нового рынка или переформатирование старого" },
      cac: { direction: "increase", magnitude: "high", description: "Образование рынка требует больших затрат" },
      ltv: { direction: "increase", magnitude: "high", description: "Первопроходцы создают strong lock-in" },
      margin: { direction: "decrease", magnitude: "high", description: "Отрицательная на старте, экспоненциальный рост потом" },
    },
    examples: ["Netflix vs Blockbuster", "Airbnb vs hotels", "Tesla"],
  },
  {
    id: "value-chain-integration",
    icon: Package,
    category: "offensive",
    unitEconomicsImpact: {
      revenue: { direction: "increase", magnitude: "medium", description: "Захват margin всей цепочки" },
      cac: { direction: "stable", magnitude: "low", description: "Контроль каналов сбыта может снизить" },
      ltv: { direction: "increase", magnitude: "medium", description: "Улучшение качества и customer experience" },
      margin: { direction: "increase", magnitude: "high", description: "Устранение посредников увеличивает margin" },
    },
    examples: ["Apple", "Zara", "Tesla"],
  },
  {
    id: "freemium",
    icon: BarChart3,
    category: "offensive",
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
  magnitude,
  stableLabel,
}: {
  direction: Direction;
  magnitude: Magnitude;
  stableLabel: string;
}) => {
  const getIcon = () => {
    if (direction === "increase") return <TrendingUp className="w-4 h-4" />;
    if (direction === "decrease") return <TrendingDown className="w-4 h-4" />;
    return <div className="w-4 h-4 flex items-center justify-center">→</div>;
  };

  const getColor = () => {
    if (direction === "stable") return "text-muted-foreground";
    return magnitude === "high"
      ? "text-primary font-bold"
      : magnitude === "medium"
      ? "text-secondary"
      : "text-muted-foreground";
  };

  const getLabel = () => {
    if (direction === "stable") return stableLabel;
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
  const { t } = useTranslation();

  const categoryBadge: Record<Strategy["category"], string> = {
    offensive: t("theory.catOffensiveBadge"),
    defensive: t("theory.catDefensiveBadge"),
    cooperative: t("theory.catCooperativeBadge"),
    disruptive: t("theory.catDisruptiveBadge"),
  };

  const categorizedStrategies = {
    offensive: strategies.filter((s) => s.category === "offensive"),
    defensive: strategies.filter((s) => s.category === "defensive"),
    cooperative: strategies.filter((s) => s.category === "cooperative"),
    disruptive: strategies.filter((s) => s.category === "disruptive"),
  };

  const stableLabel = t("theory.impactStable");

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          {t("theory.strategiesTitle")}
        </CardTitle>
        <CardDescription>{t("theory.strategiesDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="offensive" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="offensive">
              {t("theory.catOffensive")} ({categorizedStrategies.offensive.length})
            </TabsTrigger>
            <TabsTrigger value="defensive">
              {t("theory.catDefensive")} ({categorizedStrategies.defensive.length})
            </TabsTrigger>
            <TabsTrigger value="cooperative">
              {t("theory.catCooperative")} ({categorizedStrategies.cooperative.length})
            </TabsTrigger>
            <TabsTrigger value="disruptive">
              {t("theory.catDisruptive")} ({categorizedStrategies.disruptive.length})
            </TabsTrigger>
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
                            <CardTitle className="text-lg">{t(`strategies.${strategy.id}.name`)}</CardTitle>
                            <CardDescription className="mt-1">
                              {t(`strategies.${strategy.id}.desc`)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize whitespace-nowrap">
                          {categoryBadge[strategy.category]}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-success" />
                            {t("theory.whenToUse")}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {t(`strategies.${strategy.id}.when`)}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-destructive" />
                            {t("theory.risksTitle")}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {t(`strategies.${strategy.id}.risks`)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-3">{t("theory.impactTitle")}</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {(["revenue", "cac", "ltv", "margin"] as const).map((m) => {
                            const cell = strategy.unitEconomicsImpact[m];
                            const labelKey = `metric${m === "revenue" ? "Revenue" : m === "cac" ? "CAC" : m === "ltv" ? "LTV" : "Margin"}`;
                            return (
                              <div key={m} className="p-3 rounded-lg bg-card border">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-semibold text-muted-foreground">
                                    {t(`theory.${labelKey}`)}
                                  </span>
                                  <ImpactIndicator
                                    direction={cell.direction}
                                    magnitude={cell.magnitude}
                                    stableLabel={stableLabel}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground">{cell.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">{t("theory.examplesTitle")}</h4>
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
