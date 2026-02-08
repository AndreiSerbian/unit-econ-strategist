import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import type { CashFlowLine, LineType, LineCategory } from './types';
import { CATEGORY_LABELS } from './types';

interface AddLineDialogProps {
  onAdd: (line: Omit<CashFlowLine, 'id' | 'timelineId' | 'createdAt' | 'updatedAt'>) => void;
}

export const AddLineDialog = memo(({ onAdd }: AddLineDialogProps) => {
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
          Добавить статью
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Новая статья денежного потока</DialogTitle>
          <DialogDescription>
            Добавьте статью поступления или выбытия для ручного ввода
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input
              placeholder="Например: Консалтинг"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Тип</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={lineType === 'inflow' ? 'default' : 'outline'}
                className="gap-2"
                onClick={() => setLineType('inflow')}
              >
                <TrendingUp className="w-4 h-4" />
                Поступление
              </Button>
              <Button
                type="button"
                variant={lineType === 'outflow' ? 'destructive' : 'outline'}
                className="gap-2"
                onClick={() => setLineType('outflow')}
              >
                <TrendingDown className="w-4 h-4" />
                Выбытие
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Категория</Label>
            <Select value={category} onValueChange={(v: LineCategory) => setCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(CATEGORY_LABELS) as [LineCategory, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

AddLineDialog.displayName = 'AddLineDialog';
