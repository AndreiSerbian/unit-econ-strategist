import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NumericInput } from '@/components/ui/numeric-input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, ChevronDown, Server, Cpu, Edit2, Check, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ApiProvider, ApiModel } from './types';

interface ApiProvidersManagerProps {
  providers: ApiProvider[];
  models: ApiModel[];
  onAddProvider: (data: Omit<ApiProvider, 'id' | 'project_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateProvider: (id: string, data: Partial<ApiProvider>) => Promise<void>;
  onDeleteProvider: (id: string) => Promise<void>;
  onAddModel: (data: Omit<ApiModel, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'provider'>) => Promise<void>;
  onUpdateModel: (id: string, data: Partial<ApiModel>) => Promise<void>;
  onDeleteModel: (id: string) => Promise<void>;
}

export function ApiProvidersManager({
  providers,
  models,
  onAddProvider,
  onUpdateProvider,
  onDeleteProvider,
  onAddModel,
  onUpdateModel,
  onDeleteModel,
}: ApiProvidersManagerProps) {
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderDesc, setNewProviderDesc] = useState('');
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  
  // New model form state
  const [newModel, setNewModel] = useState<{
    provider_id: string;
    model_name: string;
    model_code: string;
    api_cost_usd: number;
    description: string;
  }>({
    provider_id: '',
    model_name: '',
    model_code: '',
    api_cost_usd: 0,
    description: '',
  });

  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editModelData, setEditModelData] = useState<Partial<ApiModel>>({});

  const handleAddProvider = async () => {
    if (!newProviderName.trim()) return;
    await onAddProvider({
      name: newProviderName.trim(),
      description: newProviderDesc.trim() || undefined,
    });
    setNewProviderName('');
    setNewProviderDesc('');
  };

  const handleAddModel = async () => {
    if (!newModel.model_name.trim() || !newModel.model_code.trim()) return;
    await onAddModel({
      provider_id: newModel.provider_id || undefined,
      model_name: newModel.model_name.trim(),
      model_code: newModel.model_code.trim(),
      api_cost_usd: newModel.api_cost_usd,
      description: newModel.description.trim() || undefined,
      active: true,
    });
    setNewModel({
      provider_id: '',
      model_name: '',
      model_code: '',
      api_cost_usd: 0,
      description: '',
    });
  };

  const toggleProvider = (id: string) => {
    setExpandedProviders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startEditModel = (model: ApiModel) => {
    setEditingModel(model.id);
    setEditModelData({
      model_name: model.model_name,
      model_code: model.model_code,
      api_cost_usd: model.api_cost_usd,
    });
  };

  const saveModelEdit = async (id: string) => {
    await onUpdateModel(id, editModelData);
    setEditingModel(null);
    setEditModelData({});
  };

  const getProviderModels = (providerId: string) => 
    models.filter(m => m.provider_id === providerId);

  const orphanModels = models.filter(m => !m.provider_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Server className="w-5 h-5 text-primary" />
          🔌 API Провайдеры и модели
        </CardTitle>
        <CardDescription>
          Справочник API-моделей с их себестоимостью
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Provider Form */}
        <div className="p-3 rounded-lg bg-muted/30 space-y-3">
          <Label className="text-sm font-semibold">Добавить провайдера</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Название (OpenAI, Anthropic...)"
              value={newProviderName}
              onChange={e => setNewProviderName(e.target.value)}
            />
            <Input
              placeholder="Описание (опционально)"
              value={newProviderDesc}
              onChange={e => setNewProviderDesc(e.target.value)}
            />
            <Button onClick={handleAddProvider} disabled={!newProviderName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </div>
        </div>

        {/* Providers List */}
        <div className="space-y-3">
          {providers.map(provider => {
            const providerModels = getProviderModels(provider.id);
            const isExpanded = expandedProviders.has(provider.id);

            return (
              <Collapsible key={provider.id} open={isExpanded} onOpenChange={() => toggleProvider(provider.id)}>
                <div className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{provider.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {providerModels.length} моделей
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProvider(provider.id);
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
                      {providerModels.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Нет моделей
                        </p>
                      ) : (
                        providerModels.map(model => (
                          <div key={model.id} className="flex items-center gap-2 p-2 rounded bg-background border">
                            <Cpu className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            {editingModel === model.id ? (
                              <>
                                <Input
                                  value={editModelData.model_name || ''}
                                  onChange={e => setEditModelData({ ...editModelData, model_name: e.target.value })}
                                  className="h-7 text-sm flex-1"
                                />
                                <Input
                                  value={editModelData.model_code || ''}
                                  onChange={e => setEditModelData({ ...editModelData, model_code: e.target.value })}
                                  className="h-7 text-sm w-24 font-mono"
                                />
                                <NumericInput
                                  value={editModelData.api_cost_usd || 0}
                                  onChange={v => setEditModelData({ ...editModelData, api_cost_usd: v ?? 0 })}
                                  className="h-7 text-sm w-24 font-mono"
                                  step="0.0001"
                                />
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => saveModelEdit(model.id)}>
                                  <Check className="w-4 h-4 text-accent" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingModel(null)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="flex-1 text-sm">{model.model_name}</span>
                                <code className="text-xs bg-muted px-1 rounded">{model.model_code}</code>
                                <span className="font-mono text-xs text-accent">
                                  ${model.api_cost_usd.toFixed(6)}
                                </span>
                                <Badge variant={model.active ? 'default' : 'secondary'} className="text-[10px]">
                                  {model.active ? 'ON' : 'OFF'}
                                </Badge>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEditModel(model)}>
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => onDeleteModel(model.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}

          {/* Orphan models */}
          {orphanModels.length > 0 && (
            <div className="border rounded-lg p-3">
              <p className="text-sm font-semibold mb-2 text-muted-foreground">Без провайдера</p>
              {orphanModels.map(model => (
                <div key={model.id} className="flex items-center gap-2 p-2 rounded bg-muted/30">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-sm">{model.model_name}</span>
                  <code className="text-xs bg-muted px-1 rounded">{model.model_code}</code>
                  <span className="font-mono text-xs text-accent">${model.api_cost_usd.toFixed(6)}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDeleteModel(model.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Model Form */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
          <Label className="text-sm font-semibold">Добавить модель</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <Select
              value={newModel.provider_id || 'none'}
              onValueChange={v => setNewModel({ ...newModel, provider_id: v === 'none' ? '' : v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Провайдер" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без провайдера</SelectItem>
                {providers.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Название модели"
              value={newModel.model_name}
              onChange={e => setNewModel({ ...newModel, model_name: e.target.value })}
            />
            <Input
              placeholder="Код (gpt-4o)"
              value={newModel.model_code}
              onChange={e => setNewModel({ ...newModel, model_code: e.target.value })}
              className="font-mono"
            />
            <div className="space-y-1">
              <NumericInput
                value={newModel.api_cost_usd}
                onChange={v => setNewModel({ ...newModel, api_cost_usd: v ?? 0 })}
                step="0.0001"
                placeholder="API Cost ($)"
              />
            </div>
            <Button onClick={handleAddModel} disabled={!newModel.model_name.trim() || !newModel.model_code.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
