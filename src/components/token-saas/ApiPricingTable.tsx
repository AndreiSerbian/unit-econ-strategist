import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquare, Image, Info } from 'lucide-react';

// Fixed constants (Single Source of Truth)
const IT_VALUE_USD = 0.001;
const MARKUP_TEXT = 1.5;
const MARKUP_IMAGE = 2.0;
const MARKUP_IMAGE_PREMIUM = 2.2;
const DEFAULT_IN_TOKENS = 300;
const DEFAULT_OUT_TOKENS = 400;

// Text models pricing data
const TEXT_MODELS = [
  { provider: "OpenAI", model: "gpt-4o-mini", mode: "Batch", priceIn1m: 0.15, priceCachedIn1m: 0.075, priceOut1m: 0.60 },
  { provider: "OpenAI", model: "gpt-4o-mini", mode: "Standard", priceIn1m: 0.30, priceCachedIn1m: 0.15, priceOut1m: 1.20 },
  { provider: "OpenAI", model: "gpt-4o", mode: "Batch", priceIn1m: 2.50, priceCachedIn1m: 1.25, priceOut1m: 10.00 },
  { provider: "OpenAI", model: "gpt-4o", mode: "Standard", priceIn1m: 3.75, priceCachedIn1m: 1.875, priceOut1m: 15.00 },
  { provider: "Google", model: "Gemini 2.5 Flash", mode: "Standard", priceIn1m: 0.30, priceCachedIn1m: null, priceOut1m: 2.50 },
  { provider: "Google", model: "Gemini 2.5 Flash", mode: "Batch", priceIn1m: 0.15, priceCachedIn1m: null, priceOut1m: 1.25 },
  { provider: "Google", model: "Gemini 2.5 Flash-Lite", mode: "Standard", priceIn1m: 0.10, priceCachedIn1m: null, priceOut1m: 0.40 },
  { provider: "Google", model: "Gemini 2.5 Flash-Lite", mode: "Batch", priceIn1m: 0.05, priceCachedIn1m: null, priceOut1m: 0.20 },
  { provider: "Anthropic", model: "Claude Sonnet 4.5", mode: "Standard", priceIn1m: 3.00, priceCachedIn1m: null, priceOut1m: 15.00 },
];

// Image models pricing data
const IMAGE_MODELS = [
  { provider: "OpenAI", model: "DALL·E 3", variant: "Standard 1024×1024", pricePerImage: 0.04, class: "image" as const },
  { provider: "OpenAI", model: "DALL·E 3", variant: "Standard 1024×1792", pricePerImage: 0.08, class: "image" as const },
  { provider: "OpenAI", model: "DALL·E 3", variant: "HD 1024×1024", pricePerImage: 0.08, class: "image" as const },
  { provider: "OpenAI", model: "DALL·E 3", variant: "HD 1024×1792", pricePerImage: 0.12, class: "image_premium" as const },
  { provider: "OpenAI", model: "GPT-Image-1", variant: "Low 1024×1024", pricePerImage: 0.011, class: "image" as const },
  { provider: "OpenAI", model: "GPT-Image-1", variant: "Medium 1024×1024", pricePerImage: 0.042, class: "image" as const },
  { provider: "OpenAI", model: "GPT-Image-1", variant: "High 1024×1024", pricePerImage: 0.167, class: "image_premium" as const },
  { provider: "OpenAI", model: "chatgpt-image-latest", variant: "Low 1024×1024", pricePerImage: 0.009, class: "image" as const },
  { provider: "OpenAI", model: "chatgpt-image-latest", variant: "Medium 1024×1024", pricePerImage: 0.034, class: "image" as const },
  { provider: "OpenAI", model: "chatgpt-image-latest", variant: "High 1024×1024", pricePerImage: 0.133, class: "image_premium" as const },
  { provider: "Google", model: "Gemini Image Output", variant: "up to 1024×1024", pricePerImage: 0.039, class: "image" as const },
  { provider: "NanoBanana", model: "NanoBanana", variant: "1 image", pricePerImage: 0.09, class: "image_premium" as const },
  { provider: "NanoBanana", model: "NanoBanana Pro", variant: "1 image", pricePerImage: 0.12, class: "image_premium" as const },
];

// Calculation functions
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

