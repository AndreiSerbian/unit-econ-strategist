import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NumericInput } from '@/components/ui/numeric-input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, ChevronDown, Layers, Zap } from 'lucide-react';
import type { CompositeOperation, OperationCatalogItem, CompositeOperationItem } from './types';
import { OPERATION_TYPE_ICONS } from './types';

interface CompositeOperationsManagerProps {
  compositeOperations: CompositeOperation[];
  operations: OperationCatalogItem[];
  onAdd: (
    data: Omit<CompositeOperation, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'items' | 'total_it_cost' | 'total_api_cost' | 'total_user_price' | 'total_margin'>,
    items: Array<{ operation_id: string; quantity: number }>
  ) => Promise<void>;
  onUpdate: (
    id: string,
    data: Partial<CompositeOperation>,
    items?: Array<{ operation_id: string; quantity: number }>
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  calculateMetrics: (composite: CompositeOperation) => {
    totalApiCost: number;
    totalUserPrice: number;
    totalItCost: number;
    totalMargin: number;
  };
  calculateOpMetrics: (op: OperationCatalogItem) => {
    userPriceUsd: number;
    marginUsd: number;
    marginPercent: number;
    itCost: number;
  };
}

interface NewItem {
  operation_id: string;
  quantity: number;
}

export function CompositeOperationsManager({
  compositeOperations,
  operations,
  onAdd,
  onUpdate,
  onDelete,
  calculateMetrics,
  calculateOpMetrics,
}: CompositeOperationsManagerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newComposite, setNewComposite] = useState({ name: '', description: '' });
  const [newItems, setNewItems] = useState<NewItem[]>([]);

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addItem = () => {
    if (operations.length === 0) return;
    setNewItems([...newItems, { operation_id: operations[0].id, quantity: 1 }]);
  };

  const updateItem = (index: number, field: keyof NewItem, value: string | number) => {
    const updated = [...newItems];
    updated[index] = { ...updated[index], [field]: value };
    setNewItems(updated);
  };

  const removeItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const handleAdd = async () => {
    if (!newComposite.name.trim() || newItems.length === 0) return;
    await onAdd(
      {
        name: newComposite.name.trim(),
        description: newComposite.description.trim() || undefined,
        active: true,
      },
      newItems
    );
    setNewComposite({ name: '', description: '' });
    setNewItems([]);
  };

  // Calculate preview metrics
  const previewMetrics = newItems.reduce(
    (acc, item) => {
      const op = operations.find(o => o.id === item.operation_id);
      if (op) {
        const metrics = calculateOpMetrics(op);
        acc.apiCost += op.api_cost_usd * item.quantity;
        acc.userPrice += metrics.userPriceUsd * item.quantity;
        acc.itCost += metrics.itCost * item.quantity;
      }
      return acc;
    },
    { apiCost: 0, userPrice: 0, itCost: 0 }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Layers className="w-5 h-5 text-primary" />
          🧩 Составные операции
        </CardTitle>
        <CardDescription>
          Комбинации атомарных операций для сложных задач
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* List */}
        <div className="space-y-3">
          {compositeOperations.map(composite => {
            const metrics = calculateMetrics(composite);
            const isExpanded = expanded.has(composite.id);

            return (
              <Collapsible key={composite.id} open={isExpanded} onOpenChange={() => toggleExpanded(composite.id)}>
                <div className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-2 flex-1">
                        <Layers className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{composite.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {(composite.items || []).length} операций
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-muted-foreground hidden sm:inline">
                          API: ${metrics.totalApiCost.toFixed(4)}
                        </span>
                        <span className="text-primary">
                          ${metrics.totalUserPrice.toFixed(4)}
                        </span>
                        <span className="font-bold">
                          {metrics.totalItCost.toFixed(2)} IT
                        </span>
                        <span className="text-accent hidden sm:inline">
                          +${metrics.totalMargin.toFixed(4)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(composite.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-3 pt-0 space-y-2">
                      {composite.description && (
                        <p className="text-xs text-muted-foreground">{composite.description}</p>
                      )}
                      <div className="space-y-1">
                        {(composite.items || []).map(item => {
                          const op = item.operation;
                          if (!op) return null;
                          const opMetrics = calculateOpMetrics(op);
                          
                          return (
                            <div key={item.id} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs">
                              <span>{OPERATION_TYPE_ICONS[op.operation_type]}</span>
                              <span className="flex-1">{op.name}</span>
                              <Badge variant="secondary">×{item.quantity}</Badge>
                              <span className="font-mono text-muted-foreground">
                                {(opMetrics.itCost * item.quantity).toFixed(2)} IT
                              </span>
                              <span className="font-mono text-primary">
                                ${(opMetrics.userPriceUsd * item.quantity).toFixed(4)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}

          {compositeOperations.length === 0 && (
            <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
              Нет составных операций. Создайте первую ниже.
            </div>
          )}
        </div>

        {/* Add Form */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-4">
          <Label className="text-sm font-semibold">Создать составную операцию</Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Название (Strategy Analysis...)"
              value={newComposite.name}
              onChange={e => setNewComposite({ ...newComposite, name: e.target.value })}
            />
            <Input
              placeholder="Описание (опционально)"
              value={newComposite.description}
              onChange={e => setNewComposite({ ...newComposite, description: e.target.value })}
            />
          </div>

          {/* Items */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Операции в составе:</Label>
            {newItems.map((item, index) => {
              const op = operations.find(o => o.id === item.operation_id);
              
              return (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={item.operation_id}
                    onValueChange={v => updateItem(index, 'operation_id', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operations.map(o => (
                        <SelectItem key={o.id} value={o.id}>
                          {OPERATION_TYPE_ICONS[o.operation_type]} {o.name} ({o.base_it_cost.toFixed(2)} IT)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <NumericInput
                    value={item.quantity}
                    onChange={v => updateItem(index, 'quantity', Math.max(1, v ?? 1))}
                    className="w-20"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-destructive"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
            <Button variant="outline" size="sm" onClick={addItem} disabled={operations.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить операцию
            </Button>
          </div>

          {/* Preview */}
          {newItems.length > 0 && (
            <div className="flex flex-wrap gap-4 p-2 rounded bg-muted/50 text-xs">
              <span>
                API Cost: <strong>${previewMetrics.apiCost.toFixed(4)}</strong>
              </span>
              <span>
                User Price: <strong className="text-primary">${previewMetrics.userPrice.toFixed(4)}</strong>
              </span>
              <span>
                IT Cost: <strong>{previewMetrics.itCost.toFixed(2)}</strong>
              </span>
              <span>
                Margin: <strong className="text-accent">${(previewMetrics.userPrice - previewMetrics.apiCost).toFixed(4)}</strong>
              </span>
            </div>
          )}

          <Button 
            onClick={handleAdd} 
            disabled={!newComposite.name.trim() || newItems.length === 0}
            className="w-full sm:w-auto"
          >
            <Layers className="w-4 h-4 mr-2" />
            Создать операцию
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
