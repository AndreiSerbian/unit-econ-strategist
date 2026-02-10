import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  ApiProvider,
  ApiModel,
  TokenPackage,
  OperationCatalogItem,
  CompositeOperation,
  CompositeOperationItem,
  TokenEconomicsConfig,
  OperationUsageForecast,
  DEFAULT_MARKUPS,
} from '@/components/token-saas/types';

export function useTokenSaas(projectId: string | undefined, scenarioType: string = 'current') {
  const { toast } = useToast();
  
  // State
  const [config, setConfig] = useState<TokenEconomicsConfig | null>(null);
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [models, setModels] = useState<ApiModel[]>([]);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [operations, setOperations] = useState<OperationCatalogItem[]>([]);
  const [compositeOperations, setCompositeOperations] = useState<CompositeOperation[]>([]);
  const [usageForecasts, setUsageForecasts] = useState<OperationUsageForecast[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchAll = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);

    try {
      // Fetch config
      const { data: configData } = await supabase
        .from('token_economics_config')
        .select('*')
        .eq('project_id', projectId)
        .single();
      
      setConfig(configData as TokenEconomicsConfig | null);

      // Fetch providers
      const { data: providersData } = await supabase
        .from('api_providers')
        .select('*')
        .eq('project_id', projectId)
        .order('name');
      
      setProviders((providersData as ApiProvider[]) || []);

      // Fetch models with provider info and pricing
      const { data: modelsData } = await supabase
        .from('api_models')
        .select('*, provider:api_providers(*), pricing_text:model_pricing_text(*), pricing_image:model_pricing_image(*)')
        .eq('project_id', projectId)
        .order('model_name');
      
      setModels((modelsData as ApiModel[]) || []);

      // Fetch packages for current scenario
      const { data: packagesData } = await supabase
        .from('token_packages')
        .select('*')
        .eq('project_id', projectId)
        .eq('scenario_type', scenarioType)
        .order('sort_order');
      
      setPackages((packagesData as TokenPackage[]) || []);

      // Fetch operations
      const { data: opsData } = await supabase
        .from('operations_catalog')
        .select('*, api_model:api_models(*)')
        .eq('project_id', projectId)
        .order('operation_code');
      
      setOperations((opsData as OperationCatalogItem[]) || []);

      // Fetch composite operations with items
      const { data: compositeData } = await supabase
        .from('composite_operations')
        .select('*')
        .eq('project_id', projectId)
        .order('name');

      if (compositeData) {
        // Fetch items for each composite
        const composites = await Promise.all(
          (compositeData as CompositeOperation[]).map(async (comp) => {
            const { data: items } = await supabase
              .from('composite_operation_items')
              .select('*, operation:operations_catalog(*)')
              .eq('composite_id', comp.id);
            
            return {
              ...comp,
              items: (items as CompositeOperationItem[]) || [],
            };
          })
        );
        setCompositeOperations(composites);
      }

      // Fetch usage forecasts
      const { data: forecastData } = await supabase
        .from('operation_usage_forecast')
        .select('*')
        .eq('project_id', projectId)
        .eq('scenario_type', scenarioType);
      
      setUsageForecasts((forecastData as OperationUsageForecast[]) || []);

    } catch (error) {
      console.error('Error fetching token saas data:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить данные Token SaaS',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, scenarioType, toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ============ CONFIG ============
  const saveConfig = useCallback(async (data: Partial<TokenEconomicsConfig>) => {
    if (!projectId) return;

    try {
      if (config) {
        const { error } = await supabase
          .from('token_economics_config')
          .update(data)
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('token_economics_config')
          .insert({ project_id: projectId, ...data });
        if (error) throw error;
      }
      await fetchAll();
      toast({ title: 'Настройки сохранены' });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({ title: 'Ошибка сохранения', variant: 'destructive' });
    }
  }, [projectId, config, fetchAll, toast]);

  // ============ PROVIDERS ============
  const addProvider = useCallback(async (data: Omit<ApiProvider, 'id' | 'project_id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('api_providers')
        .insert({ project_id: projectId, ...data });
      if (error) throw error;
      await fetchAll();
      toast({ title: 'Провайдер добавлен' });
    } catch (error) {
      console.error('Error adding provider:', error);
      toast({ title: 'Ошибка добавления', variant: 'destructive' });
    }
  }, [projectId, fetchAll, toast]);

  const updateProvider = useCallback(async (id: string, data: Partial<ApiProvider>) => {
    try {
      const { error } = await supabase
        .from('api_providers')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      await fetchAll();
    } catch (error) {
      console.error('Error updating provider:', error);
      toast({ title: 'Ошибка обновления', variant: 'destructive' });
    }
  }, [fetchAll, toast]);

  const deleteProvider = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_providers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast({ title: 'Провайдер удалён' });
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({ title: 'Ошибка удаления', variant: 'destructive' });
    }
  }, [fetchAll, toast]);

  // ============ MODELS ============
  const addModel = useCallback(async (data: Omit<ApiModel, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'provider'>) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('api_models')
        .insert({ project_id: projectId, ...data });
      if (error) throw error;
      await fetchAll();
      toast({ title: 'Модель добавлена' });
    } catch (error) {
      console.error('Error adding model:', error);
      toast({ title: 'Ошибка добавления', variant: 'destructive' });
    }
  }, [projectId, fetchAll, toast]);

  const updateModel = useCallback(async (id: string, data: Partial<ApiModel>) => {
    try {
      const { error } = await supabase
        .from('api_models')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      await fetchAll();
    } catch (error) {
      console.error('Error updating model:', error);
      toast({ title: 'Ошибка обновления', variant: 'destructive' });
    }
  }, [fetchAll, toast]);

  const deleteModel = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_models')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast({ title: 'Модель удалена' });
    } catch (error) {
      console.error('Error deleting model:', error);
      toast({ title: 'Ошибка удаления', variant: 'destructive' });
    }
  }, [fetchAll, toast]);

  // ============ PACKAGES ============
  const addPackage = useCallback(async (data: Omit<TokenPackage, 'id' | 'project_id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('token_packages')
        .insert({ project_id: projectId, ...data });
      if (error) throw error;
      await fetchAll();
      toast({ title: 'Пакет добавлен' });
    } catch (error) {
      console.error('Error adding package:', error);
      toast({ title: 'Ошибка добавления', variant: 'destructive' });
    }
  }, [projectId, fetchAll, toast]);

  const updatePackage = useCallback(async (id: string, data: Partial<TokenPackage>) => {
    try {
      const { error } = await supabase
        .from('token_packages')
        .update(data)
        .eq('id', id);
      if (error) throw error;
      await fetchAll();
    } catch (error) {
      console.error('Error updating package:', error);
      toast({ title: 'Ошибка обновления', variant: 'destructive' });
    }
  }, [fetchAll, toast]);

  const deletePackage = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('token_packages')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast({ title: 'Пакет удалён' });
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({ title: 'Ошибка удаления', variant: 'destructive' });
    }
  }, [fetchAll, toast]);

  // ============ OPERATIONS ============
  const addOperation = useCallback(async (data: Omit<OperationCatalogItem, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'base_it_cost' | 'api_model'>) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('operations_catalog')
        .insert({ project_id: projectId, ...data });
      if (error) throw error;
      await fetchAll();
      toast({ title: 'Операция добавлена' });
    } catch (error) {
      console.error('Error adding operation:', error);
      toast({ title: 'Ошибка добавления', variant: 'destructive' });
    }
  }, [projectId, fetchAll, toast]);

  const updateOperation = useCallback(async (id: string, data: Partial<OperationCatalogItem>) => {
    try {
      // Remove computed/joined fields
      const { base_it_cost, api_model, ...updateData } = data as any;
      const { error } = await supabase
        .from('operations_catalog')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
      await fetchAll();
    } catch (error) {
      console.error('Error updating operation:', error);
      toast({ title: 'Ошибка обновления', variant: 'destructive' });
    }
  }, [fetchAll, toast]);

  const deleteOperation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('operations_catalog')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast({ title: 'Операция удалена' });
    } catch (error) {
      console.error('Error deleting operation:', error);
      toast({ title: 'Ошибка удаления', variant: 'destructive' });
    }
  }, [fetchAll, toast]);

  // ============ COMPOSITE OPERATIONS ============
  const addCompositeOperation = useCallback(async (
    data: Omit<CompositeOperation, 'id' | 'project_id' | 'created_at' | 'updated_at' | 'items' | 'total_it_cost' | 'total_api_cost' | 'total_user_price' | 'total_margin'>,
    items: Array<{ operation_id: string; quantity: number }>
  ) => {
    if (!projectId) return;

    try {
      const { data: composite, error } = await supabase
        .from('composite_operations')
        .insert({ project_id: projectId, ...data })
        .select()
        .single();
      if (error) throw error;

      // Add items
      if (items.length > 0 && composite) {
        const { error: itemsError } = await supabase
          .from('composite_operation_items')
          .insert(items.map(item => ({
            composite_id: composite.id,
            operation_id: item.operation_id,
            quantity: item.quantity,
          })));
        if (itemsError) throw itemsError;
      }

      await fetchAll();
      toast({ title: 'Составная операция создана' });
    } catch (error) {
      console.error('Error adding composite:', error);
      toast({ title: 'Ошибка добавления', variant: 'destructive' });
    }
  }, [projectId, fetchAll, toast]);

  const updateCompositeOperation = useCallback(async (
    id: string,
    data: Partial<CompositeOperation>,
    items?: Array<{ operation_id: string; quantity: number }>
  ) => {
    try {
      const { items: _, ...updateData } = data as any;
      const { error } = await supabase
        .from('composite_operations')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;

      // Replace items if provided
      if (items) {
        await supabase
          .from('composite_operation_items')
          .delete()
          .eq('composite_id', id);
        
        if (items.length > 0) {
          const { error: itemsError } = await supabase
            .from('composite_operation_items')
            .insert(items.map(item => ({
              composite_id: id,
              operation_id: item.operation_id,
              quantity: item.quantity,
            })));
          if (itemsError) throw itemsError;
        }
      }

      await fetchAll();
    } catch (error) {
      console.error('Error updating composite:', error);
      toast({ title: 'Ошибка обновления', variant: 'destructive' });
    }
  }, [fetchAll, toast]);

  const deleteCompositeOperation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('composite_operations')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchAll();
      toast({ title: 'Составная операция удалена' });
    } catch (error) {
      console.error('Error deleting composite:', error);
      toast({ title: 'Ошибка удаления', variant: 'destructive' });
    }
  }, [fetchAll, toast]);

  // ============ USAGE FORECASTS ============
  const updateUsageForecast = useCallback(async (
    operationId: string | null,
    compositeId: string | null,
    expectedUsage: number
  ) => {
    if (!projectId) return;

    try {
      const existing = usageForecasts.find(f => 
        f.operation_id === operationId && 
        f.composite_id === compositeId &&
        f.scenario_type === scenarioType
      );

      if (existing) {
        const { error } = await supabase
          .from('operation_usage_forecast')
          .update({ expected_usage: expectedUsage })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('operation_usage_forecast')
          .insert({
            project_id: projectId,
            operation_id: operationId,
            composite_id: compositeId,
            scenario_type: scenarioType,
            expected_usage: expectedUsage,
          });
        if (error) throw error;
      }

      await fetchAll();
    } catch (error) {
      console.error('Error updating forecast:', error);
      toast({ title: 'Ошибка обновления прогноза', variant: 'destructive' });
    }
  }, [projectId, scenarioType, usageForecasts, fetchAll, toast]);

  // ============ CALCULATIONS ============
  const itValueUsd = config?.it_value_usd || 0.001;

  const calculateOperationMetrics = useCallback((op: OperationCatalogItem) => {
    const userPriceUsd = op.api_cost_usd * op.markup_multiplier;
    const marginUsd = userPriceUsd - op.api_cost_usd;
    const marginPercent = op.api_cost_usd > 0 ? (marginUsd / userPriceUsd) * 100 : 0;
    const itCost = op.base_it_cost;

    return { userPriceUsd, marginUsd, marginPercent, itCost };
  }, []);

  const calculateCompositeMetrics = useCallback((composite: CompositeOperation) => {
    let totalApiCost = 0;
    let totalUserPrice = 0;
    let totalItCost = 0;

    (composite.items || []).forEach(item => {
      if (item.operation) {
        const opMetrics = calculateOperationMetrics(item.operation);
        totalApiCost += item.operation.api_cost_usd * item.quantity;
        totalUserPrice += opMetrics.userPriceUsd * item.quantity;
        totalItCost += opMetrics.itCost * item.quantity;
      }
    });

    const totalMargin = totalUserPrice - totalApiCost;

    return { totalApiCost, totalUserPrice, totalItCost, totalMargin };
  }, [calculateOperationMetrics]);

  const calculateScenarioMetrics = useCallback(() => {
    // Package revenue
    const totalPackageRevenue = packages.reduce((sum, pkg) => 
      sum + (pkg.price_usd * pkg.expected_sales), 0);
    const totalITSold = packages.reduce((sum, pkg) => 
      sum + (pkg.it_amount * pkg.expected_sales), 0);

    // Operations cost (from usage forecasts)
    let totalOperationsApiCost = 0;
    let totalOperationsUserPrice = 0;
    let totalITConsumed = 0;

    usageForecasts.forEach(forecast => {
      if (forecast.operation_id) {
        const op = operations.find(o => o.id === forecast.operation_id);
        if (op) {
          const metrics = calculateOperationMetrics(op);
          totalOperationsApiCost += op.api_cost_usd * forecast.expected_usage;
          totalOperationsUserPrice += metrics.userPriceUsd * forecast.expected_usage;
          totalITConsumed += metrics.itCost * forecast.expected_usage;
        }
      }
      if (forecast.composite_id) {
        const comp = compositeOperations.find(c => c.id === forecast.composite_id);
        if (comp) {
          const metrics = calculateCompositeMetrics(comp);
          totalOperationsApiCost += metrics.totalApiCost * forecast.expected_usage;
          totalOperationsUserPrice += metrics.totalUserPrice * forecast.expected_usage;
          totalITConsumed += metrics.totalItCost * forecast.expected_usage;
        }
      }
    });

    const platformProfit = totalPackageRevenue - totalOperationsApiCost;
    const itUtilizationPercent = totalITSold > 0 ? (totalITConsumed / totalITSold) * 100 : 0;

    return {
      totalPackageRevenue,
      totalITSold,
      totalOperationsApiCost,
      totalOperationsUserPrice,
      totalITConsumed,
      platformProfit,
      itUtilizationPercent,
    };
  }, [packages, usageForecasts, operations, compositeOperations, calculateOperationMetrics, calculateCompositeMetrics]);

  // ============ CATALOG FUNCTIONS ============
  const seedCatalog = useCallback(async () => {
    if (!projectId) return;
    try {
      const { error } = await supabase.rpc('seed_reference_catalog', { p_project_id: projectId });
      if (error) throw error;
      await fetchAll();
      toast({ title: 'Каталог загружен', description: 'Провайдеры и модели добавлены' });
    } catch (error) {
      console.error('Error seeding catalog:', error);
      toast({ title: 'Ошибка загрузки каталога', variant: 'destructive' });
    }
  }, [projectId, fetchAll, toast]);

  const generateOperations = useCallback(async () => {
    if (!projectId) return;
    try {
      const { data, error } = await supabase.rpc('generate_token_operations', { p_project_id: projectId });
      if (error) throw error;
      await fetchAll();
      toast({ title: 'Операции сгенерированы', description: `${data} операций обновлено` });
    } catch (error) {
      console.error('Error generating operations:', error);
      toast({ title: 'Ошибка генерации операций', variant: 'destructive' });
    }
  }, [projectId, fetchAll, toast]);

  return {
    // State
    config,
    providers,
    models,
    packages,
    operations,
    compositeOperations,
    usageForecasts,
    loading,
    itValueUsd,

    // Actions
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
    updateUsageForecast,
    seedCatalog,
    generateOperations,
    refetch: fetchAll,

    // Calculations
    calculateOperationMetrics,
    calculateCompositeMetrics,
    calculateScenarioMetrics,
  };
}
