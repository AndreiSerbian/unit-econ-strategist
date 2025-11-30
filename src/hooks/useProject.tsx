import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

interface Competitor {
  id: string;
  name: string;
  revenue: number;
  marketShare: number;
  pricing: number;
  quality: number;
  marketingSpend: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity: number;
}

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
};

export const useProject = (userId: string | undefined) => {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<Metrics>(initialMetrics);
  const [scenarioA, setScenarioA] = useState<Metrics>(initialMetrics);
  const [scenarioB, setScenarioB] = useState<Metrics>(initialMetrics);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currency, setCurrency] = useState<string>("RUB");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProject();
    }
  }, [userId]);

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
      const { error } = await supabase.from("scenarios").upsert({
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
      });

      if (error) throw error;
      toast.success("Сценарий сохранен");
    } catch (error: any) {
      console.error("Error saving scenario:", error);
      toast.error("Ошибка сохранения");
    }
  };

  const saveCompetitor = async (competitor: Omit<Competitor, "id">) => {
    if (!projectId || !userId) return;

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
    if (!userId) return;

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
    if (!projectId || !userId) return;

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

  const deleteProduct = async (productId: string) => {
    if (!userId) return;

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

  const updateCurrency = async (newCurrency: string) => {
    if (!projectId || !userId) return;

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
    currency,
    loading,
    saveScenario,
    saveCompetitor,
    deleteCompetitor,
    saveProduct,
    deleteProduct,
    updateCurrency,
  };
};
