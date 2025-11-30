import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Building2 } from "lucide-react";

interface Competitor {
  id: string;
  name: string;
  revenue: number;
  marketShare: number;
  pricing: number;
  quality: number;
  marketingSpend: number;
}

export const CompetitorAnalysis = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState<Omit<Competitor, "id">>({
    name: "",
    revenue: 0,
    marketShare: 0,
    pricing: 0,
    quality: 0,
    marketingSpend: 0,
  });

  const addCompetitor = () => {
    if (newCompetitor.name.trim()) {
      setCompetitors([
        ...competitors,
        { ...newCompetitor, id: Date.now().toString() },
      ]);
      setNewCompetitor({
        name: "",
        revenue: 0,
        marketShare: 0,
        pricing: 0,
        quality: 0,
        marketingSpend: 0,
      });
    }
  };

  const removeCompetitor = (id: string) => {
    setCompetitors(competitors.filter((c) => c.id !== id));
  };

  const updateNewCompetitor = (field: keyof Omit<Competitor, "id">, value: string | number) => {
    setNewCompetitor((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-secondary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Добавить конкурента
          </CardTitle>
          <CardDescription>
            Заполните информацию о конкуренте для анализа
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="competitor-name">Название компании</Label>
              <Input
                id="competitor-name"
                value={newCompetitor.name}
                onChange={(e) => updateNewCompetitor("name", e.target.value)}
                placeholder="Название конкурента"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-revenue">Выручка (₽)</Label>
              <Input
                id="competitor-revenue"
                type="number"
                value={newCompetitor.revenue || ""}
                onChange={(e) => updateNewCompetitor("revenue", parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-marketShare">Доля рынка (%)</Label>
              <Input
                id="competitor-marketShare"
                type="number"
                value={newCompetitor.marketShare || ""}
                onChange={(e) => updateNewCompetitor("marketShare", parseFloat(e.target.value) || 0)}
                placeholder="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-pricing">Средняя цена (₽)</Label>
              <Input
                id="competitor-pricing"
                type="number"
                value={newCompetitor.pricing || ""}
                onChange={(e) => updateNewCompetitor("pricing", parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-quality">Качество продукта (1-10)</Label>
              <Input
                id="competitor-quality"
                type="number"
                value={newCompetitor.quality || ""}
                onChange={(e) => updateNewCompetitor("quality", parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="1"
                max="10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitor-marketing">Расходы на маркетинг (₽)</Label>
              <Input
                id="competitor-marketing"
                type="number"
                value={newCompetitor.marketingSpend || ""}
                onChange={(e) => updateNewCompetitor("marketingSpend", parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
          <Button onClick={addCompetitor} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Добавить конкурента
          </Button>
        </CardContent>
      </Card>

      {competitors.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Список конкурентов</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {competitors.map((competitor) => (
              <Card key={competitor.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{competitor.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCompetitor(competitor.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Выручка:</span>
                    <span className="font-semibold font-mono">{competitor.revenue.toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Доля рынка:</span>
                    <span className="font-semibold font-mono">{competitor.marketShare}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Средняя цена:</span>
                    <span className="font-semibold font-mono">{competitor.pricing.toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Качество:</span>
                    <span className="font-semibold font-mono">{competitor.quality}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Маркетинг:</span>
                    <span className="font-semibold font-mono">{competitor.marketingSpend.toLocaleString("ru-RU")} ₽</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {competitors.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Пока нет добавленных конкурентов. Добавьте первого конкурента для анализа.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
