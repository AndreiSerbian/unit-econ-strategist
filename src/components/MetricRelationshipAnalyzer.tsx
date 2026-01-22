/**
 * Metric Relationship Analyzer v3.2
 * Main component composing all analysis sub-components
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, Lightbulb, AlertCircle } from 'lucide-react';
import type { Metrics, Competitor } from '@/hooks/useProject';
import type { BusinessType } from '@/config/businessTypeMetrics';
import { analyzeMetrics } from '@/utils/metricAnalysis';
import {
  RelationshipMap,
  ChecksTable,
  CompetitorsComparison,
  HypothesesCards,
  MissingDataPanel
} from '@/components/metric-analyzer';

interface MetricRelationshipAnalyzerProps {
  metrics: Metrics;
  competitors: Competitor[];
  businessType: BusinessType;
  currency: string;
}

export function MetricRelationshipAnalyzer({
  metrics,
  competitors,
  businessType,
  currency
}: MetricRelationshipAnalyzerProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all');
  
  const analysis = useMemo(() => 
    analyzeMetrics(metrics, competitors, businessType),
    [metrics, competitors, businessType]
  );
  
  const { summary, checks, comparisons, hypotheses } = analysis;
  
  const hasProblems = summary.contradictionCount > 0 || summary.warningCount > 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Анализ связей метрик
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasProblems && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {summary.contradictionCount + summary.warningCount} проблем
              </Badge>
            )}
            <Badge variant="outline">
              {summary.okCount}/{summary.totalChecks} ОК
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-1">
              <Activity className="h-4 w-4" />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="checks" className="gap-1">
              <AlertCircle className="h-4 w-4" />
              Проверки
            </TabsTrigger>
            <TabsTrigger value="competitors" className="gap-1">
              <Users className="h-4 w-4" />
              Конкуренты
            </TabsTrigger>
            <TabsTrigger value="hypotheses" className="gap-1">
              <Lightbulb className="h-4 w-4" />
              Гипотезы
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <RelationshipMap 
                businessType={businessType} 
                checks={checks} 
              />
              <MissingDataPanel checks={checks} />
            </div>
          </TabsContent>
          
          <TabsContent value="checks" className="mt-4">
            <ChecksTable checks={checks} />
          </TabsContent>
          
          <TabsContent value="competitors" className="space-y-4 mt-4">
            {competitors.length > 0 && (
              <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Выберите конкурента" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все конкуренты</SelectItem>
                  {competitors.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <CompetitorsComparison 
              comparisons={comparisons}
              selectedCompetitorId={selectedCompetitor === 'all' ? undefined : selectedCompetitor}
            />
          </TabsContent>
          
          <TabsContent value="hypotheses" className="mt-4">
            <HypothesesCards hypotheses={hypotheses} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
