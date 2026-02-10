import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NumericInput } from '@/components/ui/numeric-input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Info, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import type { OperationCatalogItem, CompositeOperation, OperationUsageForecast } from './types';

interface UsageForecastManagerProps {
  operations: OperationCatalogItem[];
  compositeOperations: CompositeOperation[];
  usageForecasts: OperationUsageForecast[];
  itValueUsd: number;
  onUpdateForecast: (operationId: string | null, compositeId: string | null, expectedUsage: number) => Promise<void>;
  calculateOperationMetrics: (op: OperationCatalogItem) => {
    userPriceUsd: number;
    marginUsd: number;
    marginPercent: number;
    itCost: number;
  };
  calculateCompositeMetrics: (comp: CompositeOperation) => {
    totalApiCost: number;
    totalUserPrice: number;
    totalItCost: number;
    totalMargin: number;
  };
}

export function UsageForecastManager({
  operations,
  compositeOperations,
  usageForecasts,
  itValueUsd,
  onUpdateForecast,
  calculateOperationMetrics,
  calculateCompositeMetrics,
}: UsageForecastManagerProps) {
  const [saving, setSaving] = useState<string | null>(null);

  const activeOps = operations.filter(op => op.active);
  const activeComposites = compositeOperations.filter(c => c.active);

  const getUsage = (opId: string | null, compId: string | null): number => {
    const forecast = usageForecasts.find(f =>
      f.operation_id === opId && f.composite_id === compId
    );
    return forecast?.expected_usage ?? 0;
  };

  const handleUsageChange = async (opId: string | null, compId: string | null, value: number) => {
    const key = opId || compId || '';
    setSaving(key);
    await onUpdateForecast(opId, compId, value);
    setSaving(null);
  };

  // Totals
  let totalApiCost = 0;
  let totalItConsumed = 0;

  activeOps.forEach(op => {
    const usage = getUsage(op.id, null);
    totalApiCost += op.api_cost_usd * usage;
    const metrics = calculateOperationMetrics(op);
    totalItConsumed += metrics.itCost * usage;
  });

  activeComposites.forEach(comp => {
    const usage = getUsage(null, comp.id);
    const metrics = calculateCompositeMetrics(comp);
    totalApiCost += metrics.totalApiCost * usage;
    totalItConsumed += metrics.totalItCost * usage;
  });

  const isEmpty = activeOps.length === 0 && activeComposites.length === 0;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BarChart3 className="w-5 h-5 text-primary" />
            📈 Прогноз использования операций
          </CardTitle>
          <CardDescription>
            Укажите <strong>суммарное количество вызовов</strong> каждой операции за период (всеми пользователями).
            <br />
            <span className="text-xs text-muted-foreground">
              Пример: 20 юзеров × 1 500 запросов/мес = 30 000 вызовов
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          {!isEmpty && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-gradient-to-r from-destructive/10 to-primary/10">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Σ API затраты</p>
                <p className="font-bold text-lg text-destructive">${totalApiCost.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Σ IT расходуется</p>
                <p className="font-bold text-lg">{totalItConsumed.toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Σ IT в $</p>
                <p className="font-bold text-lg text-primary">${(totalItConsumed * itValueUsd).toFixed(2)}</p>
              </div>
            </div>
          )}

          {isEmpty ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>Сначала сгенерируйте операции во вкладке «API Тарифы»</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-xs sm:text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-2">Операция</th>
                    <th className="text-left p-2">Тип</th>
                    <th className="text-right p-2">API Cost ($)</th>
                    <th className="text-right p-2">IT/вызов</th>
                    <th className="text-right p-2">
                      <span className="flex items-center justify-end gap-1">
                        Вызовов/период
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-[200px]">
                              Суммарное кол-во вызовов ВСЕМИ пользователями за период.
                              Не кол-во пользователей!
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                    </th>
                    <th className="text-right p-2">Σ API ($)</th>
                    <th className="text-right p-2">Σ IT</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Atomic operations */}
                  {activeOps.map(op => {
                    const usage = getUsage(op.id, null);
                    const metrics = calculateOperationMetrics(op);
                    const totalCost = op.api_cost_usd * usage;
                    const totalIt = metrics.itCost * usage;

                    return (
                      <tr key={op.id} className="border-b hover:bg-muted/30">
                        <td className="p-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-xs">{op.name}</span>
                            <code className="text-[10px] text-muted-foreground">{op.operation_code}</code>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-[10px]">
                            {op.operation_type}
                          </Badge>
                        </td>
                        <td className="text-right p-2 font-mono text-xs">
                          ${op.api_cost_usd.toFixed(6)}
                        </td>
                        <td className="text-right p-2 font-mono text-xs font-bold">
                          {metrics.itCost.toFixed(2)}
                        </td>
                        <td className="text-right p-2">
                          <NumericInput
                            value={usage}
                            onChange={v => handleUsageChange(op.id, null, v ?? 0)}
                            className="h-7 w-28 text-xs ml-auto"
                            step="100"
                          />
                        </td>
                        <td className="text-right p-2 font-mono text-xs text-destructive">
                          {usage > 0 ? `$${totalCost.toFixed(2)}` : '—'}
                        </td>
                        <td className="text-right p-2 font-mono text-xs">
                          {usage > 0 ? totalIt.toFixed(0) : '—'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Composite operations */}
                  {activeComposites.length > 0 && (
                    <tr>
                      <td colSpan={7} className="p-2 pt-4">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          Составные операции
                        </span>
                      </td>
                    </tr>
                  )}
                  {activeComposites.map(comp => {
                    const usage = getUsage(null, comp.id);
                    const metrics = calculateCompositeMetrics(comp);
                    const totalCost = metrics.totalApiCost * usage;
                    const totalIt = metrics.totalItCost * usage;

                    return (
                      <tr key={comp.id} className="border-b hover:bg-muted/30">
                        <td className="p-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-xs">{comp.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {(comp.items || []).length} шагов
                            </span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-[10px]">composite</Badge>
                        </td>
                        <td className="text-right p-2 font-mono text-xs">
                          ${metrics.totalApiCost.toFixed(6)}
                        </td>
                        <td className="text-right p-2 font-mono text-xs font-bold">
                          {metrics.totalItCost.toFixed(2)}
                        </td>
                        <td className="text-right p-2">
                          <NumericInput
                            value={usage}
                            onChange={v => handleUsageChange(null, comp.id, v ?? 0)}
                            className="h-7 w-28 text-xs ml-auto"
                            step="100"
                          />
                        </td>
                        <td className="text-right p-2 font-mono text-xs text-destructive">
                          {usage > 0 ? `$${totalCost.toFixed(2)}` : '—'}
                        </td>
                        <td className="text-right p-2 font-mono text-xs">
                          {usage > 0 ? totalIt.toFixed(0) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
