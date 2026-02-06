import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NumericInput } from '@/components/ui/numeric-input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Plus, Trash2, Edit2, Check, X, Info, Package, TrendingUp } from 'lucide-react';
import type { TokenPackage } from './types';

interface TokenPackagesManagerProps {
  packages: TokenPackage[];
  scenarioType: string;
  itValueUsd: number;
  onAdd: (data: Omit<TokenPackage, 'id' | 'project_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<TokenPackage>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TokenPackagesManager({
  packages,
  scenarioType,
  itValueUsd,
  onAdd,
  onUpdate,
  onDelete,
}: TokenPackagesManagerProps) {
  const [newPkg, setNewPkg] = useState({
    name: '',
    it_amount: 1000,
    price_usd: 10,
    expected_sales: 0,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TokenPackage>>({});

  const handleAdd = async () => {
    if (!newPkg.name.trim()) return;
    await onAdd({
      name: newPkg.name.trim(),
      it_amount: newPkg.it_amount,
      price_usd: newPkg.price_usd,
      expected_sales: newPkg.expected_sales,
      scenario_type: scenarioType as 'current' | 'optimistic' | 'pessimistic',
      active: true,
      sort_order: packages.length,
    });
    setNewPkg({
      name: '',
      it_amount: 1000,
      price_usd: 10,
      expected_sales: 0,
    });
  };

  const startEdit = (pkg: TokenPackage) => {
    setEditingId(pkg.id);
    setEditData({
      name: pkg.name,
      it_amount: pkg.it_amount,
      price_usd: pkg.price_usd,
      expected_sales: pkg.expected_sales,
    });
  };

  const saveEdit = async (id: string) => {
    await onUpdate(id, editData);
    setEditingId(null);
    setEditData({});
  };

  // Aggregate calculations
  const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.price_usd * pkg.expected_sales), 0);
  const totalITSold = packages.reduce((sum, pkg) => sum + (pkg.it_amount * pkg.expected_sales), 0);
  const avgEffectivePrice = totalITSold > 0 ? totalRevenue / totalITSold : 0;

  // Preview for new package
  const previewEffectivePrice = newPkg.it_amount > 0 ? newPkg.price_usd / newPkg.it_amount : 0;
  const previewRevenue = newPkg.price_usd * newPkg.expected_sales;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Package className="w-5 h-5 text-primary" />
            📦 Пакеты токенов
          </CardTitle>
          <CardDescription>
            Тарифы продажи IT-токенов пользователям
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          {packages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Всего продаж</p>
                <p className="font-bold text-lg">{packages.reduce((s, p) => s + p.expected_sales, 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Выручка ($)</p>
                <p className="font-bold text-lg text-primary">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">IT продано</p>
                <p className="font-bold text-lg">{totalITSold.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Ср. цена IT</p>
                <p className="font-bold text-lg text-accent">${avgEffectivePrice.toFixed(5)}</p>
              </div>
            </div>
          )}

          {/* Packages Table */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-2">Пакет</th>
                  <th className="text-right p-2">IT в пакете</th>
                  <th className="text-right p-2">Цена ($)</th>
                  <th className="text-right p-2">
                    <span className="flex items-center justify-end gap-1">
                      $/IT
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Эффективная цена за 1 IT = Цена / Кол-во IT</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </th>
                  <th className="text-right p-2">Продажи</th>
                  <th className="text-right p-2">Выручка ($)</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => {
                  const effectivePrice = pkg.it_amount > 0 ? pkg.price_usd / pkg.it_amount : 0;
                  const revenue = pkg.price_usd * pkg.expected_sales;
                  const isEditing = editingId === pkg.id;

                  return (
                    <tr key={pkg.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">
                        {isEditing ? (
                          <Input
                            value={editData.name || ''}
                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                            className="h-7 text-sm"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pkg.name}</span>
                            {!pkg.active && <Badge variant="secondary" className="text-[10px]">OFF</Badge>}
                          </div>
                        )}
                      </td>
                      <td className="text-right p-2 font-mono">
                        {isEditing ? (
                          <NumericInput
                            value={editData.it_amount || 0}
                            onChange={v => setEditData({ ...editData, it_amount: v })}
                            className="h-7 w-24 text-xs"
                          />
                        ) : (
                          pkg.it_amount.toLocaleString()
                        )}
                      </td>
                      <td className="text-right p-2 font-mono text-primary">
                        {isEditing ? (
                          <NumericInput
                            value={editData.price_usd || 0}
                            onChange={v => setEditData({ ...editData, price_usd: v })}
                            className="h-7 w-20 text-xs"
                          />
                        ) : (
                          `$${pkg.price_usd}`
                        )}
                      </td>
                      <td className="text-right p-2 font-mono text-muted-foreground">
                        ${effectivePrice.toFixed(5)}
                      </td>
                      <td className="text-right p-2 font-mono">
                        {isEditing ? (
                          <NumericInput
                            value={editData.expected_sales || 0}
                            onChange={v => setEditData({ ...editData, expected_sales: v })}
                            className="h-7 w-20 text-xs"
                          />
                        ) : (
                          pkg.expected_sales.toLocaleString()
                        )}
                      </td>
                      <td className="text-right p-2 font-mono font-bold text-accent">
                        ${revenue.toLocaleString()}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(pkg.id)}>
                                <Check className="w-4 h-4 text-accent" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(pkg)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(pkg.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {packages.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                      Нет пакетов. Добавьте первый пакет токенов ниже.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Package Form */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-4">
            <Label className="text-sm font-semibold">Добавить пакет</Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <Input
                placeholder="Название (Basic, Pro...)"
                value={newPkg.name}
                onChange={e => setNewPkg({ ...newPkg, name: e.target.value })}
              />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">IT в пакете</Label>
                <NumericInput
                  value={newPkg.it_amount}
                  onChange={v => setNewPkg({ ...newPkg, it_amount: Math.max(1, v ?? 1) })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Цена ($)</Label>
                <NumericInput
                  value={newPkg.price_usd}
                  onChange={v => setNewPkg({ ...newPkg, price_usd: Math.max(0.01, v ?? 0.01) })}
                  step="0.01"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Ожид. продаж</Label>
                <NumericInput
                  value={newPkg.expected_sales}
                  onChange={v => setNewPkg({ ...newPkg, expected_sales: Math.max(0, v ?? 0) })}
                />
              </div>
              <Button 
                onClick={handleAdd} 
                disabled={!newPkg.name.trim()}
                className="self-end"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить
              </Button>
            </div>

            {/* Preview */}
            {newPkg.name && (
              <div className="flex flex-wrap gap-4 p-2 rounded bg-muted/50 text-xs">
                <span>
                  $/IT: <strong>${previewEffectivePrice.toFixed(5)}</strong>
                </span>
                <span>
                  vs базовый IT: <strong className={previewEffectivePrice > itValueUsd ? 'text-accent' : 'text-destructive'}>
                    {((previewEffectivePrice / itValueUsd - 1) * 100).toFixed(0)}%
                  </strong>
                </span>
                <span>
                  Выручка: <strong className="text-primary">${previewRevenue.toLocaleString()}</strong>
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
