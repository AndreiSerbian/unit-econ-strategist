import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Package, HelpCircle, Calculator } from "lucide-react";
import type { RawMaterialV2, LogisticsTariffV2 } from "./types";
import { calculateRawMaterialShippingCost } from "./types";

interface RawMaterialsV2ManagerProps {
  materials: RawMaterialV2[];
  logisticsTariffs: LogisticsTariffV2[];
  onAdd: (material: Omit<RawMaterialV2, 'id' | 'projectId'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<RawMaterialV2>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currency: string;
}

const UNIT_OPTIONS = [
  { value: "piece", label: "шт" },
  { value: "kg", label: "кг" },
  { value: "liter", label: "л" },
  { value: "meter", label: "м" },
  { value: "m2", label: "м²" },
  { value: "m3", label: "м³" },
];

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

export const RawMaterialsV2Manager = ({
  materials,
  logisticsTariffs,
  onAdd,
  onUpdate,
  onDelete,
  currency,
}: RawMaterialsV2ManagerProps) => {
  const [newMaterial, setNewMaterial] = useState<Omit<RawMaterialV2, 'id' | 'projectId'>>({
    name: "",
    unitCost: 0,
    unitType: "piece",
    weightPerUnit: 0,
    volumePerUnit: 0,
    shipmentSize: 1,
  });

  const handleAdd = async () => {
    if (!newMaterial.name.trim()) return;
    await onAdd({ ...newMaterial, shipmentSize: Math.max(1, newMaterial.shipmentSize) });
    setNewMaterial({
      name: "",
      unitCost: 0,
      unitType: "piece",
      weightPerUnit: 0,
      volumePerUnit: 0,
      shipmentSize: 1,
    });
  };

  const getShippingCostPerUnit = (material: RawMaterialV2) => {
    const tariff = logisticsTariffs.find(t => t.id === material.logisticsTariffId);
    return calculateRawMaterialShippingCost(material, tariff);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Сырьё
        </CardTitle>
        <CardDescription>Сырьё и материалы с расчётом логистики на единицу</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add form */}
        <div className="p-3 border rounded-lg bg-muted/30 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Название</Label>
              <Input
                value={newMaterial.name}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ткань, мука..."
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ед. изм.</Label>
              <Select 
                value={newMaterial.unitType} 
                onValueChange={(v) => setNewMaterial(prev => ({ ...prev, unitType: v }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Цена ({currency})</Label>
              <NumericInput
                value={newMaterial.unitCost}
                onChange={(v) => setNewMaterial(prev => ({ ...prev, unitCost: v }))}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Вес (кг)</Label>
              <NumericInput
                value={newMaterial.weightPerUnit}
                onChange={(v) => setNewMaterial(prev => ({ ...prev, weightPerUnit: v }))}
                step="0.01"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Объём (м³)</Label>
              <NumericInput
                value={newMaterial.volumePerUnit}
                onChange={(v) => setNewMaterial(prev => ({ ...prev, volumePerUnit: v }))}
                step="0.001"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center">
                Размер партии
                <FieldTooltip content="Сколько единиц сырья в одной партии доставки. Используется для расчёта логистики на единицу." />
              </Label>
              <NumericInput
                value={newMaterial.shipmentSize}
                onChange={(v) => setNewMaterial(prev => ({ ...prev, shipmentSize: Math.max(1, v) }))}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Расстояние (км)</Label>
              <NumericInput
                value={newMaterial.distanceKm || 0}
                onChange={(v) => setNewMaterial(prev => ({ ...prev, distanceKm: v }))}
                className="text-sm"
              />
            </div>
          </div>
          
          <Button onClick={handleAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Добавить сырьё
          </Button>
        </div>

        {/* Materials list */}
        {materials.length > 0 && (
          <div className="space-y-2">
            {materials.map((material) => {
              const shippingPerUnit = getShippingCostPerUnit(material);
              
              return (
                <div key={material.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Input
                      value={material.name}
                      onChange={(e) => onUpdate(material.id, { name: e.target.value })}
                      className="font-medium border-0 p-0 h-auto bg-transparent text-sm"
                    />
                    <Button variant="ghost" size="icon" onClick={() => onDelete(material.id)} className="h-8 w-8 shrink-0">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Цена</Label>
                      <NumericInput
                        value={material.unitCost}
                        onChange={(v) => onUpdate(material.id, { unitCost: v })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Вес (кг)</Label>
                      <NumericInput
                        value={material.weightPerUnit}
                        onChange={(v) => onUpdate(material.id, { weightPerUnit: v })}
                        className="h-8 text-xs"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Объём (м³)</Label>
                      <NumericInput
                        value={material.volumePerUnit}
                        onChange={(v) => onUpdate(material.id, { volumePerUnit: v })}
                        className="h-8 text-xs"
                        step="0.001"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground flex items-center">
                        Партия
                        <FieldTooltip content="Размер партии (ед.)" />
                      </Label>
                      <NumericInput
                        value={material.shipmentSize}
                        onChange={(v) => onUpdate(material.id, { shipmentSize: Math.max(1, v) })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Расст. (км)</Label>
                      <NumericInput
                        value={material.distanceKm || 0}
                        onChange={(v) => onUpdate(material.id, { distanceKm: v })}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Calculated shipping per unit */}
                  {shippingPerUnit > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calculator className="w-3 h-3" />
                      <span>Логистика на ед.: <span className="font-mono font-medium text-foreground">{shippingPerUnit.toFixed(2)} {currency}</span></span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {materials.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Добавьте сырьё для расчёта себестоимости
          </p>
        )}
      </CardContent>
    </Card>
  );
};
