import { memo, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Calculator,
  TrendingUp,
  Link2
} from 'lucide-react';
import { useCashFlowTimeline } from '@/hooks/useCashFlowTimeline';
import { TimelineSettings } from './TimelineSettings';
import { SummaryCards } from './SummaryCards';
import { CashFlowGrid } from './CashFlowGrid';
import { AddLineDialog } from './AddLineDialog';
import type { ScenarioType, CashFlowLine } from './types';
import type { BusinessType } from '@/config/businessTypeMetrics';
import {
  marketplaceAdapter,
  ecommerceAdapter,
  servicesAdapter,
  saasAdapter,
  sharingAdapter,
  expensesAdapter,
  type MarketplaceInput,
  type EcommerceInput,
  type ServicesInput,
  type SaasInput,
  type SharingInput,
  type ExpensesInput,
} from './adapters';
import { useState } from 'react';

interface CashFlowTimelineManagerProps {
  projectId: string | null;
  currency: string;
  businessType: BusinessType;
  // Data from business models for adapters
  marketplaceData?: MarketplaceInput;
  ecommerceData?: EcommerceInput;
  servicesData?: ServicesInput;
  saasData?: SaasInput;
  sharingData?: SharingInput;
  expensesData?: ExpensesInput;
}

export const CashFlowTimelineManager = memo(({
  projectId,
  currency,
  businessType,
  marketplaceData,
  ecommerceData,
  servicesData,
  saasData,
  sharingData,
  expensesData,
}: CashFlowTimelineManagerProps) => {
  const [scenarioType, setScenarioType] = useState<ScenarioType>('current');
  const [showPV, setShowPV] = useState(true);
  const [showCumulative, setShowCumulative] = useState(true);

  const {
    timeline,
    loading,
    periodMetrics,
    summary,
    allLinesWithValues,
    fetchTimeline,
    updateTimeline,
    addLine,
    deleteLine,
    updatePoint,
    applyAdapterLines,
  } = useCashFlowTimeline({ projectId });

  // Fetch timeline on mount and scenario change
  useEffect(() => {
    if (projectId) {
      fetchTimeline(scenarioType);
    }
  }, [projectId, scenarioType, fetchTimeline]);

  // Generate adapter lines from business data
  const generatedAdapterLines = useMemo(() => {
    if (!timeline) return [];
    
    const horizonPeriods = timeline.horizonPeriods;
    const planningPeriod = timeline.planningPeriod;
    const lines = [];

    // Apply business-specific adapter
    if (businessType === 'marketplace' && marketplaceData) {
      lines.push(...marketplaceAdapter({ ...marketplaceData, horizonPeriods, planningPeriod }));
    } else if ((businessType === 'ecommerce' || businessType === 'production') && ecommerceData) {
      lines.push(...ecommerceAdapter({ ...ecommerceData, horizonPeriods, planningPeriod }));
    } else if (businessType === 'services' && servicesData) {
      lines.push(...servicesAdapter({ ...servicesData, horizonPeriods, planningPeriod }));
    } else if ((businessType === 'saas' || businessType === 'freemium') && saasData) {
      lines.push(...saasAdapter({ ...saasData, horizonPeriods, planningPeriod }));
    } else if (businessType === 'sharing' && sharingData) {
      lines.push(...sharingAdapter({ ...sharingData, horizonPeriods, planningPeriod }));
    }

    // Apply common expenses adapter
    if (expensesData) {
      lines.push(...expensesAdapter({ ...expensesData, horizonPeriods }));
    }

    return lines;
  }, [timeline, businessType, marketplaceData, ecommerceData, servicesData, saasData, sharingData, expensesData]);

  // Apply adapter lines to hook
  useEffect(() => {
    applyAdapterLines(generatedAdapterLines);
  }, [generatedAdapterLines, applyAdapterLines]);

  // Edit-line dialog intentionally disabled for the conference build.
  // The grid renders a disabled edit button with a tooltip explaining this.

  const hasData = allLinesWithValues.length > 0 || generatedAdapterLines.length > 0;
  const hasLinkedData = generatedAdapterLines.length > 0;

  if (!projectId) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Выберите проект для работы с денежными потоками
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Cash Flow Timeline
          </h2>
          <p className="text-sm text-muted-foreground">
            Денежные потоки по периодам с дисконтированием (PV/NPV)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTimeline(scenarioType)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          <AddLineDialog onAdd={addLine} />
        </div>
      </div>

      {/* Scenario Tabs */}
      <Tabs value={scenarioType} onValueChange={(v) => setScenarioType(v as ScenarioType)}>
        <TabsList>
          <TabsTrigger value="current">Текущий</TabsTrigger>
          <TabsTrigger value="optimistic">Оптимистичный</TabsTrigger>
          <TabsTrigger value="pessimistic">Пессимистичный</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Settings */}
      <TimelineSettings timeline={timeline} onUpdate={updateTimeline} />

      {/* Summary Cards */}
      <SummaryCards
        summary={summary}
        currency={currency}
        planningPeriod={timeline?.planningPeriod ?? 'month'}
        hasData={hasData}
      />

      {/* Linked Data Info */}
      {hasLinkedData && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link2 className="w-4 h-4 text-primary" />
              <span>
                Подключено {generatedAdapterLines.length} статей из бизнес-модели ({businessType})
              </span>
              <Badge variant="outline" className="ml-auto">
                Автоматическое обновление
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch
            id="showPV"
            checked={showPV}
            onCheckedChange={setShowPV}
          />
          <Label htmlFor="showPV" className="flex items-center gap-1.5 cursor-pointer">
            <Calculator className="w-3.5 h-3.5" />
            PV
          </Label>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            id="showCumulative"
            checked={showCumulative}
            onCheckedChange={setShowCumulative}
          />
          <Label htmlFor="showCumulative" className="flex items-center gap-1.5 cursor-pointer">
            <TrendingUp className="w-3.5 h-3.5" />
            Накопительный
          </Label>
        </div>
      </div>

      {/* Main Grid */}
      <CashFlowGrid
        lines={allLinesWithValues}
        periodMetrics={periodMetrics}
        currency={currency}
        showPV={showPV}
        showCumulative={showCumulative}
        onUpdatePoint={updatePoint}
        onDeleteLine={deleteLine}
        
      />
    </div>
  );
});

CashFlowTimelineManager.displayName = 'CashFlowTimelineManager';
