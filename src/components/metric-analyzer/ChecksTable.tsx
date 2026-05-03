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
import { useTranslation } from '@/i18n/useTranslation';

interface ChecksTableProps {
  checks: ConsistencyCheckResult[];
  showOnlyProblems?: boolean;
}

function buildStatusConfig(t: (k: string) => string) {
  return {
    ok: { 
      icon: <CheckCircle2 className="h-4 w-4" />, 
      label: t('metricAnalyzer.statusOk'), 
      variant: 'default' as const,
      className: 'bg-green-500/10 text-green-700 border-green-500/30'
    },
    warning: { 
      icon: <AlertTriangle className="h-4 w-4" />, 
      label: t('metricAnalyzer.statusWarning'), 
      variant: 'secondary' as const,
      className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30'
    },
    contradiction: { 
      icon: <XCircle className="h-4 w-4" />, 
      label: t('metricAnalyzer.statusContradiction'), 
      variant: 'destructive' as const,
      className: 'bg-red-500/10 text-red-700 border-red-500/30'
    },
    missing: { 
      icon: <HelpCircle className="h-4 w-4" />, 
      label: t('metricAnalyzer.statusMissing'), 
      variant: 'outline' as const,
      className: 'bg-muted text-muted-foreground'
    }
  };
}

export function ChecksTable({ checks, showOnlyProblems = false }: ChecksTableProps) {
  const { t } = useTranslation();
  const statusConfig = buildStatusConfig(t);
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
          {showOnlyProblems ? t('metricAnalyzer.noProblems') : t('metricAnalyzer.noData')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>{t('metricAnalyzer.checksTitle')}</span>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="bg-green-500/10 text-green-700 text-xs">
              {checks.filter(c => c.status === 'ok').length} {t('metricAnalyzer.statusOk')}
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 text-xs">
              {checks.filter(c => c.status === 'warning').length} ⚠
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-700 text-xs">
              {checks.filter(c => c.status === 'contradiction').length} ✗
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile: Card-based layout */}
        <div className="block sm:hidden space-y-3">
          {sortedChecks.map((check) => {
            const config = statusConfig[check.status];
            return (
              <div key={check.relationshipId} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge 
                    variant={config.variant}
                    className={`gap-1 text-xs ${config.className}`}
                  >
                    {config.icon}
                    {config.label}
                  </Badge>
                  <span className="font-mono text-sm">
                    {check.currentValue !== undefined 
                      ? check.currentValue.toFixed(1)
                      : '—'
                    }
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-foreground break-words">
                  {check.relationshipId.replace(/_/g, ' ')}
                </p>
                <p className="text-sm">
                  {check.message}
                </p>
              </div>
            );
          })}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">{t('metricAnalyzer.colStatus')}</TableHead>
                <TableHead className="w-[180px]">{t('metricAnalyzer.colCheck')}</TableHead>
                <TableHead>{t('metricAnalyzer.colResult')}</TableHead>
                <TableHead className="w-[100px] text-right">{t('metricAnalyzer.colValue')}</TableHead>
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
        </div>
      </CardContent>
    </Card>
  );
}
