import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, DollarSign, Calendar, Target } from "lucide-react";

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
  fixedCosts?: number;
  variableCosts?: number;
  marketingSpend: number;
  detailedExpenses?: DetailedExpenses;
}

interface CompetitorROICalculatorProps {
  myCompany: {
    name: string;
    revenue: number;
    fixedCosts: number;
    variableCosts: number;
    marketingCosts: number;
  };
  competitors: CompetitorData[];
  currency: string;
}

export const CompetitorROICalculator = ({
  myCompany,
  competitors,
  currency,
}: CompetitorROICalculatorProps) => {
  const [timePeriod, setTimePeriod] = useState(12);
  const [initialInvestment, setInitialInvestment] = useState(0);

  const calculateMonthlyProfit = (company: { revenue: number; fixedCosts: number; variableCosts: number; marketingCosts: number }) => {
    const totalCosts = company.fixedCosts + company.variableCosts + company.marketingCosts;
    return company.revenue - totalCosts;
  };

  const calculateROI = (company: { revenue: number; fixedCosts: number; variableCosts: number; marketingCosts: number }) => {
    const monthlyProfit = calculateMonthlyProfit(company);
    const totalProfit = monthlyProfit * timePeriod;
    if (initialInvestment === 0) return 0;
    return ((totalProfit - initialInvestment) / initialInvestment) * 100;
  };

  const calculatePaybackPeriod = (company: { revenue: number; fixedCosts: number; variableCosts: number; marketingCosts: number }) => {
    const monthlyProfit = calculateMonthlyProfit(company);
    if (monthlyProfit <= 0 || initialInvestment === 0) return Infinity;
    return initialInvestment / monthlyProfit;
  };

  const generateCashFlowData = () => {
    const data = [];
    
    const companies = [
      { name: "Моя компания", ...myCompany },
      ...competitors.map(c => ({
        name: c.name,
        revenue: c.revenue,
        fixedCosts: c.fixedCosts || 0,
        variableCosts: c.variableCosts || 0,
        marketingCosts: c.marketingSpend || 0,
      }))
    ];

    for (let month = 0; month <= timePeriod; month++) {
      const dataPoint: any = { month: `М${month}` };
      
      companies.forEach(company => {
        const monthlyProfit = calculateMonthlyProfit(company);
        const cumulative = month === 0 ? -initialInvestment : (data[month - 1]?.[company.name] || 0) + monthlyProfit;
        dataPoint[company.name] = Math.round(cumulative);
      });
      
      data.push(dataPoint);
    }

    return data;
  };

  const generateMonthlyProfitData = () => {
    const data = [];
    
    const companies = [
      { name: "Моя компания", ...myCompany },
      ...competitors.map(c => ({
        name: c.name,
        revenue: c.revenue,
        fixedCosts: c.fixedCosts || 0,
        variableCosts: c.variableCosts || 0,
        marketingCosts: c.marketingSpend || 0,
      }))
    ];

    for (let month = 1; month <= Math.min(timePeriod, 12); month++) {
      const dataPoint: any = { month: `М${month}` };
      
      companies.forEach(company => {
        const monthlyProfit = calculateMonthlyProfit(company);
        dataPoint[company.name] = Math.round(monthlyProfit);
      });
      
      data.push(dataPoint);
    }

    return data;
  };

  const roiData = [
    {
      name: "Моя компания",
      roi: calculateROI(myCompany),
      payback: calculatePaybackPeriod(myCompany),
      totalProfit: calculateMonthlyProfit(myCompany) * timePeriod,
      monthlyProfit: calculateMonthlyProfit(myCompany),
    },
    ...competitors.map(c => {
      const companyData = {
        revenue: c.revenue,
        fixedCosts: c.fixedCosts || 0,
        variableCosts: c.variableCosts || 0,
        marketingCosts: c.marketingSpend || 0,
      };
      return {
        name: c.name,
        roi: calculateROI(companyData),
        payback: calculatePaybackPeriod(companyData),
        totalProfit: calculateMonthlyProfit(companyData) * timePeriod,
        monthlyProfit: calculateMonthlyProfit(companyData),
      };
    })
  ];

  const CHART_COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--secondary))",
    "hsl(var(--accent))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(220 70% 50%)",
    "hsl(280 70% 50%)",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            💰 Сравнительный ROI: Моя компания vs Конкуренты
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investment" className="flex items-center gap-1 text-xs sm:text-sm">
                <DollarSign className="w-3 h-3" />
                Начальные инвестиции ({currency})
              </Label>
              <Input
                id="investment"
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                placeholder="0"
                min="0"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period" className="flex items-center gap-1 text-xs sm:text-sm">
                <Calendar className="w-3 h-3" />
                Период анализа (месяцев)
              </Label>
              <Input
                id="period"
                type="number"
                value={timePeriod}
                onChange={(e) => setTimePeriod(Number(e.target.value))}
                placeholder="12"
                min="1"
                max="60"
                className="text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-4">
            {roiData.map((item) => (
              <Card key={item.name} className="bg-gradient-to-br from-accent/5 to-primary/5">
                <CardContent className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-sm sm:text-base truncate" title={item.name}>{item.name}</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">ROI</p>
                      <p className={`text-lg sm:text-xl font-bold font-mono ${item.roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {item.roi.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Окупаемость</p>
                      <p className="text-sm sm:text-base font-semibold font-mono">
                        {item.payback === Infinity ? '∞' : `${item.payback.toFixed(1)} мес.`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Прибыль/мес</p>
                      <p className="text-sm sm:text-base font-semibold font-mono">
                        {item.monthlyProfit.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} {currency}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            📈 Накопительный денежный поток: Сравнение
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400} className="text-xs sm:text-sm">
            <LineChart data={generateCashFlowData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()} ${currency}`}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {roiData.map((item, index) => (
                <Line
                  key={item.name}
                  type="monotone"
                  dataKey={item.name}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
            💵 Ежемесячная прибыль: Сравнение
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350} className="text-xs sm:text-sm">
            <BarChart data={generateMonthlyProfitData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()} ${currency}`}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              {roiData.map((item, index) => (
                <Bar
                  key={item.name}
                  dataKey={item.name}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">📊 Сравнительная таблица ROI и прибыльности</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Компания</th>
                  <th className="text-right p-2 font-semibold">ROI (%)</th>
                  <th className="text-right p-2 font-semibold">Окупаемость (мес.)</th>
                  <th className="text-right p-2 font-semibold">Прибыль за период</th>
                  <th className="text-right p-2 font-semibold">Прибыль/мес</th>
                </tr>
              </thead>
              <tbody>
                {roiData.map((item, index) => (
                  <tr key={item.name} className={`border-b hover:bg-muted/50 ${index === 0 ? 'bg-primary/5' : ''}`}>
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className={`text-right p-2 font-mono font-semibold ${item.roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {item.roi.toFixed(1)}%
                    </td>
                    <td className="text-right p-2 font-mono">
                      {item.payback === Infinity ? '∞' : item.payback.toFixed(1)}
                    </td>
                    <td className="text-right p-2 font-mono">
                      {item.totalProfit.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} {currency}
                    </td>
                    <td className="text-right p-2 font-mono">
                      {item.monthlyProfit.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} {currency}
                    </td>
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
