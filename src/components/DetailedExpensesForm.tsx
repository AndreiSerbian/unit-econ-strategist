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
import { Plus, X, Calculator } from "lucide-react";
import { NumericInput } from "@/components/ui/numeric-input";

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
}

interface DetailedExpensesFormProps {
  expenses: DetailedExpenses;
  onChange: (expenses: DetailedExpenses) => void;
  revenue: number;
  currency: string;
}

export const DetailedExpensesForm = memo(({
  expenses,
  onChange,
  revenue,
  currency,
}: DetailedExpensesFormProps) => {
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
    return (
      expenses.variableCosts.marketing.trafficPurchase +
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
            <span>📊 Постоянные расходы</span>
            <span className="font-mono text-primary">
              {calculateFixedTotal().toLocaleString("ru-RU")} {currency}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="fot">
              <AccordionTrigger>Оклады и ставки (постоянный ФОТ)</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Фиксированная часть зарплаты, не зависящая от результатов
                </p>
                <div className="space-y-2">
                  <Label>ЗП по старым клиентам</Label>
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
                  <Label>ЗП по новым клиентам</Label>
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
                  <Label>Оклад руководящего состава</Label>
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
                  <Label>Оклад отдела маркетинга</Label>
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
                  <Label>Оклад отдела производства</Label>
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
              <AccordionTrigger>Аренда</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Аренда офиса</Label>
                  <NumericInput
                    value={expenses.fixedCosts.officeRent}
                    onChange={(v) => updateFixedCost("officeRent", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Аренда склада</Label>
                  <NumericInput
                    value={expenses.fixedCosts.warehouseRent}
                    onChange={(v) => updateFixedCost("warehouseRent", v)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="operational">
              <AccordionTrigger>Операционные расходы</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Интернет</Label>
                    <NumericInput
                      value={expenses.fixedCosts.internet}
                      onChange={(v) => updateFixedCost("internet", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Связь</Label>
                    <NumericInput
                      value={expenses.fixedCosts.communication}
                      onChange={(v) => updateFixedCost("communication", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Банковское обслуживание</Label>
                    <NumericInput
                      value={expenses.fixedCosts.banking}
                      onChange={(v) => updateFixedCost("banking", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Лицензии и подписки</Label>
                    <NumericInput
                      value={expenses.fixedCosts.subscriptions}
                      onChange={(v) => updateFixedCost("subscriptions", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Коммунальные (уборка и т.д.)</Label>
                    <NumericInput
                      value={expenses.fixedCosts.utilities}
                      onChange={(v) => updateFixedCost("utilities", v)}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="custom-fixed">
              <AccordionTrigger>Пользовательские категории</AccordionTrigger>
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
                    placeholder="Название категории"
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
                    Добавить
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
            <span>📈 Переменные расходы</span>
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
                  <span>Маркетинг (Marketing Cost)</span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {calculateMarketingTotal().toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Закупка трафика</Label>
                  <NumericInput
                    value={expenses.variableCosts.marketing.trafficPurchase}
                    onChange={(v) => updateVariableCost("marketing", "trafficPurchase", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Оплата подрядчикам</Label>
                  <NumericInput
                    value={expenses.variableCosts.marketing.contractorsPayment}
                    onChange={(v) => updateVariableCost("marketing", "contractorsPayment", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CRM расходы</Label>
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
                    placeholder="Название категории"
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
                    Добавить
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sales">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <span>Бонусы и KPI (переменный ФОТ)</span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {calculateSalesTotal().toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Переменная часть зарплаты, зависящая от результатов продаж
                </p>
                <div className="space-y-2">
                  <Label>Бонусы по старым клиентам</Label>
                  <NumericInput
                    value={expenses.variableCosts.salesPayroll.bonusOldClients}
                    onChange={(v) => updateVariableCost("salesPayroll", "bonusOldClients", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Бонусы по новым клиентам</Label>
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
                    placeholder="Название категории"
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
                    Добавить
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="production">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <span>Исполнение обязательств (Production Cost)</span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {calculateProductionTotal().toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Материалы</Label>
                  <NumericInput
                    value={expenses.variableCosts.production.materials}
                    onChange={(v) => updateVariableCost("production", "materials", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Кураторы</Label>
                  <NumericInput
                    value={expenses.variableCosts.production.curators}
                    onChange={(v) => updateVariableCost("production", "curators", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Логистика</Label>
                  <NumericInput
                    value={expenses.variableCosts.production.logistics}
                    onChange={(v) => updateVariableCost("production", "logistics", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Процент партнёрам</Label>
                  <NumericInput
                    value={expenses.variableCosts.production.partnersPercent}
                    onChange={(v) => updateVariableCost("production", "partnersPercent", v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ремонт оборудования</Label>
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
                    placeholder="Название категории"
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
                    Добавить
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="taxes">
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <span>Налоги и другое</span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {calculateOtherTotal().toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Налоговая ставка (%)</Label>
                  <NumericInput
                    value={expenses.taxRate}
                    onChange={updateTaxRate}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Сумма налогов ({currency})</Label>
                  <div className="flex items-center gap-2">
                    <NumericInput
                      value={expenses.taxes}
                      onChange={updateTaxes}
                    />
                    <Button variant="outline" size="sm" onClick={autoCalculateTaxes}>
                      <Calculator className="w-4 h-4 mr-1" />
                      Авто
                    </Button>
                  </div>
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
                    placeholder="Название категории"
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
                    Добавить
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
