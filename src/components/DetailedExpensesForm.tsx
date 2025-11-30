import { useState } from "react";
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

export const DetailedExpensesForm = ({
  expenses,
  onChange,
  revenue,
  currency,
}: DetailedExpensesFormProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");

  const updateFixedCost = (field: keyof typeof expenses.fixedCosts, value: number) => {
    if (field === "customCategories") return;
    onChange({
      ...expenses,
      fixedCosts: { ...expenses.fixedCosts, [field]: value },
    });
  };

  const updateVariableCost = (
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
  };

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

  const updateCustomCategory = (
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
  };

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
              <AccordionTrigger>ФОТ (фонд оплаты труда)</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>ЗП по старым клиентам</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={expenses.fixedCosts.salaryOldClients || ""}
                      onChange={(e) =>
                        updateFixedCost("salaryOldClients", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {calculatePercent(expenses.fixedCosts.salaryOldClients)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ЗП по новым клиентам</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={expenses.fixedCosts.salaryNewClients || ""}
                      onChange={(e) =>
                        updateFixedCost("salaryNewClients", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {calculatePercent(expenses.fixedCosts.salaryNewClients)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Оклад руководящего состава</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={expenses.fixedCosts.managementSalary || ""}
                      onChange={(e) =>
                        updateFixedCost("managementSalary", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {calculatePercent(expenses.fixedCosts.managementSalary)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Оклад отдела маркетинга</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={expenses.fixedCosts.marketingSalary || ""}
                      onChange={(e) =>
                        updateFixedCost("marketingSalary", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {calculatePercent(expenses.fixedCosts.marketingSalary)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Оклад отдела производства</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={expenses.fixedCosts.productionSalary || ""}
                      onChange={(e) =>
                        updateFixedCost("productionSalary", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
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
                  <Input
                    type="number"
                    value={expenses.fixedCosts.officeRent || ""}
                    onChange={(e) => updateFixedCost("officeRent", parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Аренда склада</Label>
                  <Input
                    type="number"
                    value={expenses.fixedCosts.warehouseRent || ""}
                    onChange={(e) =>
                      updateFixedCost("warehouseRent", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
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
                    <Input
                      type="number"
                      value={expenses.fixedCosts.internet || ""}
                      onChange={(e) => updateFixedCost("internet", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Связь</Label>
                    <Input
                      type="number"
                      value={expenses.fixedCosts.communication || ""}
                      onChange={(e) =>
                        updateFixedCost("communication", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Банковское обслуживание</Label>
                    <Input
                      type="number"
                      value={expenses.fixedCosts.banking || ""}
                      onChange={(e) => updateFixedCost("banking", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Лицензии и подписки</Label>
                    <Input
                      type="number"
                      value={expenses.fixedCosts.subscriptions || ""}
                      onChange={(e) =>
                        updateFixedCost("subscriptions", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Коммунальные (уборка и т.д.)</Label>
                    <Input
                      type="number"
                      value={expenses.fixedCosts.utilities || ""}
                      onChange={(e) => updateFixedCost("utilities", parseFloat(e.target.value) || 0)}
                      placeholder="0"
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
                    <Input
                      type="number"
                      value={category.value || ""}
                      onChange={(e) =>
                        updateCustomCategory(
                          "fixed",
                          category.id,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
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
                  <Input
                    type="number"
                    value={expenses.variableCosts.marketing.trafficPurchase || ""}
                    onChange={(e) =>
                      updateVariableCost("marketing", "trafficPurchase", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Оплата подрядчикам</Label>
                  <Input
                    type="number"
                    value={expenses.variableCosts.marketing.contractorsPayment || ""}
                    onChange={(e) =>
                      updateVariableCost(
                        "marketing",
                        "contractorsPayment",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CRM расходы</Label>
                  <Input
                    type="number"
                    value={expenses.variableCosts.marketing.crmCosts || ""}
                    onChange={(e) =>
                      updateVariableCost("marketing", "crmCosts", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                </div>
                {expenses.variableCosts.marketing.customCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Label className="min-w-[200px]">{category.name}</Label>
                    <Input
                      type="number"
                      value={category.value || ""}
                      onChange={(e) =>
                        updateCustomCategory(
                          "variable",
                          category.id,
                          parseFloat(e.target.value) || 0,
                          "marketing"
                        )
                      }
                      placeholder="0"
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
                  <span>ФОТ продаж (Sales Cost)</span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {calculateSalesTotal().toLocaleString("ru-RU")} {currency}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Бонусы по старым клиентам</Label>
                  <Input
                    type="number"
                    value={expenses.variableCosts.salesPayroll.bonusOldClients || ""}
                    onChange={(e) =>
                      updateVariableCost(
                        "salesPayroll",
                        "bonusOldClients",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Бонусы по новым клиентам</Label>
                  <Input
                    type="number"
                    value={expenses.variableCosts.salesPayroll.bonusNewClients || ""}
                    onChange={(e) =>
                      updateVariableCost(
                        "salesPayroll",
                        "bonusNewClients",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                </div>
                {expenses.variableCosts.salesPayroll.customCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Label className="min-w-[200px]">{category.name}</Label>
                    <Input
                      type="number"
                      value={category.value || ""}
                      onChange={(e) =>
                        updateCustomCategory(
                          "variable",
                          category.id,
                          parseFloat(e.target.value) || 0,
                          "salesPayroll"
                        )
                      }
                      placeholder="0"
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
                  <Input
                    type="number"
                    value={expenses.variableCosts.production.materials || ""}
                    onChange={(e) =>
                      updateVariableCost("production", "materials", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Кураторы</Label>
                  <Input
                    type="number"
                    value={expenses.variableCosts.production.curators || ""}
                    onChange={(e) =>
                      updateVariableCost("production", "curators", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Логистика</Label>
                  <Input
                    type="number"
                    value={expenses.variableCosts.production.logistics || ""}
                    onChange={(e) =>
                      updateVariableCost("production", "logistics", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Процент партнёрам</Label>
                  <Input
                    type="number"
                    value={expenses.variableCosts.production.partnersPercent || ""}
                    onChange={(e) =>
                      updateVariableCost(
                        "production",
                        "partnersPercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ремонт оборудования</Label>
                  <Input
                    type="number"
                    value={expenses.variableCosts.production.equipmentRepair || ""}
                    onChange={(e) =>
                      updateVariableCost(
                        "production",
                        "equipmentRepair",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                  />
                </div>
                {expenses.variableCosts.production.customCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Label className="min-w-[200px]">{category.name}</Label>
                    <Input
                      type="number"
                      value={category.value || ""}
                      onChange={(e) =>
                        updateCustomCategory(
                          "variable",
                          category.id,
                          parseFloat(e.target.value) || 0,
                          "production"
                        )
                      }
                      placeholder="0"
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
                  <Input
                    type="number"
                    value={expenses.taxRate || ""}
                    onChange={(e) =>
                      onChange({ ...expenses, taxRate: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Сумма налогов ({currency})</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={expenses.taxes || ""}
                      onChange={(e) =>
                        onChange({ ...expenses, taxes: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
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
                    <Input
                      type="number"
                      value={category.value || ""}
                      onChange={(e) =>
                        updateCustomCategory(
                          "variable",
                          category.id,
                          parseFloat(e.target.value) || 0,
                          "other"
                        )
                      }
                      placeholder="0"
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
};
