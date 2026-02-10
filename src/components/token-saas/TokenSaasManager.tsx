import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Server, Zap, Package, Layers, BarChart3, Calculator } from 'lucide-react';
import { useTokenSaas } from '@/hooks/useTokenSaas';
import { TokenEconomicsConfigCard } from './TokenEconomicsConfigCard';
import { ApiProvidersManager } from './ApiProvidersManager';
import { OperationsCatalog } from './OperationsCatalog';
import { TokenPackagesManager } from './TokenPackagesManager';
import { CompositeOperationsManager } from './CompositeOperationsManager';
import { TokenEconomicsDashboard } from './TokenEconomicsDashboard';
import { ApiPricingTable } from './ApiPricingTable';

interface TokenSaasManagerProps {
  projectId: string;
  scenarioType: string;
}

export function TokenSaasManager({ projectId, scenarioType }: TokenSaasManagerProps) {
  const {
    config,
    providers,
    models,
    packages,
    operations,
    compositeOperations,
    usageForecasts,
    loading,
    itValueUsd,
    saveConfig,
    addProvider,
    updateProvider,
    deleteProvider,
    addModel,
    updateModel,
    deleteModel,
    addPackage,
    updatePackage,
    deletePackage,
    addOperation,
    updateOperation,
    deleteOperation,
    addCompositeOperation,
    updateCompositeOperation,
    deleteCompositeOperation,
    calculateOperationMetrics,
    calculateCompositeMetrics,
    calculateScenarioMetrics,
    seedCatalog,
    generateOperations,
  } = useTokenSaas(projectId, scenarioType);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const defaultMarkups = {
    text: config?.default_text_markup || 1.5,
    image: config?.default_image_markup || 2.0,
    image_premium: config?.default_premium_markup || 2.2,
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto">
          <TabsTrigger value="dashboard" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="api_pricing" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">API Тарифы</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Настройки</span>
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <Server className="w-4 h-4" />
            <span className="hidden sm:inline">Провайдеры</span>
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Операции</span>
          </TabsTrigger>
          <TabsTrigger value="composites" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Составные</span>
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center gap-1 text-xs sm:text-sm py-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Пакеты</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <TokenEconomicsDashboard
            packages={packages}
            operations={operations}
            compositeOperations={compositeOperations}
            usageForecasts={usageForecasts}
            scenarioType={scenarioType}
            itValueUsd={itValueUsd}
            calculateScenarioMetrics={calculateScenarioMetrics}
            calculateOperationMetrics={calculateOperationMetrics}
          />
        </TabsContent>

        <TabsContent value="api_pricing" className="mt-6">
          <ApiPricingTable
            projectId={projectId}
            onToggleEnabled={async (id, enabled) => { await updateModel(id, { enabled } as any); }}
            onSeedCatalog={seedCatalog}
            onGenerateOperations={generateOperations}
            modelsCount={models.length}
          />
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <TokenEconomicsConfigCard config={config} onSave={saveConfig} />
        </TabsContent>

        <TabsContent value="providers" className="mt-6">
          <ApiProvidersManager
            providers={providers}
            models={models}
            onAddProvider={addProvider}
            onUpdateProvider={updateProvider}
            onDeleteProvider={deleteProvider}
            onAddModel={addModel}
            onUpdateModel={updateModel}
            onDeleteModel={deleteModel}
          />
        </TabsContent>

        <TabsContent value="operations" className="mt-6">
          <OperationsCatalog
            operations={operations}
            models={models}
            itValueUsd={itValueUsd}
            defaultMarkups={defaultMarkups}
            onAdd={addOperation}
            onUpdate={updateOperation}
            onDelete={deleteOperation}
            calculateMetrics={calculateOperationMetrics}
          />
        </TabsContent>

        <TabsContent value="composites" className="mt-6">
          <CompositeOperationsManager
            compositeOperations={compositeOperations}
            operations={operations}
            onAdd={addCompositeOperation}
            onUpdate={updateCompositeOperation}
            onDelete={deleteCompositeOperation}
            calculateMetrics={calculateCompositeMetrics}
            calculateOpMetrics={calculateOperationMetrics}
          />
        </TabsContent>

        <TabsContent value="packages" className="mt-6">
          <TokenPackagesManager
            packages={packages}
            scenarioType={scenarioType}
            itValueUsd={itValueUsd}
            onAdd={addPackage}
            onUpdate={updatePackage}
            onDelete={deletePackage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
