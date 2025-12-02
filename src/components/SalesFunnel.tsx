import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Users, CreditCard, TrendingDown } from "lucide-react";

interface LeadSource {
  id: string;
  name: string;
  type: "paid" | "organic" | "referral" | "direct";
  leads: number;
  cost: number;
}

interface SalesFunnelProps {
  totalLeads: number;
  totalClients: number;
  conversionRate: number;
  leadSources: LeadSource[];
  marketingCosts: number;
  currency: string;
}

export const SalesFunnel = memo(({
  totalLeads,
  totalClients,
  conversionRate,
  leadSources,
  marketingCosts,
  currency,
}: SalesFunnelProps) => {
  const cpl = totalLeads > 0 ? marketingCosts / totalLeads : 0;
  const cac = totalClients > 0 ? marketingCosts / totalClients : 0;

  const stages = [
    {
      name: "Лиды",
      value: totalLeads,
      icon: Target,
      color: "bg-primary",
      width: 100,
    },
    {
      name: "Клиенты",
      value: totalClients,
      icon: Users,
      color: "bg-success",
      width: totalLeads > 0 ? (totalClients / totalLeads) * 100 : 0,
    },
  ];

  const sourcesByType = {
    paid: leadSources.filter(s => s.type === "paid"),
    organic: leadSources.filter(s => s.type === "organic"),
    referral: leadSources.filter(s => s.type === "referral"),
    direct: leadSources.filter(s => s.type === "direct"),
  };

  const typeLabels: Record<string, string> = {
    paid: "Платный трафик",
    organic: "Органика",
    referral: "Рефералы",
    direct: "Прямой",
  };

  const typeColors: Record<string, string> = {
    paid: "text-destructive",
    organic: "text-success",
    referral: "text-accent",
    direct: "text-secondary",
  };

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-accent" />
          Воронка продаж
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Визуализация воронки */}
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <stage.icon className={`w-4 h-4 ${index === 0 ? 'text-primary' : 'text-success'}`} />
                  <span className="font-medium">{stage.name}</span>
                </div>
                <span className="font-mono font-bold">{stage.value.toLocaleString("ru-RU")}</span>
              </div>
              <div className="relative">
                <Progress value={stage.width} className="h-8" />
                {index === 1 && stage.width > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary-foreground">
                    Конверсия: {conversionRate.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Метрики стоимости */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">CPL (стоимость лида)</p>
            <p className="text-xl font-bold font-mono text-primary">
              {cpl.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
            </p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">CAC (стоимость клиента)</p>
            <p className="text-xl font-bold font-mono text-destructive">
              {cac.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
            </p>
          </div>
        </div>

        {/* Источники трафика */}
        {leadSources.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-sm">Источники трафика</h4>
            {Object.entries(sourcesByType).map(([type, sources]) => {
              if (sources.length === 0) return null;
              const totalLeadsInType = sources.reduce((sum, s) => sum + s.leads, 0);
              const totalCostInType = sources.reduce((sum, s) => sum + s.cost, 0);
              const cplType = totalLeadsInType > 0 ? totalCostInType / totalLeadsInType : 0;

              return (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${typeColors[type]}`}>
                      {typeLabels[type]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      CPL: {cplType.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
                    </span>
                  </div>
                  {sources.map((source) => (
                    <div
                      key={source.id}
                      className="flex justify-between items-center pl-4 text-sm"
                    >
                      <span>{source.name}</span>
                      <div className="flex gap-4">
                        <span className="text-muted-foreground">
                          {source.leads.toLocaleString("ru-RU")} лидов
                        </span>
                        <span className="font-mono">
                          {source.cost.toLocaleString("ru-RU")} {currency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

SalesFunnel.displayName = "SalesFunnel";
