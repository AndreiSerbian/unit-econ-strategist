import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Truck, HelpCircle } from "lucide-react";
import type { LogisticsTariffV2, PricingModel } from "./types";

interface LogisticsTariffsV2ManagerProps {
  tariffs: LogisticsTariffV2[];
  onAdd: (tariff: Omit<LogisticsTariffV2, 'id' | 'projectId'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<LogisticsTariffV2>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currency: string;
}

const FieldTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help inline-block ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const LogisticsTariffsV2Manager = ({
  tariffs,
  onAdd,
  onUpdate,
  onDelete,
  currency,
}: LogisticsTariffsV2ManagerProps) => {
  const [newTariff, setNewTariff] = useState<Omit<LogisticsTariffV2, 'id' | 'projectId'>>({
    name: "",
    baseCost: 0,
    costPerKg: 0,
    costPerM3: 0,
    costPerKm: 0,
    pricingModel: "sum",
    minCharge: 0,
    currency: "EUR",
  });

  const handleAdd = async () => {
    if (!newTariff.name.trim()) return;
    await onAdd(newTariff);
    setNewTariff({
      name: "",
      baseCost: 0,
      costPerKg: 0,
      costPerM3: 0,
      costPerKm: 0,
      pricingModel: "sum",
      minCharge: 0,
      currency: "EUR",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          Тарифы логистики (сырьё)
        </CardTitle>
        <CardDescription>Тарифы на доставку сырья от поставщиков</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add form */}
        <div className="p-3 border rounded-lg bg-muted/30 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Название тарифа</Label>
              <Input
                value={newTariff.name}
                onChange={(e) => setNewTariff(prev => ({ ...prev, name: e.target.value }))}
                placeholder="DHL Freight, Деловые линии..."
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center">
                База
                <FieldTooltip content="Фиксированная стоимость за отправку (независимо от веса/объёма)" />
              </Label>
              <NumericInput
                value={newTariff.baseCost}
                onChange={(v) => setNewTariff(prev => ({ ...prev, baseCost: v }))}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center">
                Модель расчёта
                <FieldTooltip content="sum = складываем вес+объём+км; max = берём максимум из вес/объём" />
              </Label>
              <Select 
                value={newTariff.pricingModel} 
                onValueChange={(v) => setNewTariff(prev => ({ ...prev, pricingModel: v as PricingModel }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Сумма (вес+объём+км)</SelectItem>
                  <SelectItem value="max">Макс. (вес или объём)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">За кг ({currency})</Label>
              <NumericInput
                value={newTariff.costPerKg}
                onChange={(v) => setNewTariff(prev => ({ ...prev, costPerKg: v }))}
                step="0.01"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">За м³ ({currency})</Label>
              <NumericInput
                value={newTariff.costPerM3}
                onChange={(v) => setNewTariff(prev => ({ ...prev, costPerM3: v }))}
                step="0.01"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">За км ({currency})</Label>
              <NumericInput
                value={newTariff.costPerKm}
                onChange={(v) => setNewTariff(prev => ({ ...prev, costPerKm: v }))}
                step="0.01"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Минимум ({currency})</Label>
              <NumericInput
                value={newTariff.minCharge}
                onChange={(v) => setNewTariff(prev => ({ ...prev, minCharge: v }))}
                className="text-sm"
              />
            </div>
          </div>
          
          <Button onClick={handleAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Добавить тариф
          </Button>
        </div>

        {/* Tariffs list */}
        {tariffs.length > 0 && (
          <div className="space-y-2">
            {tariffs.map((tariff) => (
              <div key={tariff.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <Input
                      value={tariff.name}
                      onChange={(e) => onUpdate(tariff.id, { name: e.target.value })}
                      className="font-medium border-0 p-0 h-auto bg-transparent text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      {tariff.pricingModel === 'sum' ? 'Сумма' : 'Максимум'} • Мин: {tariff.minCharge} {currency}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(tariff.id)} className="h-8 w-8 shrink-0">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">База</Label>
                    <NumericInput
                      value={tariff.baseCost}
                      onChange={(v) => onUpdate(tariff.id, { baseCost: v })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">За кг</Label>
                    <NumericInput
                      value={tariff.costPerKg}
                      onChange={(v) => onUpdate(tariff.id, { costPerKg: v })}
                      className="h-8 text-xs"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">За м³</Label>
                    <NumericInput
                      value={tariff.costPerM3}
                      onChange={(v) => onUpdate(tariff.id, { costPerM3: v })}
                      className="h-8 text-xs"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">За км</Label>
                    <NumericInput
                      value={tariff.costPerKm}
                      onChange={(v) => onUpdate(tariff.id, { costPerKm: v })}
                      className="h-8 text-xs"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tariffs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Добавьте тарифы для расчёта логистики сырья
          </p>
        )}
      </CardContent>
    </Card>
  );
};
