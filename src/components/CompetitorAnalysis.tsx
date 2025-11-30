import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Building2, ChevronDown, Package } from "lucide-react";

interface CompetitorProduct {
  id: string;
  name: string;
  price: number;
  annualSales: number;
  annualRevenue: number;
  salesChannels: string[];
}

interface Competitor {
  id: string;
  name: string;
  revenue: number;
  marketShare: number;
  pricing: number;
  quality: number;
  marketingSpend: number;
  products: CompetitorProduct[];
}

interface CompetitorAnalysisProps {
  competitors: Competitor[];
  saveCompetitor: (competitor: Omit<Competitor, "id">) => Promise<void>;
  deleteCompetitor: (competitorId: string) => Promise<void>;
  addCompetitorProduct: (competitorId: string, product: Omit<CompetitorProduct, "id" | "annualRevenue">) => Promise<void>;
  deleteCompetitorProduct: (competitorId: string, productId: string) => Promise<void>;
  isAuthenticated: boolean;
}

const SALES_CHANNELS = ["Онлайн", "Розница", "Дистрибьюторы", "B2B"];

export const CompetitorAnalysis = ({
  competitors,
  saveCompetitor,
  deleteCompetitor,
  addCompetitorProduct,
  deleteCompetitorProduct,
  isAuthenticated,
}: CompetitorAnalysisProps) => {
  const [newCompetitor, setNewCompetitor] = useState<Omit<Competitor, "id">>({
    name: "",
    revenue: 0,
    marketShare: 0,
    pricing: 0,
    quality: 0,
    marketingSpend: 0,
    products: [],
  });

  const [expandedCompetitors, setExpandedCompetitors] = useState<Set<string>>(new Set());
  const [newProducts, setNewProducts] = useState<Record<string, Omit<CompetitorProduct, "id" | "annualRevenue">>>({});

  const addCompetitor = async () => {
    if (newCompetitor.name.trim()) {
      await saveCompetitor(newCompetitor);
      setNewCompetitor({
        name: "",
        revenue: 0,
        marketShare: 0,
        pricing: 0,
        quality: 0,
        marketingSpend: 0,
        products: [],
      });
    }
  };

  const updateNewCompetitor = (field: keyof Omit<Competitor, "id">, value: string | number) => {
    setNewCompetitor((prev) => ({ ...prev, [field]: value }));
  };

  const initNewProduct = (competitorId: string) => {
    if (!newProducts[competitorId]) {
      setNewProducts((prev) => ({
        ...prev,
        [competitorId]: {
          name: "",
          price: 0,
          annualSales: 0,
          salesChannels: [],
        },
      }));
    }
  };

  const updateNewProduct = (
    competitorId: string,
    field: keyof Omit<CompetitorProduct, "id" | "annualRevenue">,
    value: string | number | string[]
  ) => {
    setNewProducts((prev) => ({
      ...prev,
      [competitorId]: {
        ...(prev[competitorId] || { name: "", price: 0, annualSales: 0, salesChannels: [] }),
        [field]: value,
      },
    }));
  };

  const handleAddProduct = async (competitorId: string) => {
    const product = newProducts[competitorId];
    if (product && product.name.trim()) {
      await addCompetitorProduct(competitorId, product);
      setNewProducts((prev) => {
        const updated = { ...prev };
        delete updated[competitorId];
        return updated;
      });
    }
  };

  const toggleChannel = (competitorId: string, channel: string) => {
    const product = newProducts[competitorId] || { name: "", price: 0, annualSales: 0, salesChannels: [] };
    const channels = product.salesChannels.includes(channel)
      ? product.salesChannels.filter((c) => c !== channel)
      : [...product.salesChannels, channel];
    updateNewProduct(competitorId, "salesChannels", channels);
  };

  const toggleExpanded = (competitorId: string) => {
    setExpandedCompetitors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(competitorId)) {
        newSet.delete(competitorId);
      } else {
        newSet.add(competitorId);
        initNewProduct(competitorId);
      }
      return newSet;
    });
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
          <div className="grid grid-cols-1 gap-4">
            {competitors.map((competitor) => {
              const isExpanded = expandedCompetitors.has(competitor.id);
              const currentProduct = newProducts[competitor.id];
              const totalProductRevenue = (competitor.products || []).reduce(
                (sum, p) => sum + p.annualRevenue,
                0
              );

              return (
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
                        onClick={() => deleteCompetitor(competitor.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
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
                    </div>

                    <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(competitor.id)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Package className="w-4 h-4 mr-2" />
                          Продукты конкурента ({(competitor.products || []).length})
                          <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4 space-y-4">
                        {/* Add product form */}
                        <Card className="bg-muted/30">
                          <CardContent className="pt-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor={`product-name-${competitor.id}`} className="text-xs">
                                  Название продукта
                                </Label>
                                <Input
                                  id={`product-name-${competitor.id}`}
                                  value={currentProduct?.name || ""}
                                  onChange={(e) => updateNewProduct(competitor.id, "name", e.target.value)}
                                  placeholder="Название"
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`product-price-${competitor.id}`} className="text-xs">
                                  Цена (₽)
                                </Label>
                                <Input
                                  id={`product-price-${competitor.id}`}
                                  type="number"
                                  value={currentProduct?.price || ""}
                                  onChange={(e) =>
                                    updateNewProduct(competitor.id, "price", parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="0"
                                  className="h-9"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`product-sales-${competitor.id}`} className="text-xs">
                                  Продажи/год (шт)
                                </Label>
                                <Input
                                  id={`product-sales-${competitor.id}`}
                                  type="number"
                                  value={currentProduct?.annualSales || ""}
                                  onChange={(e) =>
                                    updateNewProduct(competitor.id, "annualSales", parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="0"
                                  className="h-9"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Каналы продаж</Label>
                              <div className="flex flex-wrap gap-3">
                                {SALES_CHANNELS.map((channel) => (
                                  <div key={channel} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${competitor.id}-${channel}`}
                                      checked={currentProduct?.salesChannels?.includes(channel) || false}
                                      onCheckedChange={() => toggleChannel(competitor.id, channel)}
                                    />
                                    <label
                                      htmlFor={`${competitor.id}-${channel}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      {channel}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Button
                              onClick={() => handleAddProduct(competitor.id)}
                              size="sm"
                              className="w-full"
                            >
                              <Plus className="w-3 h-3 mr-2" />
                              Добавить продукт
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Product list */}
                        {(competitor.products || []).length > 0 ? (
                          <div className="space-y-2">
                            {competitor.products.map((product) => (
                              <Card key={product.id} className="bg-background/50">
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-primary" />
                                        <span className="font-medium text-sm">{product.name}</span>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <div>
                                          Цена: <span className="font-mono font-medium text-foreground">{product.price.toLocaleString("ru-RU")} ₽</span>
                                        </div>
                                        <div>
                                          Продажи: <span className="font-mono font-medium text-foreground">{product.annualSales.toLocaleString("ru-RU")} шт/год</span>
                                        </div>
                                        <div>
                                          Выручка: <span className="font-mono font-medium text-foreground">{product.annualRevenue.toLocaleString("ru-RU")} ₽</span>
                                        </div>
                                      </div>
                                      {product.salesChannels.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {product.salesChannels.map((channel) => (
                                            <span
                                              key={channel}
                                              className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                                            >
                                              {channel}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteCompetitorProduct(competitor.id, product.id)}
                                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            <div className="pt-2 border-t">
                              <div className="flex justify-between text-sm font-semibold">
                                <span>Итого выручка по продуктам:</span>
                                <span className="font-mono">{totalProductRevenue.toLocaleString("ru-RU")} ₽</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Продукты не добавлены
                          </p>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              );
            })}
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
