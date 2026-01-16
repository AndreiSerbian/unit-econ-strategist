import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExpenseCategory {
  id: string;
  name: string;
  value: number;
  isCustom: boolean;
}

export interface DetailedExpenses {
  fixedCosts: {
    salaryOldClients: number;
    salaryNewClients: number;
    officeRent: number;
    warehouseRent: number;
    managementSalary: number;
    marketingSalary: number;
    productionSalary: number;
    internet: number;
    communication: number;
    banking: number;
    subscriptions: number;
    utilities: number;
    customCategories: ExpenseCategory[];
  };
  variableCosts: {
    marketing: {
      trafficPurchase: number;
      contractorsPayment: number;
      crmCosts: number;
      customCategories: ExpenseCategory[];
    };
    salesPayroll: {
      bonusOldClients: number;
      bonusNewClients: number;
      customCategories: ExpenseCategory[];
    };
    production: {
      materials: number;
      curators: number;
      logistics: number;
      partnersPercent: number;
      equipmentRepair: number;
      customCategories: ExpenseCategory[];
    };
    other: {
      customCategories: ExpenseCategory[];
    };
  };
  taxRate: number;
  taxes: number;
}

interface LeadSource {
  id: string;
  name: string;
  type: "paid" | "organic" | "referral" | "direct";
  leads: number;
  cost: number;
}

interface Metrics {
  revenue: number;
  totalClients: number;
  newClients: number;
  returningClients: number;
  conversionRate: number;
  avgCheck: number;
  fixedCosts: number;
  variableCosts: number;
  marketingCosts: number;
  detailedExpenses?: DetailedExpenses;
  customerLifetimeMonths?: number;
  purchaseFrequency?: number;
  ltv?: number;
  churnRate?: number;
  retentionRate?: number;
  paybackMonths?: number;
  totalLeads?: number;
  leadSources?: LeadSource[];
  marketShare?: number;
  quality?: number;
}

export type { Metrics, CompetitorProduct, Competitor, Product, LeadSource };

interface CompetitorProduct {
  id: string;
  name: string;
  price: number;
  annualSales: number;
  annualRevenue: number;
  salesChannels: string[];
}

interface Competitor {
  id: string;
  name: string;
  revenue: number;
  marketShare: number;
  pricing: number;
  quality: number;
  marketingSpend: number;
  products: CompetitorProduct[];
  totalClients?: number;
  newClients?: number;
  returningClients?: number;
  conversionRate?: number;
  avgCheck?: number;
  fixedCosts?: number;
  variableCosts?: number;
  detailedExpenses?: DetailedExpenses;
  customerLifetimeMonths?: number;
  purchaseFrequency?: number;
  ltv?: number;
  churnRate?: number;
  retentionRate?: number;
  paybackMonths?: number;
  // Lead sources
  leadSources?: LeadSource[];
  totalLeads?: number;
  // Logistics
  logisticsMaterials?: number;
  logisticsProducts?: number;
  logisticsWarehouse?: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  quality?: number;          // quality rating (1-20)
  logisticsToClientPerUnit?: number;
  // Extended logistics fields
  weightPerUnit?: number;    // weight per unit (kg)
  volumePerUnit?: number;    // volume per unit (m³)
  deliveryType?: 'courier' | 'pickup' | 'transport_company' | 'own_delivery';
}

// Sales Channels types
export interface SalesChannel {
  id: string;
  name: string;
  type: 'website' | 'marketplace' | 'distributor' | 'retail' | 'agent' | 'direct_b2b' | 'franchise' | 'export';
  commissionPercent: number;
  fulfillmentCostPerUnit: number;
  logisticsCostPerUnit: number;
  returnRatePercent: number;
  paymentDelayDays: number;
  minOrderQuantity?: number;
  discountPercent?: number;
}

export interface ProductChannelAllocation {
  id: string;
  productId: string;
  channelId: string;
  quantity: number;
  priceOverride?: number;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  logisticsToProductionPerUnit?: number;
  // Extended logistics fields
  weight?: number;           // weight per unit (kg)
  volume?: number;           // volume per unit (m³)
  transportType?: 'auto' | 'rail' | 'air' | 'sea' | 'local';
  distance?: number;         // distance (km)
}

export interface ProductMaterialUsage {
  id: string;
  productId: string;
  materialId: string;
  quantityPerUnit: number;
}

export interface LogisticsTariffsData {
  auto: { perKgKm: number; perM3Km: number; baseRate: number };
  rail: { perKgKm: number; perM3Km: number; baseRate: number };
  air: { perKgKm: number; perM3Km: number; baseRate: number };
  sea: { perKgKm: number; perM3Km: number; baseRate: number };
  local: { perKgKm: number; perM3Km: number; baseRate: number };
  courier: { perKg: number; perM3: number; baseRate: number };
  pickup: { perKg: number; perM3: number; baseRate: number };
  transport_company: { perKg: number; perM3: number; baseRate: number };
  own_delivery: { perKg: number; perM3: number; baseRate: number };
}

const initialDetailedExpenses: DetailedExpenses = {
  fixedCosts: {
    salaryOldClients: 0,
    salaryNewClients: 0,
    officeRent: 0,
    warehouseRent: 0,
    managementSalary: 0,
    marketingSalary: 0,
    productionSalary: 0,
    internet: 0,
    communication: 0,
    banking: 0,
    subscriptions: 0,
    utilities: 0,
    customCategories: [],
  },
  variableCosts: {
    marketing: {
      trafficPurchase: 0,
      contractorsPayment: 0,
      crmCosts: 0,
      customCategories: [],
    },
    salesPayroll: {
      bonusOldClients: 0,
      bonusNewClients: 0,
      customCategories: [],
    },
    production: {
      materials: 0,
      curators: 0,
      logistics: 0,
      partnersPercent: 0,
      equipmentRepair: 0,
      customCategories: [],
    },
    other: {
      customCategories: [],
    },
  },
  taxRate: 15,
  taxes: 0,
};

