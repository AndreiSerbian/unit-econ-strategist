import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Truck, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";

export interface LogisticsTariffsData {
  // Rate per kg per km for each transport type
  auto: { perKgKm: number; perM3Km: number; baseRate: number };
  rail: { perKgKm: number; perM3Km: number; baseRate: number };
  air: { perKgKm: number; perM3Km: number; baseRate: number };
  sea: { perKgKm: number; perM3Km: number; baseRate: number };
  local: { perKgKm: number; perM3Km: number; baseRate: number };
  // Delivery types for products
  courier: { perKg: number; perM3: number; baseRate: number };
  pickup: { perKg: number; perM3: number; baseRate: number };
  transport_company: { perKg: number; perM3: number; baseRate: number };
  own_delivery: { perKg: number; perM3: number; baseRate: number };
}

export const defaultTariffs: LogisticsTariffsData = {
  auto: { perKgKm: 0.05, perM3Km: 50, baseRate: 500 },
  rail: { perKgKm: 0.02, perM3Km: 30, baseRate: 1000 },
  air: { perKgKm: 0.5, perM3Km: 500, baseRate: 2000 },
  sea: { perKgKm: 0.01, perM3Km: 20, baseRate: 3000 },
  local: { perKgKm: 0.1, perM3Km: 100, baseRate: 200 },
  courier: { perKg: 50, perM3: 500, baseRate: 300 },
  pickup: { perKg: 0, perM3: 0, baseRate: 0 },
  transport_company: { perKg: 30, perM3: 300, baseRate: 500 },
  own_delivery: { perKg: 20, perM3: 200, baseRate: 150 },
};

interface LogisticsTariffsProps {
  tariffs: LogisticsTariffsData;
  setTariffs: React.Dispatch<React.SetStateAction<LogisticsTariffsData>>;
  currency: string;
}

const TRANSPORT_KEYS: Record<string, string> = {
  auto: "rawMaterials.transportAuto",
  rail: "rawMaterials.transportRail",
  air: "rawMaterials.transportAir",
  sea: "rawMaterials.transportSea",
  local: "rawMaterials.transportLocal",
};

export const LogisticsTariffs = ({
  tariffs,
  setTariffs,
  currency,
}: LogisticsTariffsProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const DELIVERY_LABELS: Record<string, string> = {
    courier: t("logisticsExt.deliveryCourier"),
    pickup: t("logisticsExt.deliveryPickup"),
    transport_company: t("logisticsExt.deliveryTransportCompany"),
    own_delivery: t("logisticsExt.deliveryOwnDelivery"),
  };

  const updateTransportTariff = (
    type: keyof Pick<LogisticsTariffsData, "auto" | "rail" | "air" | "sea" | "local">,
    field: "perKgKm" | "perM3Km" | "baseRate",
    value: number
  ) => {
    setTariffs((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const updateDeliveryTariff = (
    type: keyof Pick<LogisticsTariffsData, "courier" | "pickup" | "transport_company" | "own_delivery">,
    field: "perKg" | "perM3" | "baseRate",
    value: number
  ) => {
    setTariffs((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="w-5 h-5 text-primary" />
                {t("logisticsExt.title")}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        {t("logisticsExt.tooltip")}{" "}
                        {t("logisticsExt.formulaShort")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Transport tariffs for raw materials */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                {t("logisticsExt.materialsHeader")}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {(["auto", "rail", "air", "sea", "local"] as const).map((type) => (
                  <div
                    key={type}
                    className="grid grid-cols-4 gap-2 items-center p-2 bg-muted/30 rounded-lg"
                  >
                    <span className="font-medium text-sm">{TRANSPORT_LABELS[type]}</span>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {currency}/кг×км
                      </Label>
                      <NumericInput
                        value={tariffs[type].perKgKm}
                        onChange={(v) => updateTransportTariff(type, "perKgKm", v)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {currency}/м³×км
                      </Label>
                      <NumericInput
                        value={tariffs[type].perM3Km}
                        onChange={(v) => updateTransportTariff(type, "perM3Km", v)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        {t("logisticsExt.baseLabel", { currency })}
                      </Label>
                      <NumericInput
                        value={tariffs[type].baseRate}
                        onChange={(v) => updateTransportTariff(type, "baseRate", v)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery tariffs for products */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                {t("logisticsExt.productsHeader")}
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {(["courier", "pickup", "transport_company", "own_delivery"] as const).map(
                  (type) => (
                    <div
                      key={type}
                      className="grid grid-cols-4 gap-2 items-center p-2 bg-muted/30 rounded-lg"
                    >
                      <span className="font-medium text-sm">{DELIVERY_LABELS[type]}</span>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {currency}/кг
                        </Label>
                        <NumericInput
                          value={tariffs[type].perKg}
                          onChange={(v) => updateDeliveryTariff(type, "perKg", v)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {currency}/м³
                        </Label>
                        <NumericInput
                          value={tariffs[type].perM3}
                          onChange={(v) => updateDeliveryTariff(type, "perM3", v)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          {t("logisticsExt.baseLabel", { currency })}
                        </Label>
                        <NumericInput
                          value={tariffs[type].baseRate}
                          onChange={(v) => updateDeliveryTariff(type, "baseRate", v)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {t("logisticsExt.formulaMaterials")}
              <br />
              {t("logisticsExt.formulaProducts")}
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

// Utility functions for calculating logistics costs
export const calculateMaterialLogisticsCost = (
  weight: number = 0,
  volume: number = 0,
  distance: number = 0,
  transportType: "auto" | "rail" | "air" | "sea" | "local" = "auto",
  tariffs: LogisticsTariffsData
): number => {
  const tariff = tariffs[transportType];
  const weightCost = weight * tariff.perKgKm * distance;
  const volumeCost = volume * tariff.perM3Km * distance;
  return tariff.baseRate + weightCost + volumeCost;
};

export const calculateProductLogisticsCost = (
  weight: number = 0,
  volume: number = 0,
  deliveryType: "courier" | "pickup" | "transport_company" | "own_delivery" = "courier",
  tariffs: LogisticsTariffsData
): number => {
  const tariff = tariffs[deliveryType];
  const weightCost = weight * tariff.perKg;
  const volumeCost = volume * tariff.perM3;
  return tariff.baseRate + weightCost + volumeCost;
};
