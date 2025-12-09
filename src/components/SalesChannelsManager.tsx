import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Store, Globe, Truck, Users, Building2, Handshake, ShoppingBag, Ship } from "lucide-react";
import { toast } from "sonner";

export interface SalesChannel {
  id: string;
  name: string;
  type: 'website' | 'marketplace' | 'distributor' | 'retail' | 'agent' | 'direct_b2b' | 'franchise' | 'export';
  commissionPercent: number;
  fulfillmentCostPerUnit: number;
  logisticsCostPerUnit: number;
  returnRatePercent: number;
  paymentDelayDays: number;
  minOrderQuantity?: number;
  discountPercent?: number;
}

export interface ProductChannelAllocation {
  id: string;
  productId: string;
  channelId: string;
  quantity: number;
  priceOverride?: number;
}

const CHANNEL_TYPES = [
  { value: "website", label: "Свой сайт", icon: Globe },
  { value: "marketplace", label: "Маркетплейс", icon: ShoppingBag },
  { value: "distributor", label: "Дистрибьютор", icon: Truck },
  { value: "retail", label: "Розница B2B", icon: Store },
  { value: "agent", label: "Агенты/Партнёры", icon: Handshake },
  { value: "direct_b2b", label: "Прямые B2B продажи", icon: Building2 },
  { value: "franchise", label: "Франшиза", icon: Users },
  { value: "export", label: "Экспорт", icon: Ship },
] as const;

const CHANNEL_TEMPLATES: Record<string, Partial<SalesChannel>> = {
  website: { commissionPercent: 0, fulfillmentCostPerUnit: 0, returnRatePercent: 2, paymentDelayDays: 0 },
  marketplace: { commissionPercent: 20, fulfillmentCostPerUnit: 100, returnRatePercent: 7, paymentDelayDays: 14 },
  distributor: { commissionPercent: 0, fulfillmentCostPerUnit: 0, returnRatePercent: 1, paymentDelayDays: 30, discountPercent: 30 },
  retail: { commissionPercent: 0, fulfillmentCostPerUnit: 0, returnRatePercent: 2, paymentDelayDays: 45, discountPercent: 15 },
  agent: { commissionPercent: 15, fulfillmentCostPerUnit: 0, returnRatePercent: 3, paymentDelayDays: 7 },
  direct_b2b: { commissionPercent: 0, fulfillmentCostPerUnit: 0, returnRatePercent: 0.5, paymentDelayDays: 30, discountPercent: 10 },
  franchise: { commissionPercent: 5, fulfillmentCostPerUnit: 0, returnRatePercent: 1, paymentDelayDays: 14 },
  export: { commissionPercent: 0, fulfillmentCostPerUnit: 200, returnRatePercent: 1, paymentDelayDays: 60, logisticsCostPerUnit: 500 },
};

interface SalesChannelsManagerProps {
  channels: SalesChannel[];
  setChannels: React.Dispatch<React.SetStateAction<SalesChannel[]>>;
  currency: string;
}

