/**
 * Checks Table - Full list of consistency checks with status
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import type { ConsistencyCheckResult } from '@/utils/metricAnalysis';

interface ChecksTableProps {
  checks: ConsistencyCheckResult[];
  showOnlyProblems?: boolean;
}

const statusConfig = {
  ok: { 
    icon: <CheckCircle2 className="h-4 w-4" />, 
    label: 'ОК', 
    variant: 'default' as const,
    className: 'bg-green-500/10 text-green-700 border-green-500/30'
  },
  warning: { 
    icon: <AlertTriangle className="h-4 w-4" />, 
    label: 'Внимание', 
    variant: 'secondary' as const,
    className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30'
  },
  contradiction: { 
    icon: <XCircle className="h-4 w-4" />, 
    label: 'Проблема', 
    variant: 'destructive' as const,
    className: 'bg-red-500/10 text-red-700 border-red-500/30'
  },
  missing: { 
    icon: <HelpCircle className="h-4 w-4" />, 
    label: 'Нет данных', 
    variant: 'outline' as const,
    className: 'bg-muted text-muted-foreground'
  }
};

export function ChecksTable({ checks, showOnlyProblems = false }: ChecksTableProps) {
  const filteredChecks = showOnlyProblems 
    ? checks.filter(c => c.status !== 'ok')
    : checks;

  const sortedChecks = [...filteredChecks].sort((a, b) => {
    const order = { contradiction: 0, warning: 1, missing: 2, ok: 3 };
    return order[a.status] - order[b.status];
  });

  if (sortedChecks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {showOnlyProblems ? 'Проблем не обнаружено' : 'Нет данных для анализа'}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Результаты проверок</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-700">
              {checks.filter(c => c.status === 'ok').length} ОК
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700">
              {checks.filter(c => c.status === 'warning').length} ⚠
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-700">
              {checks.filter(c => c.status === 'contradiction').length} ✗
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Статус</TableHead>
              <TableHead className="w-[180px]">Проверка</TableHead>
              <TableHead>Результат</TableHead>
              <TableHead className="w-[100px] text-right">Значение</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedChecks.map((check) => {
              const config = statusConfig[check.status];
              return (
                <TableRow key={check.relationshipId}>
                  <TableCell>
                    <Badge 
                      variant={config.variant}
                      className={`gap-1 ${config.className}`}
                    >
                      {config.icon}
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {check.relationshipId.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {check.message}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {check.currentValue !== undefined 
                      ? check.currentValue.toFixed(1)
                      : '—'
                    }
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
