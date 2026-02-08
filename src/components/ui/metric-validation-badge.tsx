import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Severity = 'error' | 'warning' | 'info' | 'success';

interface MetricValidationBadgeProps {
  severity: Severity;
  message: string;
  className?: string;
}

export function MetricValidationBadge({ severity, message, className }: MetricValidationBadgeProps) {
  const config = {
    error: {
      icon: AlertCircle,
      bgColor: 'bg-destructive/10',
      textColor: 'text-destructive',
      borderColor: 'border-destructive/20',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-500/20',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500/20',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600',
      borderColor: 'border-green-500/20',
    },
  };

  const { icon: Icon, bgColor, textColor, borderColor } = config[severity];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border',
        bgColor,
        textColor,
        borderColor,
        className
      )}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

interface NotEnoughDataBadgeProps {
  missingFields?: string[];
  className?: string;
}

export function NotEnoughDataBadge({ missingFields, className }: NotEnoughDataBadgeProps) {
  const message = missingFields && missingFields.length > 0
    ? `Не хватает данных: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}`
    : 'Недостаточно данных';

  return (
    <MetricValidationBadge
      severity="info"
      message={message}
      className={className}
    />
  );
}

interface MetricTooltipProps {
  metricKey: string;
  label: string;
  description: string;
  formula?: string;
  unit?: string;
  timeMeaning?: string;
  range?: string;
  children: React.ReactNode;
}

export function MetricTooltip({
  label,
  description,
  formula,
  unit,
  timeMeaning,
  range,
  children,
}: MetricTooltipProps) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute z-50 hidden group-hover:block w-64 p-3 bg-popover border rounded-lg shadow-lg -top-2 left-full ml-2">
        <div className="space-y-2">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          {formula && (
            <p className="text-xs font-mono bg-muted p-1 rounded">
              {formula}
            </p>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            {unit && (
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                {unit}
              </span>
            )}
            {timeMeaning && (
              <span className="px-1.5 py-0.5 bg-accent text-accent-foreground rounded">
                {timeMeaning}
              </span>
            )}
            {range && (
              <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded">
                {range}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
