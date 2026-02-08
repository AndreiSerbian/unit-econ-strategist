import { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  TrendingUp, 
  TrendingDown, 
  Edit2, 
  Trash2, 
  Link2, 
  Pencil,
  GripVertical
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CashFlowLine, PeriodMetrics, LineType, LineCategory } from './types';
import { CATEGORY_LABELS } from './types';

interface LineWithValues extends CashFlowLine {
  values: number[];
  isManual: boolean;
}

interface CashFlowGridProps {
  lines: LineWithValues[];
  periodMetrics: PeriodMetrics[];
  currency: string;
  showPV: boolean;
  showCumulative: boolean;
  onUpdatePoint: (lineId: string, periodIndex: number, amount: number) => void;
  onDeleteLine: (lineId: string) => void;
  onEditLine: (line: CashFlowLine) => void;
}

const formatNumber = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
};

const LineTypeIcon = ({ type }: { type: LineType }) => {
  return type === 'inflow' 
    ? <TrendingUp className="w-3.5 h-3.5 text-success" />
    : <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
};

const EditableCell = memo(({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: number; 
  onChange: (val: number) => void;
  disabled?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value.toString());

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    const num = parseFloat(localValue) || 0;
    if (num !== value) {
      onChange(num);
    }
  }, [localValue, value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setLocalValue(value.toString());
      setIsEditing(false);
    }
  }, [handleBlur, value]);

  if (disabled) {
    return (
      <span className="text-muted-foreground font-mono text-xs">
        {formatNumber(value)}
      </span>
    );
  }

  if (isEditing) {
    return (
      <Input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-7 w-20 text-xs font-mono"
        autoFocus
      />
    );
  }

  return (
    <button
      onClick={() => {
        setLocalValue(value.toString());
        setIsEditing(true);
      }}
      className="text-xs font-mono hover:bg-muted px-1.5 py-0.5 rounded cursor-text min-w-[50px] text-right"
    >
      {formatNumber(value)}
    </button>
  );
});

EditableCell.displayName = 'EditableCell';

