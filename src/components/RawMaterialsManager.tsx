import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NumericInput } from "@/components/ui/numeric-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlaskConical, Plus, Trash2, Calculator } from "lucide-react";
import { RawMaterial, LogisticsTariffsData } from "@/hooks/useProject";
import { calculateMaterialLogisticsCost } from "./LogisticsTariffs";

interface RawMaterialsManagerProps {
  materials: RawMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<RawMaterial[]>>;
  currency: string;
  tariffs?: LogisticsTariffsData;
}

const UNIT_OPTIONS = [
  { value: "кг", label: "кг (килограмм)" },
  { value: "г", label: "г (грамм)" },
  { value: "т", label: "т (тонна)" },
  { value: "л", label: "л (литр)" },
  { value: "мл", label: "мл (миллилитр)" },
  { value: "м³", label: "м³ (куб. метр)" },
  { value: "м", label: "м (метр)" },
  { value: "см", label: "см (сантиметр)" },
  { value: "мм", label: "мм (миллиметр)" },
  { value: "м²", label: "м² (кв. метр)" },
  { value: "шт.", label: "шт. (штука)" },
  { value: "упак.", label: "упак. (упаковка)" },
  { value: "коробка", label: "коробка" },
  { value: "паллета", label: "паллета" },
  { value: "other", label: "Другое..." },
];

const TRANSPORT_TYPE_OPTIONS = [
  { value: "auto", label: "Авто" },
  { value: "rail", label: "Ж/Д" },
  { value: "air", label: "Авиа" },
  { value: "sea", label: "Морской" },
  { value: "local", label: "Локальный" },
];

export const RawMaterialsManager = ({
  materials,
  setMaterials,
  currency,
  tariffs,
}: RawMaterialsManagerProps) => {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("шт.");
  const [customUnit, setCustomUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [logisticsToProductionPerUnit, setLogisticsToProductionPerUnit] = useState(0);
  const [weight, setWeight] = useState(0);
  const [volume, setVolume] = useState(0);
  const [transportType, setTransportType] = useState<RawMaterial["transportType"]>("auto");
  const [distance, setDistance] = useState(0);

  const handleAdd = () => {
    if (!name.trim()) return;

    const finalUnit = unit === "other" ? customUnit.trim() || "шт." : unit;

    const newMaterial: RawMaterial = {
      id: Date.now().toString(),
      name: name.trim(),
      unit: finalUnit,
      pricePerUnit,
      logisticsToProductionPerUnit,
      weight: weight || undefined,
      volume: volume || undefined,
      transportType,
      distance: distance || undefined,
    };

    setMaterials((prev) => [...prev, newMaterial]);
    setName("");
    setUnit("шт.");
    setCustomUnit("");
    setPricePerUnit(0);
    setLogisticsToProductionPerUnit(0);
    setWeight(0);
    setVolume(0);
    setTransportType("auto");
    setDistance(0);
  };

  const handleUpdate = (id: string, field: keyof RawMaterial, value: string | number) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              [field]:
                field === "pricePerUnit" ||
                field === "logisticsToProductionPerUnit" ||
                field === "weight" ||
                field === "volume" ||
                field === "distance"
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
        {/* Row 1: Name, Unit, Price, Logistics */}
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
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger id="material-unit">
                <SelectValue placeholder="Выберите единицу" />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {unit === "other" && (
              <Input
                className="mt-2"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="Введите единицу"
              />
            )}
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
              за 1 {unit === "other" ? customUnit || "ед." : unit || "ед."}
            </p>
          </div>
        </div>

        {/* Row 2: Weight, Volume, Transport Type, Distance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <Label htmlFor="material-weight">Вес единицы (кг)</Label>
            <NumericInput
              id="material-weight"
              value={weight}
              onChange={setWeight}
              placeholder="0"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="material-volume">Объём единицы (м³)</Label>
            <NumericInput
              id="material-volume"
              value={volume}
              onChange={setVolume}
              placeholder="0"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="material-transport">Тип транспортировки</Label>
            <Select
              value={transportType}
              onValueChange={(v) => setTransportType(v as RawMaterial["transportType"])}
            >
              <SelectTrigger id="material-transport">
                <SelectValue placeholder="Тип транспорта" />
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="material-distance">Расстояние (км)</Label>
            <NumericInput
              id="material-distance"
              value={distance}
              onChange={setDistance}
              placeholder="0"
            />
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
                className="flex flex-col gap-3 p-3 border rounded-lg"
              >
                {/* Row 1: Basic fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Название</Label>
                    <Input
                      value={m.name}
                      onChange={(e) => handleUpdate(m.id, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ед. изм.</Label>
                    <Select
                      value={UNIT_OPTIONS.some((o) => o.value === m.unit) ? m.unit : "other"}
                      onValueChange={(v) => {
                        if (v !== "other") {
                          handleUpdate(m.id, "unit", v);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!UNIT_OPTIONS.some((o) => o.value === m.unit && o.value !== "other") && (
                      <Input
                        className="mt-2"
                        value={m.unit}
                        onChange={(e) => handleUpdate(m.id, "unit", e.target.value)}
                        placeholder="Введите единицу"
                      />
                    )}
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
                      Логистика за {m.unit || "ед."} ({currency})
                    </Label>
                    <NumericInput
                      value={m.logisticsToProductionPerUnit || 0}
                      onChange={(value) =>
                        handleUpdate(m.id, "logisticsToProductionPerUnit", value)
                      }
                    />
                  </div>
                </div>

                {/* Row 2: Extended logistics fields */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div>
                    <Label className="text-xs text-muted-foreground">Вес (кг)</Label>
                    <NumericInput
                      value={m.weight || 0}
                      onChange={(value) => handleUpdate(m.id, "weight", value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Объём (м³)</Label>
                    <NumericInput
                      value={m.volume || 0}
                      onChange={(value) => handleUpdate(m.id, "volume", value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Транспорт</Label>
                    <Select
                      value={m.transportType || "auto"}
                      onValueChange={(v) =>
                        handleUpdate(m.id, "transportType", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRANSPORT_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Расстояние (км)</Label>
                    <NumericInput
                      value={m.distance || 0}
                      onChange={(value) => handleUpdate(m.id, "distance", value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