const initialMetrics: Metrics = {
  revenue: 0,
  totalClients: 0,
  newClients: 0,
  returningClients: 0,
  conversionRate: 0,
  avgCheck: 0,
  fixedCosts: 0,
  variableCosts: 0,
  marketingCosts: 0,
  detailedExpenses: initialDetailedExpenses,
};

const STORAGE_KEY_PREFIX = "unit-economics-project";

const getStorageKey = (userId?: string) => 
  userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX;

const loadFromLocalStorage = (userId?: string) => {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
  return null;
};

const saveToLocalStorage = (data: any, userId?: string) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify({
      ...data,
      lastModified: Date.now()
    }));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

// Очистка меток сохранения в localStorage после успешного сохранения в облако
const markAsSavedToCloud = (userId?: string) => {
  try {
    const stored = loadFromLocalStorage(userId);
    if (stored) {
      saveToLocalStorage({
        ...stored,
        lastCloudSync: Date.now()
      }, userId);
    }
  } catch (error) {
    console.error("Error marking as saved:", error);
  }
};

export const useProject = (userId: string | undefined) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<Metrics>(initialMetrics);
  const [scenarioA, setScenarioA] = useState<Metrics>(initialMetrics);
  const [scenarioB, setScenarioB] = useState<Metrics>(initialMetrics);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [productMaterials, setProductMaterials] = useState<ProductMaterialUsage[]>([]);
  const [currency, setCurrency] = useState<string>("RUB");
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialLoad = useRef(true);
  const [logisticsTariffs, setLogisticsTariffs] = useState<LogisticsTariffsData>({
    auto: { perKgKm: 0.05, perM3Km: 50, baseRate: 500 },
    rail: { perKgKm: 0.02, perM3Km: 30, baseRate: 1000 },
    air: { perKgKm: 0.5, perM3Km: 500, baseRate: 2000 },
    sea: { perKgKm: 0.01, perM3Km: 20, baseRate: 3000 },
    local: { perKgKm: 0.1, perM3Km: 100, baseRate: 200 },
    courier: { perKg: 50, perM3: 500, baseRate: 300 },
    pickup: { perKg: 0, perM3: 0, baseRate: 0 },
    transport_company: { perKg: 30, perM3: 300, baseRate: 500 },
    own_delivery: { perKg: 20, perM3: 200, baseRate: 150 },
  });
  const [salesChannels, setSalesChannels] = useState<SalesChannel[]>([]);
  const [productChannelAllocations, setProductChannelAllocations] = useState<ProductChannelAllocation[]>([]);

  // Предупреждение при закрытии страницы с несохранёнными изменениями
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && userId) {
        e.preventDefault();
        e.returnValue = 'У вас есть несохранённые изменения. Вы уверены, что хотите покинуть страницу?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, userId]);

  // Восстановление данных из localStorage при загрузке
  const restoreFromLocalStorage = useCallback((stored: any) => {
    if (stored) {
      if (stored.currentMetrics) setCurrentMetrics(stored.currentMetrics);
      if (stored.scenarioA) setScenarioA(stored.scenarioA);
      if (stored.scenarioB) setScenarioB(stored.scenarioB);
      if (stored.competitors) setCompetitors(stored.competitors);
      if (stored.products) setProducts(stored.products);
      if (stored.materials) setMaterials(stored.materials);
      if (stored.productMaterials) setProductMaterials(stored.productMaterials);
      if (stored.currency) setCurrency(stored.currency);
      if (stored.logisticsTariffs) setLogisticsTariffs(stored.logisticsTariffs);
      if (stored.salesChannels) setSalesChannels(stored.salesChannels);
      if (stored.productChannelAllocations) setProductChannelAllocations(stored.productChannelAllocations);
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadFromLocalStorage(userId);
    if (stored) {
      restoreFromLocalStorage(stored);
    }
    // Помечаем что начальная загрузка завершена после небольшой задержки
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    if (userId) {
      loadProject();
    }
  }, [userId]);

  // Auto-save to localStorage when data changes (ВСЕГДА, независимо от авторизации)
  useEffect(() => {
    // Пропускаем автосохранение при начальной загрузке
    if (isInitialLoad.current) return;
    
    saveToLocalStorage({
      currentMetrics,
      scenarioA,
      scenarioB,
      competitors,
      products,
      materials,
      productMaterials,
      currency,
      logisticsTariffs,
      salesChannels,
      productChannelAllocations,
    }, userId);
    
    // Отмечаем что есть несохранённые изменения (только для авторизованных)
    if (userId) {
      setHasUnsavedChanges(true);
    }
  }, [currentMetrics, scenarioA, scenarioB, competitors, products, materials, productMaterials, currency, logisticsTariffs, salesChannels, productChannelAllocations, userId]);

  // Сохранение в облако для авторизованных пользователей
  const saveAllToCloud = useCallback(async (showToast = true) => {
    if (!projectId || !userId) return;
    
    setIsSaving(true);
    try {
      // Сохраняем все три сценария
      const scenarios = [
        { type: 'current', data: currentMetrics },
        { type: 'scenarioA', data: scenarioA },
        { type: 'scenarioB', data: scenarioB },
      ];

      for (const scenario of scenarios) {
        await supabase.from("scenarios").upsert(
          {
            project_id: projectId,
            scenario_type: scenario.type,
            revenue: scenario.data.revenue,
            total_clients: scenario.data.totalClients,
            new_clients: scenario.data.newClients,
            returning_clients: scenario.data.returningClients,
            conversion_rate: scenario.data.conversionRate,
            avg_check: scenario.data.avgCheck,
            fixed_costs: scenario.data.fixedCosts,
            variable_costs: scenario.data.variableCosts,
            marketing_costs: scenario.data.marketingCosts,
          },
          { onConflict: 'project_id,scenario_type' }
        );
        
        // Сохраняем детализированные расходы и источники лидов
        if (scenario.data.detailedExpenses || scenario.data.leadSources) {
          await (supabase.from("detailed_expenses") as any).upsert(
            {
              project_id: projectId,
              scenario_type: scenario.type,
              expenses: scenario.data.detailedExpenses || {},
              lead_sources: scenario.data.leadSources || [],
            },
            { onConflict: 'project_id,scenario_type' }
          );
        }
      }

      // Сохраняем тарифы логистики
      await (supabase.from("logistics_tariffs") as any).upsert(
        {
          project_id: projectId,
          tariffs: logisticsTariffs,
        },
        { onConflict: 'project_id' }
      );

      // Синхронизируем каналы продаж (включая удаление)
      const { data: existingChannels } = await supabase
        .from("sales_channels")
        .select("id")
        .eq("project_id", projectId);

      const existingChannelIds = new Set(existingChannels?.map(c => c.id) || []);
      const currentChannelIds = new Set(salesChannels.map(c => c.id));

      // Удаляем каналы, которых больше нет
      for (const existingId of existingChannelIds) {
        if (!currentChannelIds.has(existingId)) {
          await supabase.from("sales_channels").delete().eq("id", existingId);
        }
      }

      // Обновляем или добавляем каналы
      for (const channel of salesChannels) {
        await (supabase.from("sales_channels") as any).upsert(
          {
            id: channel.id,
            project_id: projectId,
            name: channel.name,
            type: channel.type,
            commission_percent: channel.commissionPercent,
            fulfillment_cost_per_unit: channel.fulfillmentCostPerUnit,
            logistics_cost_per_unit: channel.logisticsCostPerUnit,
            return_rate_percent: channel.returnRatePercent,
            payment_delay_days: channel.paymentDelayDays,
            min_order_quantity: channel.minOrderQuantity || 0,
            discount_percent: channel.discountPercent || 0,
          },
          { onConflict: 'id' }
        );
      }

      // Синхронизируем продукты (включая удаление)
      const { data: existingProducts } = await supabase
        .from("products")
        .select("id")
        .eq("project_id", projectId);

      const existingProductIds = new Set(existingProducts?.map(p => p.id) || []);
      const currentProductIds = new Set(products.map(p => p.id));

      // Удаляем продукты, которых больше нет
      for (const existingId of existingProductIds) {
        if (!currentProductIds.has(existingId)) {
          await supabase.from("products").delete().eq("id", existingId);
        }
      }

      // Обновляем или добавляем продукты
      for (const product of products) {
        await supabase.from("products").upsert({
          id: product.id,
          project_id: projectId,
          name: product.name,
          price: product.price,
          cost: product.cost,
          quantity: product.quantity,
          quality: product.quality ?? 10,
          weight_per_unit: product.weightPerUnit || 0,
          volume_per_unit: product.volumePerUnit || 0,
          delivery_type: product.deliveryType || 'courier',
          logistics_to_client: product.logisticsToClientPerUnit || 0,
        }, { onConflict: 'id' });
      }

      // Синхронизируем конкурентов (включая удаление)
      const { data: existingCompetitors } = await supabase
        .from("competitors")
        .select("id")
        .eq("project_id", projectId);

      const existingCompetitorIds = new Set(existingCompetitors?.map(c => c.id) || []);
      const currentCompetitorIds = new Set(competitors.map(c => c.id));

      // Удаляем конкурентов, которых больше нет
      for (const existingId of existingCompetitorIds) {
        if (!currentCompetitorIds.has(existingId)) {
          await supabase.from("competitors").delete().eq("id", existingId);
        }
      }

      // Обновляем или добавляем конкурентов
      for (const competitor of competitors) {
        await supabase.from("competitors").upsert({
          id: competitor.id,
          project_id: projectId,
          name: competitor.name,
          revenue: competitor.revenue,
          market_share: competitor.marketShare,
          pricing: competitor.pricing,
          quality: competitor.quality,
          marketing_spend: competitor.marketingSpend,
        }, { onConflict: 'id' });
      }

      // Сохраняем сырьё (raw_materials)
      await supabase
        .from("raw_materials")
        .delete()
        .eq("project_id", projectId);
      
      if (materials.length > 0) {
        for (const material of materials) {
          await supabase.from("raw_materials").insert({
            id: material.id,
            project_id: projectId,
            name: material.name,
            price_per_unit: material.pricePerUnit,
            unit: material.unit,
            weight: material.weight || 0,
            volume: material.volume || 0,
            distance: material.distance || 0,
            logistics_to_production: material.logisticsToProductionPerUnit || 0,
            transport_type: material.transportType || 'auto',
          });
        }
      }

      // Сохраняем связи product_materials
      await supabase
        .from("product_materials")
        .delete()
        .eq("project_id", projectId);
      
      if (productMaterials.length > 0) {
        for (const pm of productMaterials) {
          await supabase.from("product_materials").insert({
            project_id: projectId,
            product_id: pm.productId,
            material_id: pm.materialId,
            quantity_per_unit: pm.quantityPerUnit,
          });
        }
      }

      // Синхронизируем распределения по каналам
      await supabase
        .from("product_channel_allocations")
        .delete()
        .eq("project_id", projectId);

      if (productChannelAllocations.length > 0) {
        for (const alloc of productChannelAllocations) {
          await supabase.from("product_channel_allocations").insert({
            project_id: projectId,
            product_id: alloc.productId,
            channel_id: alloc.channelId,
            quantity: alloc.quantity,
            price_override: alloc.priceOverride,
          });
        }
      }

      markAsSavedToCloud(userId);
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date());
      if (showToast) {
        toast.success("Данные сохранены в облако");
      }
    } catch (error) {
      console.error("Save error:", error);
      if (showToast) {
        toast.error("Ошибка сохранения в облако");
      }
    } finally {
      setIsSaving(false);
    }
  }, [projectId, userId, currentMetrics, scenarioA, scenarioB, logisticsTariffs, salesChannels, materials, productMaterials, products, competitors, productChannelAllocations]);

  // Debounced автосохранение при изменении данных (2 секунды задержка)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!userId || !projectId || isInitialLoad.current) return;
    
    // Очищаем предыдущий таймер
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Устанавливаем новый таймер для сохранения через 2 секунды после последнего изменения
    debounceTimerRef.current = setTimeout(() => {
      if (hasUnsavedChanges) {
        saveAllToCloud(false); // Без тоста для автосохранения
      }
    }, 2000);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [userId, projectId, currentMetrics, scenarioA, scenarioB, competitors, products, materials, productMaterials, currency, logisticsTariffs, salesChannels, productChannelAllocations, hasUnsavedChanges, saveAllToCloud]);

  const loadProject = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Get or create project
      const { data: projects, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .limit(1);

      if (projectError) throw projectError;

      let currentProjectId: string;

      if (projects && projects.length > 0) {
        currentProjectId = projects[0].id;
      } else {
        // Create new project
        const { data: newProject, error: createError } = await supabase
          .from("projects")
          .insert({ user_id: userId, name: "Мой проект" })
          .select()
          .single();

        if (createError) throw createError;
        currentProjectId = newProject.id;
      }

      setProjectId(currentProjectId);

      // Load project settings
      if (projects && projects.length > 0) {
        setCurrency(projects[0].currency || "RUB");
      }

      // Load scenarios
      const { data: scenarios, error: scenariosError } = await supabase
        .from("scenarios")
        .select("*")
        .eq("project_id", currentProjectId);

      if (scenariosError) throw scenariosError;

      // Load detailed expenses
      const { data: detailedExpensesData } = await (supabase
        .from("detailed_expenses") as any)
        .select("*")
        .eq("project_id", currentProjectId);

      // Create a map of detailed expenses by scenario type
      const detailedExpensesMap: Record<string, any> = {};
      if (detailedExpensesData) {
        detailedExpensesData.forEach((de: any) => {
          detailedExpensesMap[de.scenario_type] = {
            expenses: de.expenses,
            leadSources: de.lead_sources || [],
          };
        });
      }

      if (scenarios) {
        scenarios.forEach((scenario) => {
          const detailedData = detailedExpensesMap[scenario.scenario_type];
          const metrics: Metrics = {
            revenue: Number(scenario.revenue) || 0,
            totalClients: scenario.total_clients || 0,
            newClients: scenario.new_clients || 0,
            returningClients: scenario.returning_clients || 0,
            conversionRate: Number(scenario.conversion_rate) || 0,
            avgCheck: Number(scenario.avg_check) || 0,
            fixedCosts: Number(scenario.fixed_costs) || 0,
            variableCosts: Number(scenario.variable_costs) || 0,
            marketingCosts: Number(scenario.marketing_costs) || 0,
            detailedExpenses: detailedData?.expenses || initialDetailedExpenses,
            leadSources: detailedData?.leadSources || [],
          };

          if (scenario.scenario_type === "current") setCurrentMetrics(metrics);
          else if (scenario.scenario_type === "scenarioA") setScenarioA(metrics);
          else if (scenario.scenario_type === "scenarioB") setScenarioB(metrics);
        });
      }

      // Load logistics tariffs
      const { data: logisticsData } = await (supabase
        .from("logistics_tariffs") as any)
        .select("*")
        .eq("project_id", currentProjectId)
        .single();

      if (logisticsData?.tariffs) {
        setLogisticsTariffs(logisticsData.tariffs);
      }

      // Load sales channels
      const { data: salesChannelsData } = await (supabase
        .from("sales_channels") as any)
        .select("*")
        .eq("project_id", currentProjectId);

      if (salesChannelsData) {
        setSalesChannels(
          salesChannelsData.map((ch: any) => ({
            id: ch.id,
            name: ch.name,
            type: ch.type,
            commissionPercent: Number(ch.commission_percent) || 0,
            fulfillmentCostPerUnit: Number(ch.fulfillment_cost_per_unit) || 0,
            logisticsCostPerUnit: Number(ch.logistics_cost_per_unit) || 0,
            returnRatePercent: Number(ch.return_rate_percent) || 0,
            paymentDelayDays: ch.payment_delay_days || 0,
            minOrderQuantity: ch.min_order_quantity || 0,
            discountPercent: Number(ch.discount_percent) || 0,
          }))
        );
      }

      // Load competitors
      const { data: competitorsData, error: competitorsError } = await supabase
        .from("competitors")
        .select("*")
        .eq("project_id", currentProjectId);

      if (competitorsError) throw competitorsError;

      // Load competitor products
      let competitorProductsMap: Record<string, CompetitorProduct[]> = {};
      if (competitorsData && competitorsData.length > 0) {
        const competitorIds = competitorsData.map((c: any) => c.id);
        const { data: competitorProductsData } = await (supabase
          .from("competitor_products") as any)
          .select("*")
          .in("competitor_id", competitorIds);
        
        if (competitorProductsData) {
          competitorProductsData.forEach((p: any) => {
            if (!competitorProductsMap[p.competitor_id]) {
              competitorProductsMap[p.competitor_id] = [];
            }
            competitorProductsMap[p.competitor_id].push({
              id: p.id,
              name: p.name,
              price: Number(p.price) || 0,
              annualSales: p.annual_sales || 0,
              annualRevenue: Number(p.annual_revenue) || 0,
              salesChannels: p.sales_channels || [],
            });
          });
        }
      }

      if (competitorsData) {
        setCompetitors(
          competitorsData.map((c: any) => ({
            id: c.id,
            name: c.name,
            revenue: Number(c.revenue) || 0,
            marketShare: Number(c.market_share) || 0,
            pricing: Number(c.pricing) || 0,
            quality: Number(c.quality) || 0,
            marketingSpend: Number(c.marketing_spend) || 0,
            products: competitorProductsMap[c.id] || [],
          }))
        );
      }

      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("project_id", currentProjectId);

      if (productsError) throw productsError;

      if (productsData) {
        setProducts(
          productsData.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price) || 0,
            cost: Number(p.cost) || 0,
            quantity: p.quantity || 0,
            quality: p.quality ?? 10,
            weightPerUnit: Number(p.weight_per_unit) || 0,
            volumePerUnit: Number(p.volume_per_unit) || 0,
            deliveryType: p.delivery_type || 'courier',
            logisticsToClientPerUnit: Number(p.logistics_to_client) || 0,
          }))
        );
      }

      // Load raw materials
      const { data: materialsData } = await supabase
        .from("raw_materials")
        .select("*")
        .eq("project_id", currentProjectId);

      if (materialsData) {
        setMaterials(
          materialsData.map((m: any) => ({
            id: m.id,
            name: m.name,
            unit: m.unit || '',
            pricePerUnit: Number(m.price_per_unit) || 0,
            logisticsToProductionPerUnit: Number(m.logistics_to_production) || 0,
            weight: Number(m.weight) || 0,
            volume: Number(m.volume) || 0,
            transportType: m.transport_type || 'auto',
            distance: Number(m.distance) || 0,
          }))
        );
      }

      // Load product materials
      const { data: productMaterialsData } = await supabase
        .from("product_materials")
        .select("*")
        .eq("project_id", currentProjectId);

      if (productMaterialsData) {
        setProductMaterials(
          productMaterialsData.map((pm: any) => ({
            id: pm.id,
            productId: pm.product_id,
            materialId: pm.material_id,
            quantityPerUnit: Number(pm.quantity_per_unit) || 0,
          }))
        );
      }

      // Load product channel allocations
      const { data: allocationsData } = await supabase
        .from("product_channel_allocations")
        .select("*")
        .eq("project_id", currentProjectId);

      if (allocationsData) {
        setProductChannelAllocations(
          allocationsData.map((a: any) => ({
            id: a.id,
            productId: a.product_id,
            channelId: a.channel_id,
            quantity: a.quantity || 0,
            priceOverride: a.price_override,
          }))
        );
      }
    } catch (error: any) {
      console.error("Error loading project:", error);
      toast.error("Ошибка загрузки проекта");
    } finally {
      setLoading(false);
    }
  };

  const saveScenario = async (scenarioType: string, metrics: Metrics) => {
    if (!projectId || !userId) return;

    try {
      const { error } = await supabase.from("scenarios").upsert(
        {
          project_id: projectId,
          scenario_type: scenarioType,
          revenue: metrics.revenue,
          total_clients: metrics.totalClients,
          new_clients: metrics.newClients,
          returning_clients: metrics.returningClients,
          conversion_rate: metrics.conversionRate,
          avg_check: metrics.avgCheck,
          fixed_costs: metrics.fixedCosts,
          variable_costs: metrics.variableCosts,
          marketing_costs: metrics.marketingCosts,
        },
        { onConflict: 'project_id,scenario_type' }
      );

      if (error) throw error;
      markAsSavedToCloud(userId);
      setHasUnsavedChanges(false);
      toast.success("Сценарий сохранен");
    } catch (error: any) {
      console.error("Error saving scenario:", error);
      toast.error("Ошибка сохранения");
    }
  };

  const saveCompetitor = async (competitor: Omit<Competitor, "id">) => {
    if (!userId) {
      // Local storage mode
      const newCompetitor = { ...competitor, id: Date.now().toString() };
      setCompetitors([...competitors, newCompetitor]);
      toast.success("Конкурент добавлен");
      return;
    }

    if (!projectId) return;

    try {
      const { data, error } = await supabase.from("competitors").insert({
        project_id: projectId,
        name: competitor.name,
        revenue: competitor.revenue,
        market_share: competitor.marketShare,
        pricing: competitor.pricing,
        quality: competitor.quality,
        marketing_spend: competitor.marketingSpend,
      }).select().single();

      if (error) throw error;
      
      // Добавляем конкурента в локальное состояние без перезагрузки всего проекта
      const newCompetitor: Competitor = {
        id: data.id,
        name: data.name,
        revenue: Number(data.revenue) || 0,
        marketShare: Number(data.market_share) || 0,
        pricing: Number(data.pricing) || 0,
        quality: Number(data.quality) || 0,
        marketingSpend: Number(data.marketing_spend) || 0,
        products: [],
      };
      setCompetitors(prev => [...prev, newCompetitor]);
      toast.success("Конкурент добавлен");
    } catch (error: any) {
      console.error("Error saving competitor:", error);
      toast.error("Ошибка сохранения конкурента");
    }
  };

  const updateCompetitor = async (competitorId: string, updates: Partial<Competitor>) => {
    if (!userId) {
      // Local storage mode
      setCompetitors(competitors.map((c) => (c.id === competitorId ? { ...c, ...updates } : c)));
      toast.success("Конкурент обновлён");
      return;
    }

    if (!projectId) return;

    try {
      const updatePayload: Record<string, any> = {};
      if (typeof updates.name !== "undefined") updatePayload.name = updates.name;
      if (typeof updates.revenue !== "undefined") updatePayload.revenue = updates.revenue;
      if (typeof updates.marketShare !== "undefined") updatePayload.market_share = updates.marketShare;
      if (typeof updates.pricing !== "undefined") updatePayload.pricing = updates.pricing;
      if (typeof updates.quality !== "undefined") updatePayload.quality = updates.quality;
      if (typeof updates.marketingSpend !== "undefined") updatePayload.marketing_spend = updates.marketingSpend;

      if (Object.keys(updatePayload).length === 0) {
        // Только локальные изменения (products и другие клиентские поля)
        setCompetitors(competitors.map((c) => (c.id === competitorId ? { ...c, ...updates } : c)));
        return;
      }

      const { error } = await supabase
        .from("competitors")
        .update(updatePayload)
        .eq("id", competitorId);

      if (error) throw error;

      setCompetitors(competitors.map((c) => (c.id === competitorId ? { ...c, ...updates } : c)));
      toast.success("Конкурент обновлён");
    } catch (error: any) {
      console.error("Error updating competitor:", error);
      toast.error("Ошибка обновления конкурента");
    }
  };

  const deleteCompetitor = async (competitorId: string) => {
    if (!userId) {
      // Local storage mode
      setCompetitors(competitors.filter((c) => c.id !== competitorId));
      toast.success("Конкурент удален");
      return;
    }

    try {
      const { error } = await supabase
        .from("competitors")
        .delete()
        .eq("id", competitorId);

      if (error) throw error;
      setCompetitors(competitors.filter((c) => c.id !== competitorId));
      toast.success("Конкурент удален");
    } catch (error: any) {
      console.error("Error deleting competitor:", error);
      toast.error("Ошибка удаления");
    }
  };

  const saveProduct = async (product: Omit<Product, "id">) => {
    if (!userId) {
      // Local storage mode
      const newProduct = { ...product, id: Date.now().toString() };
      setProducts([...products, newProduct]);
      toast.success("Продукт добавлен");
      return;
    }

    if (!projectId) return;

    try {
      const { data, error } = await supabase.from("products").insert({
        project_id: projectId,
        name: product.name,
        price: product.price,
        cost: product.cost,
        quantity: product.quantity,
        quality: product.quality ?? 10,
        weight_per_unit: product.weightPerUnit || 0,
        volume_per_unit: product.volumePerUnit || 0,
        delivery_type: product.deliveryType || 'courier',
        logistics_to_client: product.logisticsToClientPerUnit || 0,
      }).select().single();

      if (error) throw error;
      
      // Добавляем продукт в локальное состояние без перезагрузки всего проекта
      const newProduct: Product = {
        id: data.id,
        name: data.name,
        price: Number(data.price) || 0,
        cost: Number(data.cost) || 0,
        quantity: data.quantity || 0,
        quality: data.quality ?? 10,
        weightPerUnit: Number(data.weight_per_unit) || 0,
        volumePerUnit: Number(data.volume_per_unit) || 0,
        deliveryType: (data.delivery_type || 'courier') as 'courier' | 'own_delivery' | 'pickup' | 'transport_company',
        logisticsToClientPerUnit: Number(data.logistics_to_client) || 0,
      };
      setProducts(prev => [...prev, newProduct]);
      toast.success("Продукт добавлен");
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error("Ошибка сохранения продукта");
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    if (!userId) {
      setProducts(products.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
      toast.success("Продукт обновлён");
      return;
    }

    if (!projectId) return;

    try {
      const updatePayload: Record<string, any> = {};
      if (typeof updates.name !== "undefined") updatePayload.name = updates.name;
      if (typeof updates.price !== "undefined") updatePayload.price = updates.price;
      if (typeof updates.cost !== "undefined") updatePayload.cost = updates.cost;
      if (typeof updates.quantity !== "undefined") updatePayload.quantity = updates.quantity;
      if (typeof updates.quality !== "undefined") updatePayload.quality = updates.quality;
      if (typeof updates.weightPerUnit !== "undefined") updatePayload.weight_per_unit = updates.weightPerUnit;
      if (typeof updates.volumePerUnit !== "undefined") updatePayload.volume_per_unit = updates.volumePerUnit;
      if (typeof updates.deliveryType !== "undefined") updatePayload.delivery_type = updates.deliveryType;
      if (typeof updates.logisticsToClientPerUnit !== "undefined") updatePayload.logistics_to_client = updates.logisticsToClientPerUnit;

      if (Object.keys(updatePayload).length === 0) return;

      const { error } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", productId);

      if (error) throw error;

      setProducts(products.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
      toast.success("Продукт обновлён");
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error("Ошибка обновления продукта");
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!userId) {
      // Local storage mode
      setProducts(products.filter((p) => p.id !== productId));
      toast.success("Продукт удален");
      return;
    }

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      setProducts(products.filter((p) => p.id !== productId));
      toast.success("Продукт удален");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error("Ошибка удаления");
    }
  };
  const addCompetitorProduct = async (
    competitorId: string,
    product: Omit<CompetitorProduct, "id" | "annualRevenue">
  ) => {
    const annualRevenue = product.price * product.annualSales;
    
    if (!userId || !projectId) {
      // Local storage mode
      const newProduct: CompetitorProduct = {
        ...product,
        id: Date.now().toString(),
        annualRevenue,
      };

      const updatedCompetitors = competitors.map((c) =>
        c.id === competitorId
          ? { ...c, products: [...(c.products || []), newProduct] }
          : c
      );

      setCompetitors(updatedCompetitors);
      toast.success("Продукт конкурента добавлен");
      return;
    }

    try {
      const { data, error } = await (supabase.from("competitor_products") as any)
        .insert({
          competitor_id: competitorId,
          name: product.name,
          price: product.price,
          annual_sales: product.annualSales,
          annual_revenue: annualRevenue,
          sales_channels: product.salesChannels || [],
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: CompetitorProduct = {
        id: data.id,
        name: data.name,
        price: Number(data.price) || 0,
        annualSales: data.annual_sales || 0,
        annualRevenue: Number(data.annual_revenue) || 0,
        salesChannels: data.sales_channels || [],
      };

      const updatedCompetitors = competitors.map((c) =>
        c.id === competitorId
          ? { ...c, products: [...(c.products || []), newProduct] }
          : c
      );

      setCompetitors(updatedCompetitors);
      toast.success("Продукт конкурента добавлен");
    } catch (error: any) {
      console.error("Error adding competitor product:", error);
      toast.error("Ошибка добавления продукта конкурента");
    }
  };

  const deleteCompetitorProduct = async (
    competitorId: string,
    productId: string
  ) => {
    if (!userId || !projectId) {
      // Local storage mode
      const updatedCompetitors = competitors.map((c) =>
        c.id === competitorId
          ? { ...c, products: (c.products || []).filter((p) => p.id !== productId) }
          : c
      );

      setCompetitors(updatedCompetitors);
      toast.success("Продукт конкурента удален");
      return;
    }

    try {
      const { error } = await (supabase.from("competitor_products") as any)
        .delete()
        .eq("id", productId);

      if (error) throw error;

      const updatedCompetitors = competitors.map((c) =>
        c.id === competitorId
          ? { ...c, products: (c.products || []).filter((p) => p.id !== productId) }
          : c
      );

      setCompetitors(updatedCompetitors);
      toast.success("Продукт конкурента удален");
    } catch (error: any) {
      console.error("Error deleting competitor product:", error);
      toast.error("Ошибка удаления продукта конкурента");
    }
  };

  const updateCurrency = async (newCurrency: string) => {
    if (!userId) {
      // Local storage mode
      setCurrency(newCurrency);
      toast.success("Валюта обновлена");
      return;
    }

    if (!projectId) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({ currency: newCurrency })
        .eq("id", projectId);

      if (error) throw error;
      setCurrency(newCurrency);
      toast.success("Валюта обновлена");
    } catch (error: any) {
      console.error("Error updating currency:", error);
      toast.error("Ошибка обновления валюты");
    }
  };

  const calculateProductsRevenue = () => {
    return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  };
 
  const calculateProductsCosts = () => {
    return products.reduce((sum, p) => sum + p.cost * p.quantity, 0);
  };
 
  const calculateMaterialCostPerUnit = (productId: string) => {
    const usages = productMaterials.filter((u) => u.productId === productId);
 
    return usages.reduce((sum, usage) => {
      const material = materials.find((m) => m.id === usage.materialId);
      if (!material) return sum;
      return sum + (material.pricePerUnit || 0) * (usage.quantityPerUnit || 0);
    }, 0);
  };
 
  const calculateLogisticsCostPerUnit = (productId: string) => {
    const usages = productMaterials.filter((u) => u.productId === productId);

    const materialsLogistics = usages.reduce((sum, usage) => {
      const material = materials.find((m) => m.id === usage.materialId);
      if (!material) return sum;
      return sum + (material.logisticsToProductionPerUnit || 0) * (usage.quantityPerUnit || 0);
    }, 0);

    const product = products.find((p) => p.id === productId);
    const productLogistics = product?.logisticsToClientPerUnit || 0;

    return materialsLogistics + productLogistics;
  };
 
  const calculateTotalMaterialsCost = () => {
    return products.reduce((total, product) => {
      const costPerUnit = calculateMaterialCostPerUnit(product.id);
      return total + costPerUnit * product.quantity;
    }, 0);
  };

  const calculateTotalLogisticsCost = () => {
    return products.reduce((total, product) => {
      const logisticsPerUnit = calculateLogisticsCostPerUnit(product.id);
      return total + logisticsPerUnit * product.quantity;
    }, 0);
  };
 
  const calculateTotalMaterialLogistics = () => {
    return products.reduce((total, product) => {
      const usages = productMaterials.filter((u) => u.productId === product.id);
 
      const materialsLogisticsPerUnit = usages.reduce((sum, usage) => {
        const material = materials.find((m) => m.id === usage.materialId);
        if (!material) return sum;
        return (
          sum +
          (material.logisticsToProductionPerUnit || 0) * (usage.quantityPerUnit || 0)
        );
      }, 0);
 
      return total + materialsLogisticsPerUnit * product.quantity;
    }, 0);
  };
 
  const calculateTotalProductLogistics = () => {
    return products.reduce((total, product) => {
      const productLogisticsPerUnit = product.logisticsToClientPerUnit || 0;
      return total + productLogisticsPerUnit * product.quantity;
    }, 0);
  };

  // Расчёт веса продукта на основе сырья
  const calculateProductWeightFromMaterials = (productId: string): number => {
    const usages = productMaterials.filter((u) => u.productId === productId);
    return usages.reduce((total, usage) => {
      const material = materials.find((m) => m.id === usage.materialId);
      if (!material) return total;
      return total + (material.weight || 0) * (usage.quantityPerUnit || 0);
    }, 0);
  };

  // Расчёт объёма продукта на основе сырья
  const calculateProductVolumeFromMaterials = (productId: string): number => {
    const usages = productMaterials.filter((u) => u.productId === productId);
    return usages.reduce((total, usage) => {
      const material = materials.find((m) => m.id === usage.materialId);
      if (!material) return total;
      return total + (material.volume || 0) * (usage.quantityPerUnit || 0);
    }, 0);
  };
 
  const syncProductsToMetrics = (scenarioType: "current" | "scenarioA" | "scenarioB") => {
    const productsRevenue = calculateProductsRevenue();

    const setter =
      scenarioType === "current" ? setCurrentMetrics :
      scenarioType === "scenarioA" ? setScenarioA : setScenarioB;
    const current =
      scenarioType === "current" ? currentMetrics :
      scenarioType === "scenarioA" ? scenarioA : scenarioB;

    const updatedMetrics: Metrics = {
      ...current,
      revenue: productsRevenue,
    };

    if (current.totalClients > 0 && productsRevenue > 0) {
      updatedMetrics.avgCheck = productsRevenue / current.totalClients;
    }

    setter(updatedMetrics);

    toast.success("Метрики обновлены на основе продуктов");
  };

  // Функции очистки данных
  const clearProducts = useCallback(async () => {
    // Удаляем из БД если авторизован
    if (projectId && userId) {
      try {
        await supabase
          .from("product_channel_allocations")
          .delete()
          .eq("project_id", projectId);
        
        await supabase
          .from("product_materials")
          .delete()
          .eq("project_id", projectId);
        
        await supabase
          .from("products")
          .delete()
          .eq("project_id", projectId);
      } catch (error) {
        console.error("Error clearing products from DB:", error);
      }
    }
    
    setProducts([]);
    setProductMaterials([]);
    setProductChannelAllocations([]);
    toast.success("Продукты очищены");
  }, [projectId, userId]);

  const clearMaterials = useCallback(async () => {
    // Удаляем из БД если авторизован
    if (projectId && userId) {
      try {
        // Сначала удаляем связи product_materials
        await supabase
          .from("product_materials")
          .delete()
          .eq("project_id", projectId);
        
        // Затем удаляем сами материалы
        await supabase
          .from("raw_materials")
          .delete()
          .eq("project_id", projectId);
      } catch (error) {
        console.error("Error clearing materials from DB:", error);
      }
    }
    
    setMaterials([]);
    setProductMaterials([]);
    toast.success("Сырьё очищено");
  }, [projectId, userId]);

  const clearCompetitors = useCallback(async () => {
    if (projectId && userId) {
      try {
        await supabase
          .from("competitors")
          .delete()
          .eq("project_id", projectId);
      } catch (error) {
        console.error("Error clearing competitors from DB:", error);
      }
    }
    
    setCompetitors([]);
    toast.success("Конкуренты очищены");
  }, [projectId, userId]);

  const clearMetrics = useCallback(() => {
    setCurrentMetrics(initialMetrics);
    setScenarioA(initialMetrics);
    setScenarioB(initialMetrics);
    toast.success("Показатели очищены");
  }, []);

  const clearSalesChannels = useCallback(async () => {
    if (projectId && userId) {
      try {
        await supabase
          .from("product_channel_allocations")
          .delete()
          .eq("project_id", projectId);
        
        await supabase
          .from("sales_channels")
          .delete()
          .eq("project_id", projectId);
      } catch (error) {
        console.error("Error clearing sales channels from DB:", error);
      }
    }
    
    setSalesChannels([]);
    setProductChannelAllocations([]);
    toast.success("Каналы продаж очищены");
  }, [projectId, userId]);

  const clearAllData = useCallback(async () => {
    // Удаляем из БД если авторизован
    if (projectId && userId) {
      try {
        await supabase.from("product_channel_allocations").delete().eq("project_id", projectId);
        await supabase.from("product_materials").delete().eq("project_id", projectId);
        await supabase.from("raw_materials").delete().eq("project_id", projectId);
        await supabase.from("products").delete().eq("project_id", projectId);
        await supabase.from("competitors").delete().eq("project_id", projectId);
        await supabase.from("sales_channels").delete().eq("project_id", projectId);
      } catch (error) {
        console.error("Error clearing all data from DB:", error);
      }
    }

    setProducts([]);
    setMaterials([]);
    setProductMaterials([]);
    setCompetitors([]);
    setCurrentMetrics(initialMetrics);
    setScenarioA(initialMetrics);
    setScenarioB(initialMetrics);
    setSalesChannels([]);
    setProductChannelAllocations([]);
    setLogisticsTariffs({
      auto: { perKgKm: 0.05, perM3Km: 50, baseRate: 500 },
      rail: { perKgKm: 0.02, perM3Km: 30, baseRate: 1000 },
      air: { perKgKm: 0.5, perM3Km: 500, baseRate: 2000 },
      sea: { perKgKm: 0.01, perM3Km: 20, baseRate: 3000 },
      local: { perKgKm: 0.1, perM3Km: 100, baseRate: 200 },
      courier: { perKg: 50, perM3: 500, baseRate: 300 },
      pickup: { perKg: 0, perM3: 0, baseRate: 0 },
      transport_company: { perKg: 30, perM3: 300, baseRate: 500 },
      own_delivery: { perKg: 20, perM3: 200, baseRate: 150 },
    });
    
    // Очистка localStorage
    localStorage.removeItem(getStorageKey(userId));
    
    toast.success("Все данные очищены");
  }, [userId, projectId]);

  return {
    projectId,
    currentMetrics,
    setCurrentMetrics,
    scenarioA,
    setScenarioA,
    scenarioB,
    setScenarioB,
    competitors,
    setCompetitors,
    products,
    setProducts,
    materials,
    setMaterials,
    productMaterials,
    setProductMaterials,
    currency,
    loading,
    hasUnsavedChanges,
    lastSavedAt,
    isSaving,
    logisticsTariffs,
    setLogisticsTariffs,
    salesChannels,
    setSalesChannels,
    productChannelAllocations,
    setProductChannelAllocations,
    saveScenario,
    saveCompetitor,
    updateCompetitor,
    deleteCompetitor,
    saveProduct,
    updateProduct,
    deleteProduct,
    updateCurrency,
    calculateProductsRevenue,
    calculateProductsCosts,
    calculateMaterialCostPerUnit,
    calculateTotalMaterialsCost,
    calculateLogisticsCostPerUnit,
    calculateTotalLogisticsCost,
    calculateTotalMaterialLogistics,
    calculateTotalProductLogistics,
    calculateProductWeightFromMaterials,
    calculateProductVolumeFromMaterials,
    syncProductsToMetrics,
    addCompetitorProduct,
    deleteCompetitorProduct,
    saveAllToCloud,
    // Функции очистки
    clearProducts,
    clearMaterials,
    clearCompetitors,
    clearMetrics,
    clearSalesChannels,
    clearAllData,
  };
};
