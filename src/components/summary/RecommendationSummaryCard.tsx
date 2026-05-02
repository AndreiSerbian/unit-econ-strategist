import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
          <CardDescription>Недостаточно данных для рекомендаций.</CardDescription>
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
        tag: "LTV/CAC",
        text: "Снизить CAC или увеличить LTV: повысить retention, средний чек или частоту покупок.",
      });
    }
    if (margin < 10) {
      recs.push({
        tag: "Маржа",
        text: "Пересмотреть структуру переменных расходов и переговорить условия с поставщиками.",
      });
    }
    if (metrics.totalClients > 0 && (metrics.newClients ?? 0) === 0) {
      recs.push({
        tag: "Привлечение",
        text: "Активизировать каналы привлечения и проверить эффективность маркетинга.",
      });
    }
    if (metrics.conversionRate !== undefined && metrics.conversionRate > 0 && metrics.conversionRate < 1) {
      recs.push({
        tag: "Воронка",
        text: "Низкая конверсия — улучшить квалификацию лидов и точки контакта.",
      });
    }
  }

  if (cashflowSummary) {
    if (cashflowSummary.npv < 0) {
      recs.push({
        tag: "NPV",
        text: "Пересмотреть допущения сценария или горизонт планирования: при текущих параметрах проект не окупается.",
      });
    }
    if (cashflowSummary.paybackPeriod === undefined) {
      recs.push({
        tag: "Окупаемость",
        text: "Сократить начальные оттоки или ускорить рост притоков, чтобы достичь окупаемости в горизонте.",
      });
    }
  }

  if (hasMetrics) {
    recs.push({
      tag: "Сценарии",
      text: "Сравните оптимистичный и пессимистичный сценарии в блоке ниже, чтобы оценить чувствительность.",
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
            Метрики в норме. Сосредоточьтесь на масштабировании текущей модели.
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
          Автоматические рекомендации, привязанные к конкретным метрикам.
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
