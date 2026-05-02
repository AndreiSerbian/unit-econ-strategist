import { useState, memo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, X, Calculator, Info } from "lucide-react";
import { NumericInput } from "@/components/ui/numeric-input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "@/i18n/useTranslation";

interface ExpenseCategory {
  id: string;
  name: string;
  value: number;
  isCustom: boolean;
}

interface DetailedExpenses {
  fixedCosts: {
    salaryOldClients: number;
    salaryNewClients: number;
    officeRent: number;
    warehouseRent: number;
    managementSalary: number;
    marketingSalary: number;
    productionSalary: number;
    internet: number;
    communication: number;
    banking: number;
    subscriptions: number;
    utilities: number;
    customCategories: ExpenseCategory[];
  };
  variableCosts: {
    marketing: {
      trafficPurchase: number;
      contractorsPayment: number;
      crmCosts: number;
      customCategories: ExpenseCategory[];
    };
    salesPayroll: {
      bonusOldClients: number;
      bonusNewClients: number;
      customCategories: ExpenseCategory[];
    };
    production: {
      materials: number;
      curators: number;
      logistics: number;
      partnersPercent: number;
      equipmentRepair: number;
      customCategories: ExpenseCategory[];
    };
    other: {
      customCategories: ExpenseCategory[];
    };
  };
  taxRate: number;
  taxes: number;
  duties?: {
    customsDuty: number;
    customsDutyRate: number;
    exportDuty: number;
    exportDutyRate: number;
    vatInput: number;
    vatOutput: number;
  };
}

interface DetailedExpensesFormProps {
  expenses: DetailedExpenses;
  onChange: (expenses: DetailedExpenses) => void;
  revenue: number;
  currency: string;
  hasLeadSources?: boolean;
}