export const CashFlowGrid = memo(({
  lines,
  periodMetrics,
  currency,
  showPV,
  showCumulative,
  onUpdatePoint,
  onDeleteLine,
  onEditLine,
}: CashFlowGridProps) => {
  const inflows = lines.filter(l => l.lineType === 'inflow');
  const outflows = lines.filter(l => l.lineType === 'outflow');

  const renderLineRow = (line: LineWithValues) => (
    <TableRow key={line.id} className="hover:bg-muted/30">
      <TableCell className="sticky left-0 bg-background z-10 min-w-[180px]">
        <div className="flex items-center gap-2">
          {line.isManual && <GripVertical className="w-3 h-3 text-muted-foreground" />}
          <LineTypeIcon type={line.lineType} />
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate max-w-[120px]">{line.name}</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                {CATEGORY_LABELS[line.category]}
              </Badge>
              {!line.isManual && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Link2 className="w-3 h-3 text-primary" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Связано с бизнес-моделью</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      
      {periodMetrics.map((pm, idx) => (
        <TableCell key={idx} className="text-center p-1">
          <EditableCell
            value={line.values[idx] ?? 0}
            onChange={(val) => onUpdatePoint(line.id, idx, val)}
            disabled={!line.isManual}
          />
        </TableCell>
      ))}
      
      {/* Row Total */}
      <TableCell className="text-right font-bold text-sm bg-muted/30">
        {formatNumber(line.values.reduce((s, v) => s + v, 0))}
      </TableCell>
      
      {/* Actions */}
      {line.isManual && (
        <TableCell className="sticky right-0 bg-background z-10">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEditLine(line)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDeleteLine(line.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </TableCell>
      )}
      {!line.isManual && <TableCell className="sticky right-0 bg-background z-10" />}
    </TableRow>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Денежные потоки по периодам</CardTitle>
        <CardDescription>Кликните на ячейку для редактирования (только ручные статьи)</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-20 min-w-[180px]">
                    Статья
                  </TableHead>
                  {periodMetrics.map((pm) => (
                    <TableHead key={pm.periodIndex} className="text-center min-w-[70px] text-xs">
                      {pm.periodLabel}
                    </TableHead>
                  ))}
                  <TableHead className="text-right bg-muted/30 min-w-[80px]">Итого</TableHead>
                  <TableHead className="sticky right-0 bg-background z-20 w-[70px]" />
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {/* Inflows Section */}
                {inflows.length > 0 && (
                  <>
                    <TableRow className="bg-success/5">
                      <TableCell colSpan={periodMetrics.length + 3} className="font-semibold text-success">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Поступления
                        </div>
                      </TableCell>
                    </TableRow>
                    {inflows.map(renderLineRow)}
                    <TableRow className="bg-success/10 font-semibold">
                      <TableCell className="sticky left-0 bg-success/10 z-10">
                        Итого поступления
                      </TableCell>
                      {periodMetrics.map((pm) => (
                        <TableCell key={pm.periodIndex} className="text-center text-sm text-success">
                          {formatNumber(pm.totalInflow)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-success bg-success/20">
                        {formatNumber(periodMetrics.reduce((s, m) => s + m.totalInflow, 0))}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </>
                )}

                {/* Outflows Section */}
                {outflows.length > 0 && (
                  <>
                    <TableRow className="bg-destructive/5">
                      <TableCell colSpan={periodMetrics.length + 3} className="font-semibold text-destructive">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4" />
                          Выбытия
                        </div>
                      </TableCell>
                    </TableRow>
                    {outflows.map(renderLineRow)}
                    <TableRow className="bg-destructive/10 font-semibold">
                      <TableCell className="sticky left-0 bg-destructive/10 z-10">
                        Итого выбытия
                      </TableCell>
                      {periodMetrics.map((pm) => (
                        <TableCell key={pm.periodIndex} className="text-center text-sm text-destructive">
                          {formatNumber(pm.totalOutflow)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-destructive bg-destructive/20">
                        {formatNumber(periodMetrics.reduce((s, m) => s + m.totalOutflow, 0))}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </>
                )}

                {/* Net Cash Flow Row */}
                <TableRow className="bg-primary/10 font-bold">
                  <TableCell className="sticky left-0 bg-primary/10 z-10">
                    Чистый денежный поток
                  </TableCell>
                  {periodMetrics.map((pm) => (
                    <TableCell 
                      key={pm.periodIndex} 
                      className={`text-center text-sm ${pm.netCashFlow >= 0 ? 'text-primary' : 'text-destructive'}`}
                    >
                      {formatNumber(pm.netCashFlow)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right bg-primary/20">
                    {formatNumber(periodMetrics.reduce((s, m) => s + m.netCashFlow, 0))}
                  </TableCell>
                  <TableCell />
                </TableRow>

                {/* Cumulative Row */}
                {showCumulative && (
                  <TableRow className="bg-muted/50">
                    <TableCell className="sticky left-0 bg-muted/50 z-10 text-muted-foreground">
                      Накопительный CF
                    </TableCell>
                    {periodMetrics.map((pm) => (
                      <TableCell 
                        key={pm.periodIndex} 
                        className={`text-center text-xs ${pm.cumulativeCashFlow >= 0 ? 'text-primary' : 'text-destructive'}`}
                      >
                        {formatNumber(pm.cumulativeCashFlow)}
                      </TableCell>
                    ))}
                    <TableCell />
                    <TableCell />
                  </TableRow>
                )}

                {/* Present Value Row */}
                {showPV && (
                  <TableRow className="bg-accent/10">
                    <TableCell className="sticky left-0 bg-accent/10 z-10 text-muted-foreground">
                      Приведённая стоимость (PV)
                    </TableCell>
                    {periodMetrics.map((pm) => (
                      <TableCell 
                        key={pm.periodIndex} 
                        className={`text-center text-xs ${pm.presentValue >= 0 ? 'text-accent-foreground' : 'text-destructive'}`}
                      >
                        {formatNumber(pm.presentValue)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right text-xs bg-accent/20">
                      {formatNumber(periodMetrics.reduce((s, m) => s + m.presentValue, 0))}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

CashFlowGrid.displayName = 'CashFlowGrid';
