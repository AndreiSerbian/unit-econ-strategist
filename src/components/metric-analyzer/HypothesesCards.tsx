/**
 * Hypotheses Cards - Generated hypotheses based on analysis
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, AlertCircle, TrendingUp } from 'lucide-react';
import type { Hypothesis } from '@/utils/metricAnalysis';

interface HypothesesCardsProps {
  hypotheses: Hypothesis[];
}

const priorityConfig = {
  high: {
    icon: <AlertCircle className="h-4 w-4" />,
    label: 'Высокий',
    className: 'bg-red-500/10 text-red-700 border-red-500/30'
  },
  medium: {
    icon: <Lightbulb className="h-4 w-4" />,
    label: 'Средний',
    className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30'
  },
  low: {
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Низкий',
    className: 'bg-blue-500/10 text-blue-700 border-blue-500/30'
  }
};

export function HypothesesCards({ hypotheses }: HypothesesCardsProps) {
  if (hypotheses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Гипотезы будут сгенерированы после анализа данных</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by priority
  const sortedHypotheses = [...hypotheses].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="space-y-3">
      {sortedHypotheses.map((hypothesis) => {
        const config = priorityConfig[hypothesis.priority];
        
        return (
          <Card key={hypothesis.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {config.icon}
                  <span>{hypothesis.title}</span>
                </div>
                <Badge variant="outline" className={config.className}>
                  {config.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {hypothesis.description}
              </p>
              {hypothesis.relatedChecks.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {hypothesis.relatedChecks.map((check) => (
                    <Badge key={check} variant="secondary" className="text-xs">
                      {check.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
