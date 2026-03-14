import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const STEPS = [
  { label: "Услуга", color: "bg-primary/15 text-primary border-primary/30" },
  { label: "Выручка", color: "bg-chart-2/15 text-chart-2 border-chart-2/30" },
  { label: "Себестоимость", color: "bg-destructive/15 text-destructive border-destructive/30" },
  { label: "Расходы", color: "bg-warning/15 text-warning border-warning/30" },
  { label: "Прибыль", color: "bg-success/15 text-success border-success/30" },
  { label: "Юнит-экономика", color: "bg-accent/15 text-accent-foreground border-accent/30" },
];

export const ServiceFlowExplainer = () => {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground mb-3">
          Как данные по услугам формируют общую финансовую модель:
        </p>
        <div className="flex items-center gap-1 flex-wrap justify-center">
          {STEPS.map((step, idx) => (
            <div key={step.label} className="flex items-center gap-1">
              <div
                className={`px-3 py-1.5 rounded-md text-xs font-medium border ${step.color}`}
              >
                {step.label}
              </div>
              {idx < STEPS.length - 1 && (
                <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
