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
import { useTranslation } from '@/i18n/useTranslation';

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
  const { t } = useTranslation();
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
            <CardTitle>{t('saasProducts.title')}</CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('saasProducts.addProduct')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('saasProducts.newProduct')}</DialogTitle>
                <DialogDescription>
                  {t('saasProducts.newProductDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">{t('saasProducts.productName')}</Label>
                  <Input
                    id="product-name"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder={t('saasProducts.productNamePlaceholder')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddProduct();
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planning-period">{t('saasProducts.planningPeriod')}</Label>
                  <Select value={newProductPeriod} onValueChange={(val) => setNewProductPeriod(val as any)}>
                    <SelectTrigger id="planning-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">{t('saasProducts.week')}</SelectItem>
                      <SelectItem value="month">{t('saasProducts.month')}</SelectItem>
                      <SelectItem value="quarter">{t('saasProducts.quarter')}</SelectItem>
                      <SelectItem value="year">{t('saasProducts.year')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('saasProducts.cancel')}
                </Button>
                <Button onClick={handleAddProduct} disabled={!newProductName.trim()}>
                  {t('saasProducts.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          {t('saasProducts.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aggregate KPIs across all products */}
        {products.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              {t('saasProducts.aggregateKPIs')}
            </div>
            <SaasKpiCards kpis={aggregateKPIs} currency={currency} />
          </div>
        )}

        {/* Products list */}
        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">{t('saasProducts.emptyTitle')}</p>
            <p className="text-sm">{t('saasProducts.emptyDescription')}</p>
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
