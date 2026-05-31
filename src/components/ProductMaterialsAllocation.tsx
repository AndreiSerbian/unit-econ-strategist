import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, Plus, Trash2, Factory, RefreshCw, ChevronDown, Scale, Box, DollarSign } from "lucide-react";
import { Product, RawMaterial, ProductMaterialUsage } from "@/hooks/useProject";
import { useTranslation } from "@/i18n/useTranslation";

interface ProductMaterialsAllocationProps {
  products: Product[];
  materials: RawMaterial[];
  productMaterials: ProductMaterialUsage[];
  setProductMaterials: React.Dispatch<React.SetStateAction<ProductMaterialUsage[]>>;
  currency: string;
  onSyncProduct: (productId: string, options: { cost?: boolean; weight?: boolean; volume?: boolean }) => void;
  onApplyMaterialsExpenses: () => void;
  totalMaterialsCost: number;
  calculateMaterialCostPerUnit: (productId: string) => number;
  calculateProductWeightFromMaterials: (productId: string) => number;
  calculateProductVolumeFromMaterials: (productId: string) => number;
}

export const ProductMaterialsAllocation = ({
  products,
  materials,
  productMaterials,
  setProductMaterials,
  currency,
  onSyncProduct,
  onApplyMaterialsExpenses,
  totalMaterialsCost,
  calculateMaterialCostPerUnit,
  calculateProductWeightFromMaterials,
  calculateProductVolumeFromMaterials,
}: ProductMaterialsAllocationProps) => {
  const { t, language } = useTranslation();
  const numLocale = language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : "en-US";

  const handleAddLine = (productId: string) => {
    if (materials.length === 0) return;
    setProductMaterials((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        productId,
        materialId: materials[0].id,
        quantityPerUnit: 0,
      },
    ]);
  };

  const handleUpdateLine = (
    id: string,
    field: keyof ProductMaterialUsage,
    value: string | number
  ) => {
    setProductMaterials((prev) =>
      prev.map((line) =>
        line.id === id
          ? {
              ...line,
              [field]: field === "quantityPerUnit" ? Number(value) || 0 : value,
            }
          : line
      )
    );
  };

  const handleDeleteLine = (id: string) => {
    setProductMaterials((prev) => prev.filter((line) => line.id !== id));
  };

  if (products.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="w-5 h-5 text-secondary" />
          {t("productMaterials.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {materials.length === 0 && (
          <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center text-muted-foreground">
            <p>{t("productMaterials.emptyMaterials")}</p>
          </div>
        )}

        {materials.length > 0 && (
          <div className="space-y-4">
            {products.map((product) => {
              const lines = productMaterials.filter((l) => l.productId === product.id);
              const materialsCostPerUnit = calculateMaterialCostPerUnit(product.id);
              const totalForProduct = materialsCostPerUnit * product.quantity;
              const calculatedWeight = calculateProductWeightFromMaterials(product.id);
              const calculatedVolume = calculateProductVolumeFromMaterials(product.id);

              const hasCostDiff = Math.abs(materialsCostPerUnit - product.cost) > 0.01 && materialsCostPerUnit > 0;
              const hasWeightDiff = Math.abs(calculatedWeight - (product.weightPerUnit || 0)) > 0.001 && calculatedWeight > 0;
              const hasVolumeDiff = Math.abs(calculatedVolume - (product.volumePerUnit || 0)) > 0.000001 && calculatedVolume > 0;
              const hasDiff = hasCostDiff || hasWeightDiff || hasVolumeDiff;

              return (
                <div
                  key={product.id}
                  className="space-y-3 p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("productMaterials.quantity")}: {product.quantity.toLocaleString(numLocale)} {t("productMaterials.pieces")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("productMaterials.costPerUnit")}</p>
                        <p className="font-mono font-semibold">
                          {materialsCostPerUnit.toLocaleString(numLocale, { maximumFractionDigits: 2 })} {currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("productMaterials.totalForProduct")}</p>
                        <p className="font-mono font-semibold text-secondary">
                          {totalForProduct.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}
                        </p>
                      </div>
                    </div>
                  </div>

                  {lines.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-background/50 rounded-lg border border-dashed">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <DollarSign className="w-3.5 h-3.5" />
                          {t("productMaterials.cost")}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${hasCostDiff ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            {t("productMaterials.calculated")}: {materialsCostPerUnit.toLocaleString(numLocale, { maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs text-muted-foreground">|</span>
                          <span className="font-mono text-sm">
                            {t("productMaterials.current")}: {product.cost.toLocaleString(numLocale, { maximumFractionDigits: 2 })}
                          </span>
                          {hasCostDiff && <span className="text-amber-500 text-xs">⚠</span>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Scale className="w-3.5 h-3.5" />
                          {t("productMaterials.weight")}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${hasWeightDiff ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            {t("productMaterials.calculated")}: {calculatedWeight.toLocaleString(numLocale, { maximumFractionDigits: 3 })}
                          </span>
                          <span className="text-xs text-muted-foreground">|</span>
                          <span className="font-mono text-sm">
                            {t("productMaterials.current")}: {(product.weightPerUnit || 0).toLocaleString(numLocale, { maximumFractionDigits: 3 })}
                          </span>
                          {hasWeightDiff && <span className="text-amber-500 text-xs">⚠</span>}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Box className="w-3.5 h-3.5" />
                          {t("productMaterials.volume")}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm ${hasVolumeDiff ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            {t("productMaterials.calculated")}: {calculatedVolume.toLocaleString(numLocale, { maximumFractionDigits: 6 })}
                          </span>
                          <span className="text-xs text-muted-foreground">|</span>
                          <span className="font-mono text-sm">
                            {t("productMaterials.current")}: {(product.volumePerUnit || 0).toLocaleString(numLocale, { maximumFractionDigits: 6 })}
                          </span>
                          {hasVolumeDiff && <span className="text-amber-500 text-xs">⚠</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {lines.map((line) => {
                      const material = materials.find((m) => m.id === line.materialId);
                      const lineCost =
                        (material?.pricePerUnit || 0) * (line.quantityPerUnit || 0);

                      return (
                        <div
                          key={line.id}
                          className="grid grid-cols-1 md:grid-cols-[2fr_2fr_2fr_auto] gap-3 items-end"
                        >
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">{t("productMaterials.material")}</Label>
                            <Select
                              value={line.materialId}
                              onValueChange={(value) =>
                                handleUpdateLine(line.id, "materialId", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t("productMaterials.selectMaterial")} />
                              </SelectTrigger>
                              <SelectContent>
                                {materials.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.name} ({m.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              {t("productMaterials.consumptionPerUnit")} ({material?.unit || t("productMaterials.unit")})
                            </Label>
                            <NumericInput
                              value={line.quantityPerUnit}
                              onChange={(value) =>
                                handleUpdateLine(line.id, "quantityPerUnit", value)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              {t("productMaterials.materialCostPerUnit")} ({currency})
                            </Label>
                            <p className="font-mono font-semibold">
                              {lineCost.toLocaleString(numLocale, { maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteLine(line.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() => handleAddLine(product.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("productMaterials.addMaterial")}
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant={hasDiff ? "default" : "outline"}
                          className="gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          {t("productMaterials.sync")}
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() => onSyncProduct(product.id, { cost: true })}
                          disabled={!hasCostDiff}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          {t("productMaterials.syncCostOnly")}
                          {hasCostDiff && <span className="ml-auto text-amber-500 text-xs">⚠</span>}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onSyncProduct(product.id, { weight: true, volume: true })}
                          disabled={!hasWeightDiff && !hasVolumeDiff}
                        >
                          <Scale className="w-4 h-4 mr-2" />
                          {t("productMaterials.syncWeightVolumeOnly")}
                          {(hasWeightDiff || hasVolumeDiff) && <span className="ml-auto text-amber-500 text-xs">⚠</span>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onSyncProduct(product.id, { cost: true, weight: true, volume: true })}
                          disabled={!hasDiff}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {t("productMaterials.syncAll")}
                          {hasDiff && <span className="ml-auto text-amber-500 text-xs">⚠</span>}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {materials.length > 0 && (
          <div className="mt-2 p-4 rounded-lg bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {t("productMaterials.totalExpenses")}
            </p>
            <p className="font-mono font-semibold text-primary text-lg">
              {totalMaterialsCost.toLocaleString(numLocale, { maximumFractionDigits: 0 })} {currency}
            </p>
          </div>
          <Button size="sm" onClick={onApplyMaterialsExpenses}>
            {t("productMaterials.applyToExpenses")}
          </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
