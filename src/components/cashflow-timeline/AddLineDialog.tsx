import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import type { CashFlowLine, LineType, LineCategory } from './types';
import { useTranslation } from '@/i18n/useTranslation';

interface AddLineDialogProps {
  onAdd: (line: Omit<CashFlowLine, 'id' | 'timelineId' | 'createdAt' | 'updatedAt'>) => void;
}

const CATEGORY_KEYS: Record<LineCategory, string> = {
  revenue: 'cashFlowLines.catRevenue',
  cogs: 'cashFlowLines.catCogs',
  logistics: 'cashFlowLines.catLogistics',
  fees: 'cashFlowLines.catFees',
  refunds: 'cashFlowLines.catRefunds',
  marketing: 'cashFlowLines.catMarketing',
  salaries: 'cashFlowLines.catSalaries',
  rent: 'cashFlowLines.catRent',
  taxes: 'cashFlowLines.catTaxes',
  other: 'cashFlowLines.catOther',
};

const CATEGORY_ORDER: LineCategory[] = [
  'revenue',
  'cogs',
  'logistics',
  'fees',
  'refunds',
  'marketing',
  'salaries',
  'rent',
  'taxes',
  'other',
];

export const AddLineDialog = memo(({ onAdd }: AddLineDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [lineType, setLineType] = useState<LineType>('inflow');
  const [category, setCategory] = useState<LineCategory>('revenue');

  const handleSubmit = () => {
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      lineType,
      category,
      source: 'manual',
      sortOrder: 0,
      isActive: true,
    });

    setName('');
    setLineType('inflow');
    setCategory('revenue');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          {t('cashFlowLines.addLine')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('cashFlowLines.dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('cashFlowLines.dialogDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('cashFlowLines.nameLabel')}</Label>
            <Input
              placeholder={t('cashFlowLines.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('cashFlowLines.typeLabel')}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={lineType === 'inflow' ? 'default' : 'outline'}
                className="gap-2"
                onClick={() => setLineType('inflow')}
              >
                <TrendingUp className="w-4 h-4" />
                {t('cashFlowLines.typeInflow')}
              </Button>
              <Button
                type="button"
                variant={lineType === 'outflow' ? 'destructive' : 'outline'}
                className="gap-2"
                onClick={() => setLineType('outflow')}
              >
                <TrendingDown className="w-4 h-4" />
                {t('cashFlowLines.typeOutflow')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('cashFlowLines.categoryLabel')}</Label>
            <Select value={category} onValueChange={(v: LineCategory) => setCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ORDER.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(CATEGORY_KEYS[value])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('cashFlowLines.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {t('cashFlowLines.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

AddLineDialog.displayName = 'AddLineDialog';
