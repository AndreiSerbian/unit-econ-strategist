import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowDown, 
  ArrowRight, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Building2,
  Megaphone,
  Package,
  Truck,
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  PiggyBank
} from "lucide-react";
import { motion } from "framer-motion";
import type { LeadSource } from "@/hooks/useProject";
import { useTranslation } from "@/i18n/useTranslation";

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
    customCategories: { value: number }[];
  };
  variableCosts: {
    marketing: {
      trafficPurchase: number;
      contractorsPayment: number;
      crmCosts: number;
      customCategories: { value: number }[];
    };
    salesPayroll: {
      bonusOldClients: number;
      bonusNewClients: number;
      customCategories: { value: number }[];
    };
    production: {
      materials: number;
      curators: number;
      logistics: number;
      partnersPercent: number;
      equipmentRepair: number;
      customCategories: { value: number }[];
    };
    other: {
      customCategories: { value: number }[];
    };
  };
  taxRate: number;
  taxes: number;
}

interface CashFlowDiagramProps {
  revenue: number;
  totalClients: number;
  newClients: number;
  returningClients: number;
  leadSources: LeadSource[];
  detailedExpenses?: DetailedExpenses;
  fixedCosts: number;
  variableCosts: number;
  marketingCosts: number;
  currency: string;
}

const formatCurrency = (value: number, currency: string, locale: string = "ru-RU") => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M ${currency}`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K ${currency}`;
  }
  return `${value.toLocaleString(locale)} ${currency}`;
};

const FlowNode = memo(({ 
  icon, 
  label, 
  value, 
  subLabel,
  variant = "default",
  delay = 0
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
  subLabel?: string;
  variant?: "income" | "expense" | "profit" | "default";
  delay?: number;
}) => {
  const variantStyles = {
    income: "bg-success/10 border-success/30 text-success",
    expense: "bg-destructive/10 border-destructive/30 text-destructive",
    profit: "bg-primary/10 border-primary/30 text-primary",
    default: "bg-muted/50 border-border"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={`flex flex-col items-center p-3 rounded-lg border-2 ${variantStyles[variant]} min-w-[120px]`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
      <span className="font-bold text-sm">{value}</span>
      {subLabel && <span className="text-xs text-muted-foreground">{subLabel}</span>}
    </motion.div>
  );
});

const FlowArrow = memo(({ 
  direction = "right", 
  label,
  delay = 0
}: { 
  direction?: "right" | "down"; 
  label?: string;
  delay?: number;
}) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.2 }}
    className="flex flex-col items-center justify-center px-2"
  >
    {direction === "right" ? (
      <ArrowRight className="w-5 h-5 text-muted-foreground" />
    ) : (
      <ArrowDown className="w-5 h-5 text-muted-foreground" />
    )}
    {label && <span className="text-[10px] text-muted-foreground whitespace-nowrap">{label}</span>}
  </motion.div>
));

const ExpenseBar = memo(({ 
  label, 
  value, 
  total, 
  color,
  icon,
  delay = 0 
}: { 
  label: string; 
  value: number; 
  total: number;
  color: string;
  icon: React.ReactNode;
  delay?: number;
}) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono">{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.2, duration: 0.5 }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </motion.div>
  );
});

