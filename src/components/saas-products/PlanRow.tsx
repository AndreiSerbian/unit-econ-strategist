import { useState, memo, useCallback } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { NumericInput } from '@/components/ui/numeric-input';
import type { SaasPlan, BillingType, PlanFormData } from './types';

interface PlanRowProps {
  plan: SaasPlan;
  currency: string;
  onUpdate: (planId: string, updates: Partial<PlanFormData>) => void;
  onDelete: (planId: string) => void;
}

export const PlanRow = memo(function PlanRow({ plan, currency, onUpdate, onDelete }: PlanRowProps) {
  const [localName, setLocalName] = useState(plan.name);

  const handleNameBlur = useCallback(() => {
    if (localName !== plan.name) {
      onUpdate(plan.id, { name: localName });
    }
  }, [localName, plan.name, plan.id, onUpdate]);

  const handleBillingTypeChange = useCallback((value: string) => {
    onUpdate(plan.id, { 
      billing_type: value as BillingType,
      // Reset free plan if switching to one_time
      is_free_plan: value === 'one_time' ? false : plan.is_free_plan,
    });
  }, [plan.id, plan.is_free_plan, onUpdate]);

  const handleFreePlanChange = useCallback((checked: boolean) => {
    onUpdate(plan.id, { 
      is_free_plan: checked,
      price_eur: checked ? 0 : plan.price_eur,
    });
  }, [plan.id, plan.price_eur, onUpdate]);

  const isSubscription = plan.billing_type === 'subscription';

  return (
    <TableRow>
      {/* Plan name */}
      <TableCell className="min-w-[120px]">
        <Input
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={handleNameBlur}
          className="h-8 text-sm"
          placeholder="Название плана"
        />
      </TableCell>

      {/* Billing type */}
      <TableCell className="min-w-[130px]">
        <Select value={plan.billing_type} onValueChange={handleBillingTypeChange}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="subscription">Подписка</SelectItem>
            <SelectItem value="one_time">Разовая</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      {/* Price */}
      <TableCell className="min-w-[100px]">
        <NumericInput
          value={plan.price_eur}
          onChange={(val) => onUpdate(plan.id, { price_eur: val ?? 0 })}
          placeholder="0"
          className={`h-8 text-sm ${plan.is_free_plan ? 'bg-muted text-muted-foreground' : ''}`}
        />
        {plan.is_free_plan && (
          <span className="text-[10px] text-muted-foreground">Бесплатный</span>
        )}
      </TableCell>

      {/* Subscribers / Buyers */}
      <TableCell className="min-w-[100px]">
        <NumericInput
          value={plan.subscribers}
          onChange={(val) => onUpdate(plan.id, { subscribers: val ?? 0 })}
          placeholder="0"
          className="h-8 text-sm"
        />
        <span className="text-[10px] text-muted-foreground">
          {isSubscription ? 'подписчиков' : 'покупателей'}
        </span>
      </TableCell>

      {/* New subs (subscription only) */}
      <TableCell className="min-w-[90px]">
        {isSubscription ? (
          <NumericInput
            value={plan.new_subscribers_per_period}
            onChange={(val) => onUpdate(plan.id, { new_subscribers_per_period: val ?? 0 })}
            placeholder="0"
            className="h-8 text-sm"
          />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>

      {/* Cost per subscriber (subscription) or per buyer (one_time) */}
      <TableCell className="min-w-[100px]">
        {isSubscription ? (
          <NumericInput
            value={plan.cost_per_subscriber_per_month_eur}
            onChange={(val) => onUpdate(plan.id, { cost_per_subscriber_per_month_eur: val ?? 0 })}
            placeholder="0"
            step="0.01"
            className="h-8 text-sm"
          />
        ) : (
          <NumericInput
            value={plan.cost_per_buyer_eur ?? 0}
            onChange={(val) => onUpdate(plan.id, { cost_per_buyer_eur: val })}
            placeholder="0"
            step="0.01"
            className="h-8 text-sm"
            allowNull
          />
        )}
        <span className="text-[10px] text-muted-foreground">
          {currency}/{isSubscription ? 'подписчика' : 'покупателя'}
        </span>
      </TableCell>

      {/* Free plan checkbox (subscription only) */}
      <TableCell className="min-w-[80px]">
        {isSubscription ? (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={plan.is_free_plan}
              onCheckedChange={handleFreePlanChange}
            />
            <span className="text-xs">Free</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>

      {/* Delete */}
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(plan.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});
