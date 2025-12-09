import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, BarChart3, AlertTriangle } from "lucide-react";
import { SalesChannel, ProductChannelAllocation } from "./SalesChannelsManager";
import { Product } from "./ProductsManagement";
import { toast } from "sonner";

interface ProductChannelBreakdownProps {
  products: Product[];
  channels: SalesChannel[];
  allocations: ProductChannelAllocation[];
  setAllocations: React.Dispatch<React.SetStateAction<ProductChannelAllocation[]>>;
  currency: string;
}

export const ProductChannelBreakdown = ({
  products,
  channels,
  allocations,
  setAllocations,
  currency,
}: ProductChannelBreakdownProps) => {
  const calculateChannelMetrics = (
    product: Product,
    channel: SalesChannel,
    allocation: ProductChannelAllocation
  ) => {
    const price = allocation.priceOverride ?? product.price;
    const discountedPrice = price * (1 - (channel.discountPercent || 0) / 100);
    const revenue = discountedPrice * allocation.quantity;
    
    const commission = revenue * (channel.commissionPercent / 100);
    const fulfillment = channel.fulfillmentCostPerUnit * allocation.quantity;
    const logistics = channel.logisticsCostPerUnit * allocation.quantity;
    const productCost = product.cost * allocation.quantity;
    
    const returnLoss = revenue * (channel.returnRatePercent / 100);
    const returnHandlingCost = (channel.fulfillmentCostPerUnit + channel.logisticsCostPerUnit) * 
      allocation.quantity * (channel.returnRatePercent / 100);
    
    const totalCosts = commission + fulfillment + logistics + productCost + returnLoss + returnHandlingCost;
    const netMargin = revenue - totalCosts;
    const marginPercent = revenue > 0 ? (netMargin / revenue) * 100 : 0;
    
    return {
      price: discountedPrice,
      revenue,
      commission,
      fulfillment,
      logistics,
      productCost,
      returnLoss,
      netMargin,
      marginPercent,
    };
  };

  const handleAddAllocation = (productId: string, channelId: string) => {
    // Check if allocation already exists
    const exists = allocations.find(
      (a) => a.productId === productId && a.channelId === channelId
    );
    if (exists) {
      toast.error("Этот канал уже добавлен для продукта");
      return;
    }

    const newAllocation: ProductChannelAllocation = {
      id: Date.now().toString(),
      productId,
      channelId,
      quantity: 0,
    };

    setAllocations([...allocations, newAllocation]);
  };

  const handleUpdateAllocation = (
    allocationId: string,
    updates: Partial<ProductChannelAllocation>
  ) => {
    setAllocations(
      allocations.map((a) => (a.id === allocationId ? { ...a, ...updates } : a))
    );
  };

  const handleDeleteAllocation = (allocationId: string) => {
    setAllocations(allocations.filter((a) => a.id !== allocationId));
  };

  const getProductAllocations = (productId: string) => {
    return allocations.filter((a) => a.productId === productId);
  };

  const getUnallocatedChannels = (productId: string) => {
    const productAllocationChannelIds = getProductAllocations(productId).map(
      (a) => a.channelId
    );
    return channels.filter((c) => !productAllocationChannelIds.includes(c.id));
  };

  const calculateProductTotals = (productId: string) => {
    const productAllocations = getProductAllocations(productId);
    const product = products.find((p) => p.id === productId);
    if (!product) return { totalQuantity: 0, totalRevenue: 0, totalMargin: 0, avgMarginPercent: 0 };

    let totalQuantity = 0;
    let totalRevenue = 0;
    let totalMargin = 0;

    productAllocations.forEach((allocation) => {
      const channel = channels.find((c) => c.id === allocation.channelId);
      if (!channel) return;

      const metrics = calculateChannelMetrics(product, channel, allocation);
      totalQuantity += allocation.quantity;
      totalRevenue += metrics.revenue;
      totalMargin += metrics.netMargin;
    });

    const avgMarginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

    return { totalQuantity, totalRevenue, totalMargin, avgMarginPercent };
  };

  if (products.length === 0) {
    return null;
  }

  if (channels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Распределение по каналам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Сначала добавьте каналы продаж</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Распределение продуктов по каналам
        </CardTitle>
        <CardDescription>
          Укажите количество и цену для каждого канала. Маржа рассчитывается автоматически.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {products.map((product) => {
          const productAllocations = getProductAllocations(product.id);
          const unallocatedChannels = getUnallocatedChannels(product.id);
          const totals = calculateProductTotals(product.id);

          return (
            <div key={product.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Базовая цена: {product.price.toLocaleString("ru-RU")} {currency} | 
                    Себестоимость: {product.cost.toLocaleString("ru-RU")} {currency}
                  </p>
                </div>
                {unallocatedChannels.length > 0 && (
                  <Select
                    value=""
                    onValueChange={(channelId) => handleAddAllocation(product.id, channelId)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Добавить канал" />
                    </SelectTrigger>
                    <SelectContent>
                      {unallocatedChannels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {productAllocations.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Канал</TableHead>
                        <TableHead className="text-right">Кол-во</TableHead>
                        <TableHead className="text-right">Цена</TableHead>
                        <TableHead className="text-right">Выручка</TableHead>
                        <TableHead className="text-right">Комиссия</TableHead>
                        <TableHead className="text-right">Фулфилмент</TableHead>
                        <TableHead className="text-right">Возвраты</TableHead>
                        <TableHead className="text-right">Маржа</TableHead>
                        <TableHead className="text-right">%</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productAllocations.map((allocation) => {
                        const channel = channels.find((c) => c.id === allocation.channelId);
                        if (!channel) return null;

                        const metrics = calculateChannelMetrics(product, channel, allocation);
                        const isLowMargin = metrics.marginPercent < 10;

                        return (
                          <TableRow key={allocation.id} className={isLowMargin ? "bg-destructive/5" : ""}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {channel.name}
                                {channel.discountPercent && channel.discountPercent > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    -{channel.discountPercent}%
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <NumericInput
                                value={allocation.quantity}
                                onChange={(value) =>
                                  handleUpdateAllocation(allocation.id, {
                                    quantity: Math.round(value),
                                  })
                                }
                                className="w-20 h-8 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <NumericInput
                                value={allocation.priceOverride ?? product.price}
                                onChange={(value) =>
                                  handleUpdateAllocation(allocation.id, {
                                    priceOverride: value,
                                  })
                                }
                                className="w-24 h-8 text-right"
                              />
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {metrics.revenue.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}
                            </TableCell>
                            <TableCell className="text-right font-mono text-destructive">
                              -{metrics.commission.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}
                            </TableCell>
                            <TableCell className="text-right font-mono text-destructive">
                              -{(metrics.fulfillment + metrics.logistics).toLocaleString("ru-RU", { maximumFractionDigits: 0 })}
                            </TableCell>
                            <TableCell className="text-right font-mono text-destructive">
                              -{metrics.returnLoss.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}
                            </TableCell>
                            <TableCell className={`text-right font-mono font-semibold ${metrics.netMargin >= 0 ? "text-green-600" : "text-destructive"}`}>
                              {metrics.netMargin.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={isLowMargin ? "destructive" : metrics.marginPercent >= 20 ? "default" : "secondary"}
                              >
                                {metrics.marginPercent.toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAllocation(allocation.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {/* Totals row */}
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell>Итого</TableCell>
                        <TableCell className="text-right font-mono">
                          {totals.totalQuantity.toLocaleString("ru-RU")}
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right font-mono">
                          {totals.totalRevenue.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell colSpan={3}></TableCell>
                        <TableCell className={`text-right font-mono ${totals.totalMargin >= 0 ? "text-green-600" : "text-destructive"}`}>
                          {totals.totalMargin.toLocaleString("ru-RU", { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={totals.avgMarginPercent >= 15 ? "default" : "secondary"}>
                            {totals.avgMarginPercent.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {productAllocations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Добавьте каналы продаж для этого продукта
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
