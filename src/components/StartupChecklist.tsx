import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, X, Eye } from "lucide-react";
import type { BusinessType } from "@/config/businessTypeMetrics";

interface StartupChecklistProps {
  projectId: string | null;
  businessType: BusinessType;
}

interface ChecklistStep {
  id: string;
  label: string;
}

const DEFAULT_STEPS: ChecklistStep[] = [
  { id: "products", label: "Добавить продукты или услуги (вкладка «Моя компания»)" },
  { id: "expenses", label: "Заполнить расходы (постоянные и переменные)" },
  { id: "leads", label: "Указать источники привлечения клиентов" },
  { id: "metrics", label: "Проверить рассчитанные показатели (вкладка «Показатели»)" },
  { id: "scenarios", label: "Сравнить сценарии в разделе «Итоги»" },
  { id: "summary", label: "Открыть вкладку «Итоги» для общего вывода" },
];

const STEPS_BY_TYPE: Partial<Record<BusinessType, ChecklistStep[]>> = {
  saas: [
    { id: "products", label: "Добавить SaaS-продукт и тарифы" },
    { id: "expenses", label: "Заполнить расходы (постоянные и переменные)" },
    { id: "leads", label: "Указать источники лидов и стоимость трафика" },
    { id: "metrics", label: "Проверить показатели: MRR, churn, LTV/CAC" },
    { id: "scenarios", label: "Сравнить сценарии: текущий, оптимистичный, пессимистичный" },
    { id: "summary", label: "Открыть вкладку «Итоги»" },
  ],
  ecommerce: [
    { id: "products", label: "Добавить товары (цена, себестоимость, объём продаж)" },
    { id: "logistics", label: "Заполнить сырьё и логистику (если применимо)" },
    { id: "expenses", label: "Указать постоянные и переменные расходы" },
    { id: "leads", label: "Добавить источники лидов" },
    { id: "metrics", label: "Проверить показатели и маржинальность" },
    { id: "scenarios", label: "Сравнить сценарии в «Итогах»" },
  ],
  production: [
    { id: "products", label: "Добавить производимые товары" },
    { id: "materials", label: "Заполнить сырьё, материалы и логистику" },
    { id: "expenses", label: "Указать постоянные и переменные расходы" },
    { id: "leads", label: "Добавить каналы продаж и источники лидов" },
    { id: "metrics", label: "Проверить себестоимость и маржу" },
    { id: "scenarios", label: "Сравнить сценарии в «Итогах»" },
  ],
  services: [
    { id: "products", label: "Добавить услуги и модели биллинга (час/проект/ретейнер)" },
    { id: "expenses", label: "Указать расходы и фонд оплаты труда" },
    { id: "leads", label: "Добавить источники лидов" },
    { id: "quality", label: "Оценить качество услуг (вкладка «Рынок»)" },
    { id: "metrics", label: "Проверить utilization и эффективную ставку" },
    { id: "scenarios", label: "Сравнить сценарии в «Итогах»" },
  ],
  marketplace: [
    { id: "categories", label: "Добавить категории и take rate" },
    { id: "leads", label: "Указать источники привлечения" },
    { id: "expenses", label: "Заполнить операционные расходы" },
    { id: "metrics", label: "Проверить GMV, take rate, маржу" },
    { id: "scenarios", label: "Сравнить сценарии в «Итогах»" },
  ],
};

export const StartupChecklist = ({ projectId, businessType }: StartupChecklistProps) => {
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
        Показать чеклист «Что заполнить сначала»
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
              Что заполнить сначала
              <span className="text-xs font-normal text-muted-foreground">
                ({completedCount}/{steps.length})
              </span>
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Подсказка для быстрого старта. Отметки ставятся вручную и не
              влияют на расчёты.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleDismiss}
            aria-label="Скрыть чеклист"
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
                {step.label}
              </label>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
