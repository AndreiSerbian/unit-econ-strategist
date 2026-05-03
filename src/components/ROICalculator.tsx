import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, DollarSign, Calendar, Target, Truck } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface DetailedExpenses {
  fixedCosts: {
    salaryOldClients: number;
    salaryNewClients: number;
    officeRent: number;
    warehouseRent: number;
    managementSalary: number;
    marketingSalary: number;
    productionSalary: number;
    internet: number;
    communication: number;
    banking: number;
    subscriptions: number;
    utilities: number;
    customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
  };
  variableCosts: {
    marketing: {
      trafficPurchase: number;
      contractorsPayment: number;
      crmCosts: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    salesPayroll: {
      bonusOldClients: number;
      bonusNewClients: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    production: {
      materials: number;
      curators: number;
      logistics: number;
      partnersPercent: number;
      equipmentRepair: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    other: {
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
  };
  taxRate: number;
  taxes: number;
}

interface Metrics {
  revenue: number;
  totalClients: number;
  newClients: number;
  returningClients: number;
  conversionRate: number;
  avgCheck: number;
  fixedCosts: number;
  variableCosts: number;
  marketingCosts: number;
  detailedExpenses?: DetailedExpenses;
}

interface ROICalculatorProps {
  currentMetrics: Metrics;
  scenarioA: Metrics;
  scenarioB: Metrics;
  currency: string;
}

export const ROICalculator = ({
  currentMetrics,
  scenarioA,
  scenarioB,
  currency,
}: ROICalculatorProps) => {
  const { t, language } = useTranslation();
  const numLocale = language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : "en-US";
  const [timePeriod, setTimePeriod] = useState(12);
  const [initialInvestment, setInitialInvestment] = useState(0);

  const calculateMonthlyProfit = (metrics: Metrics) => {
    const totalCosts = metrics.fixedCosts + metrics.variableCosts + metrics.marketingCosts;
    return metrics.revenue - totalCosts;
  };

  const calculateROI = (metrics: Metrics) => {
    const monthlyProfit = calculateMonthlyProfit(metrics);
    const totalProfit = monthlyProfit * timePeriod;
    if (initialInvestment === 0) return 0;
    return ((totalProfit - initialInvestment) / initialInvestment) * 100;
  };

  const calculatePaybackPeriod = (metrics: Metrics) => {
    const monthlyProfit = calculateMonthlyProfit(metrics);
    if (monthlyProfit <= 0 || initialInvestment === 0) return Infinity;
    return initialInvestment / monthlyProfit;
  };

  const generateCashFlowData = () => {
    const data = [];
    let currentCumulative = -initialInvestment;
    let scenarioACumulative = -initialInvestment;
    let scenarioBCumulative = -initialInvestment;

    const currentMonthlyProfit = calculateMonthlyProfit(currentMetrics);
    const scenarioAMonthlyProfit = calculateMonthlyProfit(scenarioA);
    const scenarioBMonthlyProfit = calculateMonthlyProfit(scenarioB);

    for (let month = 0; month <= timePeriod; month++) {
      if (month > 0) {
        currentCumulative += currentMonthlyProfit;
        scenarioACumulative += scenarioAMonthlyProfit;
        scenarioBCumulative += scenarioBMonthlyProfit;
      }

      data.push({
        month: `${t("roiCalculator.monthAbbr")}${month}`,
        current: Math.round(currentCumulative),
        scenarioA: Math.round(scenarioACumulative),
        scenarioB: Math.round(scenarioBCumulative),
      });
    }

    return data;
  };

  const generateMonthlyProfitData = () => {
    const data = [];
    const currentMonthlyProfit = calculateMonthlyProfit(currentMetrics);
    const scenarioAMonthlyProfit = calculateMonthlyProfit(scenarioA);
    const scenarioBMonthlyProfit = calculateMonthlyProfit(scenarioB);

    for (let month = 1; month <= Math.min(timePeriod, 12); month++) {
      data.push({
        month: `${t("roiCalculator.monthAbbr")}${month}`,
        current: Math.round(currentMonthlyProfit),
        scenarioA: Math.round(scenarioAMonthlyProfit),
        scenarioB: Math.round(scenarioBMonthlyProfit),
      });
    }

    return data;
  };

  const roiData = [
    {
      scenario: t("ltvCalculator.scenarioCurrent"),
      roi: calculateROI(currentMetrics),
      payback: calculatePaybackPeriod(currentMetrics),
      totalProfit: calculateMonthlyProfit(currentMetrics) * timePeriod,
    },
    {
      scenario: t("ltvCalculator.scenarioA"),
      roi: calculateROI(scenarioA),
      payback: calculatePaybackPeriod(scenarioA),
      totalProfit: calculateMonthlyProfit(scenarioA) * timePeriod,
    },
    {
      scenario: t("ltvCalculator.scenarioB"),
      roi: calculateROI(scenarioB),
      payback: calculatePaybackPeriod(scenarioB),
      totalProfit: calculateMonthlyProfit(scenarioB) * timePeriod,
    },
  ];
 
  // Получение статистики по логистике с fallback на 0, если detailedExpenses отсутствует
  const getLogisticsStats = (metrics: Metrics) => {
    // Если detailedExpenses не указаны, возвращаем нули
    const logistics = metrics.detailedExpenses?.variableCosts.production.logistics ?? 0;
    const revenue = metrics.revenue || 0;
    const variableCosts = metrics.variableCosts || 0;

    const logisticsVsRevenue = revenue > 0 ? (logistics / revenue) * 100 : 0;
    const logisticsVsVariable = variableCosts > 0 ? (logistics / variableCosts) * 100 : 0;

    return { 
      logistics, 
      logisticsVsRevenue, 
      logisticsVsVariable,
      hasData: !!metrics.detailedExpenses 
    };
  };
 
   const logisticsData = [
     {
       scenario: "Текущий",
       ...getLogisticsStats(currentMetrics),
     },
     {
       scenario: "Сценарий A",
       ...getLogisticsStats(scenarioA),
     },
     {
       scenario: "Сценарий B",
       ...getLogisticsStats(scenarioB),
     },
   ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            💰 {t("roiCalculator.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investment" className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {t("roiCalculator.initialInvestment", { currency })}
              </Label>
              <Input
                id="investment"
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t("roiCalculator.analysisPeriod")}
              </Label>
              <Input
                id="period"
                type="number"
                value={timePeriod}
                onChange={(e) => setTimePeriod(Number(e.target.value))}
                placeholder="12"
                min="1"
                max="60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-4">
            {roiData.map((item) => (
              <Card key={item.scenario} className="bg-gradient-to-br from-accent/5 to-primary/5">
                <CardContent className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-base sm:text-lg">{item.scenario}</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">ROI</p>
                      <p className={`text-xl sm:text-2xl font-bold font-mono ${item.roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {item.roi.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{t("roiCalculator.payback")}</p>
                      <p className="text-base sm:text-lg font-semibold font-mono">
                        {item.payback === Infinity ? '∞' : t("roiCalculator.paybackMonths", { value: item.payback.toFixed(1) })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{t("roiCalculator.profitForPeriod")}</p>
                      <p className="text-base sm:text-lg font-semibold font-mono">
                        {item.totalProfit.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} {currency}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
 
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
             <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            🚚 {t("roiCalculator.logisticsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("roiCalculator.logisticsDesc")}
           </p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
             {logisticsData.map((item) => (
               <Card key={item.scenario} className="bg-muted/40">
                 <CardContent className="pt-4 sm:pt-6 space-y-2">
                   <h3 className="font-semibold text-sm sm:text-base">{item.scenario}</h3>
                   {item.hasData ? (
                     <div className="space-y-1.5">
                       <div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {t("roiCalculator.logisticsForPeriod")}
                          </p>
                          <p className="text-base sm:text-lg font-mono font-semibold">
                            {item.logistics.toLocaleString(numLocale, {
                              maximumFractionDigits: 0,
                            })}{" "}
                            {currency}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {t("roiCalculator.shareInRevenue")}
                            </p>
                            <p className="text-sm sm:text-base font-mono">
                              {item.logisticsVsRevenue.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {t("roiCalculator.shareInVariable")}
                            </p>
                            <p className="text-sm sm:text-base font-mono">
                              {item.logisticsVsVariable.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        {t("roiCalculator.noDetailedExpenses")}
                      </p>
                   )}
                 </CardContent>
               </Card>
             ))}
           </div>
         </CardContent>
       </Card>
 
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
             <Target className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
             📈 {t("roiCalculator.cumulativeCashFlow")}
           </CardTitle>
         </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350} className="text-xs sm:text-sm">
            <LineChart data={generateCashFlowData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()} ${currency}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Текущий"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="Сценарий A"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="Сценарий B"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            💵 {t("roiCalculator.monthlyProfit")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
            <BarChart data={generateMonthlyProfitData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()} ${currency}`}
              />
              <Legend />
              <Bar dataKey="Текущий" fill="hsl(var(--primary))" />
              <Bar dataKey="Сценарий A" fill="hsl(var(--secondary))" />
              <Bar dataKey="Сценарий B" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">📊 {t("roiCalculator.comparisonTable")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">{t("roiCalculator.metric")}</th>
                  <th className="text-right p-2 font-semibold">{t("ltvCalculator.scenarioCurrent")}</th>
                  <th className="text-right p-2 font-semibold">{t("ltvCalculator.scenarioA")}</th>
                  <th className="text-right p-2 font-semibold">{t("ltvCalculator.scenarioB")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">ROI (%)</td>
                  <td className={`text-right p-2 font-mono font-semibold ${roiData[0].roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {roiData[0].roi.toFixed(1)}%
                  </td>
                  <td className={`text-right p-2 font-mono font-semibold ${roiData[1].roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {roiData[1].roi.toFixed(1)}%
                  </td>
                  <td className={`text-right p-2 font-mono font-semibold ${roiData[2].roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {roiData[2].roi.toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">{t("roiCalculator.paybackPeriodLabel")}</td>
                  <td className="text-right p-2 font-mono">
                    {roiData[0].payback === Infinity ? '∞' : roiData[0].payback.toFixed(1)}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {roiData[1].payback === Infinity ? '∞' : roiData[1].payback.toFixed(1)}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {roiData[2].payback === Infinity ? '∞' : roiData[2].payback.toFixed(1)}
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">{t("roiCalculator.profitForPeriodCurrency", { currency })}</td>
                  <td className="text-right p-2 font-mono">
                    {roiData[0].totalProfit.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {roiData[1].totalProfit.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {roiData[2].totalProfit.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="p-2">{t("roiCalculator.monthlyProfitCurrency", { currency })}</td>
                  <td className="text-right p-2 font-mono">
                    {calculateMonthlyProfit(currentMetrics).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {calculateMonthlyProfit(scenarioA).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="text-right p-2 font-mono">
                    {calculateMonthlyProfit(scenarioB).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
