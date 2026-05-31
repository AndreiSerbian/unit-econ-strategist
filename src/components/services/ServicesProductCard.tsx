import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, Clock, TrendingUp, AlertTriangle, CheckCircle, HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceProduct, ServiceCalculatedMetrics, BillingModel, PlanningPeriod } from "./types";
import { computeServiceRevenue } from "./revenue";
import { calculateServiceCogs } from "@/utils/serviceCogs";
import { useTranslation } from "@/i18n/useTranslation";

interface ServicesProductCardProps {
  product: ServiceProduct;
  onUpdate: (productId: string, updates: Partial<ServiceProduct>) => void;
  onDelete: (productId: string) => void;
  currency: string;
}

// Planning period multipliers (weeks per period)
const WEEKS_PER_PERIOD: Record<PlanningPeriod, number> = {
  week: 1,
  month: 4.33,
  quarter: 13,
  year: 52,
};

const PERIOD_LABELS: Record<PlanningPeriod, string> = {
  week: 'нед',
  month: 'мес',
  quarter: 'кв',
  year: 'год',
};

const BILLING_MODEL_LABELS: Record<BillingModel, string> = {
  fixed_project: 'Фиксированный проект',
  hourly: 'Почасовая оплата',
  retainer: 'Абонентское сопровождение',
};

// Calculate all derived metrics
const calculateMetrics = (product: ServiceProduct): ServiceCalculatedMetrics => {
  const hoursPerWeek = product.hoursPerWeek ?? 40;
  const billablePercent = product.billablePercent ?? (product.utilization ?? 100);
  const allocationPercent = product.allocationPercent ?? 100;
  const planningPeriod = product.planningPeriod ?? 'month';
  const billingModel = product.billingModel ?? 'fixed_project';
  const weeksPerPeriod = WEEKS_PER_PERIOD[planningPeriod];
  
  // Base calculations
  const effectiveHoursPerWeek = hoursPerWeek * (allocationPercent / 100);
  const billableHoursWeek = effectiveHoursPerWeek * (billablePercent / 100);
  const billableHoursPeriod = billableHoursWeek * weeksPerPeriod;
  
  // Project-specific calculations
  let durationWeeksPerProject: number | null = null;
  let maxProjectsPerPeriod: number | null = null;
  let effectiveHourlyRate: number | null = null;
  let revenuePeriod: number | null = null;
  let isOverloaded = false;
  let hasInsufficientData = false;
  
  const estimatedHours = product.estimatedHoursPerProject;
  const projectPrice = product.price ?? 0;
  const projectsCount = product.quantity ?? 0;
  const hourlyRate = product.hourlyRate ?? 0;
  
  // FIN-008b — revenue from the shared helper so My Company / Cash Flow agree.
  revenuePeriod = computeServiceRevenue(product);
  // Touch calculateServiceCogs so we share COGS contract (manual mode default
  // preserves existing behaviour; hourly mode only triggers when costMode is
  // explicitly 'hourly' and the necessary fields are filled).
  void calculateServiceCogs({
    costMode: (product as any).costMode,
    manualCostPerProject: product.cost,
    estimatedHoursPerProject: product.estimatedHoursPerProject,
    loadedHourlyCost: (product as any).loadedHourlyCost,
    quantity: product.quantity,
  });

  if (billingModel === 'fixed_project') {
    if (estimatedHours && estimatedHours > 0) {
      if (billableHoursWeek > 0) {
        durationWeeksPerProject = estimatedHours / billableHoursWeek;
      }
      if (billableHoursPeriod > 0) {
        maxProjectsPerPeriod = Math.floor(billableHoursPeriod / estimatedHours);
      }
      if (projectPrice > 0) {
        effectiveHourlyRate = projectPrice / estimatedHours;
      }
      isOverloaded = maxProjectsPerPeriod !== null && projectsCount > maxProjectsPerPeriod;
    } else {
      hasInsufficientData = true;
    }
  } else if (billingModel === 'hourly') {
    const plannedHours = product.plannedBillableHoursPerPeriod ?? billableHoursPeriod;
    effectiveHourlyRate = hourlyRate;
    isOverloaded = plannedHours > billableHoursPeriod;
  } else if (billingModel === 'retainer') {
    const retainerFee = product.retainerFee ?? 0;
    const clientsCount = product.clientsCount ?? 0;
    if (clientsCount > 0 && billableHoursPeriod > 0) {
      const hoursPerClient = billableHoursPeriod / clientsCount;
      effectiveHourlyRate = retainerFee / hoursPerClient;
    }
  }
  
  return {
    billableHoursWeek,
    billableHoursPeriod,
    weeksPerPeriod,
    durationWeeksPerProject,
    maxProjectsPerPeriod,
    effectiveHourlyRate,
    revenuePeriod,
    isOverloaded,
    hasInsufficientData,
  };
};

