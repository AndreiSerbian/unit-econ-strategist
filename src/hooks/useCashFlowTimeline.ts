// Hook for Cash Flow Timeline management
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  CashFlowTimeline,
  CashFlowLine,
  CashFlowPoint,
  PeriodMetrics,
  TimelineSummary,
  PlanningPeriod,
  ScenarioType,
  LineType,
  LineCategory,
  AdapterLine,
} from '@/components/cashflow-timeline/types';
import {
  getPeriodicRate,
  computePresentValue,
  generatePeriodLabels,
} from '@/components/cashflow-timeline/types';

interface UseCashFlowTimelineProps {
  projectId: string | null;
}

export function useCashFlowTimeline({ projectId }: UseCashFlowTimelineProps) {
  const [timeline, setTimeline] = useState<CashFlowTimeline | null>(null);
  const [lines, setLines] = useState<CashFlowLine[]>([]);
  const [points, setPoints] = useState<CashFlowPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [adapterLines, setAdapterLines] = useState<AdapterLine[]>([]);

  // ============================================================
  // FETCH
  // ============================================================
  const fetchTimeline = useCallback(async (scenarioType: ScenarioType = 'current') => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // Fetch or create timeline
      let { data: existing, error } = await supabase
        .from('cashflow_timelines')
        .select('*')
        .eq('project_id', projectId)
        .eq('scenario_type', scenarioType)
        .maybeSingle();

      if (error) throw error;

      if (!existing) {
        // Create default timeline
        const { data: created, error: createError } = await supabase
          .from('cashflow_timelines')
          .insert({
            project_id: projectId,
            scenario_type: scenarioType,
            name: 'Основной таймлайн',
            planning_period: 'month',
            horizon_periods: 12,
            discount_rate_annual: 10,
          })
          .select()
          .single();

        if (createError) throw createError;
        existing = created;
      }

      const tl: CashFlowTimeline = {
        id: existing.id,
        projectId: existing.project_id,
        scenarioType: existing.scenario_type as ScenarioType,
        name: existing.name,
        planningPeriod: existing.planning_period as PlanningPeriod,
        horizonPeriods: existing.horizon_periods,
        discountRateAnnual: Number(existing.discount_rate_annual),
        startDate: existing.start_date,
        createdAt: existing.created_at,
        updatedAt: existing.updated_at,
      };
      setTimeline(tl);

      // Fetch lines
      const { data: linesData, error: linesError } = await supabase
        .from('cashflow_lines')
        .select('*')
        .eq('timeline_id', tl.id)
        .order('sort_order');

      if (linesError) throw linesError;

      const fetchedLines: CashFlowLine[] = (linesData || []).map(l => ({
        id: l.id,
        timelineId: l.timeline_id,
        name: l.name,
        lineType: l.line_type as LineType,
        category: l.category as LineCategory,
        source: l.source as 'manual' | 'linked',
        sourceAdapter: l.source_adapter as any,
        formulaConfig: l.formula_config as any,
        sortOrder: l.sort_order,
        isActive: l.is_active,
        createdAt: l.created_at,
        updatedAt: l.updated_at,
      }));
      setLines(fetchedLines);

      // Fetch points for all lines
      if (fetchedLines.length > 0) {
        const lineIds = fetchedLines.map(l => l.id);
        const { data: pointsData, error: pointsError } = await supabase
          .from('cashflow_points')
          .select('*')
          .in('line_id', lineIds)
          .order('period_index');

        if (pointsError) throw pointsError;

        const fetchedPoints: CashFlowPoint[] = (pointsData || []).map(p => ({
          id: p.id,
          lineId: p.line_id,
          periodIndex: p.period_index,
          amount: Number(p.amount),
          isOverride: p.is_override,
          notes: p.notes,
          createdAt: p.created_at,
        }));
        setPoints(fetchedPoints);
      } else {
        setPoints([]);
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
      toast.error('Ошибка загрузки таймлайна');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // ============================================================
  // UPDATE TIMELINE SETTINGS
  // ============================================================
  const updateTimeline = useCallback(async (updates: Partial<CashFlowTimeline>) => {
    if (!timeline) return;

    try {
      const { error } = await supabase
        .from('cashflow_timelines')
        .update({
          planning_period: updates.planningPeriod,
          horizon_periods: updates.horizonPeriods,
          discount_rate_annual: updates.discountRateAnnual,
          start_date: updates.startDate,
          name: updates.name,
        })
        .eq('id', timeline.id);

      if (error) throw error;

      setTimeline(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Настройки обновлены');
    } catch (err) {
      console.error('Error updating timeline:', err);
      toast.error('Ошибка обновления');
    }
  }, [timeline]);

  // ============================================================
  // ADD/UPDATE/DELETE LINES
  // ============================================================
  const addLine = useCallback(async (line: Omit<CashFlowLine, 'id' | 'timelineId' | 'createdAt' | 'updatedAt'>) => {
    if (!timeline) return;

    try {
      const { data, error } = await supabase
        .from('cashflow_lines')
        .insert({
          timeline_id: timeline.id,
          name: line.name,
          line_type: line.lineType,
          category: line.category,
          source: line.source,
          source_adapter: line.sourceAdapter,
          formula_config: line.formulaConfig,
          sort_order: lines.length,
          is_active: line.isActive ?? true,
        })
        .select()
        .single();

      if (error) throw error;

      const newLine: CashFlowLine = {
        id: data.id,
        timelineId: data.timeline_id,
        name: data.name,
        lineType: data.line_type as LineType,
        category: data.category as LineCategory,
        source: data.source as 'manual' | 'linked',
        sourceAdapter: data.source_adapter as any,
        formulaConfig: data.formula_config as any,
        sortOrder: data.sort_order,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      setLines(prev => [...prev, newLine]);
      toast.success('Статья добавлена');
      return newLine;
    } catch (err) {
      console.error('Error adding line:', err);
      toast.error('Ошибка добавления');
    }
  }, [timeline, lines.length]);

  const updateLine = useCallback(async (lineId: string, updates: Partial<CashFlowLine>) => {
    try {
      const { error } = await supabase
        .from('cashflow_lines')
        .update({
          name: updates.name,
          line_type: updates.lineType,
          category: updates.category,
          is_active: updates.isActive,
        })
        .eq('id', lineId);

      if (error) throw error;

      setLines(prev => prev.map(l => l.id === lineId ? { ...l, ...updates } : l));
    } catch (err) {
      console.error('Error updating line:', err);
      toast.error('Ошибка обновления');
    }
  }, []);

  const deleteLine = useCallback(async (lineId: string) => {
    try {
      const { error } = await supabase
        .from('cashflow_lines')
        .delete()
        .eq('id', lineId);

      if (error) throw error;

      setLines(prev => prev.filter(l => l.id !== lineId));
      setPoints(prev => prev.filter(p => p.lineId !== lineId));
      toast.success('Статья удалена');
    } catch (err) {
      console.error('Error deleting line:', err);
      toast.error('Ошибка удаления');
    }
  }, []);

  // ============================================================
  // UPDATE POINTS
  // ============================================================
  const updatePoint = useCallback(async (lineId: string, periodIndex: number, amount: number) => {
    try {
      // Upsert point
      const existingPoint = points.find(p => p.lineId === lineId && p.periodIndex === periodIndex);
      
      if (existingPoint) {
        const { error } = await supabase
          .from('cashflow_points')
          .update({ amount, is_override: true })
          .eq('id', existingPoint.id);

        if (error) throw error;

        setPoints(prev => prev.map(p => 
          p.id === existingPoint.id ? { ...p, amount, isOverride: true } : p
        ));
      } else {
        const { data, error } = await supabase
          .from('cashflow_points')
          .insert({
            line_id: lineId,
            period_index: periodIndex,
            amount,
            is_override: true,
          })
          .select()
          .single();

        if (error) throw error;

        const newPoint: CashFlowPoint = {
          id: data.id,
          lineId: data.line_id,
          periodIndex: data.period_index,
          amount: Number(data.amount),
          isOverride: data.is_override,
          notes: data.notes,
          createdAt: data.created_at,
        };
        setPoints(prev => [...prev, newPoint]);
      }
    } catch (err) {
      console.error('Error updating point:', err);
      toast.error('Ошибка обновления');
    }
  }, [points]);

  // ============================================================
  // APPLY ADAPTER LINES (from business model)
  // ============================================================
  const applyAdapterLines = useCallback((newAdapterLines: AdapterLine[]) => {
    setAdapterLines(newAdapterLines);
  }, []);

  // ============================================================
  // COMPUTATIONS
  // ============================================================
  const periodMetrics = useMemo((): PeriodMetrics[] => {
    if (!timeline) return [];

    const horizonPeriods = timeline.horizonPeriods;
    const periodLabels = generatePeriodLabels(timeline.planningPeriod, horizonPeriods, timeline.startDate);
    const periodRate = getPeriodicRate(timeline.discountRateAnnual, timeline.planningPeriod);

    const metrics: PeriodMetrics[] = [];
    let cumulativeCF = 0;

    for (let p = 0; p < horizonPeriods; p++) {
      let totalInflow = 0;
      let totalOutflow = 0;

      // Sum from manual lines
      for (const line of lines) {
        if (!line.isActive) continue;
        const point = points.find(pt => pt.lineId === line.id && pt.periodIndex === p);
        const amount = point?.amount ?? 0;

        if (line.lineType === 'inflow') {
          totalInflow += amount;
        } else {
          totalOutflow += amount;
        }
      }

      // Sum from adapter lines (linked from business models)
      for (const adapterLine of adapterLines) {
        const amount = adapterLine.values[p] ?? 0;
        if (adapterLine.lineType === 'inflow') {
          totalInflow += amount;
        } else {
          totalOutflow += amount;
        }
      }

      const netCashFlow = totalInflow - totalOutflow;
      cumulativeCF += netCashFlow;
      const presentValue = computePresentValue(netCashFlow, p, periodRate);

      metrics.push({
        periodIndex: p,
        periodLabel: periodLabels[p],
        totalInflow,
        totalOutflow,
        netCashFlow,
        cumulativeCashFlow: cumulativeCF,
        presentValue,
      });
    }

    return metrics;
  }, [timeline, lines, points, adapterLines]);

  const summary = useMemo((): TimelineSummary => {
    const totalInflow = periodMetrics.reduce((sum, m) => sum + m.totalInflow, 0);
    const totalOutflow = periodMetrics.reduce((sum, m) => sum + m.totalOutflow, 0);
    const netCashFlow = totalInflow - totalOutflow;
    const npv = periodMetrics.reduce((sum, m) => sum + m.presentValue, 0);

    // Payback period (simple)
    let paybackPeriod: number | undefined;
    for (const m of periodMetrics) {
      if (m.cumulativeCashFlow >= 0) {
        paybackPeriod = m.periodIndex;
        break;
      }
    }

    return {
      totalInflow,
      totalOutflow,
      netCashFlow,
      npv,
      paybackPeriod,
    };
  }, [periodMetrics]);

  // ============================================================
  // HELPERS
  // ============================================================
  const getPointValue = useCallback((lineId: string, periodIndex: number): number => {
    const point = points.find(p => p.lineId === lineId && p.periodIndex === periodIndex);
    return point?.amount ?? 0;
  }, [points]);

  const getAllLinesWithValues = useMemo(() => {
    // Combine manual lines with adapter lines for display
    const manualLinesWithValues = lines.map(line => ({
      ...line,
      values: Array.from({ length: timeline?.horizonPeriods ?? 12 }, (_, i) => getPointValue(line.id, i)),
      isManual: true,
    }));

    const linkedLines = adapterLines.map((al, idx) => ({
      id: `adapter-${idx}`,
      timelineId: timeline?.id ?? '',
      name: al.name,
      lineType: al.lineType,
      category: al.category,
      source: 'linked' as const,
      sourceAdapter: al.sourceAdapter,
      sortOrder: 1000 + idx,
      isActive: true,
      createdAt: '',
      updatedAt: '',
      values: al.values,
      isManual: false,
    }));

    return [...manualLinesWithValues, ...linkedLines];
  }, [lines, adapterLines, timeline, getPointValue]);

  return {
    timeline,
    lines,
    points,
    loading,
    adapterLines,
    periodMetrics,
    summary,
    allLinesWithValues: getAllLinesWithValues,
    fetchTimeline,
    updateTimeline,
    addLine,
    updateLine,
    deleteLine,
    updatePoint,
    applyAdapterLines,
    getPointValue,
  };
}
