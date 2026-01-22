/**
 * Missing Data Panel - Shows what data is needed for complete analysis
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight } from 'lucide-react';
import type { ConsistencyCheckResult } from '@/utils/metricAnalysis';

interface MissingDataPanelProps {
  checks: ConsistencyCheckResult[];
}

export function MissingDataPanel({ checks }: MissingDataPanelProps) {
  const missingChecks = checks.filter(c => c.status === 'missing');
  
  // Collect all unique missing metrics
  const missingMetrics = new Set<string>();
  for (const check of missingChecks) {
    if (check.neededMetricsMissing) {
      for (const m of check.neededMetricsMissing) {
        missingMetrics.add(m);
      }
    }
  }
  
  const missingArray = Array.from(missingMetrics);

  if (missingArray.length === 0) {
    return null; // Don't render if no missing data
  }

  // Group checks by missing metric to show impact
  const impactByMetric: Record<string, string[]> = {};
  for (const check of missingChecks) {
    if (check.neededMetricsMissing) {
      for (const m of check.neededMetricsMissing) {
        if (!impactByMetric[m]) {
          impactByMetric[m] = [];
        }
        impactByMetric[m].push(check.relationshipId);
      }
    }
  }

  return (
    <Card className="border-yellow-500/30 bg-yellow-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-yellow-700">
          <AlertCircle className="h-4 w-4" />
          Недостающие данные
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700">
            {missingArray.length} метрик
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Заполните следующие метрики для полного анализа:
        </p>
        
        <div className="grid gap-2">
          {missingArray.slice(0, 6).map((metric) => (
            <div 
              key={metric}
              className="flex items-center gap-3 p-2 rounded-md bg-background border"
            >
              <Badge variant="secondary" className="font-mono text-xs">
                {metric}
              </Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Разблокирует {impactByMetric[metric]?.length || 0} проверок
              </span>
            </div>
          ))}
        </div>
        
        {missingArray.length > 6 && (
          <p className="text-xs text-muted-foreground text-center">
            +{missingArray.length - 6} метрик
          </p>
        )}
      </CardContent>
    </Card>
  );
}
