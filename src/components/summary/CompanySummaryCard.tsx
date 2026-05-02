import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import {
  calculateProfit,
  calculateProfitMargin,
  calculateCAC,
  calculateLTV,
  calculateLTVCACRatio,
} from "@/utils/metricsCalculations";
import { MetricInfoTooltip } from "@/components/ui/metric-info-tooltip";

interface CompanySummaryCardProps {
  metrics: any;
  currency: string;
}

const fmt = (v: number, currency: string) => {
  if (!isFinite(v)) return "—";
  return `${Math.round(v).toLocaleString("ru-RU")} ${currency}`;
};

const fmtNum = (v: number) => {
  if (!isFinite(v)) return "—";
  return Math.round(v).toLocaleString("ru-RU");
};

const fmtPct = (v: number) => {
  if (!isFinite(v)) return "—";
  return `${v.toFixed(1)}%`;
};

const fmtRatio = (v: number) => {
  if (!isFinite(v) || v === 0) return "—";
  return `${v.toFixed(2)}×`;
};

export const CompanySummaryCard = ({ metrics, currency }: CompanySummaryCardProps) => {
  const hasMetrics = !!metrics && metrics.revenue !== undefined;

  if (!hasMetrics || (metrics.revenue === 0 && metrics.totalClients === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-4 h-4 text-primary" />
            {t("summary.company")}
          </CardTitle>
          <CardDescription>Недостаточно данных. Заполните вкладку «Моя компания».</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const profit = calculateProfit(metrics);
  const margin = calculateProfitMargin(metrics);
  const cac = calculateCAC(metrics);
  const ltv = calculateLTV(metrics);
  const ltvCac = calculateLTVCACRatio(metrics);

  const kpis: Array<{ label: string; value: string; hint?: string; tooltipKey?: string }> = [
    { label: "Выручка", value: fmt(metrics.revenue || 0, currency), tooltipKey: "revenue" },
    { label: "Прибыль", value: fmt(profit, currency), tooltipKey: "profit" },
    { label: "Маржа", value: fmtPct(margin), tooltipKey: "margin" },
    { label: "CAC", value: cac > 0 ? fmt(cac, currency) : "Недостаточно данных", tooltipKey: "cac" },
    { label: "LTV", value: ltv > 0 ? fmt(ltv, currency) : "Недостаточно данных", tooltipKey: "ltv" },
    { label: "LTV / CAC", value: fmtRatio(ltvCac), tooltipKey: "ltvCac" },
    { label: "Всего клиентов", value: fmtNum(metrics.totalClients || 0), tooltipKey: "totalClients" },
    { label: "Средний чек", value: fmt(metrics.avgCheck || 0, currency), tooltipKey: "avgCheck" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="w-4 h-4 text-primary" />
          {t("summary.company")}
        </CardTitle>
        <CardDescription>
          Сводные показатели текущего сценария на основе введённых данных.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="rounded-md border bg-muted/20 p-3 flex flex-col gap-1"
            >
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <span>{k.label}</span>
                {k.tooltipKey && <MetricInfoTooltip metricKey={k.tooltipKey} />}
              </div>
              <div className="text-sm font-semibold">{k.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
