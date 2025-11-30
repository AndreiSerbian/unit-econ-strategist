import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Save, History } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface MetricSnapshot {
  id: string;
  snapshot_date: string;
  revenue: number | null;
  cac: number | null;
  cpl: number | null;
  profit: number | null;
  profit_margin: number | null;
  break_even_point: number | null;
}

interface MetricHistoryChartProps {
  projectId?: string;
  scenarioType: string;
  currentMetrics?: {
    revenue: number;
    cac: number;
    cpl: number;
    profit: number;
    profitMargin: number;
    breakEven: number;
  };
}

export const MetricHistoryChart = ({ 
  projectId, 
  scenarioType,
  currentMetrics 
}: MetricHistoryChartProps) => {
  const [history, setHistory] = useState<MetricSnapshot[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("revenue");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const saveSnapshot = async () => {
    if (!projectId || !currentMetrics) {
      toast.error("Нет данных для сохранения");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('metric_history')
        .insert({
          project_id: projectId,
          scenario_type: scenarioType,
          revenue: currentMetrics.revenue,
          cac: currentMetrics.cac,
          cpl: currentMetrics.cpl,
          profit: currentMetrics.profit,
          profit_margin: currentMetrics.profitMargin,
          break_even_point: currentMetrics.breakEven
        });

      if (error) throw error;
      
      toast.success("Снимок метрик сохранен");
      await loadHistory();
    } catch (error) {
      console.error('Error saving snapshot:', error);
      toast.error("Ошибка при сохранении снимка");
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = history.map(snapshot => ({
    date: format(new Date(snapshot.snapshot_date), 'dd MMM', { locale: ru }),
    fullDate: format(new Date(snapshot.snapshot_date), 'dd MMMM yyyy', { locale: ru }),
    revenue: snapshot.revenue || 0,
    cac: snapshot.cac || 0,
    cpl: snapshot.cpl || 0,
    profit: snapshot.profit || 0,
    profitMargin: snapshot.profit_margin || 0,
    breakEven: snapshot.break_even_point || 0
  }));

  const metricOptions = [
    { value: "revenue", label: "Выручка", color: "#8b5cf6" },
    { value: "profit", label: "Прибыль", color: "#10b981" },
    { value: "cac", label: "CAC", color: "#f59e0b" },
    { value: "cpl", label: "CPL", color: "#3b82f6" },
    { value: "profitMargin", label: "Маржа %", color: "#ec4899" },
    { value: "breakEven", label: "Точка безубыточности", color: "#6366f1" }
  ];

  const currentOption = metricOptions.find(opt => opt.value === selectedMetric);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              История изменений метрик
            </CardTitle>
            <CardDescription>
              Отслеживайте динамику ключевых показателей
            </CardDescription>
          </div>
          <Button
            onClick={saveSnapshot}
            disabled={isSaving || !projectId || !currentMetrics}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить снимок
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Метрика:</label>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[200px]">
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

        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Загрузка данных...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
            <History className="h-12 w-12 opacity-50" />
            <p>Нет сохраненных снимков</p>
            <p className="text-sm">Сохраните текущие метрики, чтобы начать отслеживание</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
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
                        <p className="font-medium mb-2">{data.fullDate}</p>
                        <p className="text-sm" style={{ color: currentOption?.color }}>
                          {currentOption?.label}: {payload[0].value?.toLocaleString('ru-RU')}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                name={currentOption?.label}
                stroke={currentOption?.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartData.length > 0 && (
          <div className="text-sm text-muted-foreground text-center">
            Всего снимков: {chartData.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
