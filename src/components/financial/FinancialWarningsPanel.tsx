import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import type { FinancialWarning, FinancialWarningCode } from "@/utils/financialWarnings";
import { trackFinancialEventOnce } from "@/utils/financialAnalytics";

type Severity = "info" | "warning" | "critical";

interface WarningMeta {
  severity: Severity;
  metricKey: string;
  reasonKey: string;
  actionKey: string;
}

// Presentation metadata only — detectFinancialWarnings() is untouched.
const WARNING_META: Record<FinancialWarningCode, WarningMeta> = {
  SERVICE_LABOR_DOUBLE_COUNT_RISK: {
    severity: "critical",
    metricKey: "financialWarnings.metricCogs",
    reasonKey: "financialWarnings.reasonLabor",
    actionKey: "financialWarnings.actionLabor",
  },
  LOGISTICS_DOUBLE_OR_TRIPLE_COUNT_RISK: {
    severity: "warning",
    metricKey: "financialWarnings.metricLogistics",
    reasonKey: "financialWarnings.reasonLogistics",
    actionKey: "financialWarnings.actionLogistics",
  },
};

const SEVERITY_ICON = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
};

interface FinancialWarningsPanelProps {
  warnings: FinancialWarning[];
  projectId: string | null;
}

export const FinancialWarningsPanel = ({ warnings, projectId }: FinancialWarningsPanelProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (warnings.length === 0) return;
    trackFinancialEventOnce("financial_warning_viewed", projectId, {
      count: warnings.length,
      codes: warnings.map((w) => w.code),
    });
  }, [warnings, projectId]);

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-3">
      {warnings.map((w) => {
        const meta = WARNING_META[w.code];
        const severity: Severity = meta?.severity ?? "info";
        const Icon = SEVERITY_ICON[severity];
        return (
          <Alert
            key={w.code}
            variant={severity === "critical" ? "destructive" : "default"}
            className={severity === "warning" ? "border-amber-500/50" : undefined}
          >
            <Icon className="h-4 w-4" />
            <AlertTitle className="flex flex-wrap items-center gap-2">
              <span>{t("financialWarnings.title")}</span>
              <Badge variant="outline">{t(`financialWarnings.severity_${severity}`)}</Badge>
              {meta && <Badge variant="secondary">{t(meta.metricKey)}</Badge>}
            </AlertTitle>
            <AlertDescription className="space-y-1 text-xs">
              <p>
                <span className="font-medium">{t("financialWarnings.reasonLabel")}: </span>
                {meta ? t(meta.reasonKey) : w.message}
              </p>
              <p>
                <span className="font-medium">{t("financialWarnings.actionLabel")}: </span>
                {meta ? t(meta.actionKey) : t("financialWarnings.actionGeneric")}
              </p>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};
