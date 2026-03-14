import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ArrowRight, MapPin } from "lucide-react";

interface PipelineStage {
  id: string;
  from: string;
  to: string;
  cost: number;
  timeHours: number;
  enabled: boolean;
  comment: string;
}

const DEFAULT_STAGES: PipelineStage[] = [
  { id: "lead_sale", from: "Лид", to: "Продажа", cost: 0, timeHours: 0, enabled: true, comment: "" },
  { id: "sale_exec", from: "Продажа", to: "Выполнение", cost: 0, timeHours: 0, enabled: true, comment: "" },
  { id: "exec_support", from: "Выполнение", to: "Поддержка", cost: 0, timeHours: 0, enabled: true, comment: "" },
  { id: "support_escort", from: "Поддержка", to: "Сопровождение", cost: 0, timeHours: 0, enabled: false, comment: "" },
];

interface ServiceDeliveryPipelineProps {
  currency: string;
}

export const ServiceDeliveryPipeline = ({ currency }: ServiceDeliveryPipelineProps) => {
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_STAGES);

  const updateStage = (id: string, updates: Partial<PipelineStage>) => {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const totalCost = stages.filter((s) => s.enabled).reduce((sum, s) => sum + s.cost, 0);
  const totalTime = stages.filter((s) => s.enabled).reduce((sum, s) => sum + s.timeHours, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Структура оказания услуги
        </CardTitle>
        <CardDescription>
          Помогает разложить процесс работы по этапам: от привлечения клиента до выполнения
          и дальнейшего сопровождения. Это позволяет лучше понимать, где возникают затраты и как
          строится экономика услуги.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual pipeline */}
        <div className="flex items-center gap-1 flex-wrap justify-center mb-6">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-1">
              {idx === 0 && (
                <div
                  className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                    stage.enabled
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {stage.from}
                </div>
              )}
              <ArrowRight
                className={`w-4 h-4 shrink-0 ${
                  stage.enabled ? "text-primary" : "text-muted-foreground/30"
                }`}
              />
              <div
                className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                  stage.enabled
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted border-border text-muted-foreground"
                }`}
              >
                {stage.to}
              </div>
            </div>
          ))}
        </div>

        {/* Stage details */}
        <div className="space-y-3">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className={`p-3 border rounded-lg transition-colors ${
                stage.enabled ? "bg-card" : "bg-muted/30 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Label className="font-medium text-sm">
                  {stage.from} → {stage.to}
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Включён</span>
                  <Switch
                    checked={stage.enabled}
                    onCheckedChange={(v) => updateStage(stage.id, { enabled: v })}
                  />
                </div>
              </div>

              {stage.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Стоимость этапа ({currency})
                    </Label>
                    <NumericInput
                      value={stage.cost}
                      onChange={(v) => updateStage(stage.id, { cost: v ?? 0 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Время (часов)</Label>
                    <NumericInput
                      value={stage.timeHours}
                      onChange={(v) => updateStage(stage.id, { timeHours: v ?? 0 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Комментарий</Label>
                    <Input
                      value={stage.comment}
                      onChange={(e) => updateStage(stage.id, { comment: e.target.value })}
                      placeholder="Примечание..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-3 border-t grid grid-cols-2 gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Общая стоимость процесса</p>
            <p className="text-lg font-mono font-semibold">
              {totalCost.toLocaleString("ru-RU")} {currency}
            </p>
          </div>
          <div className="p-3 bg-secondary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Общее время процесса</p>
            <p className="text-lg font-mono font-semibold">{totalTime} ч</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
