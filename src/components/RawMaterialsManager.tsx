import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NumericInput } from "@/components/ui/numeric-input";
import { FlaskConical, Plus, Trash2 } from "lucide-react";
import { RawMaterial } from "@/hooks/useProject";

interface RawMaterialsManagerProps {
  materials: RawMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<RawMaterial[]>>;
  currency: string;
}

export const RawMaterialsManager = ({
  materials,
  setMaterials,
  currency,
}: RawMaterialsManagerProps) => {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [logisticsToProductionPerUnit, setLogisticsToProductionPerUnit] = useState(0);

  const handleAdd = () => {
    if (!name.trim()) return;

    const newMaterial: RawMaterial = {
      id: Date.now().toString(),
      name: name.trim(),
      unit: unit.trim() || "шт.",
      pricePerUnit,
      logisticsToProductionPerUnit,
    };

    setMaterials((prev) => [...prev, newMaterial]);
    setName("");
    setUnit("");
    setPricePerUnit(0);
    setLogisticsToProductionPerUnit(0);
  };

  const handleUpdate = (id: string, field: keyof RawMaterial, value: string | number) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              [field]: field === "pricePerUnit" || field === "logisticsToProductionPerUnit"
                ? Number(value) || 0
                : value,
            }
          : m
      )
    );
  };

  const handleDelete = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          Сырьё
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <Label htmlFor="material-name">Название</Label>
            <Input
              id="material-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, мука, ткань, сталь"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="material-unit">Единица измерения</Label>
            <Input
              id="material-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="кг, м, шт."
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="material-price">Цена за единицу ({currency})</Label>
            <NumericInput
              id="material-price"
              value={pricePerUnit}
              onChange={setPricePerUnit}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="material-logistics">Логистика до производства ({currency})</Label>
            <NumericInput
              id="material-logistics"
              value={logisticsToProductionPerUnit}
              onChange={setLogisticsToProductionPerUnit}
            />
            <p className="text-[10px] text-muted-foreground">
              за 1 {unit || "ед."}
            </p>
          </div>
        </div>
        <Button className="w-full" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить сырьё
        </Button>

        {materials.length > 0 && (
          <div className="mt-4 space-y-3">
            {materials.map((m) => (
              <div
                key={m.id}
                className="flex flex-col md:flex-row md:items-center gap-3 p-3 border rounded-lg"
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Название</Label>
                    <Input
                      value={m.name}
                      onChange={(e) => handleUpdate(m.id, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ед. изм.</Label>
                    <Input
                      value={m.unit}
                      onChange={(e) => handleUpdate(m.id, "unit", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Цена за {m.unit || "ед."} ({currency})
                    </Label>
                    <NumericInput
                      value={m.pricePerUnit}
                      onChange={(value) => handleUpdate(m.id, "pricePerUnit", value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Логистика до производства за {m.unit || "ед."} ({currency})
                    </Label>
                    <NumericInput
                      value={m.logisticsToProductionPerUnit || 0}
                      onChange={(value) =>
                        handleUpdate(m.id, "logisticsToProductionPerUnit", value)
                      }
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="self-start md:self-center"
                  onClick={() => handleDelete(m.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
