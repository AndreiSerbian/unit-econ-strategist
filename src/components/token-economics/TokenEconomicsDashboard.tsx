import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Database, Cpu, Package, Calculator, Play, RefreshCw } from "lucide-react";
import {
  useTokenEconomics,
  IT_VALUE_USD,
  MARKUP_TEXT,
  MARKUP_IMAGE,
  MARKUP_IMAGE_PREMIUM,
} from "@/hooks/useTokenEconomics";
import { OperationsTable } from "./OperationsTable";
import { PackageCapacitiesTable } from "./PackageCapacitiesTable";
import { ModelsTable } from "./ModelsTable";

interface TokenEconomicsDashboardProps {
  projectId: string;
  currency?: string;
}

export function TokenEconomicsDashboard({ projectId, currency = "USD" }: TokenEconomicsDashboardProps) {
  const {
    loading,
    providers,
    textModels,
    imageModels,
    operations,
    packages,
    operationsSummary,
    packageCapacitiesMatrix,
    refresh,
    seedPricingData,
    generateOperations,
    createDefaultPackages,
    calculateCapacities,
    runFullSeed,
  } = useTokenEconomics(projectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasData = providers.length > 0 && (textModels.length > 0 || imageModels.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Token Economics Dashboard
          </CardTitle>
          <CardDescription>
            Управление моделями, операциями и пакетами токенов. IT = ${IT_VALUE_USD}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">Text Markup: {MARKUP_TEXT}x</Badge>
            <Badge variant="outline">Image Markup: {MARKUP_IMAGE}x</Badge>
            <Badge variant="outline">Premium Image: {MARKUP_IMAGE_PREMIUM}x</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {!hasData && (
              <Button onClick={runFullSeed} className="gap-2">
                <Play className="w-4 h-4" />
                Инициализировать всё
              </Button>
            )}
            <Button variant="outline" onClick={seedPricingData} className="gap-2">
              <Database className="w-4 h-4" />
              Загрузить модели
            </Button>
            <Button variant="outline" onClick={generateOperations} className="gap-2">
              <Cpu className="w-4 h-4" />
              Сгенерировать операции
            </Button>
            <Button variant="outline" onClick={createDefaultPackages} className="gap-2">
              <Package className="w-4 h-4" />
              Создать пакеты
            </Button>
            <Button variant="outline" onClick={calculateCapacities} className="gap-2">
              <Calculator className="w-4 h-4" />
              Рассчитать ёмкости
            </Button>
            <Button variant="ghost" onClick={refresh} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Обновить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{providers.length}</p>
            <p className="text-xs text-muted-foreground">Провайдеров</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{textModels.length + imageModels.length}</p>
            <p className="text-xs text-muted-foreground">Моделей</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{operations.length}</p>
            <p className="text-xs text-muted-foreground">Операций</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{packages.length}</p>
            <p className="text-xs text-muted-foreground">Пакетов</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="operations">Операции</TabsTrigger>
          <TabsTrigger value="packages">Пакеты</TabsTrigger>
          <TabsTrigger value="models">Модели</TabsTrigger>
        </TabsList>

        <TabsContent value="operations">
          <OperationsTable operations={operationsSummary} currency={currency} />
        </TabsContent>

        <TabsContent value="packages">
          <PackageCapacitiesTable
            packages={packages}
            operations={operations}
            capacitiesMatrix={packageCapacitiesMatrix}
            currency={currency}
          />
        </TabsContent>

        <TabsContent value="models">
          <ModelsTable textModels={textModels} imageModels={imageModels} currency={currency} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
