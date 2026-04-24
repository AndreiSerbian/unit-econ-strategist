import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SubjectiveEstimateBadgeProps {
  className?: string;
  /** Optional shorter label override */
  label?: string;
}

/**
 * Neutral, lightweight badge for sections whose results depend on
 * user-provided assumptions or expert estimates rather than verified
 * external market data (competitors, market, SWOT, scoring, quality).
 *
 * Do NOT use on internal computed unit-economics metrics
 * (CAC, LTV, margin, revenue, profit, cash flow, scenarios).
 */
export const SubjectiveEstimateBadge = ({
  className,
  label = "Субъективная экспертная оценка",
}: SubjectiveEstimateBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 font-normal text-[11px] text-muted-foreground border-dashed cursor-help",
              className
            )}
          >
            <Info className="w-3 h-3" />
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px]">
          <p className="text-xs">
            Этот результат основан на введённых пользователем предположениях
            или экспертной оценке, а не на проверенных внешних рыночных данных.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
