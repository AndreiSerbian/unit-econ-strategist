import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Image, Info, Download, Zap, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { ApiModel } from './types';

// Fixed constants
const IT_VALUE_USD = 0.001;
const MARKUP_TEXT = 1.5;
const MARKUP_IMAGE = 2.0;
const MARKUP_IMAGE_PREMIUM = 2.2;
const DEFAULT_IN_TOKENS = 300;
const DEFAULT_OUT_TOKENS = 400;

interface TextModelRow {
  id: string;
  model_code: string;
  provider_name: string;
  model_name: string;
  mode: string;
  model_class: string;
  enabled: boolean;
  price_in_1m: number;
  price_cached_in_1m: number | null;
  price_out_1m: number;
}

interface ImageModelRow {
  id: string;
  model_code: string;
  provider_name: string;
  model_name: string;
  variant: string;
  model_class: string;
  enabled: boolean;
  price_per_image: number;
}

function calculateTextCallCost(priceIn1m: number, priceOut1m: number): number {
  return (DEFAULT_IN_TOKENS / 1_000_000) * priceIn1m + (DEFAULT_OUT_TOKENS / 1_000_000) * priceOut1m;
}

function calculateItCost(apiCost: number, markup: number): number {
  return (apiCost * markup) / IT_VALUE_USD;
}

function formatPrice(value: number, decimals: number = 6): string {
  return `$${value.toFixed(decimals)}`;
}

function formatIt(value: number): string {
  return value.toFixed(2);
}

interface ApiPricingTableProps {
  projectId: string;
  onToggleEnabled?: (modelId: string, enabled: boolean) => Promise<void>;
  onSeedCatalog?: () => Promise<void>;
  onGenerateOperations?: () => Promise<void>;
  modelsCount?: number;
}

