import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Package, TrendingUp } from 'lucide-react';
import { useSaasProducts } from '@/hooks/useSaasProducts';
import { SaasProductCard } from './SaasProductCard';
import { SaasKpiCards } from './SaasKpiCards';

interface SalesChannel {
  id: string;
  name: string;
}

interface SaasProductsManagerProps {
  projectId: string;
  currency: string;
  salesChannels: SalesChannel[];
}

export function SaasProductsManager({ projectId, currency, salesChannels }: SaasProductsManagerProps) {
  const {
    products,
    loading,
    aggregateKPIs,
    calculateProductKPIs,
    addProduct,
    updateProduct,
    deleteProduct,
    addPlan,
    updatePlan,
    deletePlan,
  } = useSaasProducts(projectId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPeriod, setNewProductPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const handleAddProduct = async () => {
    if (!newProductName.trim()) return;
    
    await addProduct(newProductName.trim(), newProductPeriod);
    setNewProductName('');
    setNewProductPeriod('month');
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <CardTitle>SaaS Продукты</CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Добавить продукт
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый SaaS продукт</DialogTitle>
                <DialogDescription>
                  Создайте продукт, затем добавьте тарифные планы (подписки или разовые покупки).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Название продукта</Label>
                  <Input
                    id="product-name"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Например: Мобильное приложение"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddProduct();
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planning-period">Период планирования</Label>
                  <Select value={newProductPeriod} onValueChange={(val) => setNewProductPeriod(val as any)}>
                    <SelectTrigger id="planning-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Неделя</SelectItem>
                      <SelectItem value="month">Месяц</SelectItem>
                      <SelectItem value="quarter">Квартал</SelectItem>
                      <SelectItem value="year">Год</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddProduct} disabled={!newProductName.trim()}>
                  Создать
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Управляйте подписками и разовыми покупками. Бесплатные планы учитываются в расходах.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aggregate KPIs across all products */}
        {products.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Сводные показатели (все продукты)
            </div>
            <SaasKpiCards kpis={aggregateKPIs} currency={currency} />
          </div>
        )}

        {/* Products list */}
        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Нет SaaS продуктов</p>
            <p className="text-sm">Добавьте первый продукт, чтобы начать работу с подписками</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <SaasProductCard
                key={product.id}
                product={product}
                kpis={calculateProductKPIs(product)}
                currency={currency}
                salesChannels={salesChannels}
                onUpdateProduct={updateProduct}
                onDeleteProduct={deleteProduct}
                onAddPlan={addPlan}
                onUpdatePlan={updatePlan}
                onDeletePlan={deletePlan}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
