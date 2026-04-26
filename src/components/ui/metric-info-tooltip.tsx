import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { getSummaryTooltip } from "@/config/summaryMetricTooltips";
import { cn } from "@/lib/utils";

interface MetricInfoTooltipProps {
  /** Optional key into SUMMARY_METRIC_TOOLTIPS. If provided, fields are auto-filled. */
  metricKey?: string;
  title?: string;
  description?: string;
  formula?: string;
  source?: string;
  className?: string;
  iconClassName?: string;
}

/**
 * Small inline Info icon with a compact tooltip describing a metric:
 * what it is, the formula, and where the data comes from in the project.
 *
 * Fails safely: if neither metricKey nor explicit content resolves,
 * renders nothing instead of breaking layout.
 */
export const MetricInfoTooltip = ({
  metricKey,
  title,
  description,
  formula,
  source,
  className,
  iconClassName,
}: MetricInfoTooltipProps) => {
  const preset = metricKey ? getSummaryTooltip(metricKey) : undefined;
  const t = {
    title: title ?? preset?.title,
    description: description ?? preset?.description,
    formula: formula ?? preset?.formula,
    source: source ?? preset?.source,
  };

  if (!t.title && !t.description) return null;

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={t.title ? `Подсказка: ${t.title}` : "Подсказка"}
          className={cn(
            "inline-flex items-center justify-center text-muted-foreground/70 hover:text-foreground focus:text-foreground focus:outline-none align-middle",
            className
          )}
        >
          <Info className={cn("w-3 h-3", iconClassName)} aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        className="max-w-xs text-xs leading-snug space-y-1.5 p-3"
      >
        {t.title && (
          <div className="font-semibold text-[12px]">{t.title}</div>
        )}
        {t.description && (
          <div className="text-muted-foreground">{t.description}</div>
        )}
        {t.formula && (
          <div className="font-mono text-[11px] bg-muted text-foreground rounded px-1.5 py-1">
            {t.formula}
          </div>
        )}
        {t.source && (
          <div className="text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">Источник: </span>
            {t.source}
          </div>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

export default MetricInfoTooltip;
