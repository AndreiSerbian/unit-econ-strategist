import { useMemo, useState } from "react";
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
import { FlaskConical, Plus, Trash2 } from "lucide-react";
import { RawMaterial, LogisticsTariffsData } from "@/hooks/useProject";
import { useTranslation } from "@/i18n/useTranslation";

interface RawMaterialsManagerProps {
  materials: RawMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<RawMaterial[]>>;
  currency: string;
  tariffs?: LogisticsTariffsData;
}

export const RawMaterialsManager = ({
  materials,
  setMaterials,
  currency,
}: RawMaterialsManagerProps) => {
  const { t } = useTranslation();

  const UNIT_OPTIONS = useMemo(
    () => [
      { value: "кг", label: t("rawMaterials.unitKg") },
      { value: "г", label: t("rawMaterials.unitG") },
      { value: "т", label: t("rawMaterials.unitT") },
      { value: "л", label: t("rawMaterials.unitL") },
      { value: "мл", label: t("rawMaterials.unitMl") },
      { value: "м³", label: t("rawMaterials.unitM3") },
      { value: "м", label: t("rawMaterials.unitM") },
      { value: "см", label: t("rawMaterials.unitCm") },
      { value: "мм", label: t("rawMaterials.unitMm") },
      { value: "м²", label: t("rawMaterials.unitM2") },
      { value: "шт.", label: t("rawMaterials.unitPcs") },
      { value: "упак.", label: t("rawMaterials.unitPack") },
      { value: "коробка", label: t("rawMaterials.unitBox") },
      { value: "паллета", label: t("rawMaterials.unitPallet") },
      { value: "other", label: t("rawMaterials.unitOther") },
    ],
    [t]
  );

  const TRANSPORT_TYPE_OPTIONS = useMemo(
    () => [
      { value: "auto", label: t("rawMaterials.transportAuto") },
      { value: "rail", label: t("rawMaterials.transportRail") },
      { value: "air", label: t("rawMaterials.transportAir") },
      { value: "sea", label: t("rawMaterials.transportSea") },
      { value: "local", label: t("rawMaterials.transportLocal") },
    ],
    [t]
  );

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

  const unitDisplay = unit === "other" ? customUnit || t("common.untitled") : unit;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          {t("rawMaterials.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Row 1: Name, Unit, Price, Logistics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <Label htmlFor="material-name" className="text-xs sm:text-sm">{t("rawMaterials.name")}</Label>
            <Input
              id="material-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("rawMaterials.namePlaceholder")}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="material-unit" className="text-xs sm:text-sm">{t("rawMaterials.unit")}</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger id="material-unit" className="text-sm">
                <SelectValue placeholder={t("rawMaterials.unitPlaceholder")} />
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
                className="mt-2 text-sm"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder={t("rawMaterials.customUnitPlaceholder")}
              />
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="material-price" className="text-xs sm:text-sm">{t("rawMaterials.price", { currency })}</Label>
            <NumericInput
              id="material-price"
              value={pricePerUnit}
              onChange={setPricePerUnit}
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="material-logistics" className="text-xs sm:text-sm">{t("rawMaterials.logistics", { currency })}</Label>
            <NumericInput
              id="material-logistics"
              value={logisticsToProductionPerUnit}
              onChange={setLogisticsToProductionPerUnit}
              className="text-sm"
            />
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">
              {t("rawMaterials.perUnit", { unit: unitDisplay })}
            </p>
          </div>
        </div>

        {/* Row 2: Weight, Volume, Transport Type, Distance */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <Label htmlFor="material-weight" className="text-xs sm:text-sm">{t("rawMaterials.weight")}</Label>
            <NumericInput
              id="material-weight"
              value={weight}
              onChange={setWeight}
              placeholder="0"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="material-volume" className="text-xs sm:text-sm">{t("rawMaterials.volume")}</Label>
            <NumericInput
              id="material-volume"
              value={volume}
              onChange={setVolume}
              placeholder="0"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="material-transport" className="text-xs sm:text-sm">{t("rawMaterials.transport")}</Label>
            <Select
              value={transportType}
              onValueChange={(v) => setTransportType(v as RawMaterial["transportType"])}
            >
              <SelectTrigger id="material-transport" className="text-sm">
                <SelectValue placeholder={t("rawMaterials.transportPlaceholder")} />
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
            <Label htmlFor="material-distance" className="text-xs sm:text-sm">{t("rawMaterials.distance")}</Label>
            <NumericInput
              id="material-distance"
              value={distance}
              onChange={setDistance}
              placeholder="0"
              className="text-sm"
            />
          </div>
        </div>

        <Button className="w-full" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          {t("rawMaterials.add")}
        </Button>

        {materials.length > 0 && (
          <div className="mt-4 space-y-3">
            {materials.map((m) => (
              <div
                key={m.id}
                className="flex flex-col gap-3 p-3 border rounded-lg"
              >
                {/* Row 1: Basic fields */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <Label className="text-xs text-muted-foreground">{t("rawMaterials.name")}</Label>
                    <Input
                      value={m.name}
                      onChange={(e) => handleUpdate(m.id, "name", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("rawMaterials.unitShort")}</Label>
                    <Select
                      value={UNIT_OPTIONS.some((o) => o.value === m.unit) ? m.unit : "other"}
                      onValueChange={(v) => {
                        if (v !== "other") {
                          handleUpdate(m.id, "unit", v);
                        }
                      }}
                    >
                      <SelectTrigger className="text-sm">
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
                        className="mt-2 text-sm"
                        value={m.unit}
                        onChange={(e) => handleUpdate(m.id, "unit", e.target.value)}
                        placeholder={t("rawMaterials.customUnitPlaceholder")}
                      />
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {t("rawMaterials.price", { currency })}
                    </Label>
                    <NumericInput
                      value={m.pricePerUnit}
                      onChange={(value) => handleUpdate(m.id, "pricePerUnit", value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {t("rawMaterials.logistics", { currency })}
                    </Label>
                    <NumericInput
                      value={m.logisticsToProductionPerUnit || 0}
                      onChange={(value) =>
                        handleUpdate(m.id, "logisticsToProductionPerUnit", value)
                      }
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Row 2: Extended logistics fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 items-end">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("rawMaterials.weight")}</Label>
                    <NumericInput
                      value={m.weight || 0}
                      onChange={(value) => handleUpdate(m.id, "weight", value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("rawMaterials.volume")}</Label>
                    <NumericInput
                      value={m.volume || 0}
                      onChange={(value) => handleUpdate(m.id, "volume", value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t("rawMaterials.transportShort")}</Label>
                    <Select
                      value={m.transportType || "auto"}
                      onValueChange={(v) =>
                        handleUpdate(m.id, "transportType", v)
                      }
                    >
                      <SelectTrigger className="text-sm">
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
                    <Label className="text-xs text-muted-foreground">{t("rawMaterials.distanceShort")}</Label>
                    <NumericInput
                      value={m.distance || 0}
                      onChange={(value) => handleUpdate(m.id, "distance", value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="flex justify-end col-span-2 sm:col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(m.id)}
                      className="h-9 w-9"
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
