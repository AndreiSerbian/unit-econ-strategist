import { memo, useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Target, Megaphone } from "lucide-react";
import { NumericInput } from "@/components/ui/numeric-input";

export interface LeadSource {
  id: string;
  name: string;
  type: "paid" | "organic" | "referral" | "direct";
  leads: number;
  cost: number;
}

interface LeadSourcesFormProps {
  leadSources: LeadSource[];
  onChange: (sources: LeadSource[]) => void;
  currency: string;
}

const typeOptions = [
  { value: "paid", label: "Платный трафик" },
  { value: "organic", label: "Органика" },
  { value: "referral", label: "Реферальный" },
  { value: "direct", label: "Прямой" },
];

const defaultSources: Omit<LeadSource, "id">[] = [
  { name: "Яндекс.Директ", type: "paid", leads: 0, cost: 0 },
  { name: "Google Ads", type: "paid", leads: 0, cost: 0 },
  { name: "VK Реклама", type: "paid", leads: 0, cost: 0 },
  { name: "SEO", type: "organic", leads: 0, cost: 0 },
  { name: "Соц. сети", type: "organic", leads: 0, cost: 0 },
];

export const LeadSourcesForm = memo(({
  leadSources,
  onChange,
  currency,
}: LeadSourcesFormProps) => {
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceType, setNewSourceType] = useState<LeadSource["type"]>("paid");

  const updateSource = useCallback((id: string, field: keyof LeadSource, value: string | number) => {
    onChange(
      leadSources.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  }, [leadSources, onChange]);

  const addSource = useCallback(() => {
    if (!newSourceName.trim()) return;
    
    const newSource: LeadSource = {
      id: Date.now().toString(),
      name: newSourceName.trim(),
      type: newSourceType,
      leads: 0,
      cost: 0,
    };
    
    onChange([...leadSources, newSource]);
    setNewSourceName("");
  }, [newSourceName, newSourceType, leadSources, onChange]);

  const removeSource = useCallback((id: string) => {
    onChange(leadSources.filter((s) => s.id !== id));
  }, [leadSources, onChange]);

  const addDefaultSources = useCallback(() => {
    const newSources: LeadSource[] = defaultSources.map((s, index) => ({
      ...s,
      id: `default-${Date.now()}-${index}`,
    }));
    onChange([...leadSources, ...newSources]);
  }, [leadSources, onChange]);

  const totalLeads = leadSources.reduce((sum, s) => sum + s.leads, 0);
  const totalCost = leadSources.reduce((sum, s) => sum + s.cost, 0);
  const avgCPL = totalLeads > 0 ? totalCost / totalLeads : 0;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            Источники трафика
          </span>
          {leadSources.length === 0 && (
            <Button variant="outline" size="sm" onClick={addDefaultSources}>
              Добавить стандартные
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Итоги */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Всего лидов</p>
            <p className="font-bold font-mono">{totalLeads.toLocaleString("ru-RU")}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Бюджет</p>
            <p className="font-bold font-mono">{totalCost.toLocaleString("ru-RU")} {currency}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Средний CPL</p>
            <p className="font-bold font-mono">{avgCPL.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}</p>
          </div>
        </div>

        {/* Список источников */}
        <div className="space-y-3">
          {leadSources.map((source) => {
            const cpl = source.leads > 0 ? source.cost / source.leads : 0;
            return (
              <div
                key={source.id}
                className="grid grid-cols-12 gap-2 items-center p-2 border rounded-lg"
              >
                <div className="col-span-12 sm:col-span-3">
                  <Label className="text-xs text-muted-foreground">Источник</Label>
                  <Input
                    value={source.name}
                    onChange={(e) => updateSource(source.id, "name", e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Тип</Label>
                  <Select
                    value={source.type}
                    onValueChange={(v) => updateSource(source.id, "type", v)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Лиды</Label>
                  <NumericInput
                    value={source.leads}
                    onChange={(v) => updateSource(source.id, "leads", v)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Затраты ({currency})</Label>
                  <NumericInput
                    value={source.cost}
                    onChange={(v) => updateSource(source.id, "cost", v)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2 text-center">
                  <Label className="text-xs text-muted-foreground">CPL</Label>
                  <p className="font-mono text-sm font-semibold">
                    {cpl.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeSource(source.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Добавление нового источника */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Input
            placeholder="Название источника"
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            className="flex-1 min-w-[150px]"
          />
          <Select
            value={newSourceType}
            onValueChange={(v: LeadSource["type"]) => setNewSourceType(v)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addSource} disabled={!newSourceName.trim()}>
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

LeadSourcesForm.displayName = "LeadSourcesForm";