export function ApiPricingTable() {
  return (
    <TooltipProvider>
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 API Тарифы (Эталон)
          </CardTitle>
          <CardDescription>
            Справочные цены провайдеров. 1 IT = ${IT_VALUE_USD}. Текстовый вызов: {DEFAULT_IN_TOKENS}in + {DEFAULT_OUT_TOKENS}out токенов.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Текстовые LLM</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span>Генерация изображений</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <TextModelsTable />
            </TabsContent>

            <TabsContent value="image">
              <ImageModelsTable />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

function TextModelsTable() {
  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2 font-semibold">Провайдер</th>
              <th className="p-2 font-semibold">Модель</th>
              <th className="p-2 font-semibold text-center">Режим</th>
              <th className="p-2 font-semibold text-right">$/1M in</th>
              <th className="p-2 font-semibold text-right">Cached</th>
              <th className="p-2 font-semibold text-right">$/1M out</th>
              <th className="p-2 font-semibold text-right">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 justify-end">
                    Cost/Call
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>API-стоимость одного вызова</p>
                    <p className="text-xs text-muted-foreground">({DEFAULT_IN_TOKENS}in + {DEFAULT_OUT_TOKENS}out токенов)</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="p-2 font-semibold text-right">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 justify-end">
                    User Price
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Цена для пользователя с наценкой</p>
                    <p className="text-xs text-muted-foreground">(×{MARKUP_TEXT} markup)</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="p-2 font-semibold text-right">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 justify-end">
                    IT
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Internal Tokens (1 IT = ${IT_VALUE_USD})</p>
                  </TooltipContent>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {TEXT_MODELS.map((m, idx) => {
              const apiCost = calculateTextCallCost(m.priceIn1m, m.priceOut1m);
              const userPrice = apiCost * MARKUP_TEXT;
              const itCost = calculateItCost(apiCost, MARKUP_TEXT);
              
              return (
                <tr key={idx} className="border-b hover:bg-muted/50">
                  <td className="p-2">{m.provider}</td>
                  <td className="p-2 font-mono text-xs">{m.model}</td>
                  <td className="p-2 text-center">
                    <Badge variant={m.mode === "Batch" ? "secondary" : "default"} className="text-xs">
                      {m.mode}
                    </Badge>
                  </td>
                  <td className="p-2 text-right font-mono text-xs">${m.priceIn1m.toFixed(2)}</td>
                  <td className="p-2 text-right font-mono text-xs text-muted-foreground">
                    {m.priceCachedIn1m !== null ? `$${m.priceCachedIn1m.toFixed(3)}` : '—'}
                  </td>
                  <td className="p-2 text-right font-mono text-xs">${m.priceOut1m.toFixed(2)}</td>
                  <td className="p-2 text-right font-mono text-xs">{formatPrice(apiCost)}</td>
                  <td className="p-2 text-right font-mono text-xs text-primary">{formatPrice(userPrice)}</td>
                  <td className="p-2 text-right font-mono text-sm font-bold">{formatIt(itCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {TEXT_MODELS.map((m, idx) => {
          const apiCost = calculateTextCallCost(m.priceIn1m, m.priceOut1m);
          const userPrice = apiCost * MARKUP_TEXT;
          const itCost = calculateItCost(apiCost, MARKUP_TEXT);
          
          return (
            <Card key={idx} className="bg-background/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{m.provider}</p>
                    <p className="font-mono text-xs text-muted-foreground">{m.model}</p>
                  </div>
                  <Badge variant={m.mode === "Batch" ? "secondary" : "default"}>
                    {m.mode}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">$/1M in</p>
                    <p className="font-mono">${m.priceIn1m.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cached</p>
                    <p className="font-mono">{m.priceCachedIn1m !== null ? `$${m.priceCachedIn1m.toFixed(3)}` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">$/1M out</p>
                    <p className="font-mono">${m.priceOut1m.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs">
                    <p className="text-muted-foreground">Cost/Call</p>
                    <p className="font-mono">{formatPrice(apiCost)}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-muted-foreground">User Price</p>
                    <p className="font-mono text-primary">{formatPrice(userPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">IT</p>
                    <p className="font-mono font-bold text-lg">{formatIt(itCost)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ImageModelsTable() {
  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2 font-semibold">Провайдер</th>
              <th className="p-2 font-semibold">Модель</th>
              <th className="p-2 font-semibold">Вариант</th>
              <th className="p-2 font-semibold text-center">Класс</th>
              <th className="p-2 font-semibold text-right">$/Image</th>
              <th className="p-2 font-semibold text-right">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 justify-end">
                    User Price
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Цена с наценкой</p>
                    <p className="text-xs text-muted-foreground">(×{MARKUP_IMAGE} / ×{MARKUP_IMAGE_PREMIUM} premium)</p>
                  </TooltipContent>
                </Tooltip>
              </th>
              <th className="p-2 font-semibold text-right">
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 justify-end">
                    IT
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Internal Tokens (1 IT = ${IT_VALUE_USD})</p>
                  </TooltipContent>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {IMAGE_MODELS.map((m, idx) => {
              const markup = m.class === "image_premium" ? MARKUP_IMAGE_PREMIUM : MARKUP_IMAGE;
              const userPrice = m.pricePerImage * markup;
              const itCost = calculateItCost(m.pricePerImage, markup);
              
              return (
                <tr key={idx} className="border-b hover:bg-muted/50">
                  <td className="p-2">{m.provider}</td>
                  <td className="p-2 font-mono text-xs">{m.model}</td>
                  <td className="p-2 text-xs">{m.variant}</td>
                  <td className="p-2 text-center">
                    <Badge 
                      variant={m.class === "image_premium" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {m.class === "image_premium" ? "⭐ Premium" : "Standard"}
                    </Badge>
                  </td>
                  <td className="p-2 text-right font-mono text-xs">${m.pricePerImage.toFixed(3)}</td>
                  <td className="p-2 text-right font-mono text-xs text-primary">${userPrice.toFixed(4)}</td>
                  <td className="p-2 text-right font-mono text-sm font-bold">{formatIt(itCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {IMAGE_MODELS.map((m, idx) => {
          const markup = m.class === "image_premium" ? MARKUP_IMAGE_PREMIUM : MARKUP_IMAGE;
          const userPrice = m.pricePerImage * markup;
          const itCost = calculateItCost(m.pricePerImage, markup);
          
          return (
            <Card key={idx} className="bg-background/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{m.provider}</p>
                    <p className="font-mono text-xs text-muted-foreground">{m.model}</p>
                  </div>
                  <Badge variant={m.class === "image_premium" ? "default" : "secondary"}>
                    {m.class === "image_premium" ? "⭐ Premium" : "Standard"}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground">{m.variant}</p>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs">
                    <p className="text-muted-foreground">$/Image</p>
                    <p className="font-mono">${m.pricePerImage.toFixed(3)}</p>
                  </div>
                  <div className="text-xs">
                    <p className="text-muted-foreground">User Price</p>
                    <p className="font-mono text-primary">${userPrice.toFixed(4)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">IT</p>
                    <p className="font-mono font-bold text-lg">{formatIt(itCost)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
