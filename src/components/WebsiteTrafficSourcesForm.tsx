import { memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus } from "lucide-react";

export interface WebsiteTrafficSource {
  id: string;
  name: string;
  type: "ads" | "seo" | "social" | "referral" | "other";
  visits: number;
  leads: number;
  cost: number;
}

interface WebsiteTrafficSourcesFormProps {
  sources: WebsiteTrafficSource[];
  onChange: (sources: WebsiteTrafficSource[]) => void;
  currency: string;
}

export const WebsiteTrafficSourcesForm = memo(({
  sources,
  onChange,
  currency,
}: WebsiteTrafficSourcesFormProps) => {
  const handleSourceChange = (id: string, field: keyof WebsiteTrafficSource, value: string | number) => {
    const updated = sources.map((source) =>
      source.id === id ? { ...source, [field]: value } : source
    );
    onChange(updated);
  };

  const handleAddSource = () => {
    const newSource: WebsiteTrafficSource = {
      id: Date.now().toString(),
      name: "",
      type: "ads",
      visits: 0,
      leads: 0,
      cost: 0,
    };
    onChange([...sources, newSource]);
  };

  const handleRemoveSource = (id: string) => {
    onChange(sources.filter((s) => s.id !== id));
  };

  const totalVisits = sources.reduce((sum, s) => sum + s.visits, 0);
  const totalLeads = sources.reduce((sum, s) => sum + s.leads, 0);
  const totalCost = sources.reduce((sum, s) => sum + s.cost, 0);
  const cpl = totalLeads > 0 ? totalCost / totalLeads : 0;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Источники трафика на сайт</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {sources.map((source) => (
            <div
              key={source.id}
              className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end border rounded-lg p-3 md:p-4"
            >
              <div className="space-y-1">
                <Label>Источник</Label>
                <Input
                  value={source.name}
                  onChange={(e) => handleSourceChange(source.id, "name", e.target.value)}
                  placeholder="Яндекс.Директ, SEO, Instagram и т.п."
                />
              </div>
              <div className="space-y-1">
                <Label>Тип</Label>
                <Select
                  value={source.type}
                  onValueChange={(value) =>
                    handleSourceChange(source.id, "type", value as WebsiteTrafficSource["type"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Тип источника" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ads">Реклама</SelectItem>
                    <SelectItem value="seo">SEO</SelectItem>
                    <SelectItem value="social">Соцсети</SelectItem>
                    <SelectItem value="referral">Рефералы</SelectItem>
                    <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Переходы</Label>
                <NumericInput
                  value={source.visits}
                  onChange={(value) => handleSourceChange(source.id, "visits", value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Лиды</Label>
                <NumericInput
                  value={source.leads}
                  onChange={(value) => handleSourceChange(source.id, "leads", value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Затраты ({currency})</Label>
                <NumericInput
                  value={source.cost}
                  onChange={(value) => handleSourceChange(source.id, "cost", value)}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 md:mt-0 md:col-span-5 justify-start text-destructive"
                onClick={() => handleRemoveSource(source.id)}
              >
                Удалить
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={handleAddSource}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить источник трафика
        </Button>

        {sources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 border-t mt-4 pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Всего переходов</p>
              <p className="font-mono font-semibold">{totalVisits.toLocaleString("ru-RU")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Всего лидов</p>
              <p className="font-mono font-semibold">{totalLeads.toLocaleString("ru-RU")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Бюджет на трафик</p>
              <p className="font-mono font-semibold">
                {totalCost.toLocaleString("ru-RU")} {currency}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CPL по сайту</p>
              <p className="font-mono font-semibold">
                {cpl.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {currency}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

WebsiteTrafficSourcesForm.displayName = "WebsiteTrafficSourcesForm";