export const CashFlowDiagram = memo(({
  revenue,
  totalClients,
  newClients,
  returningClients,
  leadSources,
  detailedExpenses,
  fixedCosts,
  variableCosts,
  marketingCosts,
  currency,
}: CashFlowDiagramProps) => {
  const { t, language } = useTranslation();
  const numLocale = language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : "en-US";
  const fc2 = (v: number) => formatCurrency(v, currency, numLocale);
  
  const flowData = useMemo(() => {
    const paidLeads = leadSources.filter(s => s.type === 'paid').reduce((sum, s) => sum + s.leads, 0);
    const organicLeads = leadSources.filter(s => s.type === 'organic').reduce((sum, s) => sum + s.leads, 0);
    const totalLeads = leadSources.reduce((sum, s) => sum + s.leads, 0);
    const leadSourceCosts = leadSources.reduce((sum, s) => sum + s.cost, 0);
    
    const totalExpenses = fixedCosts + variableCosts;
    const profit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    let salaries = 0;
    let rent = 0;
    let marketing = marketingCosts;
    let production = 0;
    let taxes = 0;
    let other = 0;
    
    if (detailedExpenses) {
      const fc = detailedExpenses.fixedCosts;
      salaries = fc.salaryOldClients + fc.salaryNewClients + fc.managementSalary + 
                 fc.marketingSalary + fc.productionSalary;
      rent = fc.officeRent + fc.warehouseRent;
      other = fc.internet + fc.communication + fc.banking + fc.subscriptions + fc.utilities +
              fc.customCategories.reduce((sum, c) => sum + c.value, 0);
      
      const vc = detailedExpenses.variableCosts;
      marketing = vc.marketing.trafficPurchase + vc.marketing.contractorsPayment + 
                  vc.marketing.crmCosts + vc.marketing.customCategories.reduce((sum, c) => sum + c.value, 0);
      production = vc.production.materials + vc.production.curators + vc.production.logistics +
                   vc.production.partnersPercent + vc.production.equipmentRepair +
                   vc.production.customCategories.reduce((sum, c) => sum + c.value, 0);
      
      const salesPayroll = vc.salesPayroll.bonusOldClients + vc.salesPayroll.bonusNewClients +
                           vc.salesPayroll.customCategories.reduce((sum, c) => sum + c.value, 0);
      salaries += salesPayroll;
      
      taxes = detailedExpenses.taxes;
      other += vc.other.customCategories.reduce((sum, c) => sum + c.value, 0);
    }
    
    return {
      paidLeads,
      organicLeads,
      totalLeads,
      leadSourceCosts,
      totalExpenses,
      profit,
      profitMargin,
      expenseBreakdown: {
        salaries,
        rent,
        marketing,
        production,
        taxes,
        other
      }
    };
  }, [leadSources, fixedCosts, variableCosts, marketingCosts, revenue, detailedExpenses]);
  
  const { expenseBreakdown, totalExpenses, profit, profitMargin } = flowData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          {t("cashFlowDiagram.title")}
          <Badge variant={profit >= 0 ? "default" : "destructive"} className="ml-2">
            {profit >= 0 ? t("cashFlowDiagram.profit") : t("cashFlowDiagram.loss")}: {fc2(Math.abs(profit))}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <FlowNode
              icon={<Megaphone className="w-5 h-5" />}
              label={t("cashFlowDiagram.paidTraffic")}
              value={t("cashFlowDiagram.leadsUnit", { count: flowData.paidLeads })}
              subLabel={fc2(flowData.leadSourceCosts)}
              delay={0}
            />
            <FlowNode
              icon={<TrendingUp className="w-5 h-5" />}
              label={t("cashFlowDiagram.organic")}
              value={t("cashFlowDiagram.leadsUnit", { count: flowData.organicLeads })}
              subLabel={t("cashFlowDiagram.organicFree")}
              delay={0.1}
            />
            <FlowArrow label="CPL" delay={0.2} />
            <FlowNode
              icon={<Users className="w-5 h-5" />}
              label={t("cashFlowDiagram.totalLeads")}
              value={`${flowData.totalLeads}`}
              delay={0.3}
            />
          </div>
          
          <FlowArrow direction="down" label={t("cashFlowDiagram.conversion")} delay={0.4} />
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <FlowNode
              icon={<ShoppingCart className="w-5 h-5" />}
              label={t("cashFlowDiagram.newClients")}
              value={`${newClients}`}
              variant="income"
              delay={0.5}
            />
            <FlowNode
              icon={<Wallet className="w-5 h-5" />}
              label={t("cashFlowDiagram.returning")}
              value={`${returningClients}`}
              variant="income"
              delay={0.6}
            />
            <FlowArrow delay={0.7} />
            <FlowNode
              icon={<DollarSign className="w-5 h-5" />}
              label={t("cashFlowDiagram.revenue")}
              value={fc2(revenue)}
              variant="income"
              delay={0.8}
            />
          </div>
          
          <FlowArrow direction="down" label={t("cashFlowDiagram.expensesArrow")} delay={0.9} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.3 }}
            className="w-full max-w-2xl p-4 bg-muted/30 rounded-lg border"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {t("cashFlowDiagram.expensesStructure")}
              </h4>
              <span className="text-sm text-muted-foreground">
                {t("cashFlowDiagram.totalLabel", { value: fc2(totalExpenses) })}
              </span>
            </div>
            
            <div className="grid gap-3">
              <ExpenseBar
                icon={<Users className="w-3 h-3" />}
                label={t("cashFlowDiagram.expSalaries")}
                value={expenseBreakdown.salaries}
                total={totalExpenses}
                color="bg-chart-1"
                delay={1.1}
              />
              <ExpenseBar
                icon={<Megaphone className="w-3 h-3" />}
                label={t("cashFlowDiagram.expMarketing")}
                value={expenseBreakdown.marketing}
                total={totalExpenses}
                color="bg-chart-2"
                delay={1.2}
              />
              <ExpenseBar
                icon={<Package className="w-3 h-3" />}
                label={t("cashFlowDiagram.expProduction")}
                value={expenseBreakdown.production}
                total={totalExpenses}
                color="bg-chart-3"
                delay={1.3}
              />
              <ExpenseBar
                icon={<Building2 className="w-3 h-3" />}
                label={t("cashFlowDiagram.expRent")}
                value={expenseBreakdown.rent}
                total={totalExpenses}
                color="bg-chart-4"
                delay={1.4}
              />
              <ExpenseBar
                icon={<Percent className="w-3 h-3" />}
                label={t("cashFlowDiagram.expTaxes")}
                value={expenseBreakdown.taxes}
                total={totalExpenses}
                color="bg-chart-5"
                delay={1.5}
              />
              <ExpenseBar
                icon={<Truck className="w-3 h-3" />}
                label={t("cashFlowDiagram.expOther")}
                value={expenseBreakdown.other}
                total={totalExpenses}
                color="bg-chart-6"
                delay={1.6}
              />
            </div>
          </motion.div>
          
          <FlowArrow direction="down" delay={1.7} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <FlowNode
              icon={profit >= 0 ? <PiggyBank className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              label={profit >= 0 ? t("cashFlowDiagram.netProfit") : t("cashFlowDiagram.loss")}
              value={fc2(Math.abs(profit))}
              subLabel={t("cashFlowDiagram.marginSuffix", { value: `${profitMargin >= 0 ? "+" : ""}${profitMargin.toFixed(1)}` })}
              variant={profit >= 0 ? "profit" : "expense"}
              delay={1.9}
            />
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t"
        >
          <div className="text-center">
            <p className="text-xs text-muted-foreground">CAC</p>
            <p className="font-bold text-primary">
              {totalClients > 0 ? fc2(marketingCosts / totalClients) : "—"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("cashFlowDiagram.avgCheck")}</p>
            <p className="font-bold text-primary">
              {totalClients > 0 ? fc2(revenue / totalClients) : "—"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("cashFlowDiagram.profitPerClient")}</p>
            <p className={`font-bold ${profit >= 0 ? "text-success" : "text-destructive"}`}>
              {totalClients > 0 ? fc2(profit / totalClients) : "—"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{t("cashFlowDiagram.profitability")}</p>
            <p className={`font-bold ${profitMargin >= 0 ? "text-success" : "text-destructive"}`}>
              {profitMargin.toFixed(1)}%
            </p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
});

CashFlowDiagram.displayName = "CashFlowDiagram";
