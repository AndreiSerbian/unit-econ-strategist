import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link2, Plus, Trash2, HelpCircle, DollarSign, AlertTriangle } from "lucide-react";
import type { ProductDistributionV2, SalesChannelV2, ProductChannelV2, ChannelRevenueCalculation, PlanningPeriod } from "./types";
import { calculateChannelRevenue, getPeriodLabel, getPeriodMultiplier } from "./types";

interface ProductChannelsManagerProps {
  products: ProductDistributionV2[];
  channels: SalesChannelV2[];
  productChannels: ProductChannelV2[];
  planningPeriod: PlanningPeriod;
  onAdd: (link: Omit<ProductChannelV2, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<ProductChannelV2>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currency: string;
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

const validatePercent = (v: number) => Math.max(0, Math.min(100, v));

export const ProductChannelsManager = ({
  products,
  channels,
  productChannels,
  planningPeriod,
  onAdd,
  onUpdate,
  onDelete,
  currency,
}: ProductChannelsManagerProps) => {
  // Group product channels by product
  const productChannelGroups = useMemo(() => {
    const groups: Record<string, {
      product: ProductDistributionV2;
      links: Array<ProductChannelV2 & { channel: SalesChannelV2; revenue: ChannelRevenueCalculation }>;
      totalRevenue: number;
      shareSum: number;
    }> = {};

    for (const product of products) {
      const links = productChannels
        .filter(pc => pc.productId === product.id)
        .map(pc => {
          const channel = channels.find(c => c.id === pc.channelId);
          if (!channel) return null;
          const revenue = calculateChannelRevenue(product, channel, pc, planningPeriod);
          return { ...pc, channel, revenue };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      groups[product.id] = {
        product,
        links,
        totalRevenue: links.reduce((sum, l) => sum + l.revenue.revenueChannel, 0),
        shareSum: links.reduce((sum, l) => sum + l.channelSharePercent, 0),
      };
    }

    return groups;
  }, [products, channels, productChannels, planningPeriod]);

  const handleAddLink = async (productId: string, channelId: string) => {
    // Check if link already exists
    const exists = productChannels.some(pc => pc.productId === productId && pc.channelId === channelId);
    if (exists) return;

    await onAdd({
      productId,
      channelId,
      channelSharePercent: 100,
      isActive: true,
    });
  };

  const activeChannels = channels.filter(c => c.isActive);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Продукт ↔ Канал: Net Revenue
        </CardTitle>
        <CardDescription>
          Привяжите продукты к каналам и укажите долю продаж. Расчёт выручки за {getPeriodLabel(planningPeriod)}.
          <br />
          <span className="text-muted-foreground text-xs">TODO: возвратная логистика пока не учитывается</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {products.length === 0 || activeChannels.length === 0 ? (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 border">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <p className="text-sm text-muted-foreground">
              {products.length === 0
                ? "Сначала добавьте продукты"
                : "Сначала добавьте активные каналы продаж"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.values(productChannelGroups).map(({ product, links, totalRevenue, shareSum }) => (
              <div key={product.id} className="border rounded-lg overflow-hidden">
                <div className="p-3 bg-muted/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {product.quantity} ед. × {product.price} {currency} = {(product.quantity * product.price).toLocaleString()} {currency} (gross)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-sm text-primary">
                      {totalRevenue.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} {currency}
                    </p>
                    <p className="text-[10px] text-muted-foreground">net revenue</p>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  {/* Existing links */}
                  {links.map((link) => (
                    <div key={link.id} className={`p-2 rounded border ${!link.isActive ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{link.channel.name}</span>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={link.isActive}
                            onCheckedChange={(checked) => onUpdate(link.id, { isActive: checked })}
                          />
                          <Button variant="ghost" size="icon" onClick={() => onDelete(link.id)} className="h-6 w-6">
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground flex items-center">
                            Доля %
                            <FieldTooltip content="Какая доля продаж этого продукта идёт через этот канал" />
                          </Label>
                          <NumericInput
                            value={link.channelSharePercent}
                            onChange={(v) => onUpdate(link.id, { channelSharePercent: validatePercent(v) })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Цена (override)</Label>
                          <NumericInput
                            value={link.priceOverride || 0}
                            onChange={(v) => onUpdate(link.id, { priceOverride: v || undefined })}
                            placeholder={String(product.price)}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Net ед.</Label>
                          <div className="h-7 px-2 py-1 border rounded bg-muted/30 text-xs font-mono">
                            {link.revenue.netUnits.toFixed(0)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground flex items-center">
                            <DollarSign className="w-3 h-3" />
                            Revenue
                          </Label>
                          <div className="h-7 px-2 py-1 border rounded bg-primary/10 text-xs font-mono font-medium">
                            {link.revenue.revenueChannel.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Share warning */}
                  {shareSum !== 100 && links.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-warning">
                      <AlertTriangle className="w-3 h-3" />
                      Сумма долей: {shareSum}% (рекомендуется 100%)
                    </div>
                  )}

                  {/* Add channel link */}
                  <div className="pt-2 border-t">
                    <Select onValueChange={(channelId) => handleAddLink(product.id, channelId)}>
                      <SelectTrigger className="h-8 text-xs">
                        <Plus className="w-3 h-3 mr-1" />
                        <span>Добавить канал</span>
                      </SelectTrigger>
                      <SelectContent>
                        {activeChannels
                          .filter(c => !links.some(l => l.channelId === c.id))
                          .map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))
          </div>
        )}
      </CardContent>
    </Card>
  );
};
