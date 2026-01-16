import { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Button } from "@/components/ui/button";
import { Calculator, Info, Receipt } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface DutiesData {
  customsDuty: number;
  customsDutyRate: number;
  exportDuty: number;
  exportDutyRate: number;
  vatInput: number;
  vatOutput: number;
  vatBalance: number;
  vatRate: number;
}

interface DutiesAndTaxesProps {
  duties: DutiesData;
  onChange: (duties: DutiesData) => void;
  revenue: number;
  importCosts: number; // Стоимость импорта для расчёта таможенных пошлин
  exportRevenue: number; // Выручка от экспорта
  currency: string;
}

const defaultDuties: DutiesData = {
  customsDuty: 0,
  customsDutyRate: 5,
  exportDuty: 0,
  exportDutyRate: 0,
  vatInput: 0,
  vatOutput: 0,
  vatBalance: 0,
  vatRate: 20,
};

export const DutiesAndTaxes = memo(({
  duties = defaultDuties,
  onChange,
  revenue,
  importCosts,
  exportRevenue,
  currency,
}: DutiesAndTaxesProps) => {
  const updateField = useCallback((field: keyof DutiesData, value: number) => {
    onChange({
      ...duties,
      [field]: value,
    });
  }, [duties, onChange]);

  const autoCalculateCustomsDuty = useCallback(() => {
    const calculated = (importCosts * duties.customsDutyRate) / 100;
    onChange({
      ...duties,
      customsDuty: Math.round(calculated),
    });
  }, [duties, importCosts, onChange]);

  const autoCalculateExportDuty = useCallback(() => {
    const calculated = (exportRevenue * duties.exportDutyRate) / 100;
    onChange({
      ...duties,
      exportDuty: Math.round(calculated),
    });
  }, [duties, exportRevenue, onChange]);

  const autoCalculateVat = useCallback(() => {
    // НДС исходящий = Выручка * ставка / (100 + ставка)
    const vatOutput = (revenue * duties.vatRate) / (100 + duties.vatRate);
    // НДС к уплате/возмещению = Исходящий - Входящий
    const vatBalance = vatOutput - duties.vatInput;
    
    onChange({
      ...duties,
      vatOutput: Math.round(vatOutput),
      vatBalance: Math.round(vatBalance),
    });
  }, [duties, revenue, onChange]);

  const totalDuties = duties.customsDuty + duties.exportDuty;
  const vatToPay = Math.max(0, duties.vatBalance);
  const vatToRefund = Math.max(0, -duties.vatBalance);

  return (
    <Card className="border-amber-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-500" />
            Пошлины и НДС
          </span>
          <span className="font-mono text-amber-500">
            {(totalDuties + vatToPay).toLocaleString("ru-RU")} {currency}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {/* Таможенные пошлины */}
          <AccordionItem value="customs">
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <span>Таможенные пошлины (импорт)</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      Пошлины на ввоз товаров из-за рубежа. Рассчитываются как % от таможенной стоимости импорта.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-mono text-muted-foreground">
                  {duties.customsDuty.toLocaleString("ru-RU")} {currency}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ставка пошлины (%)</Label>
                  <NumericInput
                    value={duties.customsDutyRate}
                    onChange={(v) => updateField('customsDutyRate', v)}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Сумма пошлины</Label>
                  <div className="flex gap-2">
                    <NumericInput
                      value={duties.customsDuty}
                      onChange={(v) => updateField('customsDuty', v)}
                    />
                    <Button variant="outline" size="sm" onClick={autoCalculateCustomsDuty}>
                      <Calculator className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {importCosts > 0 && (
                <p className="text-xs text-muted-foreground">
                  База для расчёта (импорт): {importCosts.toLocaleString("ru-RU")} {currency}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Экспортные пошлины */}
          <AccordionItem value="export">
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <span>Экспортные пошлины</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      Пошлины на вывоз товаров за рубеж. Применяются к определённым категориям товаров (сырьё, металлы и т.д.)
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-mono text-muted-foreground">
                  {duties.exportDuty.toLocaleString("ru-RU")} {currency}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ставка пошлины (%)</Label>
                  <NumericInput
                    value={duties.exportDutyRate}
                    onChange={(v) => updateField('exportDutyRate', v)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Сумма пошлины</Label>
                  <div className="flex gap-2">
                    <NumericInput
                      value={duties.exportDuty}
                      onChange={(v) => updateField('exportDuty', v)}
                    />
                    <Button variant="outline" size="sm" onClick={autoCalculateExportDuty}>
                      <Calculator className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {exportRevenue > 0 && (
                <p className="text-xs text-muted-foreground">
                  База для расчёта (экспорт): {exportRevenue.toLocaleString("ru-RU")} {currency}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* НДС к вычету/возмещению */}
          <AccordionItem value="vat">
            <AccordionTrigger>
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-2">
                  <span>НДС к вычету / возмещению</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      Входящий НДС (от закупок) можно принять к вычету. Если входящий НДС больше исходящего — возможно возмещение.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className={`text-sm font-mono ${duties.vatBalance >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {duties.vatBalance >= 0 ? 'К уплате: ' : 'К возмещению: '}
                  {Math.abs(duties.vatBalance).toLocaleString("ru-RU")} {currency}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ставка НДС (%)</Label>
                  <NumericInput
                    value={duties.vatRate}
                    onChange={(v) => updateField('vatRate', v)}
                    placeholder="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>НДС входящий (от закупок)</Label>
                  <NumericInput
                    value={duties.vatInput}
                    onChange={(v) => updateField('vatInput', v)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>НДС исходящий (в выручке)</Label>
                  <div className="flex gap-2">
                    <NumericInput
                      value={duties.vatOutput}
                      onChange={(v) => updateField('vatOutput', v)}
                    />
                    <Button variant="outline" size="sm" onClick={autoCalculateVat}>
                      <Calculator className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>НДС к уплате/возмещению</Label>
                  <div className={`p-2 rounded-lg text-center font-mono ${
                    duties.vatBalance >= 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                  }`}>
                    {duties.vatBalance >= 0 ? '+' : ''}{duties.vatBalance.toLocaleString("ru-RU")} {currency}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  💡 НДС к уплате = НДС исходящий − НДС входящий. 
                  Если результат отрицательный — можно подать на возмещение.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Summary */}
        <div className="mt-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Пошлины</p>
              <p className="font-mono font-bold text-amber-500">
                {totalDuties.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">НДС к уплате</p>
              <p className="font-mono font-bold text-red-500">
                {vatToPay.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">НДС к возмещению</p>
              <p className="font-mono font-bold text-green-500">
                {vatToRefund.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

DutiesAndTaxes.displayName = "DutiesAndTaxes";