// Field tooltip component
const FieldTooltip = memo(({ children, content }: { children: React.ReactNode; content: string }) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {children}
          <HelpCircle className="w-3 h-3 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));

FieldTooltip.displayName = 'FieldTooltip';

export const ServicesProductCard = memo(({
  product,
  onUpdate,
  onDelete,
  currency,
}: ServicesProductCardProps) => {
  const { t, language } = useTranslation();
  const numLocale = language === "ru" ? "ru-RU" : language === "ro" ? "ro-RO" : "en-US";
  const billingModel = product.billingModel ?? 'fixed_project';
  const planningPeriod = product.planningPeriod ?? 'month';
  const metrics = useMemo(() => calculateMetrics(product), [product]);
  const periodKey = planningPeriod.charAt(0).toUpperCase() + planningPeriod.slice(1);
  const periodLabel = t(`servicesCard.period${periodKey}`);

  const handleChange = (key: keyof ServiceProduct, value: any) => {
    onUpdate(product.id, { [key]: value });
  };
  
  // Determine status badge
  const getStatusBadge = () => {
    if (metrics.hasInsufficientData) {
      return (
        <Badge variant="outline" className="text-xs bg-muted">
          <Info className="w-3 h-3 mr-1" />
          {t("servicesCard.notEnoughData")}
        </Badge>
      );
    }
    if (metrics.isOverloaded) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {t("servicesCard.overloaded")}
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="text-xs bg-success text-success-foreground">
        <CheckCircle className="w-3 h-3 mr-1" />
        {t("servicesCard.ok")}
      </Badge>
    );
  };
  
  return (
    <div className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium text-sm sm:text-base truncate max-w-[200px]">
            {product.name || t("servicesCard.unnamed")}
          </h4>
          {getStatusBadge()}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(product.id)}
          className="shrink-0 h-8 w-8 p-0"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
      
      {/* Main fields - row 1: name + billing model + period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <Label htmlFor={`${product.id}-name`}>{t("servicesCard.name")}</Label>
          <Input
            id={`${product.id}-name`}
            value={product.name ?? ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={t("servicesCard.namePlaceholder")}
          />
        </div>
        
        <div>
          <Label htmlFor={`${product.id}-billingModel`}>
            <FieldTooltip content={t("servicesCard.billingModelTooltip")}>
              {t("servicesCard.billingModel")}
            </FieldTooltip>
          </Label>
          <Select
            value={billingModel}
            onValueChange={(v) => handleChange('billingModel', v as BillingModel)}
          >
            <SelectTrigger id={`${product.id}-billingModel`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed_project">{t("servicesCard.fixedProject")}</SelectItem>
              <SelectItem value="hourly">{t("servicesCard.hourly")}</SelectItem>
              <SelectItem value="retainer">{t("servicesCard.retainer")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor={`${product.id}-planningPeriod`}>
            <FieldTooltip content={t("servicesCard.planningPeriodTooltip")}>
              {t("servicesCard.planningPeriod")}
            </FieldTooltip>
          </Label>
          <Select
            value={planningPeriod}
            onValueChange={(v) => handleChange('planningPeriod', v as PlanningPeriod)}
          >
            <SelectTrigger id={`${product.id}-planningPeriod`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t("servicesCard.week")}</SelectItem>
              <SelectItem value="month">{t("servicesCard.month")}</SelectItem>
              <SelectItem value="quarter">{t("servicesCard.quarter")}</SelectItem>
              <SelectItem value="year">{t("servicesCard.year")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor={`${product.id}-price`}>
            {billingModel === 'fixed_project' 
              ? `${t("servicesCard.projectPrice")} (${currency})`
              : billingModel === 'retainer'
              ? `${t("servicesCard.retainerFeeShort")} (${currency})`
              : `${t("servicesCard.hourlyRate")} (${currency})`
            }
          </Label>
          <NumericInput
            id={`${product.id}-price`}
            value={billingModel === 'hourly' ? (product.hourlyRate ?? 0) : (product.price ?? 0)}
            onChange={(v) => handleChange(billingModel === 'hourly' ? 'hourlyRate' : 'price', v)}
            allowNull
          />
        </div>
      </div>
      
      {/* Row 2: Hours and percentages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div>
          <Label htmlFor={`${product.id}-hoursPerWeek`}>
            <FieldTooltip content={t("servicesCard.hoursPerWeekTooltip")}>
              {t("servicesCard.hoursPerWeek")}
            </FieldTooltip>
          </Label>
          <NumericInput
            id={`${product.id}-hoursPerWeek`}
            value={product.hoursPerWeek ?? 40}
            onChange={(v) => handleChange('hoursPerWeek', Math.min(168, Math.max(0, v ?? 0)))}
          />
        </div>
        
        <div>
          <Label htmlFor={`${product.id}-allocationPercent`}>
            <FieldTooltip content={t("servicesCard.allocationPercentTooltip")}>
              {t("servicesCard.allocationPercent")}
            </FieldTooltip>
          </Label>
          <NumericInput
            id={`${product.id}-allocationPercent`}
            value={product.allocationPercent ?? 100}
            onChange={(v) => handleChange('allocationPercent', Math.min(100, Math.max(0, v ?? 0)))}
          />
        </div>
        
        <div>
          <Label htmlFor={`${product.id}-billablePercent`}>
            <FieldTooltip content={t("servicesCard.billablePercentTooltip")}>
              {t("servicesCard.billablePercent")}
            </FieldTooltip>
          </Label>
          <NumericInput
            id={`${product.id}-billablePercent`}
            value={product.billablePercent ?? product.utilization ?? 100}
            onChange={(v) => handleChange('billablePercent', Math.min(100, Math.max(0, v ?? 0)))}
          />
        </div>
        
        <div>
          <Label htmlFor={`${product.id}-cost`}>{t("servicesCard.cost")} ({currency})</Label>
          <NumericInput
            id={`${product.id}-cost`}
            value={product.cost ?? 0}
            onChange={(v) => handleChange('cost', v)}
            allowNull
          />
        </div>
        
        {/* Conditional field based on billing model */}
        {billingModel === 'fixed_project' && (
          <div>
            <Label htmlFor={`${product.id}-estimatedHours`}>
              <FieldTooltip content={t("servicesCard.estimatedHoursTooltip")}>
                {t("servicesCard.estimatedHours")}
              </FieldTooltip>
            </Label>
            <NumericInput
              id={`${product.id}-estimatedHours`}
              value={product.estimatedHoursPerProject ?? null}
              onChange={(v) => handleChange('estimatedHoursPerProject', Math.max(0, v ?? 0))}
              allowNull
            />
          </div>
        )}
        
        {billingModel === 'hourly' && (
          <div>
            <Label htmlFor={`${product.id}-plannedHours`}>
              <FieldTooltip content={t("servicesCard.plannedHoursTooltip")}>
                {t("servicesCard.plannedHours")}/{periodLabel}
              </FieldTooltip>
            </Label>
            <NumericInput
              id={`${product.id}-plannedHours`}
              value={product.plannedBillableHoursPerPeriod ?? Math.round(metrics.billableHoursPeriod)}
              onChange={(v) => handleChange('plannedBillableHoursPerPeriod', Math.max(0, v ?? 0))}
              allowNull
            />
          </div>
        )}
        
        {billingModel === 'retainer' && (
          <>
            <div>
              <Label htmlFor={`${product.id}-retainerFee`}>
                <FieldTooltip content={t("servicesCard.retainerFeeTooltip")}>
                  {t("servicesCard.retainerFee")} ({currency})
                </FieldTooltip>
              </Label>
              <NumericInput
                id={`${product.id}-retainerFee`}
                value={product.retainerFee ?? null}
                onChange={(v) => handleChange('retainerFee', Math.max(0, v ?? 0))}
                allowNull
              />
            </div>
          </>
        )}
      </div>
      
      {/* Row 3: Project/Client counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {billingModel === 'fixed_project' && (
          <div>
            <Label htmlFor={`${product.id}-quantity`}>
              {t("servicesCard.projectsPerPeriod")}/{periodLabel}
            </Label>
            <NumericInput
              id={`${product.id}-quantity`}
              value={product.quantity ?? 0}
              onChange={(v) => handleChange('quantity', Math.max(0, v ?? 0))}
            />
          </div>
        )}
        
        {billingModel === 'retainer' && (
          <div>
            <Label htmlFor={`${product.id}-clientsCount`}>
              {t("servicesCard.clientsCount")}
            </Label>
            <NumericInput
              id={`${product.id}-clientsCount`}
              value={product.clientsCount ?? 0}
              onChange={(v) => handleChange('clientsCount', Math.max(0, v ?? 0))}
            />
          </div>
        )}
        
        {billingModel === 'hourly' && (
          <div>
            <Label htmlFor={`${product.id}-hourlyRate`}>
              {t("servicesCard.hourlyRateField")} ({currency})
            </Label>
            <NumericInput
              id={`${product.id}-hourlyRate`}
              value={product.hourlyRate ?? 0}
              onChange={(v) => handleChange('hourlyRate', Math.max(0, v ?? 0))}
              allowNull
            />
          </div>
        )}
      </div>
      
      {/* Calculated metrics section */}
      <div className="pt-3 border-t space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          <span>{t("servicesCard.calculatedMetrics")}</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs sm:text-sm">
          {/* Billable hours */}
          <div className="p-2 bg-muted/50 rounded">
            <p className="text-muted-foreground text-[10px] sm:text-xs">{t("servicesCard.billableHoursWeek")}</p>
            <p className="font-mono font-semibold">
              {metrics.billableHoursWeek.toFixed(1)} {t("servicesCard.hoursUnit")}
            </p>
          </div>
          
          <div className="p-2 bg-muted/50 rounded">
            <p className="text-muted-foreground text-[10px] sm:text-xs">
              {t("servicesCard.billableHoursPeriod")}/{periodLabel}
            </p>
            <p className="font-mono font-semibold">
              {metrics.billableHoursPeriod.toFixed(0)} {t("servicesCard.hoursUnit")}
            </p>
          </div>
          
          {/* Duration per project (fixed_project only) */}
          {billingModel === 'fixed_project' && (
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground text-[10px] sm:text-xs">{t("servicesCard.projectDuration")}</p>
              <p className="font-mono font-semibold">
                {metrics.durationWeeksPerProject !== null 
                  ? `${metrics.durationWeeksPerProject.toFixed(1)} ${t("servicesCard.weeksUnit")}` 
                  : '—'}
              </p>
            </div>
          )}
          
          {/* Max projects (fixed_project only) */}
          {billingModel === 'fixed_project' && (
            <div className={cn(
              "p-2 rounded",
              metrics.isOverloaded ? "bg-destructive/10" : "bg-muted/50"
            )}>
              <p className="text-muted-foreground text-[10px] sm:text-xs">
                {t("servicesCard.maxProjectsPerPeriod")}/{periodLabel}
              </p>
              <p className={cn(
                "font-mono font-semibold",
                metrics.isOverloaded && "text-destructive"
              )}>
                {metrics.maxProjectsPerPeriod !== null ? metrics.maxProjectsPerPeriod : '—'}
              </p>
            </div>
          )}
          
          {/* Effective hourly rate */}
          <div className="p-2 bg-muted/50 rounded">
            <p className="text-muted-foreground text-[10px] sm:text-xs">{t("servicesCard.effectiveHourlyRate")}</p>
            <p className="font-mono font-semibold">
              {metrics.effectiveHourlyRate !== null 
                ? `${metrics.effectiveHourlyRate.toFixed(0)} ${currency}` 
                : '—'}
            </p>
          </div>
          
          {/* Revenue per period */}
          <div className="p-2 bg-primary/10 rounded">
            <p className="text-muted-foreground text-[10px] sm:text-xs">
              {t("servicesCard.revenuePerPeriod")}/{periodLabel}
            </p>
            <p className="font-mono font-semibold text-primary">
              {metrics.revenuePeriod !== null 
                ? `${metrics.revenuePeriod.toLocaleString(numLocale)} ${currency}` 
                : '—'}
            </p>
          </div>
        </div>
        
        {/* Warning for overload */}
        {metrics.isOverloaded && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-destructive text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {billingModel === 'fixed_project' 
                ? t("servicesCard.overloadWarningProjects")
                    .replace("{count}", String(product.quantity ?? 0))
                    .replace("{max}", String(metrics.maxProjectsPerPeriod ?? 0))
                : t("servicesCard.overloadWarningHours")
              }
            </span>
          </div>
        )}
        
        {/* Info for insufficient data */}
        {metrics.hasInsufficientData && billingModel === 'fixed_project' && (
          <div className="flex items-center gap-2 p-2 bg-muted rounded text-muted-foreground text-xs">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              {t("servicesCard.insufficientDataHint")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

ServicesProductCard.displayName = 'ServicesProductCard';
