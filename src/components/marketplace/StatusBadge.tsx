import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { DataStatus } from "./types";

interface StatusBadgeProps {
  status: DataStatus;
  details?: string;
}

const statusConfig: Record<DataStatus, { 
  label: string; 
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: typeof CheckCircle;
  className: string;
}> = {
  ok: {
    label: 'OK',
    variant: 'default',
    icon: CheckCircle,
    className: 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20',
  },
  not_enough_data: {
    label: 'Нет данных',
    variant: 'secondary',
    icon: Info,
    className: 'bg-muted text-muted-foreground',
  },
  mismatch: {
    label: 'Расхождение',
    variant: 'outline',
    icon: AlertTriangle,
    className: 'bg-warning/10 text-warning-foreground border-warning/30',
  },
  shares_overflow: {
    label: 'Доли >100%',
    variant: 'destructive',
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

export const StatusBadge = ({ status, details }: StatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  const badge = (
    <Badge variant={config.variant} className={`${config.className} gap-1 text-xs`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );

  if (details) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">{details}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};
