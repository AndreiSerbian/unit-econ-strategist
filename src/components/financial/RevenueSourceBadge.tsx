import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/useTranslation";
import { Sparkles, PencilLine } from "lucide-react";

interface RevenueSourceBadgeProps {
  source?: "auto" | "manual";
  className?: string;
}

/**
 * Small badge showing which revenue source is currently active.
 * Rendered next to revenue totals. Display only.
 */
export const RevenueSourceBadge = ({ source, className }: RevenueSourceBadgeProps) => {
  const { t } = useTranslation();
  const effective = source === "manual" ? "manual" : "auto";
  const Icon = effective === "manual" ? PencilLine : Sparkles;
  return (
    <Badge variant="outline" className={`gap-1 text-[10px] font-normal ${className ?? ""}`}>
      <Icon className="h-3 w-3" />
      {effective === "manual"
        ? t("financialSafety.sourceManualShort")
        : t("financialSafety.sourceAutoShort")}
    </Badge>
  );
};
