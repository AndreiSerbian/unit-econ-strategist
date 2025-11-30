import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Save, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScenarioSummaryProps {
  projectId?: string;
  scenarioType: string;
  scenarioLabel: string;
  metrics?: {
    revenue: number;
    profit: number;
    profitMargin: number;
    cac: number;
    breakEven: number;
  };
}

export const ScenarioSummary = ({ 
  projectId, 
  scenarioType, 
  scenarioLabel,
  metrics 
}: ScenarioSummaryProps) => {
  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadSummary();
    }
  }, [projectId, scenarioType]);

  const loadSummary = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('scenario_summaries')
      .select('*')
      .eq('project_id', projectId)
      .eq('scenario_type', scenarioType)
      .maybeSingle();

    if (error) {
      console.error('Error loading summary:', error);
      return;
    }

    if (data) {
      setSummary(data.summary || "");
      setRecommendations(data.recommendations || "");
    }
  };

  const saveSummary = async () => {
    if (!projectId) {
      toast.error("Проект не выбран");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('scenario_summaries')
        .upsert({
          project_id: projectId,
          scenario_type: scenarioType,
          summary,
          recommendations
        }, {
          onConflict: 'project_id,scenario_type'
        });

      if (error) throw error;
      
      toast.success("Резюме сохранено");
    } catch (error) {
      console.error('Error saving summary:', error);
      toast.error("Ошибка при сохранении резюме");
    } finally {
      setIsSaving(false);
    }
  };

  const generateRecommendations = () => {
    if (!metrics) return;

    setIsGenerating(true);
    
    const recs: string[] = [];

    // Analyze profit margin
    if (metrics.profitMargin < 0) {
      recs.push("⚠️ Отрицательная маржа: необходимо срочно оптимизировать расходы или увеличить выручку");
    } else if (metrics.profitMargin < 10) {
      recs.push("⚡ Низкая маржа (< 10%): рассмотрите возможность повышения цен или снижения затрат");
    } else if (metrics.profitMargin > 30) {
      recs.push("✅ Отличная маржа (> 30%): хорошая возможность для масштабирования");
    }

    // Analyze CAC
    if (metrics.cac > metrics.revenue / 10) {
      recs.push("💰 Высокая стоимость привлечения клиента: оптимизируйте маркетинговые каналы");
    }

    // Analyze break-even
    if (metrics.breakEven < 0) {
      recs.push(`📉 До точки безубыточности не хватает ${Math.abs(metrics.breakEven)} клиентов`);
    } else if (metrics.breakEven > 0) {
      recs.push(`📈 Бизнес прибыльный, превышение точки безубыточности на ${metrics.breakEven} клиентов`);
    } else {
      recs.push("⚖️ Бизнес находится в точке безубыточности");
    }

    setRecommendations(recs.join("\n\n"));
    setIsGenerating(false);
    toast.success("Рекомендации сгенерированы");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Резюме: {scenarioLabel}
        </CardTitle>
        <CardDescription>
          Запишите выводы и рекомендации по сценарию
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="summary">Общее резюме</Label>
          <Textarea
            id="summary"
            placeholder="Опишите основные выводы по данному сценарию..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="recommendations">Рекомендации</Label>
            {metrics && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateRecommendations}
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Сгенерировать
              </Button>
            )}
          </div>
          <Textarea
            id="recommendations"
            placeholder="Рекомендации по улучшению показателей..."
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            className="min-h-[150px]"
          />
        </div>

        <Button
          onClick={saveSummary}
          disabled={isSaving || !projectId}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Сохранение..." : "Сохранить резюме"}
        </Button>
      </CardContent>
    </Card>
  );
};
