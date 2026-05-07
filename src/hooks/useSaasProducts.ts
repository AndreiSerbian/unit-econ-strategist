import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  SaasProduct, 
  SaasPlan, 
  SaasProductWithPlans, 
  ProductKPIs,
  PlanFormData,
  BillingType 
} from '@/components/saas-products/types';

export function useSaasProducts(projectId: string) {
  const [products, setProducts] = useState<SaasProductWithPlans[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products and plans
  const fetchData = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('saas_products')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (productsError) throw productsError;

      // Fetch all plans for these products
      const productIds = (productsData || []).map(p => p.id);
      
      let plansData: SaasPlan[] = [];
      if (productIds.length > 0) {
        const { data: plans, error: plansError } = await supabase
          .from('saas_plans')
          .select('*')
          .in('product_id', productIds)
          .order('sort_order', { ascending: true });

        if (plansError) throw plansError;
        plansData = (plans || []).map(p => ({
          ...p,
          billing_type: p.billing_type as BillingType,
        }));
      }

      // Combine products with their plans
      const productsWithPlans: SaasProductWithPlans[] = (productsData || []).map(product => ({
        ...product,
        planning_period: product.planning_period as 'week' | 'month' | 'quarter' | 'year',
        plans: plansData.filter(plan => plan.product_id === product.id),
      }));

      setProducts(productsWithPlans);
    } catch (error) {
      console.error('Error fetching SaaS products:', error);
      toast.error('Ошибка загрузки SaaS продуктов');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate KPIs for a single product
  const calculateProductKPIs = useCallback((product: SaasProductWithPlans): ProductKPIs => {
    let subscriptionMRR = 0;
    let oneTimeRevenue = 0;
    let variableCostSubscription = 0;
    let variableCostOneTime = 0;
    let totalSubscribers = 0;
    let totalFreeTierUsers = 0;
    let totalBuyers = 0;

    for (const plan of product.plans) {
      if (plan.billing_type === 'subscription') {
        // Subscription revenue (only non-free plans)
        if (!plan.is_free_plan) {
          subscriptionMRR += plan.price_eur * plan.subscribers;
          totalSubscribers += plan.subscribers;
        } else {
          totalFreeTierUsers += plan.subscribers;
        }
        // Variable cost applies to ALL subscription plans (including free)
        variableCostSubscription += plan.subscribers * plan.cost_per_subscriber_per_month_eur;
      } else {
        // One-time purchase
        oneTimeRevenue += plan.price_eur * plan.subscribers; // subscribers = buyers for one_time
        totalBuyers += plan.subscribers;
        if (plan.cost_per_buyer_eur) {
          variableCostOneTime += plan.subscribers * plan.cost_per_buyer_eur;
        }
      }
    }

    const totalRevenue = subscriptionMRR + oneTimeRevenue;
    const totalVariableCost = variableCostSubscription + variableCostOneTime;
    const grossProfit = totalRevenue - totalVariableCost;
    // FIN-004 — This is contribution margin (Revenue − all variable costs),
    // not strict gross margin (Revenue − COGS). `grossMarginPercent` is kept
    // as a legacy alias of the same number.
    const contributionMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return {
      subscriptionMRR,
      oneTimeRevenue,
      totalRevenue,
      totalVariableCost,
      grossProfit,
      grossMarginPercent: contributionMarginPercent,
      contributionMarginPercent,
      totalSubscribers,
      totalFreeTierUsers,
      totalBuyers,
    };
  }, []);

  // Aggregate KPIs across all products
  const aggregateKPIs = useMemo((): ProductKPIs => {
    return products.reduce((acc, product) => {
      const kpis = calculateProductKPIs(product);
      return {
        subscriptionMRR: acc.subscriptionMRR + kpis.subscriptionMRR,
        oneTimeRevenue: acc.oneTimeRevenue + kpis.oneTimeRevenue,
        totalRevenue: acc.totalRevenue + kpis.totalRevenue,
        totalVariableCost: acc.totalVariableCost + kpis.totalVariableCost,
        grossProfit: acc.grossProfit + kpis.grossProfit,
        grossMarginPercent: 0,
        contributionMarginPercent: 0, // Recalculated below
        totalSubscribers: acc.totalSubscribers + kpis.totalSubscribers,
        totalFreeTierUsers: acc.totalFreeTierUsers + kpis.totalFreeTierUsers,
        totalBuyers: acc.totalBuyers + kpis.totalBuyers,
      };
    }, {
      subscriptionMRR: 0,
      oneTimeRevenue: 0,
      totalRevenue: 0,
      totalVariableCost: 0,
      grossProfit: 0,
      grossMarginPercent: 0,
      contributionMarginPercent: 0,
      totalSubscribers: 0,
      totalFreeTierUsers: 0,
      totalBuyers: 0,
    });
  }, [products, calculateProductKPIs]);

  // Recalculate aggregate margin
  const finalAggregateKPIs = useMemo((): ProductKPIs => {
    const margin = aggregateKPIs.totalRevenue > 0 
      ? (aggregateKPIs.grossProfit / aggregateKPIs.totalRevenue) * 100 
      : 0;
    return { ...aggregateKPIs, grossMarginPercent: margin, contributionMarginPercent: margin };
  }, [aggregateKPIs]);

  // Add product
  const addProduct = useCallback(async (name: string, planningPeriod: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
    if (!projectId) return null;

    try {
      const { data, error } = await supabase
        .from('saas_products')
        .insert({
          project_id: projectId,
          name,
          planning_period: planningPeriod,
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: SaasProductWithPlans = {
        ...data,
        planning_period: data.planning_period as 'week' | 'month' | 'quarter' | 'year',
        plans: [],
      };

      setProducts(prev => [...prev, newProduct]);
      toast.success('SaaS продукт добавлен');
      return newProduct;
    } catch (error) {
      console.error('Error adding SaaS product:', error);
      toast.error('Ошибка добавления продукта');
      return null;
    }
  }, [projectId]);

  // Update product
  const updateProduct = useCallback(async (
    productId: string, 
    updates: Partial<Pick<SaasProduct, 'name' | 'planning_period' | 'default_channel_id'>>
  ) => {
    try {
      const { error } = await supabase
        .from('saas_products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, ...updates } : p
      ));
      toast.success('Продукт обновлён');
    } catch (error) {
      console.error('Error updating SaaS product:', error);
      toast.error('Ошибка обновления продукта');
    }
  }, []);

  // Delete product
  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const { error } = await supabase
        .from('saas_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success('Продукт удалён');
    } catch (error) {
      console.error('Error deleting SaaS product:', error);
      toast.error('Ошибка удаления продукта');
    }
  }, []);

  // Add plan
  const addPlan = useCallback(async (productId: string, planData: PlanFormData) => {
    try {
      // Enforce free plan price = 0
      const price = planData.is_free_plan ? 0 : planData.price_eur;

      const { data, error } = await supabase
        .from('saas_plans')
        .insert({
          product_id: productId,
          name: planData.name,
          billing_type: planData.billing_type,
          price_eur: price,
          subscribers: planData.subscribers,
          new_subscribers_per_period: planData.new_subscribers_per_period,
          cost_per_subscriber_per_month_eur: planData.cost_per_subscriber_per_month_eur,
          is_free_plan: planData.is_free_plan,
          churn_rate_percent: planData.churn_rate_percent,
          cost_per_buyer_eur: planData.cost_per_buyer_eur,
        })
        .select()
        .single();

      if (error) throw error;

      const newPlan: SaasPlan = {
        ...data,
        billing_type: data.billing_type as BillingType,
      };

      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, plans: [...p.plans, newPlan] }
          : p
      ));
      toast.success('Тарифный план добавлен');
      return newPlan;
    } catch (error) {
      console.error('Error adding plan:', error);
      toast.error('Ошибка добавления плана');
      return null;
    }
  }, []);

  // Update plan
  const updatePlan = useCallback(async (planId: string, updates: Partial<PlanFormData>) => {
    try {
      // Enforce free plan price = 0
      const finalUpdates = { ...updates };
      if (updates.is_free_plan) {
        finalUpdates.price_eur = 0;
      }

      const { error } = await supabase
        .from('saas_plans')
        .update(finalUpdates)
        .eq('id', planId);

      if (error) throw error;

      setProducts(prev => prev.map(p => ({
        ...p,
        plans: p.plans.map(plan => 
          plan.id === planId ? { ...plan, ...finalUpdates } : plan
        ),
      })));
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Ошибка обновления плана');
    }
  }, []);

  // Delete plan
  const deletePlan = useCallback(async (planId: string) => {
    try {
      const { error } = await supabase
        .from('saas_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      setProducts(prev => prev.map(p => ({
        ...p,
        plans: p.plans.filter(plan => plan.id !== planId),
      })));
      toast.success('План удалён');
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Ошибка удаления плана');
    }
  }, []);

  // Get cashflow timeline export data
  const getCashflowExport = useCallback((productId?: string) => {
    const targetProducts = productId 
      ? products.filter(p => p.id === productId)
      : products;

    let subscriptionMRR = 0;
    let oneTimeRevenue = 0;
    let totalVariableCost = 0;

    for (const product of targetProducts) {
      const kpis = calculateProductKPIs(product);
      subscriptionMRR += kpis.subscriptionMRR;
      oneTimeRevenue += kpis.oneTimeRevenue;
      totalVariableCost += kpis.totalVariableCost;
    }

    return {
      inflows: [
        { name: 'Подписки (MRR)', amount: subscriptionMRR },
        { name: 'Разовые покупки', amount: oneTimeRevenue },
      ],
      outflows: [
        { name: 'Переменные расходы (SaaS)', amount: totalVariableCost },
      ],
    };
  }, [products, calculateProductKPIs]);

  return {
    products,
    loading,
    aggregateKPIs: finalAggregateKPIs,
    calculateProductKPIs,
    addProduct,
    updateProduct,
    deleteProduct,
    addPlan,
    updatePlan,
    deletePlan,
    getCashflowExport,
    refetch: fetchData,
  };
}
