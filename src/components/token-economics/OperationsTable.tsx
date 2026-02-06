import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cpu } from "lucide-react";

interface OperationSummary {
  operation: string;
  provider: string;
  model: string;
  modeVariant: string;
  apiCostUsd: number;
  userPriceUsd: number;
  itCost: number;
  marginUsd: number;
}

interface OperationsTableProps {
  operations: OperationSummary[];
  currency: string;
}

export function OperationsTable({ operations, currency }: OperationsTableProps) {
  if (operations.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Cpu className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Операции не найдены. Сначала загрузите модели и сгенерируйте операции.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Cpu className="w-4 h-4 text-primary" />
          Каталог операций
        </CardTitle>
        <CardDescription>
          API cost, User price, IT cost, и маржа для каждой атомарной операции
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Операция</TableHead>
              <TableHead>Провайдер</TableHead>
              <TableHead>Модель</TableHead>
              <TableHead>Режим</TableHead>
              <TableHead className="text-right">API Cost</TableHead>
              <TableHead className="text-right">User Price</TableHead>
              <TableHead className="text-right">IT Cost</TableHead>
              <TableHead className="text-right">Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operations.map((op, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium text-xs max-w-[200px] truncate" title={op.operation}>
                  {op.operation}
                </TableCell>
                <TableCell className="text-xs">{op.provider}</TableCell>
                <TableCell className="text-xs">{op.model}</TableCell>
                <TableCell className="text-xs">{op.modeVariant}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  ${op.apiCostUsd.toFixed(6)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  ${op.userPriceUsd.toFixed(6)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs font-semibold text-primary">
                  {op.itCost.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-success">
                  ${op.marginUsd.toFixed(6)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
