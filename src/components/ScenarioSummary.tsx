import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Save, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t } = useTranslation();
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
      toast.error(t("summary.noProject"));
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
      
      toast.success(t("summary.saved"));
    } catch (error) {
      console.error('Error saving summary:', error);
      toast.error(t("summary.saveError"));
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
      recs.push(t("summary.recNegativeMargin"));
    } else if (metrics.profitMargin < 10) {
      recs.push(t("summary.recLowMargin"));
    } else if (metrics.profitMargin > 30) {
      recs.push(t("summary.recHighMargin"));
    }

    // Analyze CAC
    if (metrics.cac > metrics.revenue / 10) {
      recs.push(t("summary.recHighCac"));
    }

    // Analyze break-even
    if (metrics.breakEven < 0) {
      recs.push(t("summary.recBreakevenMissing").replace("{n}", String(Math.abs(metrics.breakEven))));
    } else if (metrics.breakEven > 0) {
      recs.push(t("summary.recBreakevenAbove").replace("{n}", String(metrics.breakEven)));
    } else {
      recs.push(t("summary.recBreakevenAt"));
    }

    setRecommendations(recs.join("\n\n"));
    setIsGenerating(false);
    toast.success(t("summary.generated"));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Резюме: {scenarioLabel}
        </CardTitle>
        <CardDescription>
          {t("summary.titleHint")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="summary">{t("summary.generalSummary")}</Label>
          <Textarea
            id="summary"
            placeholder={t("summary.summaryPlaceholder")}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="recommendations">{t("summary.recommendationsLabel")}</Label>
            {metrics && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateRecommendations}
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t("summary.generate")}
              </Button>
            )}
          </div>
          <Textarea
            id="recommendations"
            placeholder={t("summary.recsPlaceholder")}
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
          {isSaving ? t("summary.saving") : t("summary.saveSummary")}
        </Button>
      </CardContent>
    </Card>
  );
};
