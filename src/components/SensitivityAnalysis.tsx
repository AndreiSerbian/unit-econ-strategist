import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

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
}

interface SensitivityAnalysisProps {
  baseMetrics: Metrics;
  currency: string;
}

export const SensitivityAnalysis = ({ baseMetrics, currency }: SensitivityAnalysisProps) => {
  const { t, language } = useTranslation();
  const numLocale = language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : "en-US";
  const [avgCheckChange, setAvgCheckChange] = useState(0);
  const [marketingChange, setMarketingChange] = useState(0);
  const [conversionChange, setConversionChange] = useState(0);
  const [clientsChange, setClientsChange] = useState(0);

  const calculateMetrics = (
    avgCheckMult: number,
    marketingMult: number,
    conversionMult: number,
    clientsMult: number
  ) => {
    const newAvgCheck = baseMetrics.avgCheck * (1 + avgCheckMult / 100);
    const newMarketingCosts = baseMetrics.marketingCosts * (1 + marketingMult / 100);
    const newConversion = baseMetrics.conversionRate * (1 + conversionMult / 100);
    const newTotalClients = baseMetrics.totalClients * (1 + clientsMult / 100);
    
    // Пересчитываем выручку с учетом новых параметров
    const newRevenue = newAvgCheck * newTotalClients;
    
    // Переменные расходы корректируются пропорционально изменению клиентов
    const newVariableCosts = baseMetrics.variableCosts * (1 + clientsMult / 100);
    
    const totalCosts = baseMetrics.fixedCosts + newVariableCosts + newMarketingCosts;
    const profit = newRevenue - totalCosts;
    const profitMargin = newRevenue > 0 ? (profit / newRevenue) * 100 : 0;
    const cac = newTotalClients > 0 ? newMarketingCosts / newTotalClients : 0;
    const breakEven = newAvgCheck > 0 ? totalCosts / newAvgCheck : 0;

    return {
      revenue: newRevenue,
      totalCosts,
      profit,
      profitMargin,
      cac,
      breakEven,
      avgCheck: newAvgCheck,
      marketingCosts: newMarketingCosts,
      conversionRate: newConversion,
      totalClients: newTotalClients,
    };
  };

  const currentMetrics = useMemo(
    () => calculateMetrics(avgCheckChange, marketingChange, conversionChange, clientsChange),
    [avgCheckChange, marketingChange, conversionChange, clientsChange, baseMetrics]
  );

  const baseCalc = calculateMetrics(0, 0, 0, 0);

  // Генерация данных для графиков зависимости прибыли от каждого параметра
  const generateSensitivityData = () => {
    const avgCheckData = [];
    const marketingData = [];
    const conversionData = [];
    const clientsData = [];

    for (let i = -50; i <= 50; i += 10) {
      avgCheckData.push({
        change: i,
        profit: calculateMetrics(i, 0, 0, 0).profit,
      });
      marketingData.push({
        change: i,
        profit: calculateMetrics(0, i, 0, 0).profit,
      });
      conversionData.push({
        change: i,
        profit: calculateMetrics(0, 0, i, 0).profit,
      });
      clientsData.push({
        change: i,
        profit: calculateMetrics(0, 0, 0, i).profit,
      });
    }

    return { avgCheckData, marketingData, conversionData, clientsData };
  };

  const sensitivityData = useMemo(() => generateSensitivityData(), [baseMetrics]);

  const percentChange = (current: number, base: number) => {
    if (base === 0) return 0;
    return ((current - base) / base) * 100;
  };

  const resetAll = () => {
    setAvgCheckChange(0);
    setMarketingChange(0);
    setConversionChange(0);
    setClientsChange(0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            🎚️ Анализ чувствительности
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Изменяйте параметры и мгновенно оценивайте влияние на прибыль и ROI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm sm:text-base">Средний чек</Label>
                <div className="text-right">
                  <span className="text-sm font-mono font-semibold text-primary">
                    {avgCheckChange >= 0 ? "+" : ""}{avgCheckChange}%
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {currentMetrics.avgCheck.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}
                  </p>
                </div>
              </div>
              <Slider
                value={[avgCheckChange]}
                onValueChange={(value) => setAvgCheckChange(value[0])}
                min={-50}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm sm:text-base">Маркетинговые расходы</Label>
                <div className="text-right">
                  <span className="text-sm font-mono font-semibold text-secondary">
                    {marketingChange >= 0 ? "+" : ""}{marketingChange}%
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {currentMetrics.marketingCosts.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}
                  </p>
                </div>
              </div>
              <Slider
                value={[marketingChange]}
                onValueChange={(value) => setMarketingChange(value[0])}
                min={-50}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm sm:text-base">Конверсия</Label>
                <div className="text-right">
                  <span className="text-sm font-mono font-semibold text-accent">
                    {conversionChange >= 0 ? "+" : ""}{conversionChange}%
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {currentMetrics.conversionRate.toFixed(2)}%
                  </p>
                </div>
              </div>
              <Slider
                value={[conversionChange]}
                onValueChange={(value) => setConversionChange(value[0])}
                min={-50}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm sm:text-base">Количество клиентов</Label>
                <div className="text-right">
                  <span className="text-sm font-mono font-semibold text-success">
                    {clientsChange >= 0 ? "+" : ""}{clientsChange}%
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(currentMetrics.totalClients)} клиентов
                  </p>
                </div>
              </div>
              <Slider
                value={[clientsChange]}
                onValueChange={(value) => setClientsChange(value[0])}
                min={-50}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={resetAll}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Сбросить все параметры
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            💰 Влияние на финансовые показатели
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className={currentMetrics.revenue >= baseCalc.revenue ? "bg-success/5" : "bg-destructive/5"}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Выручка</p>
                  <p className="text-lg sm:text-xl font-bold font-mono">
                    {currentMetrics.revenue.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    {currentMetrics.revenue >= baseCalc.revenue ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className={currentMetrics.revenue >= baseCalc.revenue ? "text-success" : "text-destructive"}>
                      {percentChange(currentMetrics.revenue, baseCalc.revenue).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={currentMetrics.profit >= baseCalc.profit ? "bg-success/5" : "bg-destructive/5"}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Прибыль</p>
                  <p className="text-lg sm:text-xl font-bold font-mono">
                    {currentMetrics.profit.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    {currentMetrics.profit >= baseCalc.profit ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className={currentMetrics.profit >= baseCalc.profit ? "text-success" : "text-destructive"}>
                      {percentChange(currentMetrics.profit, baseCalc.profit).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={currentMetrics.profitMargin >= baseCalc.profitMargin ? "bg-success/5" : "bg-destructive/5"}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Маржа прибыли</p>
                  <p className="text-lg sm:text-xl font-bold font-mono">
                    {currentMetrics.profitMargin.toFixed(1)}%
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    {currentMetrics.profitMargin >= baseCalc.profitMargin ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className={currentMetrics.profitMargin >= baseCalc.profitMargin ? "text-success" : "text-destructive"}>
                      {(currentMetrics.profitMargin - baseCalc.profitMargin).toFixed(1)} п.п.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={currentMetrics.breakEven <= baseCalc.breakEven ? "bg-success/5" : "bg-destructive/5"}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Безубыточность</p>
                  <p className="text-lg sm:text-xl font-bold font-mono">
                    {Math.round(currentMetrics.breakEven)} ед.
                  </p>
                  <div className="flex items-center gap-1 text-xs">
                    {currentMetrics.breakEven <= baseCalc.breakEven ? (
                      <TrendingDown className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingUp className="w-3 h-3 text-destructive" />
                    )}
                    <span className={currentMetrics.breakEven <= baseCalc.breakEven ? "text-success" : "text-destructive"}>
                      {percentChange(currentMetrics.breakEven, baseCalc.breakEven).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">📈 Зависимость прибыли от среднего чека</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="text-xs sm:text-sm">
              <LineChart data={sensitivityData.avgCheckData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="change" label={{ value: "Изменение (%)", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: `Прибыль (${currency})`, angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value: number) => `${value.toLocaleString(numLocale)} ${currency}`} />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">📉 Зависимость прибыли от маркетинга</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="text-xs sm:text-sm">
              <LineChart data={sensitivityData.marketingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="change" label={{ value: "Изменение (%)", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: `Прибыль (${currency})`, angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value: number) => `${value.toLocaleString(numLocale)} ${currency}`} />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">🎯 Зависимость прибыли от конверсии</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="text-xs sm:text-sm">
              <LineChart data={sensitivityData.conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="change" label={{ value: "Изменение (%)", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: `Прибыль (${currency})`, angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value: number) => `${value.toLocaleString(numLocale)} ${currency}`} />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">👥 Зависимость прибыли от клиентов</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="text-xs sm:text-sm">
              <LineChart data={sensitivityData.clientsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="change" label={{ value: "Изменение (%)", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: `Прибыль (${currency})`, angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value: number) => `${value.toLocaleString(numLocale)} ${currency}`} />
                <Line type="monotone" dataKey="profit" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">📊 Сравнительная таблица</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Показатель</th>
                  <th className="text-right p-2 font-semibold">Базовое значение</th>
                  <th className="text-right p-2 font-semibold">Текущее значение</th>
                  <th className="text-right p-2 font-semibold">Изменение</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">Выручка</td>
                  <td className="text-right p-2 font-mono">{baseCalc.revenue.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}</td>
                  <td className="text-right p-2 font-mono">{currentMetrics.revenue.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}</td>
                  <td className={`text-right p-2 font-mono font-semibold ${currentMetrics.revenue >= baseCalc.revenue ? "text-success" : "text-destructive"}`}>
                    {percentChange(currentMetrics.revenue, baseCalc.revenue).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">Прибыль</td>
                  <td className="text-right p-2 font-mono">{baseCalc.profit.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}</td>
                  <td className="text-right p-2 font-mono">{currentMetrics.profit.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}</td>
                  <td className={`text-right p-2 font-mono font-semibold ${currentMetrics.profit >= baseCalc.profit ? "text-success" : "text-destructive"}`}>
                    {percentChange(currentMetrics.profit, baseCalc.profit).toFixed(1)}%
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">Маржа прибыли</td>
                  <td className="text-right p-2 font-mono">{baseCalc.profitMargin.toFixed(1)}%</td>
                  <td className="text-right p-2 font-mono">{currentMetrics.profitMargin.toFixed(1)}%</td>
                  <td className={`text-right p-2 font-mono font-semibold ${currentMetrics.profitMargin >= baseCalc.profitMargin ? "text-success" : "text-destructive"}`}>
                    {(currentMetrics.profitMargin - baseCalc.profitMargin).toFixed(1)} п.п.
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2">CAC</td>
                  <td className="text-right p-2 font-mono">{baseCalc.cac.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}</td>
                  <td className="text-right p-2 font-mono">{currentMetrics.cac.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}</td>
                  <td className={`text-right p-2 font-mono font-semibold ${currentMetrics.cac <= baseCalc.cac ? "text-success" : "text-destructive"}`}>
                    {percentChange(currentMetrics.cac, baseCalc.cac).toFixed(1)}%
                  </td>
                </tr>
                <tr className="hover:bg-muted/50">
                  <td className="p-2">Точка безубыточности</td>
                  <td className="text-right p-2 font-mono">{Math.round(baseCalc.breakEven)} ед.</td>
                  <td className="text-right p-2 font-mono">{Math.round(currentMetrics.breakEven)} ед.</td>
                  <td className={`text-right p-2 font-mono font-semibold ${currentMetrics.breakEven <= baseCalc.breakEven ? "text-success" : "text-destructive"}`}>
                    {percentChange(currentMetrics.breakEven, baseCalc.breakEven).toFixed(1)}%
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