export function ApiPricingTable({ projectId, onToggleEnabled, onSeedCatalog, onGenerateOperations, modelsCount = 0 }: ApiPricingTableProps) {
  const [textModels, setTextModels] = useState<TextModelRow[]>([]);
  const [imageModels, setImageModels] = useState<ImageModelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchModels = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);

    // Fetch text models with pricing
    const { data: textData } = await supabase
      .from('api_models')
      .select('id, model_code, model_name, model_type, model_class, mode_or_variant, enabled, active, provider:api_providers(name), pricing:model_pricing_text(price_in_1m, price_cached_in_1m, price_out_1m)')
      .eq('project_id', projectId)
      .eq('model_type', 'text')
      .eq('active', true)
      .order('model_name');

    if (textData) {
      setTextModels(textData.map((m: any) => ({
        id: m.id,
        model_code: m.model_code,
        provider_name: m.provider?.name || '—',
        model_name: m.model_name,
        mode: m.mode_or_variant || '',
        model_class: m.model_class || 'text',
        enabled: m.enabled,
        price_in_1m: m.pricing?.price_in_1m || 0,
        price_cached_in_1m: m.pricing?.price_cached_in_1m ?? null,
        price_out_1m: m.pricing?.price_out_1m || 0,
      })));
    }

    // Fetch image models with pricing
    const { data: imageData } = await supabase
      .from('api_models')
      .select('id, model_code, model_name, model_type, model_class, mode_or_variant, enabled, active, provider:api_providers(name), pricing:model_pricing_image(price_per_image)')
      .eq('project_id', projectId)
      .eq('model_type', 'image')
      .eq('active', true)
      .order('model_name');

    if (imageData) {
      setImageModels(imageData.map((m: any) => ({
        id: m.id,
        model_code: m.model_code,
        provider_name: m.provider?.name || '—',
        model_name: m.model_name,
        variant: m.mode_or_variant || '',
        model_class: m.model_class || 'image',
        enabled: m.enabled,
        price_per_image: m.pricing?.price_per_image || 0,
      })));
    }

    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  const handleToggle = async (modelId: string, enabled: boolean) => {
    if (onToggleEnabled) {
      await onToggleEnabled(modelId, enabled);
    } else {
      await supabase.from('api_models').update({ enabled }).eq('id', modelId);
    }
    // Optimistic update
    setTextModels(prev => prev.map(m => m.id === modelId ? { ...m, enabled } : m));
    setImageModels(prev => prev.map(m => m.id === modelId ? { ...m, enabled } : m));
  };

  const handleSeed = async () => {
    if (!onSeedCatalog) return;
    setSeeding(true);
    await onSeedCatalog();
    await fetchModels();
    setSeeding(false);
  };

  const handleGenerate = async () => {
    if (!onGenerateOperations) return;
    setGenerating(true);
    await onGenerateOperations();
    setGenerating(false);
  };

  const isEmpty = textModels.length === 0 && imageModels.length === 0;
  const enabledCount = [...textModels, ...imageModels].filter(m => m.enabled).length;

  return (
    <TooltipProvider>
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                📊 API Каталог моделей
              </CardTitle>
              <CardDescription>
                Справочник из БД. 1 IT = ${IT_VALUE_USD}. Профиль: {DEFAULT_IN_TOKENS}in + {DEFAULT_OUT_TOKENS}out.
                {enabledCount > 0 && (
                  <Badge variant="secondary" className="ml-2">{enabledCount} enabled</Badge>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {isEmpty && onSeedCatalog && (
                <Button onClick={handleSeed} disabled={seeding} size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  {seeding ? 'Загрузка...' : 'Загрузить каталог'}
                </Button>
              )}
              {!isEmpty && onGenerateOperations && (
                <Button onClick={handleGenerate} disabled={generating} size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  {generating ? 'Генерация...' : 'Сгенерировать операции'}
                </Button>
              )}
              {!isEmpty && (
                <Button onClick={() => fetchModels()} size="sm" variant="ghost">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : isEmpty ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg mb-2">Каталог пуст</p>
              <p className="text-sm">Нажмите «Загрузить каталог» чтобы добавить эталонные модели и цены.</p>
            </div>
          ) : (
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Текстовые ({textModels.length})</span>
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  <span>Изображения ({imageModels.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <TextModelsTable models={textModels} onToggle={handleToggle} />
              </TabsContent>
              <TabsContent value="image">
                <ImageModelsTable models={imageModels} onToggle={handleToggle} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function TextModelsTable({ models, onToggle }: { models: TextModelRow[]; onToggle: (id: string, enabled: boolean) => void }) {
  return (
    <div className="space-y-4">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2 font-semibold w-12">Вкл</th>
              <th className="p-2 font-semibold">Провайдер</th>
              <th className="p-2 font-semibold">Модель</th>
              <th className="p-2 font-semibold text-center">Режим</th>
              <th className="p-2 font-semibold text-right">$/1M in</th>
              <th className="p-2 font-semibold text-right">Cached</th>
              <th className="p-2 font-semibold text-right">$/1M out</th>
              <th className="p-2 font-semibold text-right">Cost/Call</th>
              <th className="p-2 font-semibold text-right">User Price</th>
              <th className="p-2 font-semibold text-right">IT</th>
            </tr>
          </thead>
          <tbody>
            {models.map(m => {
              const apiCost = calculateTextCallCost(m.price_in_1m, m.price_out_1m);
              const userPrice = apiCost * MARKUP_TEXT;
              const itCost = calculateItCost(apiCost, MARKUP_TEXT);

              return (
                <tr key={m.id} className={`border-b hover:bg-muted/50 ${!m.enabled ? 'opacity-40' : ''}`}>
                  <td className="p-2">
                    <Switch checked={m.enabled} onCheckedChange={v => onToggle(m.id, v)} className="scale-75" />
                  </td>
                  <td className="p-2">{m.provider_name}</td>
                  <td className="p-2 font-mono text-xs">{m.model_name}</td>
                  <td className="p-2 text-center">
                    <Badge variant={m.mode === 'Batch' ? 'secondary' : 'default'} className="text-xs">{m.mode}</Badge>
                  </td>
                  <td className="p-2 text-right font-mono text-xs">${m.price_in_1m.toFixed(2)}</td>
                  <td className="p-2 text-right font-mono text-xs text-muted-foreground">
                    {m.price_cached_in_1m !== null ? `$${m.price_cached_in_1m.toFixed(3)}` : '—'}
                  </td>
                  <td className="p-2 text-right font-mono text-xs">${m.price_out_1m.toFixed(2)}</td>
                  <td className="p-2 text-right font-mono text-xs">{formatPrice(apiCost)}</td>
                  <td className="p-2 text-right font-mono text-xs text-primary">{formatPrice(userPrice)}</td>
                  <td className="p-2 text-right font-mono text-sm font-bold">{formatIt(itCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden space-y-3">
        {models.map(m => {
          const apiCost = calculateTextCallCost(m.price_in_1m, m.price_out_1m);
          const userPrice = apiCost * MARKUP_TEXT;
          const itCost = calculateItCost(apiCost, MARKUP_TEXT);

          return (
            <Card key={m.id} className={`bg-background/50 ${!m.enabled ? 'opacity-40' : ''}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{m.provider_name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{m.model_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.mode === 'Batch' ? 'secondary' : 'default'}>{m.mode}</Badge>
                    <Switch checked={m.enabled} onCheckedChange={v => onToggle(m.id, v)} className="scale-75" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-muted-foreground">$/1M in</p><p className="font-mono">${m.price_in_1m.toFixed(2)}</p></div>
                  <div><p className="text-muted-foreground">Cached</p><p className="font-mono">{m.price_cached_in_1m !== null ? `$${m.price_cached_in_1m.toFixed(3)}` : '—'}</p></div>
                  <div><p className="text-muted-foreground">$/1M out</p><p className="font-mono">${m.price_out_1m.toFixed(2)}</p></div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs"><p className="text-muted-foreground">Cost/Call</p><p className="font-mono">{formatPrice(apiCost)}</p></div>
                  <div className="text-xs"><p className="text-muted-foreground">User Price</p><p className="font-mono text-primary">{formatPrice(userPrice)}</p></div>
                  <div className="text-right"><p className="text-muted-foreground text-xs">IT</p><p className="font-mono font-bold text-lg">{formatIt(itCost)}</p></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ImageModelsTable({ models, onToggle }: { models: ImageModelRow[]; onToggle: (id: string, enabled: boolean) => void }) {
  return (
    <div className="space-y-4">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2 font-semibold w-12">Вкл</th>
              <th className="p-2 font-semibold">Провайдер</th>
              <th className="p-2 font-semibold">Модель</th>
              <th className="p-2 font-semibold">Вариант</th>
              <th className="p-2 font-semibold text-center">Класс</th>
              <th className="p-2 font-semibold text-right">$/Image</th>
              <th className="p-2 font-semibold text-right">User Price</th>
              <th className="p-2 font-semibold text-right">IT</th>
            </tr>
          </thead>
          <tbody>
            {models.map(m => {
              const markup = m.model_class === 'image_premium' ? MARKUP_IMAGE_PREMIUM : MARKUP_IMAGE;
              const userPrice = m.price_per_image * markup;
              const itCost = calculateItCost(m.price_per_image, markup);

              return (
                <tr key={m.id} className={`border-b hover:bg-muted/50 ${!m.enabled ? 'opacity-40' : ''}`}>
                  <td className="p-2">
                    <Switch checked={m.enabled} onCheckedChange={v => onToggle(m.id, v)} className="scale-75" />
                  </td>
                  <td className="p-2">{m.provider_name}</td>
                  <td className="p-2 font-mono text-xs">{m.model_name}</td>
                  <td className="p-2 text-xs">{m.variant}</td>
                  <td className="p-2 text-center">
                    <Badge variant={m.model_class === 'image_premium' ? 'default' : 'secondary'} className="text-xs">
                      {m.model_class === 'image_premium' ? '⭐ Premium' : 'Standard'}
                    </Badge>
                  </td>
                  <td className="p-2 text-right font-mono text-xs">${m.price_per_image.toFixed(3)}</td>
                  <td className="p-2 text-right font-mono text-xs text-primary">${userPrice.toFixed(4)}</td>
                  <td className="p-2 text-right font-mono text-sm font-bold">{formatIt(itCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden space-y-3">
        {models.map(m => {
          const markup = m.model_class === 'image_premium' ? MARKUP_IMAGE_PREMIUM : MARKUP_IMAGE;
          const userPrice = m.price_per_image * markup;
          const itCost = calculateItCost(m.price_per_image, markup);

          return (
            <Card key={m.id} className={`bg-background/50 ${!m.enabled ? 'opacity-40' : ''}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{m.provider_name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{m.model_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.model_class === 'image_premium' ? 'default' : 'secondary'}>
                      {m.model_class === 'image_premium' ? '⭐ Premium' : 'Standard'}
                    </Badge>
                    <Switch checked={m.enabled} onCheckedChange={v => onToggle(m.id, v)} className="scale-75" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{m.variant}</p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs"><p className="text-muted-foreground">$/Image</p><p className="font-mono">${m.price_per_image.toFixed(3)}</p></div>
                  <div className="text-xs"><p className="text-muted-foreground">User Price</p><p className="font-mono text-primary">${userPrice.toFixed(4)}</p></div>
                  <div className="text-right"><p className="text-muted-foreground text-xs">IT</p><p className="font-mono font-bold text-lg">{formatIt(itCost)}</p></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
