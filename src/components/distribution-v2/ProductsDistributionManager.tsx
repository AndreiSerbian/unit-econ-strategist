import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Package, HelpCircle, Calculator, AlertTriangle } from "lucide-react";
import type { ProductDistributionV2, DeliveryTariffV2 } from "./types";

interface ProductsDistributionManagerProps {
  products: ProductDistributionV2[];
  deliveryTariffs: DeliveryTariffV2[];
  onUpdate: (id: string, updates: Partial<ProductDistributionV2>) => Promise<void>;
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

export const ProductsDistributionManager = ({
  products,
  deliveryTariffs,
  onUpdate,
  currency,
}: ProductsDistributionManagerProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Продукты: Логистика
        </CardTitle>
        <CardDescription>
          Настройте вес/объём и выберите тариф доставки. Стоимость рассчитывается автоматически.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.length === 0 ? (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 border">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-sm text-muted-foreground">
              Сначала добавьте продукты в основном разделе
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-[10px] text-muted-foreground">
                      Цена: {product.price} {currency} • Кол-во: {product.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Manual</span>
                    <Switch
                      checked={product.manualDeliveryOverride}
                      onCheckedChange={(checked) => onUpdate(product.id, { manualDeliveryOverride: checked })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Вес (кг)</Label>
                    <NumericInput
                      value={product.weightKg}
                      onChange={(v) => onUpdate(product.id, { weightKg: v })}
                      step="0.01"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Объём (м³)</Label>
                    <NumericInput
                      value={product.volumeM3}
                      onChange={(v) => onUpdate(product.id, { volumeM3: v })}
                      step="0.001"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Тариф доставки</Label>
                    <Select 
                      value={product.deliveryTariffId || ""} 
                      onValueChange={(v) => onUpdate(product.id, { deliveryTariffId: v || undefined })}
                      disabled={product.manualDeliveryOverride}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Выберите тариф" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Не выбран</SelectItem>
                        {deliveryTariffs.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center">
                      Доставка/ед.
                      <FieldTooltip content={product.manualDeliveryOverride 
                        ? "Ручной ввод стоимости доставки" 
                        : "Авторасчёт из тарифа"} 
                      />
                    </Label>
                    {product.manualDeliveryOverride ? (
                      <NumericInput
                        value={product.manualDeliveryCost}
                        onChange={(v) => onUpdate(product.id, { manualDeliveryCost: v })}
                        className="text-sm"
                      />
                    ) : (
                      <div className="h-9 px-3 py-2 border rounded-md bg-muted/50 flex items-center gap-1">
                        <Calculator className="w-3 h-3 text-muted-foreground" />
                        <span className="font-mono text-sm">
                          {(product.computedDeliveryCost || 0).toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">{currency}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Effective cost summary */}
                <div className="mt-2 p-2 rounded bg-muted/30 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Итого доставка на ед.:</span>
                  <span className="font-mono font-medium text-sm">
                    {(product.effectiveDeliveryCost || 0).toFixed(2)} {currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
