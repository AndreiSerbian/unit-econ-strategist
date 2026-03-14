import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart as PieChartIcon, TrendingDown } from "lucide-react";

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
    customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
  };
  variableCosts: {
    marketing: {
      trafficPurchase: number;
      contractorsPayment: number;
      crmCosts: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    salesPayroll: {
      bonusOldClients: number;
      bonusNewClients: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    production: {
      materials: number;
      curators: number;
      logistics: number;
      partnersPercent: number;
      equipmentRepair: number;
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
    other: {
      customCategories: Array<{ id: string; name: string; value: number; isCustom: boolean }>;
    };
  };
  taxRate: number;
  taxes: number;
}

interface CompetitorExpensesChartsProps {
  competitorName: string;
  expenses: DetailedExpenses;
  currency: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(220 70% 50%)",
  "hsl(280 70% 50%)",
  "hsl(340 70% 50%)",
  "hsl(40 70% 50%)",
];

export const CompetitorExpensesCharts = ({ competitorName, expenses, currency }: CompetitorExpensesChartsProps) => {
  // Подготовка данных для постоянных расходов
  const fixedCostsData = [
    { name: "ЗП по старым клиентам", value: expenses.fixedCosts.salaryOldClients },
    { name: "ЗП по новым клиентам", value: expenses.fixedCosts.salaryNewClients },
    { name: "Оклад руководства", value: expenses.fixedCosts.managementSalary },
    { name: "Оклад маркетинга", value: expenses.fixedCosts.marketingSalary },
    { name: "Оклад производства", value: expenses.fixedCosts.productionSalary },
    { name: "Аренда офиса", value: expenses.fixedCosts.officeRent },
    { name: "Аренда склада", value: expenses.fixedCosts.warehouseRent },
    { name: "Интернет", value: expenses.fixedCosts.internet },
    { name: "Связь", value: expenses.fixedCosts.communication },
    { name: "Банковское обслуживание", value: expenses.fixedCosts.banking },
    { name: "Лицензии и подписки", value: expenses.fixedCosts.subscriptions },
    { name: "Коммунальные", value: expenses.fixedCosts.utilities },
    ...expenses.fixedCosts.customCategories.map((cat) => ({
      name: cat.name,
      value: cat.value,
    })),
  ].filter((item) => item.value > 0);

  const totalFixedCosts = fixedCostsData.reduce((sum, item) => sum + item.value, 0);

  // Подготовка данных для переменных расходов
  const variableCostsData = [
    { name: "Закупка трафика", value: expenses.variableCosts.marketing.trafficPurchase, category: "Маркетинг" },
    { name: "Оплата подрядчикам", value: expenses.variableCosts.marketing.contractorsPayment, category: "Маркетинг" },
    { name: "CRM расходы", value: expenses.variableCosts.marketing.crmCosts, category: "Маркетинг" },
    ...expenses.variableCosts.marketing.customCategories.map((cat) => ({
      name: cat.name,
      value: cat.value,
      category: "Маркетинг",
    })),
    { name: "Бонусы по старым клиентам", value: expenses.variableCosts.salesPayroll.bonusOldClients, category: "ФОТ продаж" },
    { name: "Бонусы по новым клиентам", value: expenses.variableCosts.salesPayroll.bonusNewClients, category: "ФОТ продаж" },
    ...expenses.variableCosts.salesPayroll.customCategories.map((cat) => ({
      name: cat.name,
      value: cat.value,
      category: "ФОТ продаж",
    })),
    { name: "Материалы", value: expenses.variableCosts.production.materials, category: "Исполнение" },
    { name: "Выплаты исполнителям", value: expenses.variableCosts.production.curators, category: "Исполнение" },
    { name: "Логистика", value: expenses.variableCosts.production.logistics, category: "Исполнение" },
    { name: "% партнёрам", value: expenses.variableCosts.production.partnersPercent, category: "Исполнение" },
    { name: "Ремонт оборудования", value: expenses.variableCosts.production.equipmentRepair, category: "Исполнение" },
    ...expenses.variableCosts.production.customCategories.map((cat) => ({
      name: cat.name,
      value: cat.value,
      category: "Исполнение",
    })),
    { name: "Налоги", value: expenses.taxes, category: "Налоги" },
    ...expenses.variableCosts.other.customCategories.map((cat) => ({
      name: cat.name,
      value: cat.value,
      category: "Другое",
    })),
  ].filter((item) => item.value > 0);

  const totalVariableCosts = variableCostsData.reduce((sum, item) => sum + item.value, 0);

  // Группировка переменных расходов по категориям
  const variableCostsByCategory: { [key: string]: number } = {};
  variableCostsData.forEach((item) => {
    variableCostsByCategory[item.category] = (variableCostsByCategory[item.category] || 0) + item.value;
  });

  const variableCostsGrouped = Object.entries(variableCostsByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = data.payload.percent ? (data.payload.percent * 100).toFixed(1) : 0;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.name}</p>
          <p className="text-sm">
            Сумма: {data.value.toLocaleString("ru-RU")} {currency}
          </p>
          <p className="text-sm text-muted-foreground">Доля: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry: any) => {
    const percent = (entry.percent * 100).toFixed(0);
    return `${percent}%`;
  };

  if (totalFixedCosts === 0 && totalVariableCosts === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-destructive/5 via-warning/5 to-muted/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
            Структура расходов: {competitorName}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Детальное распределение постоянных и переменных расходов по категориям
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Постоянные расходы */}
        {fixedCostsData.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <PieChartIcon className="w-4 h-4 text-primary" />
                Постоянные расходы
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Распределение по категориям</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350} className="text-xs sm:text-sm">
                <PieChart>
                  <Pie
                    data={fixedCostsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {fixedCostsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px' }}
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 text-center">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Итого постоянные расходы:</p>
                <p className="text-lg sm:text-xl font-bold text-destructive font-mono">
                  {totalFixedCosts.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Переменные расходы (по категориям) */}
        {variableCostsGrouped.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <PieChartIcon className="w-4 h-4 text-secondary" />
                Переменные расходы
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Распределение по основным категориям</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350} className="text-xs sm:text-sm">
                <PieChart>
                  <Pie
                    data={variableCostsGrouped}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={100}
                    fill="hsl(var(--secondary))"
                    dataKey="value"
                  >
                    {variableCostsGrouped.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px' }}
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2 text-center">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Итого переменные расходы:</p>
                <p className="text-lg sm:text-xl font-bold text-warning font-mono">
                  {totalVariableCosts.toLocaleString("ru-RU")} {currency}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Общий итог */}
      <Card className="shadow-lg border-2 border-destructive/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Постоянные расходы</p>
              <p className="text-lg sm:text-xl font-bold text-destructive font-mono">
                {totalFixedCosts.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Переменные расходы</p>
              <p className="text-lg sm:text-xl font-bold text-warning font-mono">
                {totalVariableCosts.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Общие расходы</p>
              <p className="text-xl sm:text-2xl font-bold font-mono">
                {(totalFixedCosts + totalVariableCosts).toLocaleString("ru-RU")} {currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
