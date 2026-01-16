import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, UserCheck, UserX, Repeat, TrendingDown } from "lucide-react";
import type { LeadSource } from "@/hooks/useProject";

interface CustomerJourneyProps {
  leadSources: LeadSource[];
  totalLeads: number;
  totalClients: number;
  newClients: number;
  returningClients: number;
  conversionRate: number;
  churnRate?: number;
  currency: string;
}

interface JourneyNode {
  id: string;
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

interface JourneyFlow {
  from: string;
  to: string;
  value: number;
  label: string;
}

export const CustomerJourney = memo(({
  leadSources,
  totalLeads,
  totalClients,
  newClients,
  returningClients,
  conversionRate,
  churnRate = 0,
  currency,
}: CustomerJourneyProps) => {
  const journeyData = useMemo(() => {
    // Calculate source breakdown
    const paidLeads = leadSources.filter(s => s.type === 'paid').reduce((sum, s) => sum + s.leads, 0);
    const organicLeads = leadSources.filter(s => s.type === 'organic').reduce((sum, s) => sum + s.leads, 0);
    const referralLeads = leadSources.filter(s => s.type === 'referral').reduce((sum, s) => sum + s.leads, 0);
    const directLeads = leadSources.filter(s => s.type === 'direct').reduce((sum, s) => sum + s.leads, 0);
    
    // Lost leads (not converted)
    const lostLeads = Math.max(0, totalLeads - totalClients);
    
    // Active vs churned clients
    const activeClients = Math.round(totalClients * (1 - churnRate / 100));
    const churnedClients = totalClients - activeClients;
    
    return {
      sources: { paid: paidLeads, organic: organicLeads, referral: referralLeads, direct: directLeads },
      lostLeads,
      activeClients,
      churnedClients,
    };
  }, [leadSources, totalLeads, totalClients, churnRate]);

  const sourceData = [
    { label: 'Платный', value: journeyData.sources.paid, color: 'bg-red-500' },
    { label: 'Органика', value: journeyData.sources.organic, color: 'bg-green-500' },
    { label: 'Реферал', value: journeyData.sources.referral, color: 'bg-blue-500' },
    { label: 'Прямой', value: journeyData.sources.direct, color: 'bg-purple-500' },
  ].filter(s => s.value > 0);

  const maxValue = Math.max(totalLeads, totalClients, 1);

  const getBarWidth = (value: number) => {
    return Math.max(5, (value / maxValue) * 100);
  };

  if (totalLeads === 0 && totalClients === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Customer Journey (Sankey)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Добавьте источники лидов и данные о клиентах для визуализации пути клиента
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Customer Journey (Sankey-диаграмма)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Sankey-like visualization */}
          <div className="relative overflow-hidden">
            {/* Stage 1: Sources -> Leads */}
            <div className="flex items-stretch gap-4 mb-6">
              {/* Sources column */}
              <div className="w-1/4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Источники</p>
                {sourceData.map((source, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                    style={{ minHeight: `${Math.max(30, getBarWidth(source.value) * 0.6)}px` }}
                  >
                    <div className={`w-3 h-3 rounded-full ${source.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{source.label}</p>
                      <p className="text-sm font-mono font-medium">{source.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Flow arrows */}
              <div className="flex items-center justify-center text-muted-foreground">
                <ArrowRight className="w-6 h-6" />
              </div>

              {/* Leads column */}
              <div className="w-1/4 flex flex-col justify-center">
                <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Лиды</p>
                <div 
                  className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30"
                  style={{ minHeight: `${getBarWidth(totalLeads) * 1.5}px` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">Всего лидов</p>
                  </div>
                  <p className="text-2xl font-bold font-mono text-primary">{totalLeads.toLocaleString()}</p>
                </div>
              </div>

              {/* Flow arrows with conversion */}
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-1">
                <ArrowRight className="w-6 h-6" />
                <span className="text-xs font-mono">{conversionRate.toFixed(1)}%</span>
              </div>

              {/* Clients column */}
              <div className="w-1/4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Клиенты</p>
                <div 
                  className="p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/30"
                  style={{ minHeight: `${getBarWidth(totalClients) * 0.8}px` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="w-4 h-4 text-green-500" />
                    <p className="text-xs font-medium">Клиенты</p>
                  </div>
                  <p className="text-xl font-bold font-mono text-green-500">{totalClients.toLocaleString()}</p>
                </div>
                {journeyData.lostLeads > 0 && (
                  <div 
                    className="p-3 rounded-lg bg-gradient-to-r from-red-500/20 to-red-500/10 border border-red-500/30"
                    style={{ minHeight: `${getBarWidth(journeyData.lostLeads) * 0.5}px` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <p className="text-xs font-medium">Потери</p>
                    </div>
                    <p className="text-lg font-bold font-mono text-red-500">{journeyData.lostLeads.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Flow arrows */}
              <div className="flex items-center justify-center text-muted-foreground">
                <ArrowRight className="w-6 h-6" />
              </div>

              {/* Retention column */}
              <div className="w-1/4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Удержание</p>
                {returningClients > 0 && (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Repeat className="w-4 h-4 text-blue-500" />
                      <p className="text-xs font-medium">Повторные</p>
                    </div>
                    <p className="text-lg font-bold font-mono text-blue-500">{returningClients.toLocaleString()}</p>
                  </div>
                )}
                {journeyData.churnedClients > 0 && (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <UserX className="w-4 h-4 text-orange-500" />
                      <p className="text-xs font-medium">Отток</p>
                    </div>
                    <p className="text-lg font-bold font-mono text-orange-500">{journeyData.churnedClients.toLocaleString()}</p>
                  </div>
                )}
                {newClients > 0 && returningClients === 0 && journeyData.churnedClients === 0 && (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-purple-500" />
                      <p className="text-xs font-medium">Новые</p>
                    </div>
                    <p className="text-lg font-bold font-mono text-purple-500">{newClients.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Конверсия</p>
              <p className="text-lg font-bold font-mono text-primary">{conversionRate.toFixed(1)}%</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Потери лидов</p>
              <p className="text-lg font-bold font-mono text-red-500">
                {totalLeads > 0 ? ((journeyData.lostLeads / totalLeads) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Повторные</p>
              <p className="text-lg font-bold font-mono text-blue-500">
                {totalClients > 0 ? ((returningClients / totalClients) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Churn Rate</p>
              <p className="text-lg font-bold font-mono text-orange-500">{churnRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CustomerJourney.displayName = "CustomerJourney";
