import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info, TrendingUp, TrendingDown, Target, DollarSign, Package } from "lucide-react";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "@/i18n/useTranslation";

export const GameTheoryMatrix = () => {
  const { t } = useTranslation();

  // Strategy labels via i18n
  const stratLabels = [
    t("theory.actionLowerPrice"),
    t("theory.actionKeepPrice"),
    t("theory.actionRaiseQuality"),
  ];

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

  const nashEq = { row: 1, col: 1 };

  // Cournot Model
  const [cournotQ1, setCournotQ1] = useState(50);
  const [cournotQ2, setCournotQ2] = useState(50);
  const [cournotMarketPrice, setCournotMarketPrice] = useState(100);
  const [cournotCost, setCournotCost] = useState(20);

  const calculateCournotEquilibrium = () =>
    (cournotMarketPrice - cournotCost) / 3;

  const calculateCournotProfit = (q1: number, q2: number) => {
    const totalQ = q1 + q2;
    const price = Math.max(0, cournotMarketPrice - totalQ);
    const profit1 = (price - cournotCost) * q1;
    const profit2 = (price - cournotCost) * q2;
    return { profit1, profit2, price, totalQ };
  };

  const cournotResult = calculateCournotProfit(cournotQ1, cournotQ2);
  const cournotEquilibrium = calculateCournotEquilibrium();

  const cournotReactionData = Array.from({ length: 21 }, (_, i) => {
    const q2 = i * 5;
    const bestResponseQ1 = Math.max(0, (cournotMarketPrice - cournotCost - q2) / 2);
    return {
      q2,
      reactionQ1: bestResponseQ1,
      equilibrium: cournotEquilibrium,
    };
  });

  // Bertrand Model
  const [bertrandP1, setBertrandP1] = useState(50);
  const [bertrandP2, setBertrandP2] = useState(50);
  const [bertrandMC, setBertrandMC] = useState(20);
  const [bertrandMarketDemand, setBertrandMarketDemand] = useState(1000);

  const calculateBertrandOutcome = (p1: number, p2: number) => {
    const mc = bertrandMC;
    if (p1 < mc || p2 < mc) {
      return { q1: 0, q2: 0, profit1: 0, profit2: 0, marketCaptured: t("theory.bertrandBelowCost") };
    }
    if (p1 < p2) {
      const q1 = bertrandMarketDemand;
      const profit1 = (p1 - mc) * q1;
      return { q1, q2: 0, profit1, profit2: 0, marketCaptured: t("theory.bertrandFirm1Wins") };
    } else if (p2 < p1) {
      const q2 = bertrandMarketDemand;
      const profit2 = (p2 - mc) * q2;
      return { q1: 0, q2, profit1: 0, profit2, marketCaptured: t("theory.bertrandFirm2Wins") };
    } else {
      const q1 = bertrandMarketDemand / 2;
      const q2 = bertrandMarketDemand / 2;
      const profit1 = (p1 - mc) * q1;
      const profit2 = (p2 - mc) * q2;
      return { q1, q2, profit1, profit2, marketCaptured: t("theory.bertrandSplit") };
    }
  };

  const bertrandResult = calculateBertrandOutcome(bertrandP1, bertrandP2);

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
        <TabsTrigger value="payoff">{t("theory.tabPayoff")}</TabsTrigger>
        <TabsTrigger value="cournot">{t("theory.tabCournot")}</TabsTrigger>
        <TabsTrigger value="bertrand">{t("theory.tabBertrand")}</TabsTrigger>
        <TabsTrigger value="concepts">{t("theory.tabConcepts")}</TabsTrigger>
      </TabsList>

      {/* Classical Payoff Matrix */}
      <TabsContent value="payoff" className="space-y-6">
        <Card className="bg-gradient-to-br from-info/5 to-primary/5">
          <CardHeader>
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-info mt-1" />
              <div>
                <CardTitle>{t("theory.payoffTitle")}</CardTitle>
                <CardDescription className="mt-2">
                  {t("theory.payoffDesc")}
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
                    {stratLabels.map((strategy, idx) => (
                      <th key={idx} className="border border-border p-4 bg-secondary/10 font-semibold text-sm">
                        {t("theory.competitorLabel")}: {strategy}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stratLabels.map((ourStrategy, rowIdx) => (
                    <tr key={rowIdx}>
                      <td className="border border-border p-4 bg-primary/10 font-semibold text-sm">
                        {t("theory.youLabel")}: {ourStrategy}
                      </td>
                      {stratLabels.map((_, colIdx) => {
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
                                  {t("theory.nashEquilibrium")}
                                </Badge>
                              )}
                              {isOptimal && (
                                <Badge variant="outline" className="text-xs bg-success/20 border-success">
                                  {t("theory.paretoOptimum")}
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
                {t("theory.dominantStrategy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {t("theory.dominantStrategyDesc")}
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="font-semibold text-success">{t("theory.dominantPick")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("theory.dominantPickDesc")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                {t("theory.risksTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {t("theory.risksDesc")}
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="font-semibold text-destructive">{t("theory.priceWar")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("theory.priceWarDesc")}
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
                <CardTitle>{t("theory.cournotTitle")}</CardTitle>
                <CardDescription className="mt-2">
                  {t("theory.cournotDesc")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cournot-q1">{t("theory.cournotQ1")}</Label>
                <Input
                  id="cournot-q1"
                  type="number"
                  min="0"
                  value={cournotQ1}
                  onChange={(e) => setCournotQ1(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cournot-q2">{t("theory.cournotQ2")}</Label>
                <Input
                  id="cournot-q2"
                  type="number"
                  min="0"
                  value={cournotQ2}
                  onChange={(e) => setCournotQ2(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cournot-price">{t("theory.cournotMaxPrice")}</Label>
                <Input
                  id="cournot-price"
                  type="number"
                  min="0"
                  value={cournotMarketPrice}
                  onChange={(e) => setCournotMarketPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cournot-cost">{t("theory.cournotMC")}</Label>
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
                <p className="text-sm text-muted-foreground mb-1">{t("theory.marketPrice")}</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {cournotResult.price.toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground mb-1">{t("theory.profitFirm1")}</p>
                <p className="text-2xl font-bold font-mono text-success">
                  {cournotResult.profit1.toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground mb-1">{t("theory.profitFirm2")}</p>
                <p className="text-2xl font-bold font-mono text-secondary">
                  {cournotResult.profit2.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-info/10 border border-info/20">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                {t("theory.cournotEqTitle")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("theory.cournotEqLine", { value: cournotEquilibrium.toFixed(2) })}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {t("theory.cournotEqHint")}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">{t("theory.reactionCurves")}</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cournotReactionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="q2" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Line type="monotone" dataKey="reactionQ1" name={t("theory.reactionFirm1")} stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="equilibrium" name={t("theory.equilibrium")} stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {t("theory.reactionHint")}
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
                <CardTitle>{t("theory.bertrandTitle")}</CardTitle>
                <CardDescription className="mt-2">
                  {t("theory.bertrandDesc")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bertrand-p1">{t("theory.bertrandP1")}</Label>
                <Input
                  id="bertrand-p1"
                  type="number"
                  min="0"
                  value={bertrandP1}
                  onChange={(e) => setBertrandP1(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bertrand-p2">{t("theory.bertrandP2")}</Label>
                <Input
                  id="bertrand-p2"
                  type="number"
                  min="0"
                  value={bertrandP2}
                  onChange={(e) => setBertrandP2(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bertrand-mc">{t("theory.cournotMC")}</Label>
                <Input
                  id="bertrand-mc"
                  type="number"
                  min="0"
                  value={bertrandMC}
                  onChange={(e) => setBertrandMC(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bertrand-demand">{t("theory.bertrandDemand")}</Label>
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
                <p className="text-sm text-muted-foreground mb-1">{t("theory.profitFirm1")}</p>
                <p className="text-2xl font-bold font-mono text-success">
                  {bertrandResult.profit1.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("theory.volumeUnits", { value: bertrandResult.q1.toFixed(0) })}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-card border">
                <p className="text-sm text-muted-foreground mb-1">{t("theory.profitFirm2")}</p>
                <p className="text-2xl font-bold font-mono text-secondary">
                  {bertrandResult.profit2.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("theory.volumeUnits", { value: bertrandResult.q2.toFixed(0) })}
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
                {t("theory.competitionResult")}
              </h4>
              <p className="text-sm font-semibold mb-1">{bertrandResult.marketCaptured}</p>
              <p className="text-xs text-muted-foreground">
                {bertrandP1 === bertrandP2 && bertrandP1 === bertrandMC
                  ? t("theory.bertrandEqOK")
                  : t("theory.bertrandEqWarn")
                }
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">{t("theory.profitVsPrice")}</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bertrandPriceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="price" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                  <Line type="monotone" dataKey="profit1IfP1" name={t("theory.profitFirm1")} stroke="hsl(var(--success))" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit2IfP2" name={t("theory.profitFirm2")} stroke="hsl(var(--secondary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {t("theory.bertrandParadox")}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Concepts */}
      <TabsContent value="concepts">
        <Card>
          <CardHeader>
            <CardTitle>{t("theory.conceptsTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-info/20 border-info">{t("theory.nashEquilibrium")}</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">{t("theory.nashDesc")}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-success/20 border-success">{t("theory.paretoOptimum")}</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">{t("theory.paretoDesc")}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-accent/20 border-accent">{t("theory.tabCournot")}</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">{t("theory.cournotConceptDesc")}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-secondary/20 border-secondary">{t("theory.tabBertrand")}</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">{t("theory.bertrandConceptDesc")}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Badge variant="outline" className="bg-warning/20 border-warning">{t("theory.dominantStrategy")}</Badge>
              </h4>
              <p className="text-sm text-muted-foreground">{t("theory.dominantConceptDesc")}</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