export const SalesChannelsManager = ({
  channels,
  setChannels,
  currency,
}: SalesChannelsManagerProps) => {
  const [newChannel, setNewChannel] = useState<Omit<SalesChannel, "id">>({
    name: "",
    type: "website",
    commissionPercent: 0,
    fulfillmentCostPerUnit: 0,
    logisticsCostPerUnit: 0,
    returnRatePercent: 0,
    paymentDelayDays: 0,
    discountPercent: 0,
  });

  const handleTypeChange = (type: SalesChannel["type"]) => {
    const template = CHANNEL_TEMPLATES[type] || {};
    setNewChannel({
      ...newChannel,
      type,
      ...template,
      logisticsCostPerUnit: template.logisticsCostPerUnit || 0,
    });
  };

  const handleAddChannel = () => {
    if (!newChannel.name.trim()) {
      toast.error("Введите название канала");
      return;
    }

    const channel: SalesChannel = {
      ...newChannel,
      id: Date.now().toString(),
    };

    setChannels([...channels, channel]);
    setNewChannel({
      name: "",
      type: "website",
      commissionPercent: 0,
      fulfillmentCostPerUnit: 0,
      logisticsCostPerUnit: 0,
      returnRatePercent: 0,
      paymentDelayDays: 0,
      discountPercent: 0,
    });
    toast.success("Канал добавлен");
  };

  const handleDeleteChannel = (channelId: string) => {
    setChannels(channels.filter((c) => c.id !== channelId));
    toast.success("Канал удалён");
  };

  const handleUpdateChannel = (channelId: string, updates: Partial<SalesChannel>) => {
    setChannels(channels.map((c) => (c.id === channelId ? { ...c, ...updates } : c)));
  };

  const getChannelIcon = (type: SalesChannel["type"]) => {
    const channelType = CHANNEL_TYPES.find((t) => t.value === type);
    return channelType?.icon || Store;
  };

  const getChannelTypeLabel = (type: SalesChannel["type"]) => {
    return CHANNEL_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          Каналы продаж
        </CardTitle>
        <CardDescription>
          Настройте параметры каналов: комиссии, фулфилмент, логистика, возвраты
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new channel form */}
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <h3 className="font-medium text-sm">Добавить канал</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Название</Label>
              <Input
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                placeholder="Например: Wildberries"
              />
            </div>
            <div>
              <Label>Тип канала</Label>
              <Select value={newChannel.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Комиссия (%)</Label>
              <NumericInput
                value={newChannel.commissionPercent}
                onChange={(value) => setNewChannel({ ...newChannel, commissionPercent: value })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <Label>Фулфилмент ({currency})</Label>
              <NumericInput
                value={newChannel.fulfillmentCostPerUnit}
                onChange={(value) => setNewChannel({ ...newChannel, fulfillmentCostPerUnit: value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Логистика ({currency})</Label>
              <NumericInput
                value={newChannel.logisticsCostPerUnit}
                onChange={(value) => setNewChannel({ ...newChannel, logisticsCostPerUnit: value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Возвраты (%)</Label>
              <NumericInput
                value={newChannel.returnRatePercent}
                onChange={(value) => setNewChannel({ ...newChannel, returnRatePercent: value })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Отсрочка (дни)</Label>
              <NumericInput
                value={newChannel.paymentDelayDays}
                onChange={(value) => setNewChannel({ ...newChannel, paymentDelayDays: Math.round(value) })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Скидка (%)</Label>
              <NumericInput
                value={newChannel.discountPercent || 0}
                onChange={(value) => setNewChannel({ ...newChannel, discountPercent: value })}
                placeholder="0"
              />
            </div>
          </div>
          <Button onClick={handleAddChannel} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Добавить канал
          </Button>
        </div>

        {/* Channels list */}
        {channels.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Настроенные каналы</h3>
            {channels.map((channel) => {
              const Icon = getChannelIcon(channel.type);
              return (
                <div
                  key={channel.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <Input
                          value={channel.name}
                          onChange={(e) => handleUpdateChannel(channel.id, { name: e.target.value })}
                          className="font-medium border-0 p-0 h-auto text-base bg-transparent"
                        />
                        <p className="text-xs text-muted-foreground">{getChannelTypeLabel(channel.type)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChannel(channel.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
                    <div>
                      <Label className="text-xs">Комиссия (%)</Label>
                      <NumericInput
                        value={channel.commissionPercent}
                        onChange={(value) => handleUpdateChannel(channel.id, { commissionPercent: value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Фулфилмент</Label>
                      <NumericInput
                        value={channel.fulfillmentCostPerUnit}
                        onChange={(value) => handleUpdateChannel(channel.id, { fulfillmentCostPerUnit: value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Логистика</Label>
                      <NumericInput
                        value={channel.logisticsCostPerUnit}
                        onChange={(value) => handleUpdateChannel(channel.id, { logisticsCostPerUnit: value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Возвраты (%)</Label>
                      <NumericInput
                        value={channel.returnRatePercent}
                        onChange={(value) => handleUpdateChannel(channel.id, { returnRatePercent: value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Отсрочка</Label>
                      <NumericInput
                        value={channel.paymentDelayDays}
                        onChange={(value) => handleUpdateChannel(channel.id, { paymentDelayDays: Math.round(value) })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Скидка (%)</Label>
                      <NumericInput
                        value={channel.discountPercent || 0}
                        onChange={(value) => handleUpdateChannel(channel.id, { discountPercent: value })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {channels.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет настроенных каналов</p>
            <p className="text-sm">Добавьте каналы продаж для анализа маржинальности</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
