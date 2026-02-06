import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NumericInput } from '@/components/ui/numeric-input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Plus, Trash2, Edit2, Check, X, Info, Zap } from 'lucide-react';
import { 
  type OperationCatalogItem, 
  type ApiModel, 
  type OperationType,
  OPERATION_TYPE_LABELS, 
  OPERATION_TYPE_ICONS,
  DEFAULT_MARKUPS,
} from './types';

interface OperationsCatalogProps {
  operations: OperationCatalogItem[];
  models: ApiModel[];
  itValueUsd: number;
  defaultMarkups: {
    text: number;
    image: number;
    image_premium: number;
  };
  onAdd: (data: Omit<OperationCatalogItem, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'base_it_cost' | 'api_model'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<OperationCatalogItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  calculateMetrics: (op: OperationCatalogItem) => {
    userPriceUsd: number;
    marginUsd: number;
    marginPercent: number;
    itCost: number;
  };
}

export function OperationsCatalog({
  operations,
  models,
  itValueUsd,
  defaultMarkups,
  onAdd,
  onUpdate,
  onDelete,
  calculateMetrics,
}: OperationsCatalogProps) {
  const [newOp, setNewOp] = useState({
    operation_code: '',
    name: '',
    operation_type: 'text' as OperationType,
    api_model_id: '',
    api_cost_usd: 0,
    markup_multiplier: 1.5,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<OperationCatalogItem>>({});

  const handleTypeChange = (type: OperationType) => {
    setNewOp({
      ...newOp,
      operation_type: type,
      markup_multiplier: DEFAULT_MARKUPS[type],
    });
  };

  const handleModelChange = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    setNewOp({
      ...newOp,
      api_model_id: modelId === 'none' ? '' : modelId,
      api_cost_usd: model?.api_cost_usd || newOp.api_cost_usd,
    });
  };

  const handleAdd = async () => {
    if (!newOp.operation_code.trim() || !newOp.name.trim()) return;
    await onAdd({
      operation_code: newOp.operation_code.trim(),
      name: newOp.name.trim(),
      operation_type: newOp.operation_type,
      api_model_id: newOp.api_model_id || undefined,
      api_cost_usd: newOp.api_cost_usd,
      markup_multiplier: newOp.markup_multiplier,
      active: true,
    });
    setNewOp({
      operation_code: '',
      name: '',
      operation_type: 'text',
      api_model_id: '',
      api_cost_usd: 0,
      markup_multiplier: 1.5,
    });
  };

  const startEdit = (op: OperationCatalogItem) => {
    setEditingId(op.id);
    setEditData({
      api_cost_usd: op.api_cost_usd,
      markup_multiplier: op.markup_multiplier,
      active: op.active,
    });
  };

  const saveEdit = async (id: string) => {
    await onUpdate(id, editData);
    setEditingId(null);
    setEditData({});
  };

  // Calculate preview metrics for new operation
  const previewItCost = newOp.api_cost_usd > 0 
    ? (newOp.api_cost_usd * newOp.markup_multiplier) / itValueUsd 
    : 0;
  const previewUserPrice = newOp.api_cost_usd * newOp.markup_multiplier;
  const previewMargin = previewUserPrice - newOp.api_cost_usd;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Zap className="w-5 h-5 text-primary" />
            ⚡ Каталог операций
          </CardTitle>
          <CardDescription>
            Атомарные операции с расчётом IT-стоимости и маржи
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Operations Table */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[700px]">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-2">Операция</th>
                  <th className="text-left p-2">Тип</th>
                  <th className="text-right p-2">API Cost ($)</th>
                  <th className="text-right p-2">Markup</th>
                  <th className="text-right p-2">
                    <span className="flex items-center justify-end gap-1">
                      User Price ($)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3 h-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">API Cost × Markup</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </th>
                  <th className="text-right p-2">IT Cost</th>
                  <th className="text-right p-2">Margin ($)</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {operations.map(op => {
                  const metrics = calculateMetrics(op);
                  const isEditing = editingId === op.id;

                  return (
                    <tr key={op.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">
                        <div className="flex flex-col">
                          <span className="font-medium">{op.name}</span>
                          <code className="text-[10px] text-muted-foreground">{op.operation_code}</code>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-[10px]">
                          {OPERATION_TYPE_ICONS[op.operation_type]} {OPERATION_TYPE_LABELS[op.operation_type]}
                        </Badge>
                      </td>
                      <td className="text-right p-2 font-mono">
                        {isEditing ? (
                          <NumericInput
                            value={editData.api_cost_usd || 0}
                            onChange={v => setEditData({ ...editData, api_cost_usd: v ?? 0 })}
                            className="h-7 w-24 text-xs"
                            step="0.0001"
                          />
                        ) : (
                          `$${op.api_cost_usd.toFixed(6)}`
                        )}
                      </td>
                      <td className="text-right p-2 font-mono">
                        {isEditing ? (
                          <NumericInput
                            value={editData.markup_multiplier || 1}
                            onChange={v => setEditData({ ...editData, markup_multiplier: Math.max(1, v ?? 1) })}
                            className="h-7 w-16 text-xs"
                            step="0.1"
                          />
                        ) : (
                          `×${op.markup_multiplier.toFixed(1)}`
                        )}
                      </td>
                      <td className="text-right p-2 font-mono text-primary">
                        ${metrics.userPriceUsd.toFixed(6)}
                      </td>
                      <td className="text-right p-2 font-mono font-bold">
                        {metrics.itCost.toFixed(2)}
                      </td>
                      <td className="text-right p-2 font-mono text-accent">
                        ${metrics.marginUsd.toFixed(6)}
                        <span className="text-[10px] text-muted-foreground ml-1">
                          ({metrics.marginPercent.toFixed(0)}%)
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveEdit(op.id)}>
                                <Check className="w-4 h-4 text-accent" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(op)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(op.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {operations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-muted-foreground">
                      Нет операций. Добавьте первую операцию ниже.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Operation Form */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-4">
            <Label className="text-sm font-semibold">Добавить операцию</Label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <Input
                placeholder="Код (text_basic)"
                value={newOp.operation_code}
                onChange={e => setNewOp({ ...newOp, operation_code: e.target.value })}
                className="font-mono"
              />
              <Input
                placeholder="Название"
                value={newOp.name}
                onChange={e => setNewOp({ ...newOp, name: e.target.value })}
              />
              <Select value={newOp.operation_type} onValueChange={(v) => handleTypeChange(v as OperationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OPERATION_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {OPERATION_TYPE_ICONS[key as OperationType]} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newOp.api_model_id || 'none'} onValueChange={handleModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Модель (опц.)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без модели</SelectItem>
                  {models.filter(m => m.active).map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.model_name} (${m.api_cost_usd.toFixed(4)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-1">
                <NumericInput
                  value={newOp.api_cost_usd}
                  onChange={v => setNewOp({ ...newOp, api_cost_usd: v ?? 0 })}
                  step="0.0001"
                  placeholder="API Cost"
                />
              </div>
              <div className="space-y-1">
                <NumericInput
                  value={newOp.markup_multiplier}
                  onChange={v => setNewOp({ ...newOp, markup_multiplier: Math.max(1, v ?? 1) })}
                  step="0.1"
                  placeholder="Markup"
                />
              </div>
            </div>

            {/* Preview */}
            {newOp.api_cost_usd > 0 && (
              <div className="flex flex-wrap gap-4 p-2 rounded bg-muted/50 text-xs">
                <span>
                  User Price: <strong className="text-primary">${previewUserPrice.toFixed(6)}</strong>
                </span>
                <span>
                  IT Cost: <strong>{previewItCost.toFixed(2)}</strong>
                </span>
                <span>
                  Margin: <strong className="text-accent">${previewMargin.toFixed(6)}</strong>
                </span>
              </div>
            )}

            <Button 
              onClick={handleAdd} 
              disabled={!newOp.operation_code.trim() || !newOp.name.trim()}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить операцию
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
