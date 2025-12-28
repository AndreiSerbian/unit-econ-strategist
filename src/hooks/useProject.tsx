import { useState, useEffect, useCallback, useRef } from "react";
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

      if (scenarios) {
        scenarios.forEach((scenario) => {
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
          };

          if (scenario.scenario_type === "current") setCurrentMetrics(metrics);
          else if (scenario.scenario_type === "scenarioA") setScenarioA(metrics);
          else if (scenario.scenario_type === "scenarioB") setScenarioB(metrics);
        });
      }

      // Load competitors
      const { data: competitorsData, error: competitorsError } = await supabase
        .from("competitors")
        .select("*")
        .eq("project_id", currentProjectId);

      if (competitorsError) throw competitorsError;

      if (competitorsData) {
        setCompetitors(
          competitorsData.map((c) => ({
            id: c.id,
            name: c.name,
            revenue: Number(c.revenue) || 0,
            marketShare: Number(c.market_share) || 0,
            pricing: Number(c.pricing) || 0,
            quality: Number(c.quality) || 0,
            marketingSpend: Number(c.marketing_spend) || 0,
            products: [],
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
          productsData.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price) || 0,
            cost: Number(p.cost) || 0,
            quantity: p.quantity || 0,
            salesChannels: [],
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
      const { error } = await supabase.from("competitors").insert({
        project_id: projectId,
        name: competitor.name,
        revenue: competitor.revenue,
        market_share: competitor.marketShare,
        pricing: competitor.pricing,
        quality: competitor.quality,
        marketing_spend: competitor.marketingSpend,
      });

      if (error) throw error;
      await loadProject();
      toast.success("Конкурент добавлен");
    } catch (error: any) {
      console.error("Error saving competitor:", error);
      toast.error("Ошибка сохранения конкурента");
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
      const { error } = await supabase.from("products").insert({
        project_id: projectId,
        name: product.name,
        price: product.price,
        cost: product.cost,
        quantity: product.quantity,
      });

      if (error) throw error;
      await loadProject();
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
    const newProduct: CompetitorProduct = {
      ...product,
      id: Date.now().toString(),
      annualRevenue: product.price * product.annualSales,
    };

    const updatedCompetitors = competitors.map((c) =>
      c.id === competitorId
        ? { ...c, products: [...(c.products || []), newProduct] }
        : c
    );

    setCompetitors(updatedCompetitors);
    toast.success("Продукт конкурента добавлен");
  };

  const deleteCompetitorProduct = async (
    competitorId: string,
    productId: string
  ) => {
    const updatedCompetitors = competitors.map((c) =>
      c.id === competitorId
        ? { ...c, products: (c.products || []).filter((p) => p.id !== productId) }
        : c
    );

    setCompetitors(updatedCompetitors);
    toast.success("Продукт конкурента удален");
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
    logisticsTariffs,
    setLogisticsTariffs,
    salesChannels,
    setSalesChannels,
    productChannelAllocations,
    setProductChannelAllocations,
    saveScenario,
    saveCompetitor,
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
    syncProductsToMetrics,
    addCompetitorProduct,
    deleteCompetitorProduct,
  };
};
