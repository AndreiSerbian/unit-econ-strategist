import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import type { TimelineSummary } from "@/components/cashflow-timeline/types";

interface CashFlowSummaryCardProps {
  summary: TimelineSummary | null;
  topInflowName: string | null;
  topOutflowName: string | null;
  weakestPeriodLabel: string | null;
  weakestPeriodValue: number | null;
  currency: string;
  loading: boolean;
}

const fmt = (v: number, currency: string) => {
  if (!isFinite(v)) return "—";
  return `${Math.round(v).toLocaleString("ru-RU")} ${currency}`;
};

export const CashFlowSummaryCard = ({
  summary,
  topInflowName,
  topOutflowName,
  weakestPeriodLabel,
  weakestPeriodValue,
  currency,
  loading,
}: CashFlowSummaryCardProps) => {
  const hasData =
    summary &&
    (summary.totalInflow !== 0 || summary.totalOutflow !== 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="w-4 h-4 text-primary" />
            Итоги по Cash Flow
          </CardTitle>
          <CardDescription>Загрузка…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="w-4 h-4 text-primary" />
            Итоги по Cash Flow
          </CardTitle>
          <CardDescription>
            Недостаточно данных. Перейдите на вкладку «Cash Flow» и заполните
            значения по периодам.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const items: Array<{ label: string; value: string; tone?: "positive" | "negative" }> = [
    { label: "Всего притоков", value: fmt(summary!.totalInflow, currency), tone: "positive" },
    { label: "Всего оттоков", value: fmt(summary!.totalOutflow, currency), tone: "negative" },
    {
      label: "Чистый денежный поток",
      value: fmt(summary!.netCashFlow, currency),
      tone: summary!.netCashFlow >= 0 ? "positive" : "negative",
    },
    {
      label: "NPV (приведённая ценность)",
      value: fmt(summary!.npv, currency),
      tone: summary!.npv >= 0 ? "positive" : "negative",
    },
    {
      label: "Окупаемость",
      value:
        summary!.paybackPeriod !== undefined
          ? `${summary!.paybackPeriod + 1} периодов`
          : "Не достигнута",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Wallet className="w-4 h-4 text-primary" />
          Итоги по Cash Flow
        </CardTitle>
        <CardDescription>
          Сводка по таймлайну текущего сценария.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {items.map((it) => (
            <div
              key={it.label}
              className="rounded-md border bg-muted/20 p-3 flex flex-col gap-1"
            >
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {it.label}
              </div>
              <div
                className={`text-sm font-semibold ${
                  it.tone === "positive"
                    ? "text-success"
                    : it.tone === "negative"
                    ? "text-destructive"
                    : ""
                }`}
              >
                {it.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-success mt-0.5" />
            <div>
              <div className="text-[11px] text-muted-foreground">Главный источник притока</div>
              <div className="text-sm font-medium">{topInflowName ?? "—"}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <TrendingDown className="w-4 h-4 text-destructive mt-0.5" />
            <div>
              <div className="text-[11px] text-muted-foreground">Главная статья оттока</div>
              <div className="text-sm font-medium">{topOutflowName ?? "—"}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-[11px] text-muted-foreground">Самый слабый период</div>
              <div className="text-sm font-medium">
                {weakestPeriodLabel
                  ? `${weakestPeriodLabel} (${
                      weakestPeriodValue !== null ? fmt(weakestPeriodValue, currency) : "—"
                    })`
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
