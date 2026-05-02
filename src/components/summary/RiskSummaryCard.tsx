import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "@/i18n/useTranslation";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import {
  calculateProfitMargin,
  calculateLTVCACRatio,
} from "@/utils/metricsCalculations";
import type { TimelineSummary } from "@/components/cashflow-timeline/types";

interface RiskSummaryCardProps {
  metrics: any;
  cashflowSummary: TimelineSummary | null;
  weakestPeriodLabel: string | null;
  weakestPeriodValue: number | null;
}

interface Risk {
  level: "high" | "medium";
  text: string;
}

export const RiskSummaryCard = ({
  metrics,
  cashflowSummary,
  weakestPeriodLabel,
  weakestPeriodValue,
}: RiskSummaryCardProps) => {
  const { t } = useTranslation();
  const hasMetrics =
    metrics && (metrics.revenue > 0 || metrics.totalClients > 0);

  if (!hasMetrics && !cashflowSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="w-4 h-4 text-primary" />
            {t("summary.risks")}
          </CardTitle>
          <CardDescription>{t("summary.notEnoughDataRisks")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const risks: Risk[] = [];

  if (hasMetrics) {
    const margin = calculateProfitMargin(metrics);
    const ltvCac = calculateLTVCACRatio(metrics);

    if (margin < 0) {
      risks.push({ level: "high", text: t("summary.riskNegativeMargin") });
    } else if (margin < 10) {
      risks.push({ level: "medium", text: t("summary.riskLowMargin").replace("{value}", margin.toFixed(1)) });
    }

    if (ltvCac > 0 && ltvCac < 1) {
      risks.push({ level: "high", text: t("summary.riskCacAboveLtv") });
    } else if (ltvCac > 0 && ltvCac < 3) {
      risks.push({
        level: "medium",
        text: t("summary.riskLtvCacBelow").replace("{value}", ltvCac.toFixed(2)),
      });
    }

    if (metrics.totalClients > 0 && (metrics.newClients ?? 0) === 0) {
      risks.push({
        level: "medium",
        text: t("summary.riskNoNewClients"),
      });
    }

    if (metrics.conversionRate !== undefined && metrics.conversionRate > 0 && metrics.conversionRate < 1) {
      risks.push({
        level: "medium",
        text: t("summary.riskLowConversion").replace("{value}", metrics.conversionRate.toFixed(2)),
      });
    }
  }

  if (cashflowSummary) {
    if (cashflowSummary.npv < 0) {
      risks.push({ level: "high", text: t("summary.riskNegativeNpv") });
    }
    if (weakestPeriodValue !== null && weakestPeriodValue < 0 && weakestPeriodLabel) {
      risks.push({
        level: "medium",
        text: t("summary.riskCashGap").replace("{label}", weakestPeriodLabel),
      });
    }
    if (cashflowSummary.paybackPeriod === undefined) {
      risks.push({
        level: "medium",
        text: t("summary.riskPaybackMissing"),
      });
    }
  }

  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="w-4 h-4 text-success" />
            {t("summary.risks")}
          </CardTitle>
          <CardDescription>
            {t("summary.risksNone")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="w-4 h-4 text-primary" />
          {t("summary.risks")}
        </CardTitle>
        <CardDescription>
          {t("summary.risksDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {risks.map((r, i) => (
            <li
              key={i}
              className={`flex items-start gap-2 rounded-md border p-2.5 ${
                r.level === "high"
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-warning/40 bg-warning/5"
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  r.level === "high" ? "text-destructive" : "text-warning"
                }`}
              />
              <span className="text-sm">{r.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
