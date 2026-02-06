import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { NumericInput } from '@/components/ui/numeric-input';
import { Settings, Save, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { TokenEconomicsConfig } from './types';

interface TokenEconomicsConfigCardProps {
  config: TokenEconomicsConfig | null;
  onSave: (data: Partial<TokenEconomicsConfig>) => Promise<void>;
}

export function TokenEconomicsConfigCard({ config, onSave }: TokenEconomicsConfigCardProps) {
  const [itValueUsd, setItValueUsd] = useState(0.001);
  const [textMarkup, setTextMarkup] = useState(1.5);
  const [imageMarkup, setImageMarkup] = useState(2.0);
  const [premiumMarkup, setPremiumMarkup] = useState(2.2);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setItValueUsd(config.it_value_usd);
      setTextMarkup(config.default_text_markup);
      setImageMarkup(config.default_image_markup);
      setPremiumMarkup(config.default_premium_markup);
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      it_value_usd: itValueUsd,
      default_text_markup: textMarkup,
      default_image_markup: imageMarkup,
      default_premium_markup: premiumMarkup,
    });
    setSaving(false);
  };

  const hasChanges = !config || 
    config.it_value_usd !== itValueUsd ||
    config.default_text_markup !== textMarkup ||
    config.default_image_markup !== imageMarkup ||
    config.default_premium_markup !== premiumMarkup;

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings className="w-5 h-5 text-primary" />
            ⚙️ Настройки токен-экономики
          </CardTitle>
          <CardDescription>
            Базовые параметры расчёта цен и маржи платформы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* IT Value */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                Стоимость 1 IT ($)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Internal Token (IT) — внутренняя единица учёта. 
                      Обычно 1 IT = $0.001. Пользователи покупают IT в пакетах, 
                      а операции списывают IT.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
            <NumericInput
                value={itValueUsd}
                onChange={(v) => setItValueUsd(v ?? 0.001)}
                step="0.0001"
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                1000 IT = ${(itValueUsd * 1000).toFixed(2)}
              </p>
            </div>

            {/* Text Markup */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                💬 Наценка Text (×)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Множитель для текстовых LLM-операций. 
                      Цена = API cost × markup. При 1.5× маржа ≈ 33%.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
            <NumericInput
                value={textMarkup}
                onChange={(v) => setTextMarkup(v ?? 1.5)}
                step="0.1"
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Маржа: {((1 - 1/textMarkup) * 100).toFixed(0)}%
              </p>
            </div>

            {/* Image Markup */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                🖼️ Наценка Image (×)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Множитель для генерации изображений. 
                      При 2× маржа = 50%.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
            <NumericInput
                value={imageMarkup}
                onChange={(v) => setImageMarkup(v ?? 2.0)}
                step="0.1"
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Маржа: {((1 - 1/imageMarkup) * 100).toFixed(0)}%
              </p>
            </div>

            {/* Premium Markup */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs sm:text-sm">
                ✨ Наценка Premium (×)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">
                      Множитель для премиум-операций (HD изображения, 
                      сложные модели). При 2.2× маржа ≈ 55%.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </Label>
            <NumericInput
                value={premiumMarkup}
                onChange={(v) => setPremiumMarkup(v ?? 2.2)}
                step="0.1"
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Маржа: {((1 - 1/premiumMarkup) * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {hasChanges && (
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
