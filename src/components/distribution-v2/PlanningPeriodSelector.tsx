import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, HelpCircle } from "lucide-react";
import type { PlanningPeriod } from "./types";
import { getPeriodLabel } from "./types";

interface PlanningPeriodSelectorProps {
  period: PlanningPeriod;
  onChange: (period: PlanningPeriod) => void;
  disabled?: boolean;
}

const FieldTooltip = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help inline-block ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const PlanningPeriodSelector = ({ period, onChange, disabled }: PlanningPeriodSelectorProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="w-4 h-4 text-primary" />
          Период планирования
          <FieldTooltip content="Единица времени для всех объёмов и прогнозов. quantity в Products = units_per_period" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Период</Label>
          <Select value={period} onValueChange={(v) => onChange(v as PlanningPeriod)} disabled={disabled}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
              <SelectItem value="quarter">Квартал</SelectItem>
              <SelectItem value="year">Год</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Все объёмы продаж указываются за {getPeriodLabel(period)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