export const DetailedExpensesForm = memo(({
  expenses,
  onChange,
  revenue,
  currency,
  hasLeadSources = false,
}: DetailedExpensesFormProps) => {
  const { t } = useTranslation();
  const [newCategoryName, setNewCategoryName] = useState("");

  const updateFixedCost = useCallback((field: keyof typeof expenses.fixedCosts, value: number) => {
    if (field === "customCategories") return;
    onChange({
      ...expenses,
      fixedCosts: { ...expenses.fixedCosts, [field]: value },
    });
  }, [expenses, onChange]);

  const updateVariableCost = useCallback((
    category: keyof typeof expenses.variableCosts,
    field: string,
    value: number
  ) => {
    if (category === "other") return;
    onChange({
      ...expenses,
      variableCosts: {
        ...expenses.variableCosts,
        [category]: {
          ...expenses.variableCosts[category],
          [field]: value,
        },
      },
    });
  }, [expenses, onChange]);

  const addCustomCategory = (
    type: "fixed" | "variable",
    subCategory?: keyof typeof expenses.variableCosts
  ) => {
    if (!newCategoryName.trim()) return;

    const newCategory: ExpenseCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      value: 0,
      isCustom: true,
    };

    if (type === "fixed") {
      onChange({
        ...expenses,
        fixedCosts: {
          ...expenses.fixedCosts,
          customCategories: [...expenses.fixedCosts.customCategories, newCategory],
        },
      });
    } else if (subCategory && subCategory !== "other") {
      onChange({
        ...expenses,
        variableCosts: {
          ...expenses.variableCosts,
          [subCategory]: {
            ...expenses.variableCosts[subCategory],
            customCategories: [
              ...(expenses.variableCosts[subCategory] as any).customCategories,
              newCategory,
            ],
          },
        },
      });
    } else if (subCategory === "other") {
      onChange({
        ...expenses,
        variableCosts: {
          ...expenses.variableCosts,
          other: {
            customCategories: [...expenses.variableCosts.other.customCategories, newCategory],
          },
        },
      });
    }

    setNewCategoryName("");
  };

  const removeCustomCategory = (
    type: "fixed" | "variable",
    categoryId: string,
    subCategory?: keyof typeof expenses.variableCosts
  ) => {
    if (type === "fixed") {
      onChange({
        ...expenses,
        fixedCosts: {
          ...expenses.fixedCosts,
          customCategories: expenses.fixedCosts.customCategories.filter(
            (c) => c.id !== categoryId
          ),
        },
      });
    } else if (subCategory && subCategory !== "other") {
      onChange({
        ...expenses,
        variableCosts: {
          ...expenses.variableCosts,
          [subCategory]: {
            ...expenses.variableCosts[subCategory],
            customCategories: (expenses.variableCosts[subCategory] as any).customCategories.filter(
              (c: ExpenseCategory) => c.id !== categoryId
            ),
          },
        },
      });
    } else if (subCategory === "other") {
      onChange({
        ...expenses,
        variableCosts: {
          ...expenses.variableCosts,
          other: {
            customCategories: expenses.variableCosts.other.customCategories.filter(
              (c) => c.id !== categoryId
            ),
          },
        },
      });
    }
  };

  const updateCustomCategory = useCallback((
    type: "fixed" | "variable",
    categoryId: string,
    value: number,
    subCategory?: keyof typeof expenses.variableCosts
  ) => {
    if (type === "fixed") {
      onChange({
        ...expenses,
        fixedCosts: {
          ...expenses.fixedCosts,
          customCategories: expenses.fixedCosts.customCategories.map((c) =>
            c.id === categoryId ? { ...c, value } : c
          ),
        },
      });
    } else if (subCategory && subCategory !== "other") {
      onChange({
        ...expenses,
        variableCosts: {
          ...expenses.variableCosts,
          [subCategory]: {
            ...expenses.variableCosts[subCategory],
            customCategories: (expenses.variableCosts[subCategory] as any).customCategories.map(
              (c: ExpenseCategory) => (c.id === categoryId ? { ...c, value } : c)
            ),
          },
        },
      });
    } else if (subCategory === "other") {
      onChange({
        ...expenses,
        variableCosts: {
          ...expenses.variableCosts,
          other: {
            customCategories: expenses.variableCosts.other.customCategories.map((c) =>
              c.id === categoryId ? { ...c, value } : c
            ),
          },
        },
      });
    }
  }, [expenses, onChange]);

  const calculateFixedTotal = () => {
    const predefined =
      expenses.fixedCosts.salaryOldClients +
      expenses.fixedCosts.salaryNewClients +
      expenses.fixedCosts.officeRent +
      expenses.fixedCosts.warehouseRent +
      expenses.fixedCosts.managementSalary +
      expenses.fixedCosts.marketingSalary +
      expenses.fixedCosts.productionSalary +
      expenses.fixedCosts.internet +
      expenses.fixedCosts.communication +
      expenses.fixedCosts.banking +
      expenses.fixedCosts.subscriptions +
      expenses.fixedCosts.utilities;
    const custom = expenses.fixedCosts.customCategories.reduce((sum, c) => sum + c.value, 0);
    return predefined + custom;
  };

  const calculateVariableTotal = () => {
    const marketing =
      expenses.variableCosts.marketing.trafficPurchase +
      expenses.variableCosts.marketing.contractorsPayment +
      expenses.variableCosts.marketing.crmCosts +
      expenses.variableCosts.marketing.customCategories.reduce((sum, c) => sum + c.value, 0);

    const sales =
      expenses.variableCosts.salesPayroll.bonusOldClients +
      expenses.variableCosts.salesPayroll.bonusNewClients +
      expenses.variableCosts.salesPayroll.customCategories.reduce((sum, c) => sum + c.value, 0);

    const production =
      expenses.variableCosts.production.materials +
      expenses.variableCosts.production.curators +
      expenses.variableCosts.production.logistics +
      expenses.variableCosts.production.partnersPercent +
      expenses.variableCosts.production.equipmentRepair +
      expenses.variableCosts.production.customCategories.reduce((sum, c) => sum + c.value, 0);

    const other = expenses.variableCosts.other.customCategories.reduce(
      (sum, c) => sum + c.value,
      0
    );

    return marketing + sales + production + other + expenses.taxes;
  };

  const calculateMarketingTotal = () => {
    // Если есть leadSources, не учитываем trafficPurchase (он учтён там)
    const trafficCost = hasLeadSources ? 0 : expenses.variableCosts.marketing.trafficPurchase;
    return (
      trafficCost +
      expenses.variableCosts.marketing.contractorsPayment +
      expenses.variableCosts.marketing.crmCosts +
      expenses.variableCosts.marketing.customCategories.reduce((sum, c) => sum + c.value, 0)
    );
  };

  const calculateSalesTotal = () => {
    return (
      expenses.variableCosts.salesPayroll.bonusOldClients +
      expenses.variableCosts.salesPayroll.bonusNewClients +
      expenses.variableCosts.salesPayroll.customCategories.reduce((sum, c) => sum + c.value, 0)
    );
  };

  const calculateProductionTotal = () => {
    return (
      expenses.variableCosts.production.materials +
      expenses.variableCosts.production.curators +
      expenses.variableCosts.production.logistics +
      expenses.variableCosts.production.partnersPercent +
      expenses.variableCosts.production.equipmentRepair +
      expenses.variableCosts.production.customCategories.reduce((sum, c) => sum + c.value, 0)
    );
  };

  const calculateOtherTotal = () => {
    return (
      expenses.variableCosts.other.customCategories.reduce((sum, c) => sum + c.value, 0) +
      expenses.taxes
    );
  };

  const calculatePercent = (value: number) => {
    if (revenue === 0) return "0.0";
    return ((value / revenue) * 100).toFixed(1);
  };

  const autoCalculateTaxes = () => {
    const profit = revenue - calculateFixedTotal() - calculateVariableTotal() + expenses.taxes;
    const calculatedTaxes = (profit * expenses.taxRate) / 100;
    onChange({
      ...expenses,
      taxes: Math.max(0, calculatedTaxes),
    });
  };

  const updateTaxRate = useCallback((value: number) => {
    onChange({ ...expenses, taxRate: value });
  }, [expenses, onChange]);

  const updateTaxes = useCallback((value: number) => {
    onChange({ ...expenses, taxes: value });
  }, [expenses, onChange]);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("expenses.fixedTitle")}</span>
            <span className="font-mono text-primary">
              {calculateFixedTotal().toLocaleString("ru-RU")} {currency}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="fot">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span>{t("expenses.fotGroup")}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                      {t("expenses.fotGroupTooltip")}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {t("expenses.fotHint")}
                </p>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.salaryOldClients")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.salaryOldClientsTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex items-center gap-2">
                    <NumericInput
                      value={expenses.fixedCosts.salaryOldClients}
                      onChange={(v) => updateFixedCost("salaryOldClients", v)}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {calculatePercent(expenses.fixedCosts.salaryOldClients)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.salaryNewClients")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.salaryNewClientsTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex items-center gap-2">
                    <NumericInput
                      value={expenses.fixedCosts.salaryNewClients}
                      onChange={(v) => updateFixedCost("salaryNewClients", v)}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {calculatePercent(expenses.fixedCosts.salaryNewClients)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.managementSalary")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.managementSalaryTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex items-center gap-2">
                    <NumericInput
                      value={expenses.fixedCosts.managementSalary}
                      onChange={(v) => updateFixedCost("managementSalary", v)}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {calculatePercent(expenses.fixedCosts.managementSalary)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.marketingSalary")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.marketingSalaryTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex items-center gap-2">
                    <NumericInput
                      value={expenses.fixedCosts.marketingSalary}
                      onChange={(v) => updateFixedCost("marketingSalary", v)}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {calculatePercent(expenses.fixedCosts.marketingSalary)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.productionSalary")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.productionSalaryTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="flex items-center gap-2">
                    <NumericInput
                      value={expenses.fixedCosts.productionSalary}
                      onChange={(v) => updateFixedCost("productionSalary", v)}
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {calculatePercent(expenses.fixedCosts.productionSalary)}%
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rent">
              <AccordionTrigger>{t("expenses.rentGroup")}</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{t("expenses.officeRent")}</Label>
                  <NumericInput
                    value={expenses.fixedCosts.officeRent}
                    onChange={(v) => updateFixedCost("officeRent", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("expenses.warehouseRent")}</Label>
                  <NumericInput
                    value={expenses.fixedCosts.warehouseRent}
                    onChange={(v) => updateFixedCost("warehouseRent", v)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="operational">
              <AccordionTrigger>{t("expenses.operationalGroup")}</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("expenses.internet")}</Label>
                    <NumericInput
                      value={expenses.fixedCosts.internet}
                      onChange={(v) => updateFixedCost("internet", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("expenses.communication")}</Label>
                    <NumericInput
                      value={expenses.fixedCosts.communication}
                      onChange={(v) => updateFixedCost("communication", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("expenses.banking")}</Label>
                    <NumericInput
                      value={expenses.fixedCosts.banking}
                      onChange={(v) => updateFixedCost("banking", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("expenses.subscriptions")}</Label>
                    <NumericInput
                      value={expenses.fixedCosts.subscriptions}
                      onChange={(v) => updateFixedCost("subscriptions", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("expenses.utilities")}</Label>
                    <NumericInput
                      value={expenses.fixedCosts.utilities}
                      onChange={(v) => updateFixedCost("utilities", v)}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="custom-fixed">
              <AccordionTrigger>{t("expenses.customGroup")}</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {expenses.fixedCosts.customCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Label className="min-w-[200px]">{category.name}</Label>
                    <NumericInput
                      value={category.value}
                      onChange={(v) => updateCustomCategory("fixed", category.id, v)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomCategory("fixed", category.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t("forms.addCategoryName")}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomCategory("fixed")}
                    disabled={!newCategoryName.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t("forms.add")}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("expenses.variableTitle")}</span>
            <span className="font-mono text-secondary">
              {calculateVariableTotal().toLocaleString("ru-RU")} {currency}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="marketing">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span>{t("expenses.marketingGroup")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.marketingGroupTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {calculateMarketingTotal().toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {hasLeadSources ? (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      {t("expenses.marketingFromTraffic")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <span>{t("expenses.trafficPurchase")}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                          {t("expenses.trafficPurchaseTooltip")}
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      value={expenses.variableCosts.marketing.trafficPurchase}
                      onChange={(v) => updateVariableCost("marketing", "trafficPurchase", v)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.contractorsPayment")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.contractorsPaymentTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <NumericInput
                    value={expenses.variableCosts.marketing.contractorsPayment}
                    onChange={(v) => updateVariableCost("marketing", "contractorsPayment", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.crmCosts")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.crmCostsTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <NumericInput
                    value={expenses.variableCosts.marketing.crmCosts}
                    onChange={(v) => updateVariableCost("marketing", "crmCosts", v)}
                  />
                </div>
                {expenses.variableCosts.marketing.customCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Label className="min-w-[200px]">{category.name}</Label>
                    <NumericInput
                      value={category.value}
                      onChange={(v) => updateCustomCategory("variable", category.id, v, "marketing")}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomCategory("variable", category.id, "marketing")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t("forms.addCategoryName")}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomCategory("variable", "marketing")}
                    disabled={!newCategoryName.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t("forms.add")}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sales">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span>{t("expenses.salesGroup")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.salesGroupTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {calculateSalesTotal().toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {t("expenses.salesHint")}
                </p>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.bonusOldClients")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.bonusOldClientsTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <NumericInput
                    value={expenses.variableCosts.salesPayroll.bonusOldClients}
                    onChange={(v) => updateVariableCost("salesPayroll", "bonusOldClients", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.bonusNewClients")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.bonusNewClientsTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <NumericInput
                    value={expenses.variableCosts.salesPayroll.bonusNewClients}
                    onChange={(v) => updateVariableCost("salesPayroll", "bonusNewClients", v)}
                  />
                </div>
                {expenses.variableCosts.salesPayroll.customCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Label className="min-w-[200px]">{category.name}</Label>
                    <NumericInput
                      value={category.value}
                      onChange={(v) => updateCustomCategory("variable", category.id, v, "salesPayroll")}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomCategory("variable", category.id, "salesPayroll")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t("forms.addCategoryName")}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomCategory("variable", "salesPayroll")}
                    disabled={!newCategoryName.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t("forms.add")}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="production">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span>{t("expenses.productionGroup")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.productionGroupTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {calculateProductionTotal().toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.materials")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.materialsTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <NumericInput
                    value={expenses.variableCosts.production.materials}
                    onChange={(v) => updateVariableCost("production", "materials", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.curators")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.curatorsTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <NumericInput
                    value={expenses.variableCosts.production.curators}
                    onChange={(v) => updateVariableCost("production", "curators", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.logistics")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.logisticsTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <NumericInput
                    value={expenses.variableCosts.production.logistics}
                    onChange={(v) => updateVariableCost("production", "logistics", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.partnersPercent")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.partnersPercentTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <NumericInput
                    value={expenses.variableCosts.production.partnersPercent}
                    onChange={(v) => updateVariableCost("production", "partnersPercent", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.equipmentRepair")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.equipmentRepairTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <NumericInput
                    value={expenses.variableCosts.production.equipmentRepair}
                    onChange={(v) => updateVariableCost("production", "equipmentRepair", v)}
                  />
                </div>
                {expenses.variableCosts.production.customCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Label className="min-w-[200px]">{category.name}</Label>
                    <NumericInput
                      value={category.value}
                      onChange={(v) => updateCustomCategory("variable", category.id, v, "production")}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomCategory("variable", category.id, "production")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t("forms.addCategoryName")}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomCategory("variable", "production")}
                    disabled={!newCategoryName.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t("forms.add")}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="duties">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span>{t("expenses.dutiesGroup")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.dutiesGroupTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {(
                      (expenses.duties?.customsDuty || 0) +
                      (expenses.duties?.exportDuty || 0) +
                      Math.max(0, (expenses.duties?.vatOutput || 0) - (expenses.duties?.vatInput || 0))
                    ).toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <span>{t("expenses.customsDuty", { currency })}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                          {t("expenses.customsDutyTooltip")}
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      value={expenses.duties?.customsDuty || 0}
                      onChange={(v) => onChange({
                        ...expenses,
                        duties: { ...expenses.duties, customsDuty: v }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("expenses.customsDutyRate")}</Label>
                    <NumericInput
                      value={expenses.duties?.customsDutyRate || 0}
                      onChange={(v) => onChange({
                        ...expenses,
                        duties: { ...expenses.duties, customsDutyRate: v }
                      })}
                      placeholder="5-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <span>{t("expenses.exportDuty", { currency })}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                          {t("expenses.exportDutyTooltip")}
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <NumericInput
                      value={expenses.duties?.exportDuty || 0}
                      onChange={(v) => onChange({
                        ...expenses,
                        duties: { ...expenses.duties, exportDuty: v }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("expenses.exportDutyRate")}</Label>
                    <NumericInput
                      value={expenses.duties?.exportDutyRate || 0}
                      onChange={(v) => onChange({
                        ...expenses,
                        duties: { ...expenses.duties, exportDutyRate: v }
                      })}
                      placeholder="0-30"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-4">
                  <h4 className="font-medium text-sm">{t("expenses.vatTitle")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <span>{t("expenses.vatInput", { currency })}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                            {t("expenses.vatInputTooltip")}
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <NumericInput
                        value={expenses.duties?.vatInput || 0}
                        onChange={(v) => onChange({
                          ...expenses,
                          duties: { ...expenses.duties, vatInput: v }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <span>{t("expenses.vatOutput", { currency })}</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                            {t("expenses.vatOutputTooltip")}
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <div className="flex items-center gap-2">
                        <NumericInput
                          value={expenses.duties?.vatOutput || 0}
                          onChange={(v) => onChange({
                            ...expenses,
                            duties: { ...expenses.duties, vatOutput: v }
                          })}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const vatOutput = Math.round(revenue * 0.2 / 1.2);
                            onChange({
                              ...expenses,
                              duties: { ...expenses.duties, vatOutput }
                            });
                          }}
                        >
                          <Calculator className="w-4 h-4 mr-1" />
                          {t("common.auto")}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {((expenses.duties?.vatOutput || 0) - (expenses.duties?.vatInput || 0)) >= 0 
                          ? t("expenses.vatPayable") 
                          : t("expenses.vatRefundable")}
                      </span>
                      <span className={`text-lg font-bold font-mono ${
                        ((expenses.duties?.vatOutput || 0) - (expenses.duties?.vatInput || 0)) >= 0 
                          ? "text-destructive" 
                          : "text-green-600"
                      }`}>
                        {Math.abs((expenses.duties?.vatOutput || 0) - (expenses.duties?.vatInput || 0)).toLocaleString("ru-RU")} {currency}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="taxes">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span>{t("expenses.taxesGroup")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.taxesGroupTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {calculateOtherTotal().toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <span>{t("expenses.taxRate")}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
                        {t("expenses.taxRateTooltip")}
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <NumericInput
                    value={expenses.taxRate}
                    onChange={updateTaxRate}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("expenses.taxAmount", { currency })}</Label>
                  <div className="flex items-center gap-2">
                    <NumericInput
                      value={expenses.taxes}
                      onChange={updateTaxes}
                    />
                    <Button variant="outline" size="sm" onClick={autoCalculateTaxes}>
                      <Calculator className="w-4 h-4 mr-1" />
                      {t("common.auto")}
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">{t("expenses.payrollTaxesTitle")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("expenses.payrollTaxesHint")}
                  </p>
                  <p className="text-xs font-mono">
                    {t("expenses.payrollTaxesEstimate", { value: ((expenses.fixedCosts.salaryOldClients + expenses.fixedCosts.salaryNewClients + expenses.fixedCosts.managementSalary + expenses.fixedCosts.marketingSalary + expenses.fixedCosts.productionSalary) * 0.3).toLocaleString("ru-RU"), currency })}
                  </p>
                </div>
                {expenses.variableCosts.other.customCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Label className="min-w-[200px]">{category.name}</Label>
                    <NumericInput
                      value={category.value}
                      onChange={(v) => updateCustomCategory("variable", category.id, v, "other")}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomCategory("variable", category.id, "other")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t("forms.addCategoryName")}
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addCustomCategory("variable", "other")}
                    disabled={!newCategoryName.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t("forms.add")}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
});

DetailedExpensesForm.displayName = "DetailedExpensesForm";
