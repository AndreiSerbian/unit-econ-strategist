import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/i18n/useTranslation";
import { Lightbulb } from "lucide-react";
import {
  calculateProfitMargin,
  calculateLTVCACRatio,
} from "@/utils/metricsCalculations";
import type { TimelineSummary } from "@/components/cashflow-timeline/types";

interface RecommendationSummaryCardProps {
  metrics: any;
  cashflowSummary: TimelineSummary | null;
}

export const RecommendationSummaryCard = ({
  metrics,
  cashflowSummary,
}: RecommendationSummaryCardProps) => {
  const { t } = useTranslation();
  const hasMetrics =
    metrics && (metrics.revenue > 0 || metrics.totalClients > 0);

  if (!hasMetrics && !cashflowSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="w-4 h-4 text-primary" />
            {t("summary.recommendations")}
          </CardTitle>
          <CardDescription>{t("summary.notEnoughDataRecs")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const recs: Array<{ text: string; tag: string }> = [];

  if (hasMetrics) {
    const margin = calculateProfitMargin(metrics);
    const ltvCac = calculateLTVCACRatio(metrics);

    if (ltvCac > 0 && ltvCac < 3) {
      recs.push({
        tag: t("summary.tagLtvCac"),
        text: t("summary.recLtvCac"),
      });
    }
    if (margin < 10) {
      recs.push({
        tag: t("summary.tagMargin"),
        text: t("summary.recMargin"),
      });
    }
    if (metrics.totalClients > 0 && (metrics.newClients ?? 0) === 0) {
      recs.push({
        tag: t("summary.tagAcquisition"),
        text: t("summary.recAcquisition"),
      });
    }
    if (metrics.conversionRate !== undefined && metrics.conversionRate > 0 && metrics.conversionRate < 1) {
      recs.push({
        tag: t("summary.tagFunnel"),
        text: t("summary.recFunnel"),
      });
    }
  }

  if (cashflowSummary) {
    if (cashflowSummary.npv < 0) {
      recs.push({
        tag: t("summary.tagNpv"),
        text: t("summary.recNpv"),
      });
    }
    if (cashflowSummary.paybackPeriod === undefined) {
      recs.push({
        tag: t("summary.tagPayback"),
        text: t("summary.recPayback"),
      });
    }
  }

  if (hasMetrics) {
    recs.push({
      tag: t("summary.tagScenarios"),
      text: t("summary.recScenarios"),
    });
  }

  if (recs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="w-4 h-4 text-primary" />
            {t("summary.recommendations")}
          </CardTitle>
          <CardDescription>
            {t("summary.recsNone")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="w-4 h-4 text-primary" />
          {t("summary.recommendations")}
        </CardTitle>
        <CardDescription>
          {t("summary.recsDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {recs.map((r, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-md border bg-muted/20 p-2.5"
            >
              <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary rounded px-1.5 py-0.5 mt-0.5 shrink-0">
                {r.tag}
              </span>
              <span className="text-sm">{r.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
