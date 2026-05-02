import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { TrendingUp, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, addMonths } from "date-fns";
import { ru, ro as roLocale, enUS } from "date-fns/locale";
import { useTranslation } from "@/i18n/useTranslation";

interface MetricSnapshot {
  snapshot_date: string;
  revenue: number | null;
  cac: number | null;
  cpl: number | null;
  profit: number | null;
  profit_margin: number | null;
}

interface MetricForecastingProps {
  projectId?: string;
  scenarioType: string;
}

export const MetricForecasting = ({ projectId, scenarioType }: MetricForecastingProps) => {
  const { t, language } = useTranslation();
  const dateLocale = language === "ru" ? ru : language === "ro" ? roLocale : enUS;
  const numLocale = language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : "en-US";
  const [history, setHistory] = useState<MetricSnapshot[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("revenue");
  const [isLoading, setIsLoading] = useState(false);
  const [forecastPeriods, setForecastPeriods] = useState<number>(3);

  useEffect(() => {
    if (projectId) {
      loadHistory();
    }
  }, [projectId, scenarioType]);

  const loadHistory = async () => {
    if (!projectId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('metric_history')
      .select('*')
      .eq('project_id', projectId)
      .eq('scenario_type', scenarioType)
      .order('snapshot_date', { ascending: true });

    if (error) {
      console.error('Error loading history:', error);
    } else if (data) {
      setHistory(data);
    }
    setIsLoading(false);
  };

  // Linear regression calculation
  const calculateLinearRegression = (data: number[]) => {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: 0 };

    const xValues = Array.from({ length: n }, (_, i) => i);
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * data[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  // Calculate standard deviation for confidence intervals
  const calculateStdDev = (data: number[], mean: number) => {
    const squareDiffs = data.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / data.length;
    return Math.sqrt(avgSquareDiff);
  };

  const generateForecast = () => {
    const metricKey = selectedMetric as keyof MetricSnapshot;
    const historicalValues = history
      .map(h => h[metricKey])
      .filter((v): v is number => v !== null);

    if (historicalValues.length < 2) {
      return { chartData: [], hasSufficientData: false };
    }

    const { slope, intercept } = calculateLinearRegression(historicalValues);
    const mean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
    const stdDev = calculateStdDev(historicalValues, mean);

    const lastDate = new Date(history[history.length - 1].snapshot_date);

    // Historical data
    const chartData: any[] = history.map((h, i) => ({
      date: format(new Date(h.snapshot_date), 'dd MMM', { locale: dateLocale }),
      actual: h[metricKey] || 0,
      type: 'historical'
    }));

    // Forecast data
    for (let i = 1; i <= forecastPeriods; i++) {
      const forecastValue = slope * (historicalValues.length - 1 + i) + intercept;
      const confidenceMargin = 1.96 * stdDev; // 95% confidence interval
      
      chartData.push({
        date: format(addMonths(lastDate, i), 'dd MMM', { locale: dateLocale }),
        forecast: Math.max(0, forecastValue),
        upper: Math.max(0, forecastValue + confidenceMargin),
        lower: Math.max(0, forecastValue - confidenceMargin),
        type: 'forecast'
      });
    }

    return { chartData, hasSufficientData: true };
  };

  const { chartData, hasSufficientData } = generateForecast();

  const metricOptions = [
    { value: "revenue", label: t("metricForecasting.metricRevenue"), color: "#8b5cf6" },
    { value: "profit", label: t("metricForecasting.metricProfit"), color: "#10b981" },
    { value: "cac", label: t("metricForecasting.metricCac"), color: "#f59e0b" },
    { value: "cpl", label: t("metricForecasting.metricCpl"), color: "#3b82f6" },
    { value: "profit_margin", label: t("metricForecasting.metricMargin"), color: "#ec4899" }
  ];

  const currentOption = metricOptions.find(opt => opt.value === selectedMetric);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t("metricForecasting.title")}
        </CardTitle>
        <CardDescription>
          {t("metricForecasting.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{t("metricForecasting.metric")}</label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">{t("metricForecasting.forecastPeriod")}</label>
            <Select 
              value={forecastPeriods.toString()} 
              onValueChange={(v) => setForecastPeriods(Number(v))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("metricForecasting.months1")}</SelectItem>
                <SelectItem value="3">{t("metricForecasting.months3")}</SelectItem>
                <SelectItem value="6">{t("metricForecasting.months6")}</SelectItem>
                <SelectItem value="12">{t("metricForecasting.months12")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            {t("metricForecasting.loading")}
          </div>
        ) : !hasSufficientData ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("metricForecasting.insufficientData")}
            </AlertDescription>
          </Alert>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-2">{data.date}</p>
                        {data.actual !== undefined && (
                          <p className="text-sm" style={{ color: currentOption?.color }}>
                            {t("metricForecasting.fact")}: {data.actual.toLocaleString(numLocale)}
                          </p>
                        )}
                        {data.forecast !== undefined && (
                          <>
                            <p className="text-sm" style={{ color: currentOption?.color }}>
                              {t("metricForecasting.forecast")}: {data.forecast.toLocaleString(numLocale)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("metricForecasting.confidenceInterval")}: {data.lower.toLocaleString(numLocale)} - {data.upper.toLocaleString(numLocale)}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="upper"
                fill={currentOption?.color}
                fillOpacity={0.1}
                stroke="none"
                name={t("metricForecasting.upperBound")}
              />
              <Area
                type="monotone"
                dataKey="lower"
                fill={currentOption?.color}
                fillOpacity={0.1}
                stroke="none"
                name={t("metricForecasting.lowerBound")}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name={t("metricForecasting.historical")}
                stroke={currentOption?.color}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name={t("metricForecasting.forecast")}
                stroke={currentOption?.color}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: currentOption?.color }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {hasSufficientData && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {t("metricForecasting.forecastNote")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
