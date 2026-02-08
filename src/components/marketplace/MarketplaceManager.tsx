import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Plus, Package, TrendingUp, DollarSign, Percent, 
  Calendar, HelpCircle, Store 
} from "lucide-react";
import { toast } from "sonner";
import type { SalesChannel } from "@/hooks/useProject";
import { 
  useMarketplace, 
  calculateCategoryMetrics,
  type MarketplaceCategory,
} from "@/hooks/useMarketplace";
import { CategoryCard } from "./CategoryCard";
import type { PlanningPeriod } from "./types";
import { getPeriodLabel } from "./types";

interface MarketplaceManagerProps {
  projectId: string | undefined;
  channels: SalesChannel[];
  currency: string;
  planningPeriod: PlanningPeriod;
  onPlanningPeriodChange?: (period: PlanningPeriod) => void;
}

const FieldTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help inline-block ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const MarketplaceManager = ({
  projectId,
  channels,
  currency,
  planningPeriod,
  onPlanningPeriodChange,
}: MarketplaceManagerProps) => {
  const {
    categories,
    channelStats,
    isLoading,
    saveCategory,
    updateCategory,
    deleteCategory,
    saveChannelStat,
    updateChannelStat,
    deleteChannelStat,
    totals,
  } = useMarketplace(projectId);

  const [newCategory, setNewCategory] = useState({
    name: '',
    transactionsCount: 0,
    avgCheck: 0,
    takeRatePercent: 10,
  });

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Введите название категории');
      return;
    }

    await saveCategory({
      projectId: projectId!,
      name: newCategory.name,
      transactionsCount: newCategory.transactionsCount,
      avgCheck: newCategory.avgCheck,
      takeRatePercent: newCategory.takeRatePercent,
      gmvOverride: null,
      sortOrder: categories.length,
      isActive: true,
    });

    setNewCategory({
      name: '',
      transactionsCount: 0,
      avgCheck: 0,
      takeRatePercent: 10,
    });
  };

  // Calculate aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    let totalGmv = 0;
    let totalPlatformRevenue = 0;
    let categoriesWithData = 0;

    categories.forEach(cat => {
      const catStats = channelStats.filter(cs => cs.categoryId === cat.id);
      const metrics = calculateCategoryMetrics(cat, catStats, channels);
      
      totalGmv += metrics.gmvUsed;
      totalPlatformRevenue += metrics.platformRevenue;
      if (metrics.hasEnoughData) categoriesWithData++;
    });

    const avgTakeRate = totalGmv > 0 ? (totalPlatformRevenue / totalGmv) * 100 : 0;

    return {
      totalGmv,
      totalPlatformRevenue,
      avgTakeRate,
      categoriesCount: categories.length,
      categoriesWithData,
    };
  }, [categories, channelStats, channels]);

  const formatCurrency = (value: number) => 
    `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ${currency}`;

  return (
    <div className="space-y-6">
      {/* Planning Period Selector */}
      {onPlanningPeriodChange && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4 text-primary" />
              Период планирования
              <FieldTooltip content="Единица времени для всех объёмов (транзакции, GMV). Влияет на интерпретацию данных." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={planningPeriod} onValueChange={(v) => onPlanningPeriodChange(v as PlanningPeriod)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                  <SelectItem value="quarter">Квартал</SelectItem>
                  <SelectItem value="year">Год</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Все объёмы указываются за {getPeriodLabel(planningPeriod)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-primary" />
            Сводка по маркетплейсу
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Total GMV
              </p>
              <p className="text-lg font-bold">{formatCurrency(aggregatedMetrics.totalGmv)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Platform Revenue
              </p>
              <p className="text-lg font-bold text-primary">{formatCurrency(aggregatedMetrics.totalPlatformRevenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Percent className="w-3 h-3" />
                Avg Take Rate
              </p>
              <p className="text-lg font-bold">{aggregatedMetrics.avgTakeRate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Package className="w-3 h-3" />
                Категории
              </p>
              <p className="text-lg font-bold">
                {aggregatedMetrics.categoriesWithData}/{aggregatedMetrics.categoriesCount}
                <span className="text-xs font-normal text-muted-foreground ml-1">с данными</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Category Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Категории товаров/услуг
          </CardTitle>
          <CardDescription>
            Настройте категории маркетплейса и распределение по каналам продаж
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new category form */}
          <div className="p-3 sm:p-4 border rounded-lg bg-muted/30 space-y-4">
            <h3 className="font-medium text-sm">Добавить категорию</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="sm:col-span-2 md:col-span-1">
                <Label className="text-xs sm:text-sm">Название</Label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Электроника"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm flex items-center">
                  Транзакции
                  <FieldTooltip content={`Количество транзакций за ${getPeriodLabel(planningPeriod)}`} />
                </Label>
                <NumericInput
                  value={newCategory.transactionsCount}
                  onChange={(v) => setNewCategory(prev => ({ ...prev, transactionsCount: v ?? 0 }))}
                  placeholder="0"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm flex items-center">
                  Средний чек ({currency})
                  <FieldTooltip content="Средняя стоимость транзакции в категории" />
                </Label>
                <NumericInput
                  value={newCategory.avgCheck}
                  onChange={(v) => setNewCategory(prev => ({ ...prev, avgCheck: v ?? 0 }))}
                  placeholder="0"
                  step="0.01"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm flex items-center">
                  Take Rate (%)
                  <FieldTooltip content="Комиссия платформы по умолчанию для категории" />
                </Label>
                <NumericInput
                  value={newCategory.takeRatePercent}
                  onChange={(v) => setNewCategory(prev => ({ ...prev, takeRatePercent: Math.max(0, Math.min(100, v ?? 0)) }))}
                  placeholder="10"
                  step="0.1"
                  className="text-sm"
                />
              </div>
            </div>
            <Button onClick={handleAddCategory} className="w-full" disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить категорию
            </Button>
          </div>

          {/* Categories list */}
          {categories.length > 0 ? (
            <div className="space-y-3">
              {categories.map(category => {
                const catStats = channelStats.filter(cs => cs.categoryId === category.id);
                return (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    channelStats={catStats}
                    channels={channels}
                    currency={currency}
                    planningPeriod={planningPeriod}
                    onUpdate={updateCategory}
                    onDelete={deleteCategory}
                    onSaveChannelStat={saveChannelStat}
                    onUpdateChannelStat={updateChannelStat}
                    onDeleteChannelStat={deleteChannelStat}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Нет категорий. Добавьте первую категорию выше.</p>
            </div>
          )}

          {/* Channels warning */}
          {channels.length === 0 && (
            <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
              <div className="flex items-center gap-2 text-warning-foreground">
                <Store className="w-4 h-4" />
                <p className="text-sm">
                  Для распределения по каналам сначала добавьте каналы продаж в разделе "Каналы продаж"
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
