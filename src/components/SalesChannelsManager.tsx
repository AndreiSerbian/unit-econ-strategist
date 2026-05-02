import { useMemo, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Trash2, Store, Globe, Truck, Users, Building2, Handshake, ShoppingBag, Ship, HelpCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * SaaS Sales Channel = payment route / merchant-of-record / reseller route
 * NOT acquisition channels (SEO, Ads, etc.)
 * 
 * Key fields:
 * - commissionPercent: revenue share / partner cut / platform fee
 * - discountPercent: typical discount for channel (promo/annual/enterprise)
 * - returnRatePercent: refunds/chargebacks (NOT churn)
 * - paymentDelayDays: payout delay or invoice terms (net-30/60)
 * 
 * Deprecated for SaaS (kept for backward compatibility):
 * - fulfillmentCostPerUnit
 * - logisticsCostPerUnit
 */
// Re-export from useProject for type consistency
export type { SalesChannel } from "@/hooks/useProject";
import type { SalesChannel } from "@/hooks/useProject";

export interface ProductChannelAllocation {
  id: string;
  productId: string;
  channelId: string;
  quantity: number;
  priceOverride?: number;
}

// Channel type definition for UI
interface ChannelTypeOption {
  value: SalesChannel["type"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  legacy?: boolean;
}

// SaaS-relevant channel types — labels are localized via t() inside the component.
// Descriptions are kept in RU as legacy fallback for tooltips not yet localized.
const CHANNEL_TYPES: ChannelTypeOption[] = [
  { value: "website", label: "Свой сайт", icon: Globe, description: "Прямые продажи через свой сайт (Stripe, Paddle и др.)" },
  { value: "marketplace", label: "Маркетплейс", icon: ShoppingBag, description: "Продажи через SaaS-маркетплейсы (AppSumo, G2 и др.)" },
  { value: "distributor", label: "Дистрибьютор", icon: Truck, description: "Реселлеры и дистрибьюторы" },
  { value: "enterprise", label: "Enterprise", icon: Building2, description: "Корпоративные контракты с отсрочкой оплаты" },
  { value: "retail", label: "Розница B2B", icon: Store, description: "Розничные B2B продажи", legacy: true },
  { value: "agent", label: "Агенты/Партнёры", icon: Handshake, description: "Affiliate и партнёрские программы" },
  { value: "direct_b2b", label: "Прямые B2B продажи", icon: Users, description: "Прямые контракты с бизнесами" },
  { value: "franchise", label: "Франшиза", icon: Store, description: "Legacy: франчайзинговая модель", legacy: true },
  { value: "export", label: "Экспорт", icon: Ship, description: "Legacy: экспортные продажи", legacy: true },
];

const CHANNEL_TYPE_LABEL_KEY: Record<SalesChannel["type"], string> = {
  website: "salesChannels.typeWebsite",
  marketplace: "salesChannels.typeMarketplace",
  distributor: "salesChannels.typeDistributor",
  enterprise: "salesChannels.typeEnterprise",
  retail: "salesChannels.typeRetail",
  agent: "salesChannels.typeAgent",
  direct_b2b: "salesChannels.typeDirectB2b",
  franchise: "salesChannels.typeFranchise",
  export: "salesChannels.typeExport",
};

// SaaS-specific templates (no fulfillment/logistics costs)
const CHANNEL_TEMPLATES: Record<string, Partial<SalesChannel>> = {
  website: { 
    commissionPercent: 3, // Payment processor fee (Stripe ~2.9%)
    fulfillmentCostPerUnit: 0, 
    returnRatePercent: 2, 
    paymentDelayDays: 2, // Stripe payout delay
    discountPercent: 0 
  },
  marketplace: { 
    commissionPercent: 30, // AppSumo-style marketplace cut
    fulfillmentCostPerUnit: 0, 
    returnRatePercent: 10, // Higher refund rate on marketplaces
    paymentDelayDays: 30,
    discountPercent: 0 
  },
  distributor: { 
    commissionPercent: 0, 
    fulfillmentCostPerUnit: 0, 
    returnRatePercent: 2, 
    paymentDelayDays: 30, 
    discountPercent: 40 // Reseller discount
  },
  enterprise: { 
    commissionPercent: 0, 
    fulfillmentCostPerUnit: 0, 
    returnRatePercent: 1, // Low refund rate for enterprise
    paymentDelayDays: 45, // Net-45 terms
    discountPercent: 20 // Enterprise volume discount
  },
  agent: { 
    commissionPercent: 20, // Partner/affiliate commission
    fulfillmentCostPerUnit: 0, 
    returnRatePercent: 3, 
    paymentDelayDays: 7,
    discountPercent: 0 
  },
  direct_b2b: { 
    commissionPercent: 0, 
    fulfillmentCostPerUnit: 0, 
    returnRatePercent: 1, 
    paymentDelayDays: 30, 
    discountPercent: 15 
  },
  franchise: { 
    commissionPercent: 5, 
    fulfillmentCostPerUnit: 0, 
    returnRatePercent: 1, 
    paymentDelayDays: 14,
    discountPercent: 0 
  },
  export: { 
    commissionPercent: 5, 
    fulfillmentCostPerUnit: 0, 
    logisticsCostPerUnit: 0, 
    returnRatePercent: 2, 
    paymentDelayDays: 60,
    discountPercent: 0 
  },
  // Legacy retail template - kept for backward compatibility
  retail: { 
    commissionPercent: 0, 
    fulfillmentCostPerUnit: 0, 
    returnRatePercent: 2, 
    paymentDelayDays: 45, 
    discountPercent: 15 
  },
};

interface SalesChannelsManagerProps {
  channels: SalesChannel[];
  setChannels: React.Dispatch<React.SetStateAction<SalesChannel[]>>;
  currency: string;
  businessType?: string; // To conditionally show/hide e-commerce fields
}

// Tooltip component for field explanations
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

export const SalesChannelsManager = ({
  channels,
  setChannels,
  currency,
  businessType = 'saas',
}: SalesChannelsManagerProps) => {
  const { t } = useTranslation();
  const isSaaS = businessType === 'saas' || businessType === 'freemium';

  // Filter channel types based on business type
  const availableChannelTypes = useMemo(
    () => (isSaaS ? CHANNEL_TYPES.filter((c) => !c.legacy) : CHANNEL_TYPES),
    [isSaaS]
  );

  const tChannelTypeLabel = (type: SalesChannel["type"]) =>
    t(CHANNEL_TYPE_LABEL_KEY[type] ?? "");

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

  // Validation helpers
  const validatePercent = (value: number): number => {
    return Math.max(0, Math.min(100, value));
  };

  const validateDelayDays = (value: number): number => {
    return Math.max(0, Math.min(365, Math.round(value)));
  };

  const handleAddChannel = () => {
    if (!newChannel.name.trim()) {
      toast.error(t("salesChannels.nameRequired"));
      return;
    }

    const channel: SalesChannel = {
      ...newChannel,
      id: Date.now().toString(),
      commissionPercent: validatePercent(newChannel.commissionPercent),
      returnRatePercent: validatePercent(newChannel.returnRatePercent),
      discountPercent: validatePercent(newChannel.discountPercent || 0),
      paymentDelayDays: validateDelayDays(newChannel.paymentDelayDays),
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
    toast.success(t("salesChannels.addedToast"));
  };

  const handleDeleteChannel = (channelId: string) => {
    setChannels(channels.filter((c) => c.id !== channelId));
    toast.success(t("salesChannels.deletedToast"));
  };

  const handleUpdateChannel = (channelId: string, updates: Partial<SalesChannel>) => {
    setChannels(channels.map((c) => (c.id === channelId ? { ...c, ...updates } : c)));
  };

  const getChannelIcon = (type: SalesChannel["type"]) => {
    const channelType = CHANNEL_TYPES.find((t) => t.value === type);
    return channelType?.icon || Store;
  };

  const getChannelTypeLabel = (type: SalesChannel["type"]) => tChannelTypeLabel(type) || type;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" />
          {t("salesChannels.title")}
        </CardTitle>
        <CardDescription>
          {isSaaS ? t("salesChannels.descSaas") : t("salesChannels.descPhysical")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new channel form */}
        <div className="p-3 sm:p-4 border rounded-lg bg-muted/30 space-y-4">
          <h3 className="font-medium text-sm">{t("salesChannels.addTitle")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <Label className="text-xs sm:text-sm">{t("common.name")}</Label>
              <Input
                value={newChannel.name}
                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                placeholder={isSaaS ? t("salesChannels.namePlaceholderSaas") : t("salesChannels.namePlaceholderPhysical")}
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">{t("salesChannels.typeLabel")}</Label>
              <Select value={newChannel.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableChannelTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {tChannelTypeLabel(type.value)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs sm:text-sm flex items-center">
                {t("salesChannels.commission")}
                <FieldTooltip content={t("salesChannels.commissionTooltip")} />
              </Label>
              <NumericInput
                value={newChannel.commissionPercent}
                onChange={(value) => setNewChannel({ ...newChannel, commissionPercent: validatePercent(value || 0) })}
                placeholder="0"
                className="text-sm"
              />
            </div>
          </div>
          
          {/* SaaS-specific fields */}
          <div className={`grid grid-cols-2 ${isSaaS ? 'sm:grid-cols-4' : 'sm:grid-cols-3 md:grid-cols-5'} gap-3 sm:gap-4`}>
            {/* Hide fulfillment/logistics for SaaS */}
            {!isSaaS && (
              <>
                <div>
                  <Label className="text-xs sm:text-sm">{t("salesChannels.fulfillment", { currency })}</Label>
                  <NumericInput
                    value={newChannel.fulfillmentCostPerUnit}
                    onChange={(value) => setNewChannel({ ...newChannel, fulfillmentCostPerUnit: value || 0 })}
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">{t("salesChannels.logistics", { currency })}</Label>
                  <NumericInput
                    value={newChannel.logisticsCostPerUnit}
                    onChange={(value) => setNewChannel({ ...newChannel, logisticsCostPerUnit: value || 0 })}
                    placeholder="0"
                    className="text-sm"
                  />
                </div>
              </>
            )}
            <div>
              <Label className="text-xs sm:text-sm flex items-center">
                {t("salesChannels.returns")}
                <FieldTooltip content={t("salesChannels.returnsTooltip")} />
              </Label>
              <NumericInput
                value={newChannel.returnRatePercent}
                onChange={(value) => setNewChannel({ ...newChannel, returnRatePercent: validatePercent(value || 0) })}
                placeholder="0"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm flex items-center">
                {t("salesChannels.delay")}
                <FieldTooltip content={t("salesChannels.delayTooltip")} />
              </Label>
              <NumericInput
                value={newChannel.paymentDelayDays}
                onChange={(value) => setNewChannel({ ...newChannel, paymentDelayDays: validateDelayDays(value || 0) })}
                placeholder="0"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm flex items-center">
                {t("salesChannels.discount")}
                <FieldTooltip content={t("salesChannels.discountTooltip")} />
              </Label>
              <NumericInput
                value={newChannel.discountPercent || 0}
                onChange={(value) => setNewChannel({ ...newChannel, discountPercent: validatePercent(value || 0) })}
                placeholder="0"
                className="text-sm"
              />
            </div>
          </div>
          <Button onClick={handleAddChannel} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {t("salesChannels.addCta")}
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
                  className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Input
                          value={channel.name}
                          onChange={(e) => handleUpdateChannel(channel.id, { name: e.target.value })}
                          className="font-medium border-0 p-0 h-auto text-sm sm:text-base bg-transparent"
                        />
                        <p className="text-[10px] sm:text-xs text-muted-foreground">{getChannelTypeLabel(channel.type)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChannel(channel.id)}
                      className="shrink-0 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className={`grid grid-cols-2 ${isSaaS ? 'sm:grid-cols-4' : 'sm:grid-cols-3 md:grid-cols-6'} gap-2 sm:gap-3 mt-3 sm:mt-4`}>
                    <div>
                      <Label className="text-[10px] sm:text-xs">Комиссия (%)</Label>
                      <NumericInput
                        value={channel.commissionPercent}
                        onChange={(value) => handleUpdateChannel(channel.id, { commissionPercent: validatePercent(value || 0) })}
                        className="h-8 text-sm"
                      />
                    </div>
                    {/* Hide fulfillment/logistics for SaaS */}
                    {!isSaaS && (
                      <>
                        <div>
                          <Label className="text-[10px] sm:text-xs">Фулфилмент</Label>
                          <NumericInput
                            value={channel.fulfillmentCostPerUnit}
                            onChange={(value) => handleUpdateChannel(channel.id, { fulfillmentCostPerUnit: value || 0 })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] sm:text-xs">Логистика</Label>
                          <NumericInput
                            value={channel.logisticsCostPerUnit}
                            onChange={(value) => handleUpdateChannel(channel.id, { logisticsCostPerUnit: value || 0 })}
                            className="h-8 text-sm"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <Label className="text-[10px] sm:text-xs">Возвраты (%)</Label>
                      <NumericInput
                        value={channel.returnRatePercent}
                        onChange={(value) => handleUpdateChannel(channel.id, { returnRatePercent: validatePercent(value || 0) })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] sm:text-xs">Отсрочка (дни)</Label>
                      <NumericInput
                        value={channel.paymentDelayDays}
                        onChange={(value) => handleUpdateChannel(channel.id, { paymentDelayDays: validateDelayDays(value || 0) })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] sm:text-xs">Скидка (%)</Label>
                      <NumericInput
                        value={channel.discountPercent || 0}
                        onChange={(value) => handleUpdateChannel(channel.id, { discountPercent: validatePercent(value || 0) })}
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
            <p className="text-sm">
              {isSaaS 
                ? "Добавьте каналы продаж для анализа unit-экономики"
                : "Добавьте каналы продаж для анализа маржинальности"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Calculate net revenue multiplier for a sales channel (SaaS model)
 * net = gross * (1 - commission%) * (1 - discount%) * (1 - refund%)
 * 
 * Note: paymentDelayDays affects cashflow timing, not revenue amount
 */
export const calculateChannelNetMultiplier = (channel: SalesChannel): number => {
  const commissionMultiplier = 1 - (channel.commissionPercent / 100);
  const discountMultiplier = 1 - ((channel.discountPercent || 0) / 100);
  const refundMultiplier = 1 - (channel.returnRatePercent / 100);
  
  return commissionMultiplier * discountMultiplier * refundMultiplier;
};

/**
 * Migrate old channel type values to new ones
 * "retail" -> "enterprise" for backward compatibility
 */
export const migrateChannelType = (type: string): SalesChannel["type"] => {
  if (type === 'retail') {
    return 'enterprise';
  }
  return type as SalesChannel["type"];
};
