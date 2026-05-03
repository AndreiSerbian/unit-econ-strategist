/**
 * Relationship Map - Visual flow of metric connections
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertTriangle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import type { ConsistencyCheckResult } from '@/utils/metricAnalysis';
import type { MetricRelationship } from '@/config/metricRelationships';
import { getRelationshipsForBusinessType } from '@/config/metricRelationships';
import type { BusinessType } from '@/config/businessTypeMetrics';
import { useTranslation } from '@/i18n/useTranslation';

interface RelationshipMapProps {
  businessType: BusinessType;
  checks: ConsistencyCheckResult[];
}

const statusIcons = {
  ok: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  contradiction: <XCircle className="h-4 w-4 text-red-500" />,
  missing: <HelpCircle className="h-4 w-4 text-muted-foreground" />
};

const statusColors = {
  ok: 'border-green-500/30 bg-green-500/10',
  warning: 'border-yellow-500/30 bg-yellow-500/10',
  contradiction: 'border-red-500/30 bg-red-500/10',
  missing: 'border-muted bg-muted/50'
};

export function RelationshipMap({ businessType, checks }: RelationshipMapProps) {
  const { t } = useTranslation();
  const { primaryRelationships } = getRelationshipsForBusinessType(businessType);
  
  const getCheckForRelationship = (id: string) => 
    checks.find(c => c.relationshipId === id);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {t('metricAnalyzer.relationshipMapTitle')}
          <Badge variant="outline" className="font-normal">
            {t('metricAnalyzer.relationshipsBadge', { count: primaryRelationships.length })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {primaryRelationships.slice(0, 6).map((rel) => {
          const check = getCheckForRelationship(rel.id);
          const status = check?.status || 'missing';
          
          return (
            <div 
              key={rel.id}
              className={`flex items-center gap-3 p-2 rounded-md border ${statusColors[status]}`}
            >
              {statusIcons[status]}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Badge variant="secondary" className="text-xs shrink-0">
                  {rel.from}
                </Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                <Badge variant="secondary" className="text-xs shrink-0">
                  {rel.to}
                </Badge>
                {rel.formulaLabel && (
                  <span className="text-xs text-muted-foreground truncate">
                    {rel.formulaLabel}
                  </span>
                )}
              </div>
              {rel.severity === 'critical' && (
                <Badge variant="destructive" className="text-xs">
                  {t('metricAnalyzer.severityCritical')}
                </Badge>
              )}
            </div>
          );
        })}
        
        {primaryRelationships.length > 6 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            {t('metricAnalyzer.moreLinks', { count: primaryRelationships.length - 6 })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
