import { useEffect, useMemo } from "react";
import { useCashFlowTimeline } from "@/hooks/useCashFlowTimeline";
import { CompanySummaryCard } from "./CompanySummaryCard";
import { CashFlowSummaryCard } from "./CashFlowSummaryCard";
import { RiskSummaryCard } from "./RiskSummaryCard";
import { RecommendationSummaryCard } from "./RecommendationSummaryCard";

interface SummarySectionProps {
  metrics: any;
  projectId: string | null;
  currency: string;
}

/**
 * SummarySection owns a SINGLE useCashFlowTimeline instance and shares
 * its summary with all four summary cards. This avoids duplicate fetches
 * across cards and keeps the Cash Flow tab's own state independent.
 */
export const SummarySection = ({ metrics, projectId, currency }: SummarySectionProps) => {
  const {
    summary,
    periodMetrics,
    allLinesWithValues,
    loading,
    fetchTimeline,
  } = useCashFlowTimeline({ projectId });

  useEffect(() => {
    if (projectId) {
      fetchTimeline("current");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const { topInflowName, topOutflowName, weakestPeriodLabel, weakestPeriodValue } = useMemo(() => {
    // Top inflow / outflow lines (by sum across all periods)
    let topInflow: { name: string; total: number } | null = null;
    let topOutflow: { name: string; total: number } | null = null;

    for (const line of allLinesWithValues) {
      const total = (line.values || []).reduce((s: number, v: number) => s + (v || 0), 0);
      if (total <= 0) continue;
      if (line.lineType === "inflow") {
        if (!topInflow || total > topInflow.total) topInflow = { name: line.name, total };
      } else {
        if (!topOutflow || total > topOutflow.total) topOutflow = { name: line.name, total };
      }
    }

    // Weakest period = min net cash flow
    let weakestLabel: string | null = null;
    let weakestValue: number | null = null;
    for (const pm of periodMetrics) {
      if (weakestValue === null || pm.netCashFlow < weakestValue) {
        weakestValue = pm.netCashFlow;
        weakestLabel = pm.periodLabel;
      }
    }

    return {
      topInflowName: topInflow?.name ?? null,
      topOutflowName: topOutflow?.name ?? null,
      weakestPeriodLabel: weakestLabel,
      weakestPeriodValue: weakestValue,
    };
  }, [allLinesWithValues, periodMetrics]);

  const cashflowSummaryForRisk =
    summary && (summary.totalInflow !== 0 || summary.totalOutflow !== 0)
      ? summary
      : null;

  return (
    <div className="space-y-6">
      <CompanySummaryCard metrics={metrics} currency={currency} />
      <CashFlowSummaryCard
        summary={summary}
        topInflowName={topInflowName}
        topOutflowName={topOutflowName}
        weakestPeriodLabel={weakestPeriodLabel}
        weakestPeriodValue={weakestPeriodValue}
        currency={currency}
        loading={loading}
      />
      <RiskSummaryCard
        metrics={metrics}
        cashflowSummary={cashflowSummaryForRisk}
        weakestPeriodLabel={weakestPeriodLabel}
        weakestPeriodValue={weakestPeriodValue}
      />
      <RecommendationSummaryCard
        metrics={metrics}
        cashflowSummary={cashflowSummaryForRisk}
      />
    </div>
  );
};
