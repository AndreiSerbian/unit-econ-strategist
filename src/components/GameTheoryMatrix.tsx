import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info, TrendingUp, TrendingDown, Target, DollarSign, Package } from "lucide-react";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const GameTheoryMatrix = () => {
  // Classical Payoff Matrix
  const strategies = {
    ours: ["Снизить цену", "Сохранить цену", "Повысить качество"],
    competitors: ["Снизить цену", "Сохранить цену", "Повысить качество"],
  };

  const payoffMatrix = [
    [
      { us: 3, them: 3 },
      { us: 7, them: 1 },
      { us: 5, them: 4 },
    ],
    [
      { us: 1, them: 7 },
      { us: 5, them: 5 },
      { us: 4, them: 6 },
    ],
    [
      { us: 4, them: 5 },
      { us: 6, them: 4 },
      { us: 8, them: 8 },
    ],
  ];

  const findNashEquilibrium = () => {
    return { row: 1, col: 1 };
  };

  const nashEq = findNashEquilibrium();

  // Cournot Model (Quantity Competition)
  const [cournotQ1, setCournotQ1] = useState(50);
  const [cournotQ2, setCournotQ2] = useState(50);
  const [cournotMarketPrice, setCournotMarketPrice] = useState(100);
  const [cournotCost, setCournotCost] = useState(20);

  const calculateCournotEquilibrium = () => {
    // Simplified Cournot model: Q* = (a - c) / 3
    // Where a = market price intercept, c = marginal cost
    const qStar = (cournotMarketPrice - cournotCost) / 3;
    return qStar;
  };

  const calculateCournotProfit = (q1: number, q2: number) => {
    const totalQ = q1 + q2;
    const price = Math.max(0, cournotMarketPrice - totalQ);
    const profit1 = (price - cournotCost) * q1;
    const profit2 = (price - cournotCost) * q2;
    return { profit1, profit2, price, totalQ };
  };

  const cournotResult = calculateCournotProfit(cournotQ1, cournotQ2);
  const cournotEquilibrium = calculateCournotEquilibrium();

  // Generate Cournot reaction curves
  const cournotReactionData = Array.from({ length: 21 }, (_, i) => {
    const q2 = i * 5;
    const bestResponseQ1 = Math.max(0, (cournotMarketPrice - cournotCost - q2) / 2);
    const bestResponseQ2 = Math.max(0, (cournotMarketPrice - cournotCost - cournotQ1) / 2);
    return {
      q2,
      reactionQ1: bestResponseQ1,
      reactionQ2: bestResponseQ2,
      equilibrium: cournotEquilibrium,
    };
  });

  // Bertrand Model (Price Competition)
  const [bertrandP1, setBertrandP1] = useState(50);
  const [bertrandP2, setBertrandP2] = useState(50);
  const [bertrandMC, setBertrandMC] = useState(20);
  const [bertrandMarketDemand, setBertrandMarketDemand] = useState(1000);

  const calculateBertrandOutcome = (p1: number, p2: number) => {
    const mc = bertrandMC;
    
    if (p1 < mc || p2 < mc) {
      return { q1: 0, q2: 0, profit1: 0, profit2: 0, marketCaptured: "Цены ниже себестоимости" };
    }
    
    if (p1 < p2) {
      const q1 = bertrandMarketDemand;
      const profit1 = (p1 - mc) * q1;
      return { q1, q2: 0, profit1, profit2: 0, marketCaptured: "Фирма 1 захватывает весь рынок" };
    } else if (p2 < p1) {
      const q2 = bertrandMarketDemand;
      const profit2 = (p2 - mc) * q2;
      return { q1: 0, q2, profit1: 0, profit2, marketCaptured: "Фирма 2 захватывает весь рынок" };
    } else {
      const q1 = bertrandMarketDemand / 2;
      const q2 = bertrandMarketDemand / 2;
      const profit1 = (p1 - mc) * q1;
      const profit2 = (p2 - mc) * q2;
      return { q1, q2, profit1, profit2, marketCaptured: "Рынок делится поровну" };
    }
  };

  const bertrandResult = calculateBertrandOutcome(bertrandP1, bertrandP2);

  // Generate Bertrand price dynamics
  const bertrandPriceData = Array.from({ length: 20 }, (_, i) => {
    const p = bertrandMC + i * 5;
    const result1 = calculateBertrandOutcome(p, bertrandP2);
    const result2 = calculateBertrandOutcome(bertrandP1, p);
    return {
      price: p,
      profit1IfP1: result1.profit1,
      profit2IfP2: result2.profit2,
    };
  });

  return (
    <Tabs defaultValue="payoff" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="payoff">Матрица выплат</TabsTrigger>
        <TabsTrigger value="cournot">Модель Курно</TabsTrigger>
        <TabsTrigger value="bertrand">Модель Бертрана</TabsTrigger>
        <TabsTrigger value="concepts">Концепции</TabsTrigger>
      </TabsList>

      {/* Classical Payoff Matrix */}
      <TabsContent value="payoff" className="space-y-6">
        <Card className="bg-gradient-to-br from-info/5 to-primary/5">
          <CardHeader>
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-info mt-1" />
              <div>
                <CardTitle>Матрица выплат (Классическая теория игр)</CardTitle>
                <CardDescription className="mt-2">
                  Анализ стратегических взаимодействий. Первое число - ваша прибыль, второе - прибыль конкурента.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-border p-4 bg-muted/50"></th>
                    {strategies.competitors.map((strategy, idx) => (
                      <th key={idx} className="border border-border p-4 bg-secondary/10 font-semibold text-sm">
                        Конкурент: {strategy}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {strategies.ours.map((ourStrategy, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="border border-border p-4 bg-primary/10 font-semibold text-sm">
                        Вы: {ourStrategy}
                      </td>
                      {strategies.competitors.map((_, colIdx) => {
                        const payoff = payoffMatrix[rowIdx][colIdx];
                        const isNash = rowIdx === nashEq.row && colIdx === nashEq.col;
                        const isOptimal = payoff.us >= 7 && payoff.them >= 7;
                        
                        return (
                          <td
                            key={colIdx}
                            className={`border border-border p-4 text-center relative ${
                              isNash ? "bg-info/10" : isOptimal ? "bg-success/10" : ""
                            }`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="text-lg font-bold font-mono">
                                <span className="text-primary">{payoff.us}</span>
                                {" / "}
                                <span className="text-secondary">{payoff.them}</span>
                              </div>
                              {isNash && (
                                <Badge variant="outline" className="text-xs bg-info/20 border-info">
                                  Равновесие Нэша
                                </Badge>
                              )}
                              {isOptimal && (
                                <Badge variant="outline" className="text-xs bg-success/20 border-success">
                                  Оптимум Парето
                                </Badge>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-success" />
                Доминирующая стратегия
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Анализ показывает оптимальный выбор:
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="font-semibold text-success">Повышение качества</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Наилучший долгосрочный результат при взаимодействии с конкурентами
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                Риски
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Потенциальные угрозы:
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="font-semibold text-destructive">Ценовая война</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Взаимное снижение цен приводит к минимальной прибыли для обеих сторон
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Cournot Model */}
      <TabsContent value="cournot" className="space-y-6">
        <Card className="bg-gradient-to-br from-accent/5 to-primary/5">
          <CardHeader>
            <div className="flex items-start gap-2">
              <Package className="w-5 h-5 text-accent mt-1" />
              <div>
                <CardTitle>Модель Курно (Конкуренция по объёму)</CardTitle>
                <CardDescription className="mt-2">
                  Олигополия с конкуренцией по количеству производимой продукции. Фирмы одновременно выбирают объёмы выпуска.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cournot-q1">Объём фирмы 1 (Q₁)</Label>
                <Input
                  id="cournot-q1"
                  type="number"
                  min="0"
                  value={cournotQ1}
                  onChange={(e) => setCournotQ1(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cournot-q2">Объём фирмы 2 (Q₂)</Label>
                <Input
                  id="cournot-q2"
                  type="number"
                  min="0"
                  value={cournotQ2}
                  onChange={(e) => setCournotQ2(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cournot-price">Макс. цена рынка</Label>
                <Input
                  id="cournot-price"
                  type="number"
                  min="0"
                  value={cournotMarketPrice}
                  onChange={(e) => setCournotMarketPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cournot-cost">Предельные издержки</Label>
                <Input
                  id="cournot-cost"
                  type="number"
                  min="0"
                  value={cournotCost}
                  onChange={(e) => setCournotCost(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground mb-1">Рыночная цена</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {cournotResult.price.toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground mb-1">Прибыль фирмы 1</p>
                <p className="text-2xl font-bold font-mono text-success">
                  {cournotResult.profit1.toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground mb-1">Прибыль фирмы 2</p>
                <p className="text-2xl font-bold font-mono text-secondary">
                  {cournotResult.profit2.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-info/10 border border-info/20">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Равновесие Курно-Нэша
              </h4>
              <p className="text-sm text-muted-foreground">
                Оптимальный объём производства для каждой фирмы: <span className="font-mono font-bold text-info">{cournotEquilibrium.toFixed(2)}</span> единиц
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                При равновесии ни одна фирма не может увеличить прибыль, изменив только свой объём производства
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Кривые реакции фирм</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cournotReactionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="q2" label={{ value: 'Q₂ (Объём фирмы 2)', position: 'insideBottom', offset: -5 }} className="text-xs" />
                  <YAxis label={{ value: 'Q₁ (Объём фирмы 1)', angle: -90, position: 'insideLeft' }} className="text-xs" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Line type="monotone" dataKey="reactionQ1" name="Реакция фирмы 1" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="equilibrium" name="Равновесие" stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Кривая реакции показывает оптимальный выбор объёма одной фирмы в зависимости от выбора другой
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Bertrand Model */}
      <TabsContent value="bertrand" className="space-y-6">
        <Card className="bg-gradient-to-br from-secondary/5 to-primary/5">
          <CardHeader>
            <div className="flex items-start gap-2">
              <DollarSign className="w-5 h-5 text-secondary mt-1" />
              <div>
                <CardTitle>Модель Бертрана (Ценовая конкуренция)</CardTitle>
                <CardDescription className="mt-2">
                  Олигополия с конкуренцией по цене. Потребители покупают у фирмы с наименьшей ценой.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bertrand-p1">Цена фирмы 1 (P₁)</Label>
                <Input
                  id="bertrand-p1"
                  type="number"
                  min="0"
                  value={bertrandP1}
                  onChange={(e) => setBertrandP1(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bertrand-p2">Цена фирмы 2 (P₂)</Label>
                <Input
                  id="bertrand-p2"
                  type="number"
                  min="0"
                  value={bertrandP2}
                  onChange={(e) => setBertrandP2(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bertrand-mc">Предельные издержки</Label>
                <Input
                  id="bertrand-mc"
                  type="number"
                  min="0"
                  value={bertrandMC}
                  onChange={(e) => setBertrandMC(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bertrand-demand">Спрос рынка</Label>
                <Input
                  id="bertrand-demand"
                  type="number"
                  min="0"
                  value={bertrandMarketDemand}
                  onChange={(e) => setBertrandMarketDemand(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground mb-1">Прибыль фирмы 1</p>
                <p className="text-2xl font-bold font-mono text-success">
                  {bertrandResult.profit1.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Объём: {bertrandResult.q1.toFixed(0)} ед.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground mb-1">Прибыль фирмы 2</p>
                <p className="text-2xl font-bold font-mono text-secondary">
                  {bertrandResult.profit2.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Объём: {bertrandResult.q2.toFixed(0)} ед.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              bertrandP1 === bertrandP2 && bertrandP1 === bertrandMC 
                ? 'bg-info/10 border-info/20' 
                : 'bg-warning/10 border-warning/20'
            }`}>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Результат конкуренции
              </h4>
              <p className="text-sm font-semibold mb-1">{bertrandResult.marketCaptured}</p>
              <p className="text-xs text-muted-foreground">
                {bertrandP1 === bertrandP2 && bertrandP1 === bertrandMC 
                  ? "⚖️ Равновесие Бертрана достигнуто: обе фирмы устанавливают цену = предельным издержкам"
                  : "⚠️ Равновесие не достигнуто: фирмы могут увеличить прибыль изменением цены"
                }
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Зависимость прибыли от цены</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bertrandPriceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="price" label={{ value: 'Цена', position: 'insideBottom', offset: -5 }} className="text-xs" />
                  <YAxis label={{ value: 'Прибыль', angle: -90, position: 'insideLeft' }} className="text-xs" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Line type="monotone" dataKey="profit1IfP1" name="Прибыль фирмы 1" stroke="hsl(var(--success))" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit2IfP2" name="Прибыль фирмы 2" stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Парадокс Бертрана: ценовая конкуренция приводит к нулевой прибыли при цене = издержкам
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Concepts */}
      <TabsContent value="concepts">
        <Card>
          <CardHeader>
            <CardTitle>Ключевые концепции теории игр</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-info/20 border-info">Равновесие Нэша</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">
                Ситуация, в которой ни один игрок не может улучшить свой результат, изменив только свою стратегию.
                Применимо ко всем трём моделям: классическая матрица, Курно, Бертран.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-success/20 border-success">Оптимум Парето</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">
                Состояние, при котором невозможно улучшить положение одного игрока без ухудшения положения другого.
                Достигается при взаимном повышении качества в классической матрице.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-accent/20 border-accent">Модель Курно</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">
                Олигополия с конкуренцией по количеству. Фирмы одновременно выбирают объёмы производства.
                Равновесие: Q* = (a - c) / (n + 1), где n — число фирм, a — максимальная цена, c — издержки.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-secondary/20 border-secondary">Модель Бертрана</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">
                Олигополия с ценовой конкуренцией. Покупатели выбирают продавца с минимальной ценой.
                Парадокс Бертрана: даже при двух фирмах цена падает до предельных издержек (P = MC).
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-warning/20 border-warning">Доминирующая стратегия</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">
                Стратегия, которая даёт наилучший результат независимо от действий других игроков.
                Если она существует, она является оптимальным выбором.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
