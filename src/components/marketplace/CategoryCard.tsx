import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Plus, Trash2, ChevronDown, ChevronRight, HelpCircle, 
  Store, TrendingUp, DollarSign, Percent, Package 
} from "lucide-react";
import { toast } from "sonner";
import type { SalesChannel } from "@/hooks/useProject";
import type { 
  MarketplaceCategory, 
  CategoryChannelStats,
} from "@/hooks/useMarketplace";
import { 
  calculateCategoryMetrics, 
  calculateChannelMetrics,
} from "@/hooks/useMarketplace";
import { StatusBadge } from "./StatusBadge";
import type { DataStatus, PlanningPeriod } from "./types";
import { useTranslation } from "@/i18n/useTranslation";

interface CategoryCardProps {
  category: MarketplaceCategory;
  channelStats: CategoryChannelStats[];
  channels: SalesChannel[];
  currency: string;
  planningPeriod: PlanningPeriod;
  onUpdate: (id: string, updates: Partial<MarketplaceCategory>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSaveChannelStat: (stat: Omit<CategoryChannelStats, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateChannelStat: (id: string, updates: Partial<CategoryChannelStats>) => Promise<void>;
  onDeleteChannelStat: (id: string) => Promise<void>;
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

export const CategoryCard = ({
  category,
  channelStats,
  channels,
  currency,
  planningPeriod,
  onUpdate,
  onDelete,
  onSaveChannelStat,
  onUpdateChannelStat,
  onDeleteChannelStat,
}: CategoryCardProps) => {
  const { t, language } = useTranslation();
  const numLocale = language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : "en-US";
  const periodLabel = t(`marketplace.period${planningPeriod.charAt(0).toUpperCase() + planningPeriod.slice(1)}`);

  const [isExpanded, setIsExpanded] = useState(false);
  const [newChannelId, setNewChannelId] = useState<string>('');

  const metrics = useMemo(() => 
    calculateCategoryMetrics(category, channelStats, channels),
    [category, channelStats, channels]
  );

  const formatCurrency = (value: number) => 
    `${value.toLocaleString(numLocale, { maximumFractionDigits: 2 })} ${currency}`;

  const status: DataStatus = useMemo(() => {
    if (category.transactionsCount === 0 || channelStats.length === 0) {
      return 'not_enough_data';
    }
    if (metrics.totalSharePercent > 100) {
      return 'shares_overflow';
    }
    if (metrics.gmvMismatchPercent && metrics.gmvMismatchPercent > 10) {
      return 'mismatch';
    }
    return 'ok';
  }, [category, channelStats, metrics]);

  const statusDetails = useMemo(() => {
    if (status === 'not_enough_data') {
      return t("marketplace.notEnoughDataDetails");
    }
    if (status === 'shares_overflow') {
      return t("marketplace.sharesOverflowDetails").replace("{sum}", metrics.totalSharePercent.toFixed(0));
    }
    if (status === 'mismatch') {
      return t("marketplace.mismatchDetails").replace("{pct}", metrics.gmvMismatchPercent?.toFixed(1) ?? "0");
    }
    return undefined;
  }, [status, metrics, t]);

  const linkedChannelIds = channelStats.map(cs => cs.channelId);
  const availableChannels = channels.filter(c => !linkedChannelIds.includes(c.id));

  const handleAddChannelMix = async () => {
    if (!newChannelId) {
      toast.error(t("marketplace.pickChannel"));
      return;
    }
    await onSaveChannelStat({
      categoryId: category.id,
      channelId: newChannelId,
      sharePercent: 0,
      transactionsPerPeriod: null,
      takeRateOverridePercent: null,
      isActive: true,
    });
    setNewChannelId('');
  };

  return (
    <Card className="border">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                <Package className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <Input
                    value={category.name}
                    onChange={(e) => onUpdate(category.id, { name: e.target.value })}
                    className="font-medium border-0 p-0 h-auto text-sm sm:text-base bg-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={status} details={statusDetails} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(category.id)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">GMV:</span>
              <span className="font-medium">{formatCurrency(metrics.gmvUsed)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">{t("marketplace.revenue")}:</span>
              <span className="font-medium text-primary">{formatCurrency(metrics.platformRevenue)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Percent className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Take Rate:</span>
              <span className="font-medium">{category.takeRatePercent}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Store className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">{t("marketplace.channels")}:</span>
              <span className="font-medium">{channelStats.length}</span>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Category inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs flex items-center">
                  {t("marketplace.transactions")}
                  <FieldTooltip content={t("marketplace.transactionsTooltip").replace("{period}", periodLabel)} />
                </Label>
                <NumericInput
                  value={category.transactionsCount}
                  onChange={(v) => onUpdate(category.id, { transactionsCount: v ?? 0 })}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs flex items-center">
                  {t("marketplace.avgCheck")} ({currency})
                  <FieldTooltip content={t("marketplace.avgCheckTooltip")} />
                </Label>
                <NumericInput
                  value={category.avgCheck}
                  onChange={(v) => onUpdate(category.id, { avgCheck: v ?? 0 })}
                  className="h-8 text-sm"
                  step="0.01"
                />
              </div>
              <div>
                <Label className="text-xs flex items-center">
                  {t("marketplace.takeRate")}
                  <FieldTooltip content={t("marketplace.takeRateCardTooltip")} />
                </Label>
                <NumericInput
                  value={category.takeRatePercent}
                  onChange={(v) => onUpdate(category.id, { takeRatePercent: Math.max(0, Math.min(100, v ?? 0)) })}
                  className="h-8 text-sm"
                  step="0.1"
                />
              </div>
              <div>
                <Label className="text-xs flex items-center">
                  {t("marketplace.gmvOverride")} ({currency})
                  <FieldTooltip content={t("marketplace.gmvOverrideTooltip").replace("{computed}", formatCurrency(category.gmvComputed))} />
                </Label>
                <NumericInput
                  value={category.gmvOverride ?? null}
                  onChange={(v) => onUpdate(category.id, { gmvOverride: v })}
                  className="h-8 text-sm"
                  step="0.01"
                  allowNull
                  placeholder={category.gmvComputed.toFixed(0)}
                />
              </div>
            </div>

            {/* GMV comparison */}
            {category.gmvOverride && metrics.gmvMismatchPercent !== undefined && (
              <div className={`text-xs p-2 rounded ${
                metrics.gmvMismatchPercent > 10 
                  ? 'bg-warning/10 text-warning-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {t("marketplace.gmvComparison")
                  .replace("{computed}", formatCurrency(category.gmvComputed))
                  .replace("{override}", formatCurrency(category.gmvOverride))
                  .replace("{pct}", metrics.gmvMismatchPercent.toFixed(1))}
              </div>
            )}

            {/* Channel mix */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Store className="w-4 h-4" />
                {t("marketplace.channelDistribution")}
                {metrics.totalSharePercent > 0 && (
                  <Badge variant={metrics.totalSharePercent > 100 ? 'destructive' : 'secondary'} className="text-xs">
                    Σ {metrics.totalSharePercent.toFixed(0)}%
                  </Badge>
                )}
              </h4>

              {channelStats.length > 0 && (
                <div className="space-y-2 mb-3">
                  {/* Mobile: Cards */}
                  <div className="block sm:hidden space-y-2">
                    {channelStats.map(stat => {
                      const channel = channels.find(c => c.id === stat.channelId);
                      const channelMetrics = calculateChannelMetrics(category, stat, channels);
                      
                      return (
                        <div key={stat.id} className="p-2 border rounded-lg bg-muted/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{channel?.name || t("marketplace.unknown")}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteChannelStat(stat.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-[10px]">{t("marketplace.share")}</Label>
                              <NumericInput
                                value={stat.sharePercent ?? null}
                                onChange={(v) => onUpdateChannelStat(stat.id, { sharePercent: v })}
                                className="h-7 text-xs"
                                allowNull
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px]">{t("marketplace.transactions")}</Label>
                              <NumericInput
                                value={stat.transactionsPerPeriod ?? null}
                                onChange={(v) => onUpdateChannelStat(stat.id, { transactionsPerPeriod: v })}
                                className="h-7 text-xs"
                                allowNull
                                placeholder={t("marketplace.auto")}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                            <div>GMV: {formatCurrency(channelMetrics.gmvChannel)}</div>
                            <div>Net: {formatCurrency(channelMetrics.netGmvChannel)}</div>
                            <div className="text-primary font-medium">
                              Rev: {formatCurrency(channelMetrics.platformRevenueChannel)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1 px-2">{t("marketplace.channel")}</th>
                          <th className="text-right py-1 px-2 w-20">{t("marketplace.share")}</th>
                          <th className="text-right py-1 px-2 w-20">{t("marketplace.transactions")}</th>
                          <th className="text-right py-1 px-2 w-20">Take Rate</th>
                          <th className="text-right py-1 px-2">GMV</th>
                          <th className="text-right py-1 px-2">{t("marketplace.netGmv")}</th>
                          <th className="text-right py-1 px-2 text-primary">{t("marketplace.revenue")}</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {channelStats.map(stat => {
                          const channel = channels.find(c => c.id === stat.channelId);
                          const channelMetrics = calculateChannelMetrics(category, stat, channels);
                          
                          return (
                            <tr key={stat.id} className="border-b border-muted/50 hover:bg-muted/30">
                              <td className="py-1 px-2 font-medium">{channel?.name || t("marketplace.unknown")}</td>
                              <td className="py-1 px-2">
                                <NumericInput
                                  value={stat.sharePercent ?? null}
                                  onChange={(v) => onUpdateChannelStat(stat.id, { sharePercent: v })}
                                  className="h-6 text-xs w-16"
                                  allowNull
                                  placeholder="0"
                                />
                              </td>
                              <td className="py-1 px-2">
                                <NumericInput
                                  value={stat.transactionsPerPeriod ?? null}
                                  onChange={(v) => onUpdateChannelStat(stat.id, { transactionsPerPeriod: v })}
                                  className="h-6 text-xs w-16"
                                  allowNull
                                  placeholder={t("marketplace.auto")}
                                />
                              </td>
                              <td className="py-1 px-2">
                                <NumericInput
                                  value={stat.takeRateOverridePercent ?? null}
                                  onChange={(v) => onUpdateChannelStat(stat.id, { takeRateOverridePercent: v })}
                                  className="h-6 text-xs w-16"
                                  allowNull
                                  placeholder={`${category.takeRatePercent}`}
                                />
                              </td>
                              <td className="py-1 px-2 text-right">{formatCurrency(channelMetrics.gmvChannel)}</td>
                              <td className="py-1 px-2 text-right">{formatCurrency(channelMetrics.netGmvChannel)}</td>
                              <td className="py-1 px-2 text-right text-primary font-medium">
                                {formatCurrency(channelMetrics.platformRevenueChannel)}
                              </td>
                              <td className="py-1 px-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteChannelStat(stat.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add channel mix */}
              {availableChannels.length > 0 && (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">{t("marketplace.addChannel")}</Label>
                    <select
                      value={newChannelId}
                      onChange={(e) => setNewChannelId(e.target.value)}
                      className="w-full h-8 text-sm border rounded-md px-2 bg-background"
                    >
                      <option value="">{t("marketplace.selectChannel")}</option>
                      {availableChannels.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button size="sm" onClick={handleAddChannelMix} className="h-8">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {availableChannels.length === 0 && channelStats.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("marketplace.addedChannelMixHint")}
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
