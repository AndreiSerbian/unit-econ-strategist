import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Megaphone } from "lucide-react";
import { NumericInput } from "@/components/ui/numeric-input";
import { useTranslation } from "@/i18n/useTranslation";

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
  totalClients?: number;
  totalRevenue?: number;
}


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
  totalClients,
  totalRevenue,
}: LeadSourcesFormProps) => {
  // Локальное состояние, чтобы список и итоги обновлялись мгновенно,
  // даже если родитель по какой-то причине задерживает обновление метрик
  const [localSources, setLocalSources] = useState<LeadSource[]>(leadSources);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceType, setNewSourceType] = useState<LeadSource["type"]>("paid");

  // Синхронизация при изменении данных сверху (смена сценария, загрузка проекта и т.п.)
  useEffect(() => {
    setLocalSources(leadSources);
  }, [leadSources]);

  const updateSource = useCallback(
    (id: string, field: keyof LeadSource, value: string | number) => {
      const updated = localSources.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      );
      setLocalSources(updated);
      onChange(updated);
    },
    [localSources, onChange]
  );

  const addSource = useCallback(() => {
    if (!newSourceName.trim()) return;

    const newSource: LeadSource = {
      id: Date.now().toString(),
      name: newSourceName.trim(),
      type: newSourceType,
      leads: 0,
      cost: 0,
    };

    const updated = [...localSources, newSource];
    setLocalSources(updated);
    onChange(updated);
    setNewSourceName("");
  }, [newSourceName, newSourceType, localSources, onChange]);

  const removeSource = useCallback(
    (id: string) => {
      const updated = localSources.filter((s) => s.id !== id);
      setLocalSources(updated);
      onChange(updated);
    },
    [localSources, onChange]
  );

  const addDefaultSources = useCallback(() => {
    const newSources: LeadSource[] = defaultSources.map((s, index) => ({
      ...s,
      id: `default-${Date.now()}-${index}`,
    }));
    const updated = [...localSources, ...newSources];
    setLocalSources(updated);
    onChange(updated);
  }, [localSources, onChange]);

  const totalLeads = localSources.reduce((sum, s) => sum + s.leads, 0);
  const totalCost = localSources.reduce((sum, s) => sum + s.cost, 0);
  const avgCPL = totalLeads > 0 ? totalCost / totalLeads : 0;
  const totalClientsValue = totalClients ?? 0;
  const totalRevenueValue = totalRevenue ?? 0;
  const hasGlobalCAC = totalClientsValue > 0 && totalCost > 0;
  const globalCAC = hasGlobalCAC ? totalCost / totalClientsValue : 0;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            Источники трафика
          </span>
          {localSources.length === 0 && (
            <Button variant="outline" size="sm" onClick={addDefaultSources}>
              Добавить стандартные
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Итоги */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg">
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
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Оценочный CAC</p>
            <p className="font-bold font-mono">
              {hasGlobalCAC
                ? `${globalCAC.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ${currency}`
                : "—"}
            </p>
          </div>
        </div>

        {/* Список источников */}
        <div className="space-y-3">
          {localSources.map((source) => {
            const cpl = source.leads > 0 ? source.cost / source.leads : 0;
            const leadShare = totalLeads > 0 ? source.leads / totalLeads : 0;
            const estimatedClients = totalClientsValue > 0 ? totalClientsValue * leadShare : 0;
            const estimatedRevenue = totalRevenueValue > 0 ? totalRevenueValue * leadShare : 0;
            const hasCAC = estimatedClients > 0 && source.cost > 0;
            const cac = hasCAC ? source.cost / estimatedClients : 0;
            const hasROI = source.cost > 0 && estimatedRevenue > 0;
            const roi = hasROI ? ((estimatedRevenue - source.cost) / source.cost) * 100 : 0;
            const roiClass = roi > 0 ? "text-accent" : roi < 0 ? "text-destructive" : "text-muted-foreground";

            return (
              <div
                key={source.id}
                className="grid grid-cols-12 gap-2 items-center p-2 border rounded-lg"
              >
                <div className="col-span-12 sm:col-span-4">
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
                <div className="col-span-6 sm:col-span-3">
                  <Label className="text-xs text-muted-foreground">Затраты ({currency})</Label>
                  <NumericInput
                    value={source.cost}
                    onChange={(v) => updateSource(source.id, "cost", v)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="col-span-6 sm:col-span-1 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeSource(source.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="col-span-12 grid grid-cols-3 gap-2 mt-2 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">CPL</p>
                    <p className="font-mono text-xs sm:text-sm font-semibold">
                      {source.leads > 0 && source.cost > 0
                        ? `${cpl.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ${currency}`
                        : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Оценочный CAC</p>
                    <p className="font-mono text-xs sm:text-sm font-semibold">
                      {hasCAC
                        ? `${cac.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ${currency}`
                        : "—"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">ROI канала</p>
                    <p className={`font-mono text-xs sm:text-sm font-semibold ${hasROI ? roiClass : "text-muted-foreground"}`}>
                      {hasROI
                        ? `${roi.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}%`
                        : "—"}
                    </p>
                  </div>
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
