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
import { useTranslation } from "@/i18n/useTranslation";

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

export const CompetitiveSimulator = ({ myCompany, competitors, currency }: CompetitiveSimulatorProps) => {
  const { t, language } = useTranslation();
  const localeMap: Record<string, string> = { ru: "ru-RU", en: "en-US", ro: "ro-RO" };
  const locale = localeMap[language] ?? "en-US";
  const fmt = (n: number) => Math.round(n).toLocaleString(locale);

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
      currentPrice = currentPrice * (1 - priceReduction / 100);
      currentMarketing = currentMarketing * (1 + marketingIncrease / 100);

      const marketShareGain = (priceReduction / 10) * 0.5 + (marketingIncrease / 10) * 0.3;
      currentMarketShare = Math.min(currentMarketShare * (1 + marketShareGain / 100), 40);

      const newRevenue = (myCompany.revenue || 0) * (1 + marketShareGain / 100);
      const newProfit = newRevenue - (myCompany.fixedCosts || 0) - currentMarketing - (myCompany.variableCosts || 0);
      const newMargin = (newProfit / newRevenue) * 100;

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
    const revenueBoost = cooperationBonus / 100;
    const costReduction = cooperationBonus / 150;

    const newRevenue = (myCompany.revenue || 0) * (1 + revenueBoost);
    const newCosts = ((myCompany.fixedCosts || 0) + (myCompany.marketingCosts || 0) + (myCompany.variableCosts || 0)) * (1 - costReduction);
    const newProfit = newRevenue - newCosts;
    const newMargin = (newProfit / newRevenue) * 100;

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
      competitorAction = lastRound ? lastRound.myAction : 'cooperate';
    }

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
    const recommendations: Array<{ type: 'warning' | 'success' | 'info'; title: string; description: string; strategy: string; }> = [];

    const myMarketShare = 100 / (competitors.length + 1);
    const avgCompetitorRevenue = competitors.length
      ? competitors.reduce((sum, c) => sum + (c.revenue || 0), 0) / competitors.length
      : 0;
    const myRevenue = myCompany.revenue || 0;
    const isMarketLeader = myRevenue > avgCompetitorRevenue;

    if (baseMargin < 15) {
      recommendations.push({
        type: 'warning',
        title: t('theory.simRecLowMarginTitle'),
        description: t('theory.simRecLowMarginDesc'),
        strategy: t('theory.simRecLowMarginStrategy'),
      });
    }

    if (isMarketLeader) {
      recommendations.push({
        type: 'success',
        title: t('theory.simRecLeaderTitle'),
        description: t('theory.simRecLeaderDesc'),
        strategy: t('theory.simRecLeaderStrategy'),
      });
    } else {
      recommendations.push({
        type: 'info',
        title: t('theory.simRecCatchUpTitle'),
        description: t('theory.simRecCatchUpDesc'),
        strategy: t('theory.simRecCatchUpStrategy'),
      });
    }

    if (myMarketShare < 20 && competitors.length > 2) {
      recommendations.push({
        type: 'info',
        title: t('theory.simRecFragmentedTitle'),
        description: t('theory.simRecFragmentedDesc'),
        strategy: t('theory.simRecFragmentedStrategy'),
      });
    }

    const cac = calculateCAC(myCompany);
    const ltv = (myCompany.customerLifetimeMonths || 12) * (myCompany.purchaseFrequency || 1) * (myCompany.avgCheck || 0);
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    if (ltvCacRatio < 3 && cac > 0) {
      recommendations.push({
        type: 'warning',
        title: t('theory.simRecLowLtvCacTitle'),
        description: t('theory.simRecLowLtvCacDesc', { ratio: ltvCacRatio.toFixed(1) }),
        strategy: t('theory.simRecLowLtvCacStrategy'),
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const lastPW = priceWarResults[priceWarResults.length - 1];

  const scenarioComparison = [
    {
      name: t('theory.simScenBaseline'),
      profit: baseProfit,
      margin: baseMargin,
      risk: t('theory.simRiskLow'),
      recommendation: t('theory.simRecBaselineDesc'),
    },
    {
      name: t('theory.simScenPriceWar', { rounds }),
      profit: lastPW ? lastPW.myProfit : 0,
      margin: lastPW ? lastPW.myMargin : 0,
      risk: t('theory.simRiskHigh'),
      recommendation: lastPW && lastPW.myProfit < baseProfit
        ? t('theory.simRecPriceWarLossDesc')
        : t('theory.simRecPriceWarOkDesc'),
    },
    {
      name: t('theory.simScenCooperation'),
      profit: cooperationResults?.after.myProfit || 0,
      margin: cooperationResults?.after.myMargin || 0,
      risk: t('theory.simRiskMid'),
      recommendation: cooperationResults && cooperationResults.after.myProfit > baseProfit
        ? t('theory.simRecCoopOkDesc')
        : t('theory.simRecRunSim'),
    },
    {
      name: t('theory.simScenTitForTat'),
      profit: titForTatHistory.length > 0
        ? titForTatHistory.reduce((sum, r) => sum + r.myProfit, 0) / titForTatHistory.length
        : 0,
      margin: baseMargin,
      risk: t('theory.simRiskLow'),
      recommendation: titForTatHistory.length > 0
        ? t('theory.simRecTitAdaptive')
        : t('theory.simRecRunSim'),
    },
  ];

  const riskLowLabel = t('theory.simRiskLow');
  const riskMidLabel = t('theory.simRiskMid');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('theory.simAutoRecsTitle')}
          </CardTitle>
          <CardDescription>{t('theory.simAutoRecsDesc')}</CardDescription>
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
          <TabsTrigger value="price-war">{t('theory.simTabPriceWar')}</TabsTrigger>
          <TabsTrigger value="cooperation">{t('theory.simTabCooperation')}</TabsTrigger>
          <TabsTrigger value="tit-for-tat">{t('theory.simTabTitForTat')}</TabsTrigger>
          <TabsTrigger value="comparison">{t('theory.simTabComparison')}</TabsTrigger>
        </TabsList>

        {/* Price War Tab */}
        <TabsContent value="price-war" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('theory.simPriceWarCardTitle')}</CardTitle>
              <CardDescription>{t('theory.simPriceWarCardDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('theory.simPriceReduction')}</Label>
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
                  <Label>{t('theory.simMarketingIncrease')}</Label>
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
                  <Label>{t('theory.simRounds')}</Label>
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
                {t('theory.simRun')}
              </Button>

              {priceWarResults.length > 0 && lastPW && (
                <>
                  <div className="space-y-4">
                    <h4 className="font-semibold">{t('theory.simProfitDynamics')}</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={priceWarResults}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" label={{ value: t('theory.simRound'), position: 'insideBottom', offset: -5 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="myProfit" stroke="hsl(var(--primary))" name={t('theory.simMyProfit')} strokeWidth={2} />
                        <Line type="monotone" dataKey="competitorAvgProfit" stroke="hsl(var(--destructive))" name={t('theory.simCompetitorProfit')} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">{t('theory.simMarginDynamics')}</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={priceWarResults}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" label={{ value: t('theory.simRound'), position: 'insideBottom', offset: -5 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="myMargin" stroke="hsl(var(--primary))" name={t('theory.simMyMargin')} strokeWidth={2} />
                        <Line type="monotone" dataKey="competitorAvgMargin" stroke="hsl(var(--destructive))" name={t('theory.simCompetitorProfit')} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('theory.simFinalProfit')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{fmt(lastPW.myProfit)} {currency}</p>
                        <p className={`text-sm ${lastPW.myProfit < baseProfit ? 'text-destructive' : 'text-green-500'}`}>
                          {lastPW.myProfit < baseProfit ? '↓' : '↑'}{' '}
                          {Math.abs(((lastPW.myProfit - baseProfit) / baseProfit * 100)).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('theory.simFinalMargin')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{lastPW.myMargin.toFixed(1)}%</p>
                        <p className={`text-sm ${lastPW.myMargin < baseMargin ? 'text-destructive' : 'text-green-500'}`}>
                          {lastPW.myMargin < baseMargin ? '↓' : '↑'}{' '}
                          {Math.abs(lastPW.myMargin - baseMargin).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('theory.simFinalPrice')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{fmt(lastPW.myPrice)} {currency}</p>
                        <p className="text-sm text-destructive">
                          ↓ {((1 - lastPW.myPrice / basePrice) * 100).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{t('theory.simMarketShareLabel')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{lastPW.myMarketShare.toFixed(1)}%</p>
                        <p className="text-sm text-green-500">
                          ↑ {(lastPW.myMarketShare - 100 / (competitors.length + 1)).toFixed(1)}%
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
              <CardTitle>{t('theory.simCooperationCardTitle')}</CardTitle>
              <CardDescription>{t('theory.simCooperationCardDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('theory.simCooperationBonus')}</Label>
                <Slider
                  value={[cooperationBonus]}
                  onValueChange={(v) => setCooperationBonus(v[0])}
                  min={5}
                  max={25}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">
                  {t('theory.simCooperationHint', { value: cooperationBonus })}
                </p>
              </div>

              <Button onClick={runCooperation} className="w-full">
                {t('theory.simRunCooperation')}
              </Button>

              {cooperationResults && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{t('theory.simBefore')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">{t('theory.simMyProfitLabel')}</span>
                          <span className="font-semibold">{fmt(cooperationResults.before.myProfit)} {currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">{t('theory.simMyMarginLabel')}</span>
                          <span className="font-semibold">{cooperationResults.before.myMargin.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">{t('theory.simCompetitorProfitLabel')}</span>
                          <span className="font-semibold">{fmt(cooperationResults.before.competitorProfit)} {currency}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{t('theory.simAfter')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">{t('theory.simMyProfitLabel')}</span>
                          <span className="font-semibold text-green-500">
                            {fmt(cooperationResults.after.myProfit)} {currency}
                            <span className="text-xs ml-1">(+{cooperationResults.improvements.myProfitChange.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">{t('theory.simMyMarginLabel')}</span>
                          <span className="font-semibold text-green-500">
                            {cooperationResults.after.myMargin.toFixed(1)}%
                            <span className="text-xs ml-1">(+{cooperationResults.improvements.myMarginChange.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">{t('theory.simCompetitorProfitLabel')}</span>
                          <span className="font-semibold text-green-500">
                            {fmt(cooperationResults.after.competitorProfit)} {currency}
                            <span className="text-xs ml-1">(+{cooperationResults.improvements.competitorProfitChange.toFixed(1)}%)</span>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {t('theory.simMutualBenefitTitle')}
                    </h4>
                    <p className="text-sm text-muted-foreground">{t('theory.simMutualBenefitDesc')}</p>
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
              <CardTitle>{t('theory.simTitForTatCardTitle')}</CardTitle>
              <CardDescription>{t('theory.simTitForTatCardDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('theory.simCompetitorStrategy')}</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={competitorStrategy === 'tit-for-tat' ? 'default' : 'outline'}
                    onClick={() => setCompetitorStrategy('tit-for-tat')}
                    className="flex-1 min-w-[120px]"
                  >
                    {t('theory.simStratTitForTat')}
                  </Button>
                  <Button
                    variant={competitorStrategy === 'always-cooperate' ? 'default' : 'outline'}
                    onClick={() => setCompetitorStrategy('always-cooperate')}
                    className="flex-1 min-w-[120px]"
                  >
                    {t('theory.simStratAlwaysCooperate')}
                  </Button>
                  <Button
                    variant={competitorStrategy === 'always-defect' ? 'default' : 'outline'}
                    onClick={() => setCompetitorStrategy('always-defect')}
                    className="flex-1 min-w-[120px]"
                  >
                    {t('theory.simStratAlwaysDefect')}
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
                    <div className="font-semibold">{t('theory.simYouCoop')}</div>
                    <div className="text-xs text-muted-foreground">{t('theory.simYouCoopDesc')}</div>
                  </div>
                </Button>

                <Button
                  onClick={() => playTitForTatRound('defect')}
                  variant="outline"
                  className="h-24 border-destructive/50 hover:bg-destructive/10"
                >
                  <div className="text-center">
                    <TrendingDown className="h-6 w-6 mx-auto mb-2 text-destructive" />
                    <div className="font-semibold">{t('theory.simYouDefect')}</div>
                    <div className="text-xs text-muted-foreground">{t('theory.simYouDefectDesc')}</div>
                  </div>
                </Button>
              </div>

              {titForTatHistory.length > 0 && (
                <>
                  <Button onClick={resetTitForTat} variant="outline" className="w-full">
                    {t('theory.simResetSim')}
                  </Button>

                  <div className="space-y-4">
                    <h4 className="font-semibold">{t('theory.simHistoryTitle')}</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {titForTatHistory.map((round) => (
                        <div key={round.round} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <span className="font-semibold">{t('theory.simRound')} {round.round}</span>
                            <div className="flex gap-4 text-sm flex-wrap">
                              <span>
                                {t('theory.simYouShort')}{' '}
                                <Badge variant={round.myAction === 'cooperate' ? 'default' : 'destructive'}>
                                  {round.myAction === 'cooperate' ? t('theory.simYouCoop') : t('theory.simYouDefect')}
                                </Badge>
                              </span>
                              <span>
                                {t('theory.simCompetitorShort')}{' '}
                                <Badge variant={round.competitorAction === 'cooperate' ? 'default' : 'destructive'}>
                                  {round.competitorAction === 'cooperate' ? t('theory.simYouCoop') : t('theory.simYouDefect')}
                                </Badge>
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm flex-wrap gap-2">
                            <span>{t('theory.simYourProfit')}: {fmt(round.myProfit)} {currency}</span>
                            <span>{t('theory.simCompProfit')}: {fmt(round.competitorProfit)} {currency}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{t('theory.simAvgProfit')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {fmt(titForTatHistory.reduce((sum, r) => sum + r.myProfit, 0) / titForTatHistory.length)} {currency}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{t('theory.simTotalRounds')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{titForTatHistory.length}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={titForTatHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="round" label={{ value: t('theory.simRound'), position: 'insideBottom', offset: -5 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="myProfit" stroke="hsl(var(--primary))" name={t('theory.simMyProfit')} strokeWidth={2} />
                        <Line type="monotone" dataKey="competitorProfit" stroke="hsl(var(--destructive))" name={t('theory.simCompetitorProfit')} strokeWidth={2} />
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
              <CardTitle>{t('theory.simComparisonCardTitle')}</CardTitle>
              <CardDescription>{t('theory.simComparisonCardDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('theory.simScenarioCol')}</th>
                      <th className="text-right p-2">{t('theory.simProfitCol', { currency })}</th>
                      <th className="text-right p-2">{t('theory.simMarginCol')}</th>
                      <th className="text-center p-2">{t('theory.simRiskCol')}</th>
                      <th className="text-left p-2">{t('theory.simRecCol')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarioComparison.map((scenario, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2 font-medium">{scenario.name}</td>
                        <td className="text-right p-2">
                          {scenario.profit > 0 ? fmt(scenario.profit) : '-'}
                        </td>
                        <td className="text-right p-2">
                          {scenario.margin > 0 ? scenario.margin.toFixed(1) : '-'}
                        </td>
                        <td className="text-center p-2">
                          <Badge variant={
                            scenario.risk === riskLowLabel ? 'default' :
                            scenario.risk === riskMidLabel ? 'secondary' :
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
                <h4 className="font-semibold">{t('theory.simProfitByScenario')}</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioComparison.filter(s => s.profit > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="profit" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">{t('theory.simFinalRecsTitle')}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {t('theory.simFinalRec1')}</li>
                  <li>• {t('theory.simFinalRec2')}</li>
                  <li>• {t('theory.simFinalRec3')}</li>
                  <li>• {t('theory.simFinalRec4')}</li>
                  <li>• {t('theory.simFinalRec5')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
