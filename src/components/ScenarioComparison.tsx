import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Save, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/useTranslation";

interface ScenarioMetrics {
  revenue: number;
  profit: number;
  profitMargin: number;
  cac: number;
  breakEven: number;
}

interface ScenarioData {
  type: string;
  label: string;
  metrics?: ScenarioMetrics;
  hasData: boolean;
}

interface ScenarioComparisonProps {
  projectId?: string;
  scenarios: ScenarioData[];
  currency: string;
}

interface SummaryState {
  summary: string;
  recommendations: string;
}

const formatNumber = (value: number, currency: string) =>
  `${value.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ${currency}`;

const formatPercent = (value: number) =>
  `${value.toFixed(1)}%`;

const TrendIcon = ({ value }: { value: number }) => {
  if (value > 0) return <TrendingUp className="w-3 h-3 text-success" />;
  if (value < 0) return <TrendingDown className="w-3 h-3 text-destructive" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

export const ScenarioComparison = ({ projectId, scenarios, currency }: ScenarioComparisonProps) => {
  const { t } = useTranslation();
  const [summaries, setSummaries] = useState<Record<string, SummaryState>>({});
  const [isSaving, setIsSaving] = useState(false);

  const activeScenarios = scenarios.filter(s => s.hasData);

  useEffect(() => {
    if (projectId) loadSummaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadSummaries = async () => {
    if (!projectId) return;
    const { data, error } = await supabase
      .from('scenario_summaries')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error loading summaries:', error);
      return;
    }

    const map: Record<string, SummaryState> = {};
    (data || []).forEach((row: any) => {
      map[row.scenario_type] = {
        summary: row.summary || "",
        recommendations: row.recommendations || "",
      };
    });
    setSummaries(map);
  };

  const saveSummary = async (scenarioType: string) => {
    if (!projectId) { toast.error(t("scenarioComparisonExt.toastNoProject")); return; }
    setIsSaving(true);
    try {
      const s = summaries[scenarioType] || { summary: "", recommendations: "" };
      const { error } = await supabase
        .from('scenario_summaries')
        .upsert({
          project_id: projectId,
          scenario_type: scenarioType,
          summary: s.summary,
          recommendations: s.recommendations,
        }, { onConflict: 'project_id,scenario_type' });
      if (error) throw error;
      toast.success(t("scenarioComparisonExt.toastSaved"));
    } catch {
      toast.error(t("scenarioComparisonExt.toastSaveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const generateRecommendations = (scenario: ScenarioData) => {
    if (!scenario.metrics) return;
    const m = scenario.metrics;
    const recs: string[] = [];

    if (m.profitMargin < 0) recs.push(t("scenarioComparisonExt.recNegativeMargin"));
    else if (m.profitMargin < 10) recs.push(t("scenarioComparisonExt.recLowMargin"));
    else if (m.profitMargin > 30) recs.push(t("scenarioComparisonExt.recGreatMargin"));

    if (m.cac > m.revenue / 10) recs.push(t("scenarioComparisonExt.recHighCac"));

    if (m.breakEven < 0) recs.push(t("scenarioComparisonExt.recBelowBE", { count: Math.abs(m.breakEven) }));
    else if (m.breakEven > 0) recs.push(t("scenarioComparisonExt.recAboveBE", { count: m.breakEven }));
    else recs.push(t("scenarioComparisonExt.recAtBE"));

    setSummaries(prev => ({
      ...prev,
      [scenario.type]: {
        ...(prev[scenario.type] || { summary: "" }),
        recommendations: recs.join("\n\n"),
      },
    }));
    toast.success(t("scenarioComparisonExt.toastGenerated"));
  };

  const updateField = (scenarioType: string, field: keyof SummaryState, value: string) => {
    setSummaries(prev => ({
      ...prev,
      [scenarioType]: {
        ...(prev[scenarioType] || { summary: "", recommendations: "" }),
        [field]: value,
      },
    }));
  };

  if (activeScenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("scenarioComparisonExt.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("scenarioComparisonExt.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t("scenarioComparisonExt.title")}
        </CardTitle>
        <CardDescription>
          {t("scenarioComparisonExt.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-xs text-muted-foreground font-medium">
                  {t("scenarioComparisonExt.metric")}
                </th>
                {activeScenarios.map(s => (
                  <th key={s.type} className="text-center py-2 px-3 text-xs font-medium">
                    <Badge variant={s.type === 'current' ? 'default' : 'secondary'} className="text-[10px]">
                      {s.label}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 text-xs text-muted-foreground">
                  {t("scenarioComparisonExt.revenue")}
                </td>
                {activeScenarios.map(s => (
                  <td key={s.type} className="text-center py-2 px-3 font-mono text-xs">
                    {s.metrics ? formatNumber(s.metrics.revenue, currency) : '—'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 text-xs text-muted-foreground">
                  {t("scenarioComparisonExt.profit")}
                </td>
                {activeScenarios.map(s => (
                  <td key={s.type} className="text-center py-2 px-3 font-mono text-xs">
                    <span className={s.metrics && s.metrics.profit < 0 ? 'text-destructive' : ''}>
                      {s.metrics ? formatNumber(s.metrics.profit, currency) : '—'}
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 text-xs text-muted-foreground">
                  {t("scenarioComparisonExt.margin")}
                </td>
                {activeScenarios.map(s => (
                  <td key={s.type} className="text-center py-2 px-3 font-mono text-xs">
                    <span className={s.metrics && s.metrics.profitMargin < 0 ? 'text-destructive' : ''}>
                      {s.metrics ? formatPercent(s.metrics.profitMargin) : '—'}
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4 text-xs text-muted-foreground">CAC</td>
                {activeScenarios.map(s => (
                  <td key={s.type} className="text-center py-2 px-3 font-mono text-xs">
                    {s.metrics ? formatNumber(s.metrics.cac, currency) : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-4 text-xs text-muted-foreground">
                  {t("scenarioComparisonExt.breakeven")}
                </td>
                {activeScenarios.map(s => (
                  <td key={s.type} className="text-center py-2 px-3 font-mono text-xs">
                    {s.metrics ? (
                      <span className="flex items-center justify-center gap-1">
                        <TrendIcon value={s.metrics.breakEven} />
                        {s.metrics.breakEven}
                      </span>
                    ) : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Scenario notes */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">
            {t("scenarioComparisonExt.summaryLabel")}
          </Label>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(activeScenarios.length, 3)}, 1fr)` }}>
            {activeScenarios.map(s => {
              const state = summaries[s.type] || { summary: "", recommendations: "" };
              return (
                <div key={s.type} className="space-y-3 p-3 rounded-lg border border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Badge variant={s.type === 'current' ? 'default' : 'secondary'} className="text-[10px]">
                      {s.label}
                    </Badge>
                    <div className="flex gap-1">
                      {s.metrics && (
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => generateRecommendations(s)}>
                          <Sparkles className="h-3 w-3 mr-1" />
                          {t("scenarioComparisonExt.auto")}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => saveSummary(s.type)} disabled={isSaving}>
                        <Save className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    placeholder={t("scenarioComparisonExt.summaryPlaceholder")}
                    value={state.summary}
                    onChange={e => updateField(s.type, 'summary', e.target.value)}
                    className="min-h-[80px] text-xs"
                  />
                  <Textarea
                    placeholder={t("scenarioComparisonExt.recommendationsPlaceholder")}
                    value={state.recommendations}
                    onChange={e => updateField(s.type, 'recommendations', e.target.value)}
                    className="min-h-[80px] text-xs"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
