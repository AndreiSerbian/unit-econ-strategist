import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { DataStatus } from "./types";
import { useTranslation } from "@/i18n/useTranslation";

interface StatusBadgeProps {
  status: DataStatus;
  details?: string;
}

const statusIcons: Record<DataStatus, typeof CheckCircle> = {
  ok: CheckCircle,
  not_enough_data: Info,
  mismatch: AlertTriangle,
  shares_overflow: AlertCircle,
};

const statusClasses: Record<DataStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  ok: { variant: 'default', className: 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20' },
  not_enough_data: { variant: 'secondary', className: 'bg-muted text-muted-foreground' },
  mismatch: { variant: 'outline', className: 'bg-warning/10 text-warning-foreground border-warning/30' },
  shares_overflow: { variant: 'destructive', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const statusLabelKey: Record<DataStatus, string> = {
  ok: 'marketplace.statusOk',
  not_enough_data: 'marketplace.statusNoData',
  mismatch: 'marketplace.statusMismatch',
  shares_overflow: 'marketplace.statusOverflow',
};

export const StatusBadge = ({ status, details }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const cfg = statusClasses[status];
  const Icon = statusIcons[status];

  const badge = (
    <Badge variant={cfg.variant} className={`${cfg.className} gap-1 text-xs`}>
      <Icon className="w-3 h-3" />
      {t(statusLabelKey[status])}
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
