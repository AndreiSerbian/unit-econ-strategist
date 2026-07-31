import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { BusinessType } from "@/config/businessTypeMetrics";
import { isIncompleteBusinessType } from "@/config/incompleteBusinessTypes";
import { trackFinancialEventOnce } from "@/utils/financialAnalytics";

interface IncompleteModelNoticeProps {
  businessType: BusinessType;
  projectId: string | null;
}

/**
 * Financial Safety Guardrails v1 — limitation notice for business models with
 * incomplete financial integrations. Display only; no formula is affected.
 */
export const IncompleteModelNotice = ({ businessType, projectId }: IncompleteModelNoticeProps) => {
  const { t } = useTranslation();
  const incomplete = isIncompleteBusinessType(businessType);

  useEffect(() => {
    if (!incomplete) return;
    trackFinancialEventOnce("incomplete_model_warning_viewed", projectId, { businessType });
  }, [incomplete, businessType, projectId]);

  if (!incomplete) return null;

  return (
    <Alert className="border-amber-500/50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{t("financialSafety.incompleteTitle")}</AlertTitle>
      <AlertDescription className="text-xs">
        {t("financialSafety.incompleteMessage")}
      </AlertDescription>
    </Alert>
  );
};
