import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Store, HelpCircle, Globe, ShoppingBag, Users, Building2 } from "lucide-react";
import type { SalesChannelV2 } from "./types";

interface SalesChannelsV2ManagerProps {
  channels: SalesChannelV2[];
  onAdd: (channel: Omit<SalesChannelV2, 'id' | 'projectId'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<SalesChannelV2>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  currency: string;
}

const CHANNEL_TYPES = [
  { value: "direct", label: "Прямые", icon: Globe },
  { value: "marketplace", label: "Маркетплейс", icon: ShoppingBag },
  { value: "wholesale", label: "Опт", icon: Building2 },
  { value: "retail", label: "Розница", icon: Store },
  { value: "affiliate", label: "Партнёры", icon: Users },
];

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

export const SalesChannelsV2Manager = ({
  channels,
  onAdd,
  onUpdate,
  onDelete,
  currency,
}: SalesChannelsV2ManagerProps) => {
  const [newChannel, setNewChannel] = useState<Omit<SalesChannelV2, 'id' | 'projectId'>>({
    name: "",
    channelType: "direct",
    commissionPercent: 0,
    commissionFixed: 0,
    discountPercent: 0,
    paymentTermsDays: 0,
    returnsPercent: 0,
    currency: "EUR",
    isActive: true,
  });

  const handleAdd = async () => {
    if (!newChannel.name.trim()) return;
    await onAdd({
      ...newChannel,
      commissionPercent: validatePercent(newChannel.commissionPercent),
      discountPercent: validatePercent(newChannel.discountPercent),
      returnsPercent: validatePercent(newChannel.returnsPercent),
    });
    setNewChannel({
      name: "",
      channelType: "direct",
      commissionPercent: 0,
      commissionFixed: 0,
      discountPercent: 0,
      paymentTermsDays: 0,
      returnsPercent: 0,
      currency: "EUR",
      isActive: true,
    });
  };

  const getChannelIcon = (type: SalesChannelV2['channelType']) => {
    return CHANNEL_TYPES.find(t => t.value === type)?.icon || Store;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          Каналы продаж V2
        </CardTitle>
        <CardDescription>
          Каналы с комиссиями, скидками и возвратами для расчёта net revenue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add form */}
        <div className="p-3 border rounded-lg bg-muted/30 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Название канала</Label>
              <Input
                value={newChannel.name}
                onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Wildberries, Ozon, Сайт..."
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Тип канала</Label>
              <Select 
                value={newChannel.channelType} 
                onValueChange={(v) => setNewChannel(prev => ({ ...prev, channelType: v as SalesChannelV2['channelType'] }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_TYPES.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center">
                Комиссия %
                <FieldTooltip content="Процент от выручки, который забирает канал" />
              </Label>
              <NumericInput
                value={newChannel.commissionPercent}
                onChange={(v) => setNewChannel(prev => ({ ...prev, commissionPercent: validatePercent(v) }))}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs flex items-center">
                Фикс. комиссия
                <FieldTooltip content="Фиксированная сумма за продажу ({currency})" />
              </Label>
              <NumericInput
                value={newChannel.commissionFixed}
                onChange={(v) => setNewChannel(prev => ({ ...prev, commissionFixed: v }))}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center">
                Скидка %
                <FieldTooltip content="Типичная скидка для канала" />
              </Label>
              <NumericInput
                value={newChannel.discountPercent}
                onChange={(v) => setNewChannel(prev => ({ ...prev, discountPercent: validatePercent(v) }))}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center">
                Возвраты %
                <FieldTooltip content="Процент возвратов товара (refunds)" />
              </Label>
              <NumericInput
                value={newChannel.returnsPercent}
                onChange={(v) => setNewChannel(prev => ({ ...prev, returnsPercent: validatePercent(v) }))}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Отсрочка (дни)</Label>
              <NumericInput
                value={newChannel.paymentTermsDays}
                onChange={(v) => setNewChannel(prev => ({ ...prev, paymentTermsDays: Math.max(0, Math.round(v)) }))}
                className="text-sm"
              />
            </div>
          </div>
          
          <Button onClick={handleAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Добавить канал
          </Button>
        </div>

        {/* Channels list */}
        {channels.length > 0 && (
          <div className="space-y-2">
            {channels.map((channel) => {
              const Icon = getChannelIcon(channel.channelType);
              
              return (
                <div key={channel.id} className={`p-3 border rounded-lg ${!channel.isActive ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <Input
                          value={channel.name}
                          onChange={(e) => onUpdate(channel.id, { name: e.target.value })}
                          className="font-medium border-0 p-0 h-auto bg-transparent text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          {CHANNEL_TYPES.find(t => t.value === channel.channelType)?.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={channel.isActive}
                        onCheckedChange={(checked) => onUpdate(channel.id, { isActive: checked })}
                      />
                      <Button variant="ghost" size="icon" onClick={() => onDelete(channel.id)} className="h-8 w-8 shrink-0">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Комиссия %</Label>
                      <NumericInput
                        value={channel.commissionPercent}
                        onChange={(v) => onUpdate(channel.id, { commissionPercent: validatePercent(v) })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Фикс.</Label>
                      <NumericInput
                        value={channel.commissionFixed}
                        onChange={(v) => onUpdate(channel.id, { commissionFixed: v })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Скидка %</Label>
                      <NumericInput
                        value={channel.discountPercent}
                        onChange={(v) => onUpdate(channel.id, { discountPercent: validatePercent(v) })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Возвраты %</Label>
                      <NumericInput
                        value={channel.returnsPercent}
                        onChange={(v) => onUpdate(channel.id, { returnsPercent: validatePercent(v) })}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {channels.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Добавьте каналы для расчёта net revenue
          </p>
        )}
      </CardContent>
    </Card>
  );
};
