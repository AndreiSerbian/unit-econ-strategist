import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SalesChannel } from "@/hooks/useProject";

// Types
export interface MarketplaceCategory {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  transactionsCount: number;
  avgCheck: number;
  gmvComputed: number; // Read-only, generated column
  gmvOverride?: number | null;
  takeRatePercent: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryChannelStats {
  id: string;
  categoryId: string;
  channelId: string;
  transactionsPerPeriod?: number | null;
  sharePercent?: number | null;
  takeRateOverridePercent?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Joined
  channel?: SalesChannel;
}

// Computed metrics
export interface CategoryMetrics {
  gmvUsed: number;
  platformRevenue: number;
  hasEnoughData: boolean;
  gmvMismatchPercent?: number;
  totalSharePercent: number;
}

export interface ChannelMetrics {
  txChannel: number;
  gmvChannel: number;
  netGmvChannel: number;
  platformRevenueChannel: number;
  effectiveTakeRate: number;
}

export type PlanningPeriod = 'week' | 'month' | 'quarter' | 'year';

// Helper functions
export const getPeriodLabel = (period: PlanningPeriod): string => {
  switch (period) {
    case 'week': return 'неделю';
    case 'month': return 'месяц';
    case 'quarter': return 'квартал';
    case 'year': return 'год';
  }
};

export const calculateCategoryMetrics = (
  category: MarketplaceCategory,
  channelStats: CategoryChannelStats[],
  channels: SalesChannel[]
): CategoryMetrics => {
  const gmvUsed = category.gmvOverride ?? category.gmvComputed;
  const hasEnoughData = category.transactionsCount > 0 && channelStats.length > 0;
  
  let gmvMismatchPercent: number | undefined;
  if (category.gmvOverride && category.gmvComputed > 0) {
    gmvMismatchPercent = Math.abs((category.gmvOverride - category.gmvComputed) / category.gmvComputed) * 100;
  }

  const totalSharePercent = channelStats.reduce((sum, cs) => sum + (cs.sharePercent ?? 0), 0);

  // Calculate platform revenue from all channel stats
  let platformRevenue = 0;
  if (hasEnoughData) {
    channelStats.forEach(cs => {
      const channelMetrics = calculateChannelMetrics(category, cs, channels);
      platformRevenue += channelMetrics.platformRevenueChannel;
    });
  }

  return {
    gmvUsed,
    platformRevenue,
    hasEnoughData,
    gmvMismatchPercent,
    totalSharePercent,
  };
};

export const calculateChannelMetrics = (
  category: MarketplaceCategory,
  channelStat: CategoryChannelStats,
  channels: SalesChannel[]
): ChannelMetrics => {
  const channel = channels.find(c => c.id === channelStat.channelId);
  if (!channel) {
    return { txChannel: 0, gmvChannel: 0, netGmvChannel: 0, platformRevenueChannel: 0, effectiveTakeRate: 0 };
  }

  const gmvUsed = category.gmvOverride ?? category.gmvComputed;
  
  // Calculate transactions for this channel
  const txChannel = channelStat.transactionsPerPeriod 
    ?? (category.transactionsCount * (channelStat.sharePercent ?? 0) / 100);
  
  // Calculate GMV for this channel
  const avgCheckForChannel = category.transactionsCount > 0 
    ? gmvUsed / category.transactionsCount 
    : category.avgCheck;
  const gmvChannel = avgCheckForChannel * txChannel;
  
  // Apply channel discounts and returns
  const discountMultiplier = 1 - (channel.discountPercent ?? 0) / 100;
  const returnMultiplier = 1 - (channel.returnRatePercent ?? 0) / 100;
  const netGmvChannel = gmvChannel * discountMultiplier * returnMultiplier;
  
  // Effective take rate
  const effectiveTakeRate = channelStat.takeRateOverridePercent ?? category.takeRatePercent;
  
  // Platform revenue
  const platformRevenueChannel = netGmvChannel * (effectiveTakeRate / 100);

  return {
    txChannel,
    gmvChannel,
    netGmvChannel,
    platformRevenueChannel,
    effectiveTakeRate,
  };
};

// Hook
export const useMarketplace = (projectId: string | undefined) => {
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [channelStats, setChannelStats] = useState<CategoryChannelStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      setCategories((data ?? []).map(row => ({
        id: row.id,
        projectId: row.project_id,
        name: row.name,
        description: row.description,
        transactionsCount: row.transactions_count ?? 0,
        avgCheck: parseFloat(row.avg_check?.toString() ?? '0'),
        gmvComputed: parseFloat(row.gmv_computed?.toString() ?? '0'),
        gmvOverride: row.gmv_override ? parseFloat(row.gmv_override.toString()) : null,
        takeRatePercent: parseFloat(row.take_rate_percent?.toString() ?? '10'),
        sortOrder: row.sort_order ?? 0,
        isActive: row.is_active ?? true,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })));
    } catch (error) {
      console.error('Error fetching marketplace categories:', error);
      toast.error('Ошибка загрузки категорий');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Fetch channel stats
  const fetchChannelStats = useCallback(async () => {
    if (!projectId || categories.length === 0) return;

    try {
      const categoryIds = categories.map(c => c.id);
      const { data, error } = await supabase
        .from('category_channel_stats')
        .select('*')
        .in('category_id', categoryIds);

      if (error) throw error;

      setChannelStats((data ?? []).map(row => ({
        id: row.id,
        categoryId: row.category_id,
        channelId: row.channel_id,
        transactionsPerPeriod: row.transactions_per_period,
        sharePercent: row.share_percent ? parseFloat(row.share_percent.toString()) : null,
        takeRateOverridePercent: row.take_rate_override_percent ? parseFloat(row.take_rate_override_percent.toString()) : null,
        isActive: row.is_active ?? true,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })));
    } catch (error) {
      console.error('Error fetching channel stats:', error);
    }
  }, [projectId, categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchChannelStats();
  }, [fetchChannelStats]);

  // CRUD operations for categories
  const saveCategory = useCallback(async (category: Omit<MarketplaceCategory, 'id' | 'createdAt' | 'updatedAt' | 'gmvComputed'>) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('marketplace_categories')
        .insert({
          project_id: projectId,
          name: category.name,
          description: category.description,
          transactions_count: category.transactionsCount,
          avg_check: category.avgCheck,
          gmv_override: category.gmvOverride,
          take_rate_percent: category.takeRatePercent,
          sort_order: category.sortOrder,
          is_active: category.isActive,
        });

      if (error) throw error;
      
      toast.success('Категория добавлена');
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Ошибка сохранения категории');
    }
  }, [projectId, fetchCategories]);

  const updateCategory = useCallback(async (categoryId: string, updates: Partial<MarketplaceCategory>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.transactionsCount !== undefined) dbUpdates.transactions_count = updates.transactionsCount;
      if (updates.avgCheck !== undefined) dbUpdates.avg_check = updates.avgCheck;
      if (updates.gmvOverride !== undefined) dbUpdates.gmv_override = updates.gmvOverride;
      if (updates.takeRatePercent !== undefined) dbUpdates.take_rate_percent = updates.takeRatePercent;
      if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from('marketplace_categories')
        .update(dbUpdates)
        .eq('id', categoryId);

      if (error) throw error;
      
      await fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Ошибка обновления категории');
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      
      toast.success('Категория удалена');
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Ошибка удаления категории');
    }
  }, [fetchCategories]);

  // CRUD operations for channel stats
  const saveChannelStat = useCallback(async (stat: Omit<CategoryChannelStats, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { error } = await supabase
        .from('category_channel_stats')
        .insert({
          category_id: stat.categoryId,
          channel_id: stat.channelId,
          transactions_per_period: stat.transactionsPerPeriod,
          share_percent: stat.sharePercent,
          take_rate_override_percent: stat.takeRateOverridePercent,
          is_active: stat.isActive,
        });

      if (error) throw error;
      
      await fetchChannelStats();
    } catch (error) {
      console.error('Error saving channel stat:', error);
      toast.error('Ошибка сохранения связи с каналом');
    }
  }, [fetchChannelStats]);

  const updateChannelStat = useCallback(async (statId: string, updates: Partial<CategoryChannelStats>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.transactionsPerPeriod !== undefined) dbUpdates.transactions_per_period = updates.transactionsPerPeriod;
      if (updates.sharePercent !== undefined) dbUpdates.share_percent = updates.sharePercent;
      if (updates.takeRateOverridePercent !== undefined) dbUpdates.take_rate_override_percent = updates.takeRateOverridePercent;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from('category_channel_stats')
        .update(dbUpdates)
        .eq('id', statId);

      if (error) throw error;
      
      await fetchChannelStats();
    } catch (error) {
      console.error('Error updating channel stat:', error);
      toast.error('Ошибка обновления связи с каналом');
    }
  }, [fetchChannelStats]);

  const deleteChannelStat = useCallback(async (statId: string) => {
    try {
      const { error } = await supabase
        .from('category_channel_stats')
        .delete()
        .eq('id', statId);

      if (error) throw error;
      
      await fetchChannelStats();
    } catch (error) {
      console.error('Error deleting channel stat:', error);
      toast.error('Ошибка удаления связи с каналом');
    }
  }, [fetchChannelStats]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalGmv = 0;
    let totalPlatformRevenue = 0;

    categories.forEach(cat => {
      const catStats = channelStats.filter(cs => cs.categoryId === cat.id);
      totalGmv += cat.gmvOverride ?? cat.gmvComputed;
      
      catStats.forEach(cs => {
        // Note: This needs channels passed in from the parent component
        // For now, we'll calculate a simplified version
        const gmvUsed = cat.gmvOverride ?? cat.gmvComputed;
        const txChannel = cs.transactionsPerPeriod ?? (cat.transactionsCount * (cs.sharePercent ?? 0) / 100);
        const avgCheck = cat.transactionsCount > 0 ? gmvUsed / cat.transactionsCount : cat.avgCheck;
        const gmvChannel = avgCheck * txChannel;
        const effectiveTakeRate = cs.takeRateOverridePercent ?? cat.takeRatePercent;
        totalPlatformRevenue += gmvChannel * (effectiveTakeRate / 100);
      });
    });

    return {
      totalGmv,
      totalPlatformRevenue,
      avgTakeRate: totalGmv > 0 ? (totalPlatformRevenue / totalGmv) * 100 : 0,
    };
  }, [categories, channelStats]);

  return {
    categories,
    channelStats,
    isLoading,
    saveCategory,
    updateCategory,
    deleteCategory,
    saveChannelStat,
    updateChannelStat,
    deleteChannelStat,
    totals,
    refetch: fetchCategories,
  };
};
