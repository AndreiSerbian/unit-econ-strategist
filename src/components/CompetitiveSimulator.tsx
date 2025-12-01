import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { Metrics, Competitor } from "@/hooks/useProject";
import { calculateProfit, calculateProfitMargin, calculateCAC } from "@/utils/metricsCalculations";
import { AlertCircle, TrendingUp, TrendingDown, Minus, CheckCircle, Zap } from "lucide-react";

interface CompetitiveSimulatorProps {
  myCompany: Metrics;
  competitors: Competitor[];
  currency: string;
}

interface SimulationRound {
  round: number;
  myProfit: number;
  myMargin: number;
  myPrice: number;
  myMarketShare: number;
  competitorAvgProfit: number;
  competitorAvgMargin: number;
  competitorAvgPrice: number;
}

interface Strategy {
  type: 'cooperate' | 'defect';
  label: string;
  description: string;
}

const STRATEGIES: Strategy[] = [
  { type: 'cooperate', label: 'Сотрудничество', description: 'Держать цены стабильными' },
  { type: 'defect', label: 'Предательство', description: 'Снизить цены агрессивно' },
];

export const CompetitiveSimulator = ({ myCompany, competitors, currency }: CompetitiveSimulatorProps) => {
  // Price War State
  const [priceReduction, setPriceReduction] = useState(10);
  const [marketingIncrease, setMarketingIncrease] = useState(15);
  const [rounds, setRounds] = useState(5);
  const [priceWarResults, setPriceWarResults] = useState<SimulationRound[]>([]);

  // Cooperation State
  const [cooperationBonus, setCooperationBonus] = useState(8);
  const [cooperationResults, setCooperationResults] = useState<any>(null);

  // Tit-for-Tat State
  const [titForTatHistory, setTitForTatHistory] = useState<Array<{
    round: number;
    myAction: 'cooperate' | 'defect';
    competitorAction: 'cooperate' | 'defect';
    myProfit: number;
    competitorProfit: number;
  }>>([]);
  const [competitorStrategy, setCompetitorStrategy] = useState<'tit-for-tat' | 'always-defect' | 'always-cooperate'>('tit-for-tat');

  const baseProfit = calculateProfit(myCompany);
  const baseMargin = calculateProfitMargin(myCompany);
  const basePrice = myCompany.avgCheck || 0;
  const baseMarketingCost = myCompany.marketingCosts || 0;

  const runPriceWar = () => {
    const results: SimulationRound[] = [];
    let currentPrice = basePrice;
    let currentMarketing = baseMarketingCost;
    let currentMarketShare = 100 / (competitors.length + 1);

    for (let i = 1; i <= rounds; i++) {
      // Apply price reduction and marketing increase
      currentPrice = currentPrice * (1 - priceReduction / 100);
      currentMarketing = currentMarketing * (1 + marketingIncrease / 100);
      
      // Market share increases with lower prices and more marketing
      const marketShareGain = (priceReduction / 10) * 0.5 + (marketingIncrease / 10) * 0.3;
      currentMarketShare = Math.min(currentMarketShare * (1 + marketShareGain / 100), 40);

      // Calculate new metrics
      const newRevenue = (myCompany.revenue || 0) * (1 + marketShareGain / 100);
      const newProfit = newRevenue - (myCompany.fixedCosts || 0) - currentMarketing - (myCompany.variableCosts || 0);
      const newMargin = (newProfit / newRevenue) * 100;

      // Competitors react by also reducing prices (lag by 1 round)
      const competitorPriceReduction = i > 1 ? priceReduction * 0.7 : 0;
      const competitorProfit = baseProfit * (1 - competitorPriceReduction / 100) * (1 - marketShareGain / 200);
      const competitorMargin = baseMargin * (1 - competitorPriceReduction / 100);

      results.push({
        round: i,
        myProfit: newProfit,
        myMargin: newMargin,
        myPrice: currentPrice,
        myMarketShare: currentMarketShare,
        competitorAvgProfit: competitorProfit,
        competitorAvgMargin: competitorMargin,
        competitorAvgPrice: basePrice * (1 - competitorPriceReduction / 100),
      });
    }

    setPriceWarResults(results);
  };

  const runCooperation = () => {
    // Cooperation scenario: stable prices, shared marketing insights
    const revenueBoost = cooperationBonus / 100;
    const costReduction = cooperationBonus / 150; // Sharing resources reduces costs

    const newRevenue = (myCompany.revenue || 0) * (1 + revenueBoost);
    const newCosts = ((myCompany.fixedCosts || 0) + (myCompany.marketingCosts || 0) + (myCompany.variableCosts || 0)) * (1 - costReduction);
    const newProfit = newRevenue - newCosts;
    const newMargin = (newProfit / newRevenue) * 100;

    // Competitors also benefit
    const competitorRevenue = (myCompany.revenue || 0) * 0.9 * (1 + revenueBoost);
    const competitorCosts = newCosts * 0.85;
    const competitorProfit = competitorRevenue - competitorCosts;
    const competitorMargin = (competitorProfit / competitorRevenue) * 100;

    setCooperationResults({
      before: {
        myProfit: baseProfit,
        myMargin: baseMargin,
        myRevenue: myCompany.revenue || 0,
        competitorProfit: baseProfit * 0.9,
        competitorMargin: baseMargin,
      },
      after: {
        myProfit: newProfit,
        myMargin: newMargin,
        myRevenue: newRevenue,
        competitorProfit: competitorProfit,
        competitorMargin: competitorMargin,
      },
      improvements: {
        myProfitChange: ((newProfit - baseProfit) / baseProfit) * 100,
        myMarginChange: newMargin - baseMargin,
        competitorProfitChange: ((competitorProfit - baseProfit * 0.9) / (baseProfit * 0.9)) * 100,
      }
    });
  };

  const playTitForTatRound = (myAction: 'cooperate' | 'defect') => {
    const lastRound = titForTatHistory[titForTatHistory.length - 1];
    
    let competitorAction: 'cooperate' | 'defect';
    
    if (competitorStrategy === 'always-cooperate') {
      competitorAction = 'cooperate';
    } else if (competitorStrategy === 'always-defect') {
      competitorAction = 'defect';
    } else {
      // Tit-for-Tat: copy opponent's last move
      competitorAction = lastRound ? lastRound.myAction : 'cooperate';
    }

    // Payoff matrix
    const payoffs = {
      'cooperate-cooperate': { me: baseProfit * 1.05, competitor: baseProfit * 1.05 },
      'cooperate-defect': { me: baseProfit * 0.7, competitor: baseProfit * 1.2 },
      'defect-cooperate': { me: baseProfit * 1.2, competitor: baseProfit * 0.7 },
      'defect-defect': { me: baseProfit * 0.85, competitor: baseProfit * 0.85 },
    };

    const key = `${myAction}-${competitorAction}` as keyof typeof payoffs;
    const result = payoffs[key];

    setTitForTatHistory([
      ...titForTatHistory,
      {
        round: titForTatHistory.length + 1,
        myAction,
        competitorAction,
        myProfit: result.me,
        competitorProfit: result.competitor,
      }
    ]);
  };

  const resetTitForTat = () => {
    setTitForTatHistory([]);
  };

  const generateRecommendations = () => {
    const recommendations = [];

    // Analyze current position
    const myMarketShare = 100 / (competitors.length + 1);
    const avgCompetitorRevenue = competitors.reduce((sum, c) => sum + (c.revenue || 0), 0) / competitors.length;
    const myRevenue = myCompany.revenue || 0;
    const isMarketLeader = myRevenue > avgCompetitorRevenue;

    if (baseMargin < 15) {
      recommendations.push({
        type: 'warning',
        title: 'Низкая маржинальность',
        description: 'Ваша маржа ниже 15%. Избегайте ценовых войн - они могут привести к убыткам.',
        strategy: 'Сфокусируйтесь на дифференциации продукта и повышении воспринимаемой ценности.'
      });
    }

    if (isMarketLeader) {
      recommendations.push({
        type: 'success',
        title: 'Лидер рынка',
        description: 'Вы опережаете конкурентов по выручке.',
        strategy: 'Кооперация выгодна - вы можете задавать правила игры. Рассмотрите стратегию "живи и дай жить другим".'
      });
    } else {
      recommendations.push({
        type: 'info',
        title: 'Догоняющая позиция',
        description: 'Ваша выручка ниже среднего конкурента.',
        strategy: 'Рассмотрите агрессивную стратегию захвата доли рынка, но следите за точкой безубыточности.'
      });
    }

    if (myMarketShare < 20 && competitors.length > 2) {
      recommendations.push({
        type: 'info',
        title: 'Фрагментированный рынок',
        description: 'Рынок разделён между многими игроками.',
        strategy: 'Рекомендуем стратегию Tit-for-Tat: отвечайте на действия конкурентов симметрично, но начинайте с кооперации.'
      });
    }

    const cac = calculateCAC(myCompany);
    const ltv = (myCompany.customerLifetimeMonths || 12) * (myCompany.purchaseFrequency || 1) * (myCompany.avgCheck || 0);
    const ltvCacRatio = ltv / cac;

    if (ltvCacRatio < 3) {
      recommendations.push({
        type: 'warning',
        title: 'Низкий LTV/CAC',
        description: `Ваш показатель LTV/CAC = ${ltvCacRatio.toFixed(1)} (норма > 3).`,
        strategy: 'Ценовая война противопоказана. Инвестируйте в удержание клиентов и повышение LTV.'
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  // Compare all scenarios
  const scenarioComparison = [
    {
      name: 'Текущее состояние',
      profit: baseProfit,
      margin: baseMargin,
      risk: 'Низкий',
      recommendation: 'Базовая линия для сравнения'
    },
    {
      name: 'Ценовая война (5 раундов)',
      profit: priceWarResults.length > 0 ? priceWarResults[priceWarResults.length - 1].myProfit : 0,
      margin: priceWarResults.length > 0 ? priceWarResults[priceWarResults.length - 1].myMargin : 0,
      risk: 'Высокий',
      recommendation: priceWarResults.length > 0 && priceWarResults[priceWarResults.length - 1].myProfit < baseProfit 
        ? 'Убыточно - не рекомендуется' 
        : 'Возможно при высокой марже'
    },
    {
      name: 'Кооперация',
      profit: cooperationResults?.after.myProfit || 0,
      margin: cooperationResults?.after.myMargin || 0,
      risk: 'Средний',
      recommendation: cooperationResults && cooperationResults.after.myProfit > baseProfit
        ? 'Выгодно для всех участников'
        : 'Запустите симуляцию'
    },
    {
      name: 'Tit-for-Tat',
      profit: titForTatHistory.length > 0 
        ? titForTatHistory.reduce((sum, r) => sum + r.myProfit, 0) / titForTatHistory.length
        : 0,
      margin: baseMargin,
      risk: 'Низкий',
      recommendation: titForTatHistory.length > 0
        ? 'Адаптивная стратегия'
        : 'Запустите симуляцию'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Automatic Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Автоматические рекомендации
          </CardTitle>
          <CardDescription>
            Анализ вашей текущей позиции и рекомендуемые стратегии
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div key={idx} className={`p-4 rounded-lg border ${
              rec.type === 'warning' ? 'bg-destructive/10 border-destructive/20' :
              rec.type === 'success' ? 'bg-green-500/10 border-green-500/20' :
              'bg-blue-500/10 border-blue-500/20'
            }`}>
              <div className="flex items-start gap-3">
                {rec.type === 'warning' && <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />}
                {rec.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                {rec.type === 'info' && <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />}
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                  <p className="text-sm font-medium">{rec.strategy}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="price-war" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="price-war">Ценовая война</TabsTrigger>
          <TabsTrigger value="cooperation">Кооперация</TabsTrigger>
          <TabsTrigger value="tit-for-tat">Tit-for-Tat</TabsTrigger>
          <TabsTrigger value="comparison">Сравнение</TabsTrigger>
        </TabsList>

        {/* Price War Tab */}
        <TabsContent value="price-war" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Симуляция ценовой войны</CardTitle>
              <CardDescription>
                Многораундовая симуляция ценовой конкуренции с реакцией конкурентов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Снижение цены (%)</Label>
                  <Slider
                    value={[priceReduction]}
                    onValueChange={(v) => setPriceReduction(v[0])}
                    min={5}
                    max={50}
                    step={5}
                  />
                  <p className="text-sm text-muted-foreground">{priceReduction}%</p>
                </div>

                <div className="space-y-2">
                  <Label>Рост маркетинга (%)</Label>
                  <Slider
                    value={[marketingIncrease]}
                    onValueChange={(v) => setMarketingIncrease(v[0])}
                    min={0}
                    max={50}
                    step={5}
                  />
                  <p className="text-sm text-muted-foreground">{marketingIncrease}%</p>
                </div>

                <div className="space-y-2">
                  <Label>Количество раундов</Label>
                  <Input
                    type="number"
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value) || 5)}
                    min={3}
                    max={12}
                  />
                </div>
              </div>

              <Button onClick={runPriceWar} className="w-full">
                Запустить симуляцию
              </Button>

              {priceWarResults.length > 0 && (
                <>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Динамика прибыли</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={priceWarResults}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" label={{ value: 'Раунд', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: `Прибыль (${currency})`, angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="myProfit" stroke="hsl(var(--primary))" name="Моя прибыль" strokeWidth={2} />
                        <Line type="monotone" dataKey="competitorAvgProfit" stroke="hsl(var(--destructive))" name="Конкуренты" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Динамика маржи</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={priceWarResults}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" label={{ value: 'Раунд', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'Маржа (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="myMargin" stroke="hsl(var(--primary))" name="Моя маржа" strokeWidth={2} />
                        <Line type="monotone" dataKey="competitorAvgMargin" stroke="hsl(var(--destructive))" name="Конкуренты" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Финальная прибыль</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {priceWarResults[priceWarResults.length - 1].myProfit.toLocaleString()} {currency}
                        </p>
                        <p className={`text-sm ${priceWarResults[priceWarResults.length - 1].myProfit < baseProfit ? 'text-destructive' : 'text-green-500'}`}>
                          {priceWarResults[priceWarResults.length - 1].myProfit < baseProfit ? '↓' : '↑'} 
                          {' '}{Math.abs(((priceWarResults[priceWarResults.length - 1].myProfit - baseProfit) / baseProfit * 100)).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Финальная маржа</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {priceWarResults[priceWarResults.length - 1].myMargin.toFixed(1)}%
                        </p>
                        <p className={`text-sm ${priceWarResults[priceWarResults.length - 1].myMargin < baseMargin ? 'text-destructive' : 'text-green-500'}`}>
                          {priceWarResults[priceWarResults.length - 1].myMargin < baseMargin ? '↓' : '↑'}
                          {' '}{Math.abs(priceWarResults[priceWarResults.length - 1].myMargin - baseMargin).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Финальная цена</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {priceWarResults[priceWarResults.length - 1].myPrice.toLocaleString()} {currency}
                        </p>
                        <p className="text-sm text-destructive">
                          ↓ {((1 - priceWarResults[priceWarResults.length - 1].myPrice / basePrice) * 100).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Доля рынка</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {priceWarResults[priceWarResults.length - 1].myMarketShare.toFixed(1)}%
                        </p>
                        <p className="text-sm text-green-500">
                          ↑ {(priceWarResults[priceWarResults.length - 1].myMarketShare - 100 / (competitors.length + 1)).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cooperation Tab */}
        <TabsContent value="cooperation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Симуляция кооперации</CardTitle>
              <CardDescription>
                Моделирование взаимной выгоды при совместных действиях
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Бонус от кооперации (%)</Label>
                <Slider
                  value={[cooperationBonus]}
                  onValueChange={(v) => setCooperationBonus(v[0])}
                  min={5}
                  max={25}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">
                  {cooperationBonus}% - совместный рост выручки за счёт рыночных синергий
                </p>
              </div>

              <Button onClick={runCooperation} className="w-full">
                Рассчитать эффект кооперации
              </Button>

              {cooperationResults && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">До кооперации</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Моя прибыль:</span>
                          <span className="font-semibold">{cooperationResults.before.myProfit.toLocaleString()} {currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Моя маржа:</span>
                          <span className="font-semibold">{cooperationResults.before.myMargin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Прибыль конкурента:</span>
                          <span className="font-semibold">{cooperationResults.before.competitorProfit.toLocaleString()} {currency}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">После кооперации</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Моя прибыль:</span>
                          <span className="font-semibold text-green-500">
                            {cooperationResults.after.myProfit.toLocaleString()} {currency}
                            <span className="text-xs ml-1">
                              (+{cooperationResults.improvements.myProfitChange.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Моя маржа:</span>
                          <span className="font-semibold text-green-500">
                            {cooperationResults.after.myMargin.toFixed(1)}%
                            <span className="text-xs ml-1">
                              (+{cooperationResults.improvements.myMarginChange.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Прибыль конкурента:</span>
                          <span className="font-semibold text-green-500">
                            {cooperationResults.after.competitorProfit.toLocaleString()} {currency}
                            <span className="text-xs ml-1">
                              (+{cooperationResults.improvements.competitorProfitChange.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Взаимная выгода
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Кооперация увеличивает прибыль обеих сторон. Это win-win стратегия, 
                      особенно эффективная на стабильных рынках с высокими барьерами входа.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tit-for-Tat Tab */}
        <TabsContent value="tit-for-tat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Стратегия Tit-for-Tat</CardTitle>
              <CardDescription>
                Пошаговая симуляция с выбором действий и реакцией конкурента
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Стратегия конкурента</Label>
                <div className="flex gap-2">
                  <Button
                    variant={competitorStrategy === 'tit-for-tat' ? 'default' : 'outline'}
                    onClick={() => setCompetitorStrategy('tit-for-tat')}
                    className="flex-1"
                  >
                    Tit-for-Tat
                  </Button>
                  <Button
                    variant={competitorStrategy === 'always-cooperate' ? 'default' : 'outline'}
                    onClick={() => setCompetitorStrategy('always-cooperate')}
                    className="flex-1"
                  >
                    Всегда кооперация
                  </Button>
                  <Button
                    variant={competitorStrategy === 'always-defect' ? 'default' : 'outline'}
                    onClick={() => setCompetitorStrategy('always-defect')}
                    className="flex-1"
                  >
                    Всегда агрессия
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => playTitForTatRound('cooperate')}
                  variant="outline"
                  className="h-24 border-green-500/50 hover:bg-green-500/10"
                >
                  <div className="text-center">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="font-semibold">Кооперация</div>
                    <div className="text-xs text-muted-foreground">Держать цены стабильными</div>
                  </div>
                </Button>

                <Button
                  onClick={() => playTitForTatRound('defect')}
                  variant="outline"
                  className="h-24 border-destructive/50 hover:bg-destructive/10"
                >
                  <div className="text-center">
                    <TrendingDown className="h-6 w-6 mx-auto mb-2 text-destructive" />
                    <div className="font-semibold">Агрессия</div>
                    <div className="text-xs text-muted-foreground">Снизить цены</div>
                  </div>
                </Button>
              </div>

              {titForTatHistory.length > 0 && (
                <>
                  <Button onClick={resetTitForTat} variant="outline" className="w-full">
                    Сбросить симуляцию
                  </Button>

                  <div className="space-y-4">
                    <h4 className="font-semibold">История раундов</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {titForTatHistory.map((round) => (
                        <div key={round.round} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Раунд {round.round}</span>
                            <div className="flex gap-4 text-sm">
                              <span>
                                Вы: <Badge variant={round.myAction === 'cooperate' ? 'default' : 'destructive'}>
                                  {round.myAction === 'cooperate' ? 'Кооперация' : 'Агрессия'}
                                </Badge>
                              </span>
                              <span>
                                Конкурент: <Badge variant={round.competitorAction === 'cooperate' ? 'default' : 'destructive'}>
                                  {round.competitorAction === 'cooperate' ? 'Кооперация' : 'Агрессия'}
                                </Badge>
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Ваша прибыль: {round.myProfit.toLocaleString()} {currency}</span>
                            <span>Прибыль конкурента: {round.competitorProfit.toLocaleString()} {currency}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Средняя прибыль</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {(titForTatHistory.reduce((sum, r) => sum + r.myProfit, 0) / titForTatHistory.length).toLocaleString()} {currency}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Всего раундов</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{titForTatHistory.length}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={titForTatHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" label={{ value: 'Раунд', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: `Прибыль (${currency})`, angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="myProfit" stroke="hsl(var(--primary))" name="Моя прибыль" strokeWidth={2} />
                        <Line type="monotone" dataKey="competitorProfit" stroke="hsl(var(--destructive))" name="Конкурент" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Сравнение всех сценариев</CardTitle>
              <CardDescription>
                Анализ эффективности различных конкурентных стратегий
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Сценарий</th>
                      <th className="text-right p-2">Прибыль ({currency})</th>
                      <th className="text-right p-2">Маржа (%)</th>
                      <th className="text-center p-2">Риск</th>
                      <th className="text-left p-2">Рекомендация</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarioComparison.map((scenario, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2 font-medium">{scenario.name}</td>
                        <td className="text-right p-2">
                          {scenario.profit > 0 ? scenario.profit.toLocaleString() : '-'}
                        </td>
                        <td className="text-right p-2">
                          {scenario.margin > 0 ? scenario.margin.toFixed(1) : '-'}
                        </td>
                        <td className="text-center p-2">
                          <Badge variant={
                            scenario.risk === 'Низкий' ? 'default' :
                            scenario.risk === 'Средний' ? 'secondary' :
                            'destructive'
                          }>
                            {scenario.risk}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">
                          {scenario.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Сравнение прибыли по сценариям</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioComparison.filter(s => s.profit > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                    <YAxis label={{ value: `Прибыль (${currency})`, angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="profit" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Итоговые рекомендации</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Высокая маржа (&gt;20%):</strong> Можно рассматривать агрессивные стратегии</li>
                  <li>• <strong>Средняя маржа (10-20%):</strong> Рекомендуется адаптивная стратегия Tit-for-Tat</li>
                  <li>• <strong>Низкая маржа (&lt;10%):</strong> Приоритет - кооперация и дифференциация</li>
                  <li>• <strong>Фрагментированный рынок:</strong> Кооперация может быть выгодна всем игрокам</li>
                  <li>• <strong>Концентрированный рынок:</strong> Ценовая война приведёт к общим потерям</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
