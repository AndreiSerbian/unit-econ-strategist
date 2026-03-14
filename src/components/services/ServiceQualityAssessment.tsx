import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Info } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Product } from "../ProductsManagement";

interface Competitor {
  id: string;
  name: string;
  quality: number | null;
}

interface QualityFactors {
  result: number;
  speed: number;
  reliability: number;
  communication: number;
  support: number;
  expertise: number;
}

const SUBFACTORS = [
  { key: "result" as const, label: "Качество результата" },
  { key: "speed" as const, label: "Скорость выполнения" },
  { key: "reliability" as const, label: "Надёжность" },
  { key: "communication" as const, label: "Коммуникация" },
  { key: "support" as const, label: "Поддержка" },
  { key: "expertise" as const, label: "Экспертность" },
];

const DEFAULT_FACTORS: QualityFactors = {
  result: 3,
  speed: 3,
  reliability: 3,
  communication: 3,
  support: 3,
  expertise: 3,
};

const factorsToComposite = (f: QualityFactors): number => {
  const avg = Object.values(f).reduce((s, v) => s + v, 0) / 6;
  return Math.round(avg * 4); // 1-5 → 4-20
};

const compositeToFactors = (quality: number): QualityFactors => {
  const base = Math.max(1, Math.min(5, quality / 4));
  return {
    result: Math.round(base),
    speed: Math.round(base),
    reliability: Math.round(base),
    communication: Math.round(base),
    support: Math.round(base),
    expertise: Math.round(base),
  };
};

interface ServiceQualityAssessmentProps {
  products: Product[];
  competitors: Competitor[];
  companyName?: string;
  onProductQualityChange?: (productId: string, quality: number) => void;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export const ServiceQualityAssessment = ({
  products,
  competitors,
  companyName = "Моя компания",
  onProductQualityChange,
}: ServiceQualityAssessmentProps) => {
  const [myFactors, setMyFactors] = useState<QualityFactors>(
    () => {
      const avgQuality = products.length > 0
        ? products.reduce((s, p) => s + (p.quality ?? 10), 0) / products.length
        : 10;
      return compositeToFactors(avgQuality);
    }
  );

  const [competitorFactors, setCompetitorFactors] = useState<Record<string, QualityFactors>>(
    () => {
      const map: Record<string, QualityFactors> = {};
      competitors.forEach((c) => {
        map[c.id] = compositeToFactors(c.quality ?? 10);
      });
      return map;
    }
  );

  const myComposite = useMemo(() => factorsToComposite(myFactors), [myFactors]);

  const radarData = useMemo(() => {
    return SUBFACTORS.map((sf) => {
      const point: Record<string, string | number> = {
        category: sf.label,
        [companyName]: myFactors[sf.key],
      };
      competitors.slice(0, 3).forEach((c) => {
        const cf = competitorFactors[c.id] || DEFAULT_FACTORS;
        point[c.name] = cf[sf.key];
      });
      return point;
    });
  }, [myFactors, competitorFactors, competitors, companyName]);

  const getQualityBadge = (q: number) => {
    if (q >= 16) return { label: "Отлично", variant: "default" as const };
    if (q >= 11) return { label: "Хорошо", variant: "secondary" as const };
    return { label: "Требует улучшения", variant: "destructive" as const };
  };

  const handleMyFactorChange = (key: keyof QualityFactors, value: number) => {
    setMyFactors((prev) => ({ ...prev, [key]: value }));
  };

  const handleCompetitorFactorChange = (
    competitorId: string,
    key: keyof QualityFactors,
    value: number
  ) => {
    setCompetitorFactors((prev) => ({
      ...prev,
      [competitorId]: { ...(prev[competitorId] || DEFAULT_FACTORS), [key]: value },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Оценка качества услуг
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              <Info className="w-3 h-3 mr-1" />
              Оценочный показатель
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Используйте этот блок для гипотетической или экспертной оценки своей компании и
            конкурентов. Это не объективная рыночная оценка, а рабочий инструмент для построения
            гипотез по юнит-экономике.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Итоговый балл (моя компания)</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold">{myComposite}</p>
                <span className="text-sm text-muted-foreground">/ 20</span>
                <Badge variant={getQualityBadge(myComposite).variant} className="ml-2">
                  {getQualityBadge(myComposite).label}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-secondary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Среднее конкурентов</p>
              <p className="text-2xl font-bold">
                {competitors.length > 0
                  ? (
                      competitors.reduce((s, c) => {
                        const cf = competitorFactors[c.id] || DEFAULT_FACTORS;
                        return s + factorsToComposite(cf);
                      }, 0) / competitors.length
                    ).toFixed(1)
                  : "—"}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Подфакторов оценки</p>
              <p className="text-2xl font-bold">6</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My company subfactors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{companyName} — оценка по подфакторам</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SUBFACTORS.map((sf) => (
            <div key={sf.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{sf.label}</Label>
                <span className="font-mono text-sm font-semibold">{myFactors[sf.key]}/5</span>
              </div>
              <Slider
                value={[myFactors[sf.key]]}
                onValueChange={([v]) => handleMyFactorChange(sf.key, v)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Competitors subfactors */}
      {competitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Конкуренты — оценка по подфакторам</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {competitors.map((comp) => {
              const cf = competitorFactors[comp.id] || DEFAULT_FACTORS;
              const composite = factorsToComposite(cf);
              return (
                <div key={comp.id} className="space-y-3 pb-4 border-b last:border-0">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">{comp.name}</Label>
                    <Badge variant={getQualityBadge(composite).variant} className="text-xs">
                      {composite}/20 — {getQualityBadge(composite).label}
                    </Badge>
                  </div>
                  {SUBFACTORS.map((sf) => (
                    <div key={sf.key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{sf.label}</span>
                        <span className="font-mono text-xs">{cf[sf.key]}/5</span>
                      </div>
                      <Slider
                        value={[cf[sf.key]]}
                        onValueChange={([v]) =>
                          handleCompetitorFactorChange(comp.id, sf.key, v)
                        }
                        min={1}
                        max={5}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Radar chart comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Сравнение по подфакторам</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
              <Radar
                name={companyName}
                dataKey={companyName}
                stroke={COLORS[0]}
                fill={COLORS[0]}
                fillOpacity={0.3}
              />
              {competitors.slice(0, 3).map((comp, idx) => (
                <Radar
                  key={comp.id}
                  name={comp.name}
                  dataKey={comp.name}
                  stroke={COLORS[(idx + 1) % COLORS.length]}
                  fill={COLORS[(idx + 1) % COLORS.length]}
                  fillOpacity={0.2}
                />
              ))}
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
