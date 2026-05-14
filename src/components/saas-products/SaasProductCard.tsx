import { useState, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Plus, Trash2, Package, Edit2, Check, X } from 'lucide-react';
import { PlanRow } from './PlanRow';
import { SaasKpiCards } from './SaasKpiCards';
import { useTranslation } from '@/i18n/useTranslation';
import type { SaasProductWithPlans, ProductKPIs, PlanFormData, SaasProduct } from './types';

interface SalesChannel {
  id: string;
  name: string;
}

interface SaasProductCardProps {
  product: SaasProductWithPlans;
  kpis: ProductKPIs;
  currency: string;
  salesChannels: SalesChannel[];
  onUpdateProduct: (productId: string, updates: Partial<Pick<SaasProduct, 'name' | 'planning_period' | 'default_channel_id'>>) => void;
  onDeleteProduct: (productId: string) => void;
  onAddPlan: (productId: string, planData: PlanFormData) => void;
  onUpdatePlan: (planId: string, updates: Partial<PlanFormData>) => void;
  onDeletePlan: (planId: string) => void;
}

export const SaasProductCard = memo(function SaasProductCard({
  product,
  kpis,
  currency,
  salesChannels,
  onUpdateProduct,
  onDeleteProduct,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
}: SaasProductCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(product.name);

  const handleSaveName = useCallback(() => {
    if (editName.trim() && editName !== product.name) {
      onUpdateProduct(product.id, { name: editName.trim() });
    }
    setIsEditing(false);
  }, [editName, product.id, product.name, onUpdateProduct]);

  const handleCancelEdit = useCallback(() => {
    setEditName(product.name);
    setIsEditing(false);
  }, [product.name]);

  const handleAddPlan = useCallback(() => {
    const defaultPlan: PlanFormData = {
      name: `План ${product.plans.length + 1}`,
      billing_type: 'subscription',
      price_eur: 0,
      subscribers: 0,
      new_subscribers_per_period: 0,
      cost_per_subscriber_per_month_eur: 0,
      is_free_plan: false,
      churn_rate_percent: null,
      cost_per_buyer_eur: null,
    };
    onAddPlan(product.id, defaultPlan);
  }, [product.id, product.plans.length, onAddPlan]);

  const planningPeriodLabels: Record<string, string> = {
    week: 'Неделя',
    month: 'Месяц',
    quarter: 'Квартал',
    year: 'Год',
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              
              <Package className="w-5 h-5 text-primary" />
              
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 w-48"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSaveName}>
                    <Check className="w-4 h-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select 
                value={product.planning_period} 
                onValueChange={(val) => onUpdateProduct(product.id, { planning_period: val as any })}
              >
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                  <SelectItem value="quarter">Квартал</SelectItem>
                  <SelectItem value="year">Год</SelectItem>
                </SelectContent>
              </Select>

              {salesChannels.length > 0 && (
                <Select 
                  value={product.default_channel_id || 'none'} 
                  onValueChange={(val) => onUpdateProduct(product.id, { 
                    default_channel_id: val === 'none' ? null : val 
                  })}
                >
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder="Канал продаж" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без канала</SelectItem>
                    {salesChannels.map(ch => (
                      <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onDeleteProduct(product.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="ml-8">
            Период: {planningPeriodLabels[product.planning_period]} • {product.plans.length} план(ов)
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* KPI Cards */}
            <SaasKpiCards kpis={kpis} currency={currency} />

            {/* Plans Table */}
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Название</TableHead>
                    <TableHead className="min-w-[130px]">Тип</TableHead>
                    <TableHead className="min-w-[100px]">Цена ({currency})</TableHead>
                    <TableHead className="min-w-[100px]">Кол-во</TableHead>
                    <TableHead className="min-w-[90px]">Новых/пер.</TableHead>
                    <TableHead className="min-w-[100px]">Себест.</TableHead>
                    <TableHead className="min-w-[80px]">Free</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.plans.map((plan) => (
                    <PlanRow
                      key={plan.id}
                      plan={plan}
                      currency={currency}
                      onUpdate={onUpdatePlan}
                      onDelete={onDeletePlan}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button variant="outline" size="sm" onClick={handleAddPlan} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Добавить план
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
});
