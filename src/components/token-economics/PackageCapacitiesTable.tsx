import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import type { TokenPackage, Operation } from "@/hooks/useTokenEconomics";

interface PackageCapacitiesTableProps {
  packages: TokenPackage[];
  operations: Operation[];
  capacitiesMatrix: Record<string, Record<string, number>>;
  currency: string;
}

export function PackageCapacitiesTable({
  packages,
  operations,
  capacitiesMatrix,
  currency,
}: PackageCapacitiesTableProps) {
  if (packages.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Пакеты не созданы. Нажмите "Создать пакеты".</p>
        </CardContent>
      </Card>
    );
  }

  const activeOperations = operations.filter((op) => op.active);

  return (
    <div className="space-y-6">
      {/* Package Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="bg-gradient-to-br from-muted/30 to-background">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                {pkg.name}
                <Badge variant="secondary">${pkg.priceUsd}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono text-primary">
                {pkg.itAmount.toLocaleString()} IT
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ${(pkg.itAmount * 0.001).toFixed(2)} value
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Capacities Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="w-4 h-4 text-primary" />
            Ёмкость пакетов по операциям
          </CardTitle>
          <CardDescription>
            Сколько раз пользователь может выполнить каждую операцию с данным пакетом
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {activeOperations.length === 0 ? (
            <p className="text-muted-foreground text-sm">Нет активных операций для расчёта ёмкости.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Операция</TableHead>
                  <TableHead className="text-right">IT Cost</TableHead>
                  {packages.map((pkg) => (
                    <TableHead key={pkg.id} className="text-right">
                      {pkg.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeOperations.slice(0, 20).map((op) => (
                  <TableRow key={op.id}>
                    <TableCell className="text-xs font-medium max-w-[180px] truncate" title={op.name}>
                      {op.name}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-primary">
                      {op.itCost.toFixed(2)}
                    </TableCell>
                    {packages.map((pkg) => {
                      const count = capacitiesMatrix[pkg.name]?.[op.name] || 0;
                      return (
                        <TableCell key={pkg.id} className="text-right font-mono text-xs font-semibold">
                          {count > 0 ? count.toLocaleString() : "—"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
