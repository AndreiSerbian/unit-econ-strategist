/**
 * Competitors Comparison - Visual comparison with competitors
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CompetitorComparisonResult } from '@/utils/metricAnalysis';
import { useTranslation } from '@/i18n/useTranslation';

interface CompetitorsComparisonProps {
  comparisons: CompetitorComparisonResult[];
  selectedCompetitorId?: string;
}

export function CompetitorsComparison({ 
  comparisons, 
  selectedCompetitorId 
}: CompetitorsComparisonProps) {
  const { t } = useTranslation();
  const filteredComparisons = selectedCompetitorId
    ? comparisons.filter(c => c.competitorId === selectedCompetitorId)
    : comparisons;

  // Group by competitor
  const byCompetitor = filteredComparisons.reduce((acc, c) => {
    if (!acc[c.competitorId]) {
      acc[c.competitorId] = { name: c.competitorName, items: [] };
    }
    acc[c.competitorId].items.push(c);
    return acc;
  }, {} as Record<string, { name: string; items: CompetitorComparisonResult[] }>);

  if (Object.keys(byCompetitor).length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('metricAnalyzer.noCompetitorData')}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(byCompetitor).map(([competitorId, { name, items }]) => (
        <Card key={competitorId}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{t('metricAnalyzer.vsLabel')} {name}</span>
              <Badge variant="outline">
                {t('metricAnalyzer.advantages', { count: items.filter(i => (i.gap || 0) > 0).length })}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.slice(0, 5).map((item) => {
              const gap = item.gap || 0;
              const isPositive = gap > 0;
              const isNeutral = Math.abs(gap) <= 10;
              
              // Normalize for progress bar (50 = equal, 100 = +100%, 0 = -100%)
              const progressValue = Math.min(100, Math.max(0, 50 + gap / 2));
              
              return (
                <div key={`${competitorId}-${item.metricKey}`} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.metricKey}</span>
                    <div className="flex items-center gap-2">
                      {isNeutral ? (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      ) : isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <Badge 
                        variant={isNeutral ? 'outline' : isPositive ? 'default' : 'destructive'}
                        className={isPositive ? 'bg-green-500' : ''}
                      >
                        {gap > 0 ? '+' : ''}{gap.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={progressValue} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('metricAnalyzer.youLabel')}: {item.myValue?.toLocaleString() || '—'}</span>
                    <span>{name}: {item.competitorValue?.toLocaleString() || '—'}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
