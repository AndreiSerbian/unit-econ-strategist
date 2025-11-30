import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Target, BarChart3, DollarSign } from "lucide-react";

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

interface CompetitorData {
  id: string;
  name: string;
  revenue: number;
  totalClients?: number;
  newClients?: number;
  returningClients?: number;
  conversionRate?: number;
  avgCheck?: number;
  fixedCosts?: number;
  variableCosts?: number;
  marketingSpend: number;
  detailedExpenses?: DetailedExpenses;
  marketShare?: number;
  pricing?: number;
  quality?: number;
  products?: any[];
}

interface CompetitorKeyMetricsComparisonProps {
  myCompany: CompetitorData;
  competitors: CompetitorData[];
  currency: string;
}

export const CompetitorKeyMetricsComparison = ({
  myCompany,
  competitors,
  currency,
}: CompetitorKeyMetricsComparisonProps) => {
  const calculateCAC = (company: CompetitorData) => {
    if (!company.detailedExpenses || !company.newClients || company.newClients === 0) return 0;

    const marketing =
      company.detailedExpenses.variableCosts.marketing.trafficPurchase +
      company.detailedExpenses.variableCosts.marketing.contractorsPayment +
      company.detailedExpenses.variableCosts.marketing.crmCosts +
      company.detailedExpenses.variableCosts.marketing.customCategories.reduce((sum, c) => sum + c.value, 0);

    const salesCost =
      company.detailedExpenses.variableCosts.salesPayroll.bonusNewClients +
      company.detailedExpenses.variableCosts.salesPayroll.customCategories.reduce((sum, c) => sum + c.value, 0);

    return (marketing + salesCost) / company.newClients;
  };

  const calculateCPL = (company: CompetitorData) => {
    if (!company.detailedExpenses || !company.newClients || !company.conversionRate) return 0;

    const marketing =
      company.detailedExpenses.variableCosts.marketing.trafficPurchase +
      company.detailedExpenses.variableCosts.marketing.contractorsPayment +
      company.detailedExpenses.variableCosts.marketing.crmCosts +
      company.detailedExpenses.variableCosts.marketing.customCategories.reduce((sum, c) => sum + c.value, 0);

    const leads = company.newClients / (company.conversionRate / 100 || 1);
    return leads > 0 ? marketing / leads : 0;
  };

  const calculateBreakeven = (company: CompetitorData) => {
    if (!company.detailedExpenses || !company.totalClients || !company.variableCosts || !company.avgCheck) return 0;

    const fixedTotal =
      company.detailedExpenses.fixedCosts.salaryOldClients +
      company.detailedExpenses.fixedCosts.salaryNewClients +
      company.detailedExpenses.fixedCosts.officeRent +
      company.detailedExpenses.fixedCosts.warehouseRent +
      company.detailedExpenses.fixedCosts.managementSalary +
      company.detailedExpenses.fixedCosts.marketingSalary +
      company.detailedExpenses.fixedCosts.productionSalary +
      company.detailedExpenses.fixedCosts.internet +
      company.detailedExpenses.fixedCosts.communication +
      company.detailedExpenses.fixedCosts.banking +
      company.detailedExpenses.fixedCosts.subscriptions +
      company.detailedExpenses.fixedCosts.utilities +
      company.detailedExpenses.fixedCosts.customCategories.reduce((sum, c) => sum + c.value, 0);

    const variablePerClient = company.totalClients > 0 ? company.variableCosts / company.totalClients : 0;
    const contribution = company.avgCheck - variablePerClient;

    return contribution > 0 ? fixedTotal / contribution : 0;
  };

  const calculateProfitMargin = (company: CompetitorData) => {
    if (company.revenue === 0) return 0;
    const totalCosts = (company.fixedCosts || 0) + (company.variableCosts || 0) + company.marketingSpend;
    const profit = company.revenue - totalCosts;
    return (profit / company.revenue) * 100;
  };

  // Фильтруем только тех конкурентов, у которых есть detailedExpenses
  const competitorsWithMetrics = competitors.filter((c) => c.detailedExpenses);

  if (competitorsWithMetrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            📊 Сравнение ключевых метрик с конкурентами
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Добавьте детальные показатели конкурентам для сравнения метрик
          </p>
        </CardContent>
      </Card>
    );
  }

  const comparisonData = [
    {
      company: myCompany.name || "Моя компания",
      CAC: Math.round(calculateCAC(myCompany)),
      CPL: Math.round(calculateCPL(myCompany)),
      "Точка безубыточности": Math.round(calculateBreakeven(myCompany)),
      "Маржа (%)": parseFloat(calculateProfitMargin(myCompany).toFixed(1)),
    },
    ...competitorsWithMetrics.map((competitor) => ({
      company: competitor.name,
      CAC: Math.round(calculateCAC(competitor)),
      CPL: Math.round(calculateCPL(competitor)),
      "Точка безубыточности": Math.round(calculateBreakeven(competitor)),
      "Маржа (%)": parseFloat(calculateProfitMargin(competitor).toFixed(1)),
    })),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            📊 CAC и CPL: сравнение с конкурентами
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="company" angle={-15} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="CAC" fill="hsl(var(--primary))" name={`CAC (${currency})`} />
              <Bar dataKey="CPL" fill="hsl(var(--secondary))" name={`CPL (${currency})`} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            🎯 Точка безубыточности и маржа прибыли
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} className="text-xs sm:text-sm">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="company" angle={-15} textAnchor="end" height={80} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="Точка безубыточности"
                fill="hsl(var(--accent))"
                name="Точка безубыточности (кл.)"
              />
              <Bar yAxisId="right" dataKey="Маржа (%)" fill="hsl(var(--success))" name="Маржа (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            💰 Сравнительная таблица показателей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Компания</th>
                  <th className="text-right p-2 font-semibold">CAC</th>
                  <th className="text-right p-2 font-semibold">CPL</th>
                  <th className="text-right p-2 font-semibold">Безубыточность</th>
                  <th className="text-right p-2 font-semibold">Маржа</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, idx) => (
                  <tr key={idx} className={`border-b hover:bg-muted/50 ${idx === 0 ? "bg-primary/5" : ""}`}>
                    <td className="p-2 font-semibold">
                      {idx === 0 && "🏠 "}
                      {item.company}
                    </td>
                    <td className="text-right p-2 font-mono">
                      {item.CAC.toLocaleString()} {currency}
                    </td>
                    <td className="text-right p-2 font-mono">
                      {item.CPL.toLocaleString()} {currency}
                    </td>
                    <td className="text-right p-2 font-mono">
                      {item["Точка безубыточности"].toLocaleString()} кл.
                    </td>
                    <td className="text-right p-2 font-mono">{item["Маржа (%)"].toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
