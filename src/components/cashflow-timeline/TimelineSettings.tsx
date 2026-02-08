import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Settings, HelpCircle, Calendar, Percent, Clock } from 'lucide-react';
import type { CashFlowTimeline, PlanningPeriod } from './types';
import { PERIOD_LABELS } from './types';

interface TimelineSettingsProps {
  timeline: CashFlowTimeline | null;
  onUpdate: (updates: Partial<CashFlowTimeline>) => void;
}

export const TimelineSettings = memo(({ timeline, onUpdate }: TimelineSettingsProps) => {
  if (!timeline) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          Настройки таймлайна
        </CardTitle>
        <CardDescription>Период планирования и ставка дисконтирования</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Planning Period */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Период
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[200px]">Единица измерения времени для всех денежных потоков</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              value={timeline.planningPeriod}
              onValueChange={(value: PlanningPeriod) => onUpdate({ planningPeriod: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PERIOD_LABELS) as [PlanningPeriod, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Horizon Periods */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Горизонт
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[200px]">Количество периодов для прогноза (1-120)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              type="number"
              min={1}
              max={120}
              value={timeline.horizonPeriods}
              onChange={(e) => {
                const val = Math.max(1, Math.min(120, parseInt(e.target.value) || 12));
                onUpdate({ horizonPeriods: val });
              }}
            />
          </div>

          {/* Discount Rate */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5" />
              Ставка дисконтирования
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[200px]">Годовая ставка дисконтирования (%). Автоматически конвертируется в периодическую</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={timeline.discountRateAnnual}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                  onUpdate({ discountRateAnnual: val });
                }}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Дата начала
            </Label>
            <Input
              type="date"
              value={timeline.startDate ?? ''}
              onChange={(e) => onUpdate({ startDate: e.target.value || undefined })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TimelineSettings.displayName = 'TimelineSettings';
