import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, X, Eye } from "lucide-react";
import type { BusinessType } from "@/config/businessTypeMetrics";
import { useTranslation } from "@/i18n/useTranslation";

interface StartupChecklistProps {
  projectId: string | null;
  businessType: BusinessType;
}

interface ChecklistStep {
  id: string;
  labelKey: string;
}

const DEFAULT_STEPS: ChecklistStep[] = [
  { id: "products", labelKey: "startupChecklist.defaultProducts" },
  { id: "expenses", labelKey: "startupChecklist.defaultExpenses" },
  { id: "leads", labelKey: "startupChecklist.defaultLeads" },
  { id: "metrics", labelKey: "startupChecklist.defaultMetrics" },
  { id: "scenarios", labelKey: "startupChecklist.defaultScenarios" },
  { id: "summary", labelKey: "startupChecklist.defaultSummary" },
];

const STEPS_BY_TYPE: Partial<Record<BusinessType, ChecklistStep[]>> = {
  saas: [
    { id: "products", labelKey: "startupChecklist.saasProducts" },
    { id: "expenses", labelKey: "startupChecklist.saasExpenses" },
    { id: "leads", labelKey: "startupChecklist.saasLeads" },
    { id: "metrics", labelKey: "startupChecklist.saasMetrics" },
    { id: "scenarios", labelKey: "startupChecklist.saasScenarios" },
    { id: "summary", labelKey: "startupChecklist.saasSummary" },
  ],
  ecommerce: [
    { id: "products", labelKey: "startupChecklist.ecommerceProducts" },
    { id: "logistics", labelKey: "startupChecklist.ecommerceLogistics" },
    { id: "expenses", labelKey: "startupChecklist.ecommerceExpenses" },
    { id: "leads", labelKey: "startupChecklist.ecommerceLeads" },
    { id: "metrics", labelKey: "startupChecklist.ecommerceMetrics" },
    { id: "scenarios", labelKey: "startupChecklist.ecommerceScenarios" },
  ],
  production: [
    { id: "products", labelKey: "startupChecklist.productionProducts" },
    { id: "materials", labelKey: "startupChecklist.productionMaterials" },
    { id: "expenses", labelKey: "startupChecklist.productionExpenses" },
    { id: "leads", labelKey: "startupChecklist.productionLeads" },
    { id: "metrics", labelKey: "startupChecklist.productionMetrics" },
    { id: "scenarios", labelKey: "startupChecklist.productionScenarios" },
  ],
  services: [
    { id: "products", labelKey: "startupChecklist.servicesProducts" },
    { id: "expenses", labelKey: "startupChecklist.servicesExpenses" },
    { id: "leads", labelKey: "startupChecklist.servicesLeads" },
    { id: "quality", labelKey: "startupChecklist.servicesQuality" },
    { id: "metrics", labelKey: "startupChecklist.servicesMetrics" },
    { id: "scenarios", labelKey: "startupChecklist.servicesScenarios" },
  ],
  marketplace: [
    { id: "categories", labelKey: "startupChecklist.marketplaceCategories" },
    { id: "leads", labelKey: "startupChecklist.marketplaceLeads" },
    { id: "expenses", labelKey: "startupChecklist.marketplaceExpenses" },
    { id: "metrics", labelKey: "startupChecklist.marketplaceMetrics" },
    { id: "scenarios", labelKey: "startupChecklist.marketplaceScenarios" },
  ],
};

export const StartupChecklist = ({ projectId, businessType }: StartupChecklistProps) => {
  const { t } = useTranslation();

  const storageKey = useMemo(
    () => `startup-checklist:${projectId ?? "default"}`,
    [projectId]
  );

  const steps = useMemo(
    () => STEPS_BY_TYPE[businessType] ?? DEFAULT_STEPS,
    [businessType]
  );

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setChecked(parsed.checked ?? {});
        setDismissed(!!parsed.dismissed);
      } else {
        setChecked({});
        setDismissed(false);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  const persist = (next: { checked?: Record<string, boolean>; dismissed?: boolean }) => {
    try {
      const merged = {
        checked: next.checked ?? checked,
        dismissed: next.dismissed ?? dismissed,
      };
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch {
      // ignore
    }
  };

  const toggle = (id: string) => {
    const updated = { ...checked, [id]: !checked[id] };
    setChecked(updated);
    persist({ checked: updated });
  };

  const handleDismiss = () => {
    setDismissed(true);
    persist({ dismissed: true });
  };

  const handleShow = () => {
    setDismissed(false);
    persist({ dismissed: false });
  };

  const completedCount = steps.filter((s) => checked[s.id]).length;

  if (dismissed) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShow}
        className="text-muted-foreground"
      >
        <Eye className="w-3.5 h-3.5 mr-1.5" />
        {t("startupChecklist.showFull")}
      </Button>
    );
  }

  return (
    <Card className="border-dashed bg-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" />
              {t("startupChecklist.title")}
              <span className="text-xs font-normal text-muted-foreground">
                {t("startupChecklist.progress", {
                  done: completedCount,
                  total: steps.length,
                })}
              </span>
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {t("startupChecklist.description")}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleDismiss}
            aria-label={t("startupChecklist.dismiss")}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {steps.map((step, idx) => (
            <li key={step.id} className="flex items-start gap-2.5">
              <Checkbox
                id={`checklist-${step.id}`}
                checked={!!checked[step.id]}
                onCheckedChange={() => toggle(step.id)}
                className="mt-0.5"
              />
              <label
                htmlFor={`checklist-${step.id}`}
                className={`text-sm cursor-pointer leading-snug ${
                  checked[step.id] ? "line-through text-muted-foreground" : ""
                }`}
              >
                <span className="text-muted-foreground mr-1.5">{idx + 1}.</span>
                {t(step.labelKey)}
              </label>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
