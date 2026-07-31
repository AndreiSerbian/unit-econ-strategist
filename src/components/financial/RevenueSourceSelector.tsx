import { useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { useTranslation } from "@/i18n/useTranslation";
import { trackFinancialEvent } from "@/utils/financialAnalytics";

interface RevenueSourceSelectorProps {
  scenario: "current" | "scenarioA" | "scenarioB";
  source?: "auto" | "manual";
  manualOverride?: number;
  displayedRevenue: number;
  currency: string;
  onChange: (source: "auto" | "manual", manualOverride?: number) => void;
}

/**
 * Financial Safety Guardrails v1 — explicit revenue source selection.
 * Purely a UI control over the existing `revenueSource` /
 * `manualRevenueOverride` fields; no revenue formula lives here.
 */
export const RevenueSourceSelector = ({
  scenario,
  source,
  manualOverride,
  displayedRevenue,
  currency,
  onChange,
}: RevenueSourceSelectorProps) => {
  const { t } = useTranslation();
  const effective: "auto" | "manual" = source === "manual" ? "manual" : "auto";

  const handleSourceChange = useCallback(
    (value: string) => {
      const next = value === "manual" ? "manual" : "auto";
      if (next === "manual") {
        // Seed the override with the currently displayed revenue so the user
        // never lands on an empty / zero value.
        const seeded =
          manualOverride === undefined || manualOverride === null || manualOverride === 0
            ? displayedRevenue
            : manualOverride;
        onChange("manual", seeded);
      } else {
        onChange("auto", manualOverride);
      }
      trackFinancialEvent("revenue_source_selected", { scenario, source: next });
    },
    [manualOverride, displayedRevenue, onChange, scenario],
  );

  const handleManualValue = useCallback(
    (value: number | null) => {
      onChange("manual", value ?? 0);
    },
    [onChange],
  );

  return (
    <div className="rounded-md border border-border/60 p-3 space-y-3">
      <p className="text-xs font-medium">{t("financialSafety.revenueSourceTitle")}</p>
      <RadioGroup value={effective} onValueChange={handleSourceChange} className="space-y-2">
        <div className="flex items-start gap-2">
          <RadioGroupItem value="auto" id={`rev-auto-${scenario}`} className="mt-0.5" />
          <Label htmlFor={`rev-auto-${scenario}`} className="text-xs font-normal cursor-pointer">
            {t("financialSafety.sourceAuto")}
          </Label>
        </div>
        <div className="flex items-start gap-2">
          <RadioGroupItem value="manual" id={`rev-manual-${scenario}`} className="mt-0.5" />
          <Label htmlFor={`rev-manual-${scenario}`} className="text-xs font-normal cursor-pointer">
            {t("financialSafety.sourceManual")}
          </Label>
        </div>
      </RadioGroup>

      {effective === "manual" && (
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">
            {t("financialSafety.manualValueLabel")} ({currency})
          </Label>
          <NumericInput
            value={manualOverride ?? displayedRevenue}
            onChange={handleManualValue}
          />
          <p className="text-[11px] text-muted-foreground">
            {t("financialSafety.manualHint")}
          </p>
        </div>
      )}
    </div>
  );
};
