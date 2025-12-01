import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, TrendingUp, DollarSign, Target, Award } from "lucide-react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  ZAxis
} from "recharts";
import { calculateLTV, calculateLTVCACRatio, calculateProfitMargin, calculateCAC } from "@/utils/metricsCalculations";

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

interface Competitor {
  id: string;
  name: string;
  revenue: number;
  marketShare: number;
  pricing: number;
  quality: number;
  marketingSpend: number;
  totalClients?: number;
  newClients?: number;
  returningClients?: number;
  conversionRate?: number;
  avgCheck?: number;
  fixedCosts?: number;
  variableCosts?: number;
  detailedExpenses?: DetailedExpenses;
  customerLifetimeMonths?: number;
  purchaseFrequency?: number;
}

interface MyCompany {
  name: string;
  revenue: number;
  marketShare: number;
  totalClients: number;
  newClients: number;
  returningClients: number;
  conversionRate: number;
  avgCheck: number;
  fixedCosts: number;
  variableCosts: number;
  marketingCosts: number;
  detailedExpenses?: DetailedExpenses;
  customerLifetimeMonths?: number;
  purchaseFrequency?: number;
}

interface CompetitiveMapProps {
  myCompany: MyCompany;
  competitors: Competitor[];
  currency: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--destructive))',
  'hsl(var(--warning))',
  'hsl(var(--success))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const CompetitiveMap = ({ myCompany, competitors, currency }: CompetitiveMapProps) => {
  // Prepare data for scatter chart (LTV/CAC vs Margin)
  const scatterData = [
    {
      name: myCompany.name,
      ltvCacRatio: myCompany.detailedExpenses && myCompany.customerLifetimeMonths && myCompany.purchaseFrequency
        ? calculateLTVCACRatio({
            ...myCompany,
            marketingCosts: myCompany.marketingCosts,
          })
        : 0,
      margin: myCompany.detailedExpenses
        ? calculateProfitMargin({
            revenue: myCompany.revenue,
            totalClients: myCompany.totalClients,
            newClients: myCompany.newClients,
            returningClients: myCompany.returningClients,
            conversionRate: myCompany.conversionRate,
            avgCheck: myCompany.avgCheck,
            fixedCosts: myCompany.fixedCosts,
            variableCosts: myCompany.variableCosts,
            marketingCosts: myCompany.marketingCosts,
            detailedExpenses: myCompany.detailedExpenses,
          })
        : 0,
      revenue: myCompany.revenue,
      isMyCompany: true,
    },
    ...competitors
      .filter(c => c.detailedExpenses)
      .map(c => ({
        name: c.name,
        ltvCacRatio: c.customerLifetimeMonths && c.purchaseFrequency && c.detailedExpenses
          ? calculateLTVCACRatio({
              revenue: c.revenue,
              totalClients: c.totalClients || 0,
              newClients: c.newClients || 0,
              returningClients: c.returningClients || 0,
              conversionRate: c.conversionRate || 0,
              avgCheck: c.avgCheck || 0,
              fixedCosts: c.fixedCosts || 0,
              variableCosts: c.variableCosts || 0,
              marketingCosts: c.marketingSpend,
              detailedExpenses: c.detailedExpenses,
              customerLifetimeMonths: c.customerLifetimeMonths,
              purchaseFrequency: c.purchaseFrequency,
            })
          : 0,
        margin: calculateProfitMargin({
          revenue: c.revenue,
          totalClients: c.totalClients || 0,
          newClients: c.newClients || 0,
          returningClients: c.returningClients || 0,
          conversionRate: c.conversionRate || 0,
          avgCheck: c.avgCheck || 0,
          fixedCosts: c.fixedCosts || 0,
          variableCosts: c.variableCosts || 0,
          marketingCosts: c.marketingSpend,
          detailedExpenses: c.detailedExpenses,
        }),
        revenue: c.revenue,
        isMyCompany: false,
      })),
  ].filter(item => item.ltvCacRatio > 0 || item.margin !== 0);

  // Prepare data for radar chart (company profiles)
  const allCompanies = [myCompany, ...competitors];
  const radarData = [
    {
      metric: "Выручка",
      ...allCompanies.reduce((acc, c, idx) => {
        const maxRevenue = Math.max(...allCompanies.map(comp => comp.revenue));
        return {
          ...acc,
          [idx === 0 ? myCompany.name : competitors[idx - 1].name]: maxRevenue > 0 ? (c.revenue / maxRevenue) * 100 : 0,
        };
      }, {}),
    },
    {
      metric: "Доля рынка",
      ...allCompanies.reduce((acc, c, idx) => ({
        ...acc,
        [idx === 0 ? myCompany.name : competitors[idx - 1].name]: c.marketShare || 0,
      }), {}),
    },
    {
      metric: "Качество",
      ...allCompanies.reduce((acc, c, idx) => {
        const quality = idx === 0 ? 8 : (competitors[idx - 1].quality || 0);
        return {
          ...acc,
          [idx === 0 ? myCompany.name : competitors[idx - 1].name]: quality * 10,
        };
      }, {}),
    },
    {
      metric: "Маркетинг",
      ...allCompanies.reduce((acc, c, idx) => {
        const maxMarketing = Math.max(
          myCompany.marketingCosts,
          ...competitors.map(comp => comp.marketingSpend)
        );
        const marketing = idx === 0 ? myCompany.marketingCosts : (competitors[idx - 1].marketingSpend || 0);
        return {
          ...acc,
          [idx === 0 ? myCompany.name : competitors[idx - 1].name]: maxMarketing > 0 ? (marketing / maxMarketing) * 100 : 0,
        };
      }, {}),
    },
    {
      metric: "Клиенты",
      ...allCompanies.reduce((acc, c, idx) => {
        const maxClients = Math.max(
          myCompany.totalClients,
          ...competitors.map(comp => comp.totalClients || 0)
        );
        const clients = idx === 0 ? myCompany.totalClients : (competitors[idx - 1].totalClients || 0);
        return {
          ...acc,
          [idx === 0 ? myCompany.name : competitors[idx - 1].name]: maxClients > 0 ? (clients / maxClients) * 100 : 0,
        };
      }, {}),
    },
  ];

  // Prepare data for pie chart (market share distribution)
  const totalMarketShare = allCompanies.reduce((sum, c) => sum + (c.marketShare || 0), 0);
  const pieData = allCompanies
    .filter(c => (c.marketShare || 0) > 0)
    .map((c, idx) => ({
      name: idx === 0 ? myCompany.name : competitors[idx - 1].name,
      value: c.marketShare || 0,
    }));

  // Calculate leaders
  const companiesWithMetrics = scatterData.map(item => ({
    name: item.name,
    ltvCacRatio: item.ltvCacRatio,
    margin: item.margin,
    revenue: item.revenue,
    marketShare: allCompanies.find(c => c.name === item.name || (c.name === myCompany.name && item.name === myCompany.name))?.marketShare || 0,
    isMyCompany: item.isMyCompany,
  }));

  const efficiencyLeader = companiesWithMetrics.reduce((max, c) => c.ltvCacRatio > max.ltvCacRatio ? c : max, companiesWithMetrics[0]);
  const marginLeader = companiesWithMetrics.reduce((max, c) => c.margin > max.margin ? c : max, companiesWithMetrics[0]);
  const marketShareLeader = companiesWithMetrics.reduce((max, c) => c.marketShare > max.marketShare ? c : max, companiesWithMetrics[0]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.name}</p>
          <p className="text-xs text-muted-foreground">LTV/CAC: <span className="font-mono font-semibold">{data.ltvCacRatio.toFixed(2)}x</span></p>
          <p className="text-xs text-muted-foreground">Маржа: <span className="font-mono font-semibold">{data.margin.toFixed(1)}%</span></p>
          <p className="text-xs text-muted-foreground">Выручка: <span className="font-mono font-semibold">{data.revenue.toLocaleString("ru-RU")} {currency}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          🗺️ Конкурентная карта
        </CardTitle>
        <CardDescription>
          Визуализация конкурентных позиций и анализ лидеров рынка
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Leader Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${efficiencyLeader?.isMyCompany ? 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary' : 'bg-card border-border'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-sm">Лидер по эффективности</h3>
            </div>
            <p className="text-lg font-bold">{efficiencyLeader?.name}</p>
            <p className="text-sm text-muted-foreground">LTV/CAC: <span className="font-mono font-bold text-success">{efficiencyLeader?.ltvCacRatio.toFixed(2)}x</span></p>
            {efficiencyLeader?.isMyCompany && (
              <p className="text-xs text-primary font-semibold mt-2">🎉 Это вы!</p>
            )}
          </div>

          <div className={`p-4 rounded-lg border-2 ${marginLeader?.isMyCompany ? 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary' : 'bg-card border-border'}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-success" />
              <h3 className="font-semibold text-sm">Лидер по марже</h3>
            </div>
            <p className="text-lg font-bold">{marginLeader?.name}</p>
            <p className="text-sm text-muted-foreground">Маржа: <span className="font-mono font-bold text-success">{marginLeader?.margin.toFixed(1)}%</span></p>
            {marginLeader?.isMyCompany && (
              <p className="text-xs text-primary font-semibold mt-2">🎉 Это вы!</p>
            )}
          </div>

          <div className={`p-4 rounded-lg border-2 ${marketShareLeader?.isMyCompany ? 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary' : 'bg-card border-border'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-sm">Лидер рынка</h3>
            </div>
            <p className="text-lg font-bold">{marketShareLeader?.name}</p>
            <p className="text-sm text-muted-foreground">Доля: <span className="font-mono font-bold text-accent">{marketShareLeader?.marketShare.toFixed(1)}%</span></p>
            {marketShareLeader?.isMyCompany && (
              <p className="text-xs text-primary font-semibold mt-2">🎉 Это вы!</p>
            )}
          </div>
        </div>

        {/* Scatter Chart: LTV/CAC vs Margin */}
        {scatterData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Позиционирование: Эффективность vs Рентабельность
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number" 
                  dataKey="ltvCacRatio" 
                  name="LTV/CAC" 
                  className="text-xs"
                  label={{ value: 'LTV/CAC Ratio', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="margin" 
                  name="Маржа" 
                  className="text-xs"
                  label={{ value: 'Маржа (%)', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis type="number" dataKey="revenue" range={[100, 1000]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Scatter 
                  name="Компании" 
                  data={scatterData} 
                  fill="hsl(var(--primary))"
                >
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isMyCompany ? 'hsl(var(--primary))' : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Scatter>
                
                {/* Reference lines for healthy zones */}
                <line x1="3" y1="0" x2="3" y2="100" stroke="hsl(var(--success))" strokeDasharray="5 5" opacity={0.3} />
                <text x="3.5" y="10" fill="hsl(var(--success))" fontSize="10">Здоровый LTV/CAC &gt; 3</text>
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Размер круга отражает выручку компании. Правый верхний квадрант — наиболее привлекательная позиция.
            </p>
          </div>
        )}

        {/* Radar Chart: Company Profiles */}
        {radarData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Профили конкурентов (Radar)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="metric" className="text-xs" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                <Tooltip 
                  formatter={(value: number) => value.toFixed(1) + '%'}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
                {allCompanies.map((c, idx) => (
                  <Radar
                    key={idx}
                    name={idx === 0 ? myCompany.name : competitors[idx - 1].name}
                    dataKey={idx === 0 ? myCompany.name : competitors[idx - 1].name}
                    stroke={COLORS[idx % COLORS.length]}
                    fill={COLORS[idx % COLORS.length]}
                    fillOpacity={idx === 0 ? 0.5 : 0.3}
                    strokeWidth={idx === 0 ? 3 : 2}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Нормализованные показатели по 5 ключевым метрикам
            </p>
          </div>
        )}

        {/* Pie Chart: Market Share Distribution */}
        {pieData.length > 0 && totalMarketShare > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Распределение долей рынка</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === myCompany.name ? 'hsl(var(--primary))' : COLORS[(index + 1) % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => value.toFixed(1) + '%'}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Общая анализируемая доля рынка: {totalMarketShare.toFixed(1)}%
            </p>
          </div>
        )}

        <div className="p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-semibold mb-2 text-sm">💡 Интерпретация карты:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <span className="font-semibold">Scatter chart</span> — показывает соотношение эффективности (LTV/CAC) и рентабельности (маржа). Идеальная позиция — правый верхний угол</li>
            <li>• <span className="font-semibold">Radar chart</span> — многомерное сравнение профилей конкурентов по ключевым метрикам</li>
            <li>• <span className="font-semibold">Pie chart</span> — распределение захваченных долей рынка между всеми игроками</li>
            <li>• <span className="font-semibold">Лидеры</span> — компании, лидирующие по эффективности привлечения, рентабельности и доле рынка</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
