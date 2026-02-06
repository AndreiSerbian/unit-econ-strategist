import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  PlanningPeriod,
  RawMaterialV2,
  LogisticsTariffV2,
  DeliveryTariffV2,
  SalesChannelV2,
  ProductChannelV2,
  ProductDistributionV2,
  ChannelRevenueCalculation,
} from '@/components/distribution-v2/types';
import {
  calculateRawMaterialShippingCost,
  calculateDeliveryCostPerUnit,
  calculateChannelRevenue,
} from '@/components/distribution-v2/types';

interface UseDistributionV2Props {
  projectId: string | undefined;
  isAuthenticated: boolean;
}

interface UseDistributionV2Return {
  planningPeriod: PlanningPeriod;
  setPlanningPeriod: (period: PlanningPeriod) => Promise<void>;
  rawMaterials: RawMaterialV2[];
  addRawMaterial: (material: Omit<RawMaterialV2, 'id' | 'projectId'>) => Promise<void>;
  updateRawMaterial: (id: string, updates: Partial<RawMaterialV2>) => Promise<void>;
  deleteRawMaterial: (id: string) => Promise<void>;
  logisticsTariffs: LogisticsTariffV2[];
  addLogisticsTariff: (tariff: Omit<LogisticsTariffV2, 'id' | 'projectId'>) => Promise<void>;
  updateLogisticsTariff: (id: string, updates: Partial<LogisticsTariffV2>) => Promise<void>;
  deleteLogisticsTariff: (id: string) => Promise<void>;
  deliveryTariffs: DeliveryTariffV2[];
  addDeliveryTariff: (tariff: Omit<DeliveryTariffV2, 'id' | 'projectId'>) => Promise<void>;
  updateDeliveryTariff: (id: string, updates: Partial<DeliveryTariffV2>) => Promise<void>;
  deleteDeliveryTariff: (id: string) => Promise<void>;
  salesChannels: SalesChannelV2[];
  addSalesChannel: (channel: Omit<SalesChannelV2, 'id' | 'projectId'>) => Promise<void>;
  updateSalesChannel: (id: string, updates: Partial<SalesChannelV2>) => Promise<void>;
  deleteSalesChannel: (id: string) => Promise<void>;
  productChannels: ProductChannelV2[];
  addProductChannel: (link: Omit<ProductChannelV2, 'id'>) => Promise<void>;
  updateProductChannel: (id: string, updates: Partial<ProductChannelV2>) => Promise<void>;
  deleteProductChannel: (id: string) => Promise<void>;
  productsDistribution: ProductDistributionV2[];
  updateProductDistribution: (id: string, updates: Partial<ProductDistributionV2>) => Promise<void>;
  getChannelRevenue: (productId: string, channelId: string) => ChannelRevenueCalculation | null;
  getTotalNetRevenue: () => number;
  getMaterialShippingCost: (materialId: string) => number;
  loading: boolean;
  saving: boolean;
}

// Type for raw DB responses (use any to bypass strict typing until types are regenerated)
type DbRecord = Record<string, unknown>;

export const useDistributionV2 = ({
  projectId,
  isAuthenticated,
}: UseDistributionV2Props): UseDistributionV2Return => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [planningPeriod, setPlanningPeriodState] = useState<PlanningPeriod>('month');
  const [rawMaterials, setRawMaterials] = useState<RawMaterialV2[]>([]);
  const [logisticsTariffs, setLogisticsTariffs] = useState<LogisticsTariffV2[]>([]);
  const [deliveryTariffs, setDeliveryTariffs] = useState<DeliveryTariffV2[]>([]);
  const [salesChannels, setSalesChannels] = useState<SalesChannelV2[]>([]);
  const [productChannels, setProductChannels] = useState<ProductChannelV2[]>([]);
  const [productsDistribution, setProductsDistribution] = useState<ProductDistributionV2[]>([]);

  const loadData = useCallback(async () => {
    if (!projectId || !isAuthenticated) return;
    
    setLoading(true);
    try {
      // Load planning period from project
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();
      
      if (projectData) {
        const pd = projectData as DbRecord;
        if (pd.planning_period) {
          setPlanningPeriodState(pd.planning_period as PlanningPeriod);
        }
      }

      // Load raw materials
      const { data: rawMaterialsData } = await supabase
        .from('raw_materials')
        .select('*')
        .eq('project_id', projectId);
      
      if (rawMaterialsData) {
        setRawMaterials(rawMaterialsData.map((rm: DbRecord) => ({
          id: rm.id as string,
          projectId: rm.project_id as string,
          name: rm.name as string,
          unitCost: (rm.unit_cost ?? rm.price_per_unit ?? 0) as number,
          unitType: (rm.unit_type ?? rm.unit ?? 'piece') as string,
          weightPerUnit: (rm.weight_per_unit ?? rm.weight ?? 0) as number,
          volumePerUnit: (rm.volume_per_unit ?? rm.volume ?? 0) as number,
          shipmentSize: (rm.shipment_size ?? 1) as number,
          supplierName: rm.supplier_name as string | undefined,
          leadTimeDays: rm.lead_time_days as number | undefined,
          distanceKm: (rm.distance ?? 0) as number,
        })));
      }

      // Load logistics tariffs - these need special handling for v1/v2 format
      const { data: logisticsData } = await supabase
        .from('logistics_tariffs')
        .select('*')
        .eq('project_id', projectId);
      
      if (logisticsData) {
        const parsedTariffs: LogisticsTariffV2[] = [];
        for (const lt of logisticsData) {
          const ltRecord = lt as DbRecord;
          // Check if v2 structure (has name column with string value)
          if (ltRecord.name && typeof ltRecord.name === 'string') {
            parsedTariffs.push({
              id: ltRecord.id as string,
              projectId: ltRecord.project_id as string,
              name: ltRecord.name as string,
              carrierName: ltRecord.carrier_name as string | undefined,
              baseCost: (ltRecord.base_cost ?? 0) as number,
              costPerKg: (ltRecord.cost_per_kg ?? 0) as number,
              costPerM3: (ltRecord.cost_per_m3 ?? 0) as number,
              costPerKm: (ltRecord.cost_per_km ?? 0) as number,
              pricingModel: ((ltRecord.pricing_model ?? 'sum') as 'sum' | 'max'),
              minCharge: (ltRecord.min_charge ?? 0) as number,
              currency: (ltRecord.currency ?? 'EUR') as string,
              notes: ltRecord.notes as string | undefined,
            });
          }
        }
        setLogisticsTariffs(parsedTariffs);
      }

      // Load delivery tariffs
      const { data: deliveryData } = await supabase
        .from('delivery_tariffs')
        .select('*')
        .eq('project_id', projectId);
      
      if (deliveryData) {
        setDeliveryTariffs(deliveryData.map((dt: DbRecord) => ({
          id: dt.id as string,
          projectId: dt.project_id as string,
          name: dt.name as string,
          deliveryType: (dt.delivery_type ?? 'standard') as DeliveryTariffV2['deliveryType'],
          baseCost: (dt.base_cost ?? 0) as number,
          costPerKg: (dt.cost_per_kg ?? 0) as number,
          costPerM3: (dt.cost_per_m3 ?? 0) as number,
          pricingModel: ((dt.pricing_model ?? 'sum') as 'sum' | 'max'),
          minCharge: (dt.min_charge ?? 0) as number,
          avgDistanceKm: dt.avg_distance_km as number | undefined,
          currency: (dt.currency ?? 'EUR') as string,
          notes: dt.notes as string | undefined,
        })));
      }

      // Load sales channels
      const { data: channelsData } = await supabase
        .from('sales_channels')
        .select('*')
        .eq('project_id', projectId);
      
      if (channelsData) {
        setSalesChannels(channelsData.map((sc: DbRecord) => ({
          id: sc.id as string,
          projectId: sc.project_id as string,
          name: sc.name as string,
          channelType: ((sc.channel_type ?? sc.type ?? 'direct') as SalesChannelV2['channelType']),
          commissionPercent: (sc.commission_percent ?? 0) as number,
          commissionFixed: (sc.commission_fixed ?? 0) as number,
          discountPercent: (sc.discount_percent ?? 0) as number,
          paymentTermsDays: (sc.payment_terms_days ?? sc.payment_delay_days ?? 0) as number,
          returnsPercent: (sc.returns_percent ?? sc.return_rate_percent ?? 0) as number,
          currency: (sc.currency ?? 'EUR') as string,
          isActive: sc.is_active !== false,
          notes: sc.notes as string | undefined,
        })));
      }

      // Load product-channel links
      const { data: productChannelsData } = await supabase
        .from('product_channels')
        .select('*');
      
      if (productChannelsData) {
        setProductChannels(productChannelsData.map((pc: DbRecord) => ({
          id: pc.id as string,
          productId: pc.product_id as string,
          channelId: pc.channel_id as string,
          priceOverride: pc.price_override as number | undefined,
          channelSharePercent: (pc.channel_share_percent ?? 100) as number,
          isActive: pc.is_active !== false,
        })));
      }

      // Load products with distribution fields
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('project_id', projectId);
      
      if (productsData) {
        setProductsDistribution(productsData.map((p: DbRecord) => ({
          id: p.id as string,
          name: p.name as string,
          price: (p.price ?? 0) as number,
          cost: (p.cost ?? 0) as number,
          quantity: (p.quantity ?? 0) as number,
          weightKg: (p.weight_kg ?? p.weight_per_unit ?? 0) as number,
          volumeM3: (p.volume_m3 ?? p.volume_per_unit ?? 0) as number,
          deliveryTariffId: p.delivery_tariff_id as string | undefined,
          manualDeliveryOverride: (p.manual_delivery_override ?? false) as boolean,
          manualDeliveryCost: (p.manual_delivery_cost ?? 0) as number,
        })));
      }

    } catch (error) {
      console.error('Error loading distribution data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [projectId, isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Planning Period
  const setPlanningPeriod = useCallback(async (period: PlanningPeriod) => {
    if (!projectId) return;
    
    setPlanningPeriodState(period);
    setSaving(true);
    try {
      await supabase
        .from('projects')
        .update({ planning_period: period } as Record<string, unknown>)
        .eq('id', projectId);
    } catch (error) {
      console.error('Error updating planning period:', error);
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  // Raw Materials CRUD
  const addRawMaterial = useCallback(async (material: Omit<RawMaterialV2, 'id' | 'projectId'>) => {
    if (!projectId) return;
    
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('raw_materials')
        .insert({
          project_id: projectId,
          name: material.name,
          price_per_unit: material.unitCost,
          unit: material.unitType,
          weight: material.weightPerUnit,
          volume: material.volumePerUnit,
          distance: material.distanceKm ?? 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setRawMaterials(prev => [...prev, {
          id: data.id,
          projectId: data.project_id,
          name: data.name,
          unitCost: data.price_per_unit ?? 0,
          unitType: data.unit ?? 'piece',
          weightPerUnit: data.weight ?? 0,
          volumePerUnit: data.volume ?? 0,
          shipmentSize: 1,
          distanceKm: data.distance ?? 0,
        }]);
        toast.success('Сырьё добавлено');
      }
    } catch (error) {
      console.error('Error adding raw material:', error);
      toast.error('Ошибка добавления сырья');
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const updateRawMaterial = useCallback(async (id: string, updates: Partial<RawMaterialV2>) => {
    setSaving(true);
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.unitCost !== undefined) dbUpdates.price_per_unit = updates.unitCost;
      if (updates.unitType !== undefined) dbUpdates.unit = updates.unitType;
      if (updates.weightPerUnit !== undefined) dbUpdates.weight = updates.weightPerUnit;
      if (updates.volumePerUnit !== undefined) dbUpdates.volume = updates.volumePerUnit;
      if (updates.distanceKm !== undefined) dbUpdates.distance = updates.distanceKm;

      await supabase.from('raw_materials').update(dbUpdates).eq('id', id);
      setRawMaterials(prev => prev.map(rm => rm.id === id ? { ...rm, ...updates } : rm));
    } catch (error) {
      console.error('Error updating raw material:', error);
      toast.error('Ошибка обновления');
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteRawMaterial = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await supabase.from('raw_materials').delete().eq('id', id);
      setRawMaterials(prev => prev.filter(rm => rm.id !== id));
      toast.success('Сырьё удалено');
    } catch (error) {
      console.error('Error deleting raw material:', error);
      toast.error('Ошибка удаления');
    } finally {
      setSaving(false);
    }
  }, []);

  // Logistics Tariffs CRUD
  const addLogisticsTariff = useCallback(async (tariff: Omit<LogisticsTariffV2, 'id' | 'projectId'>) => {
    if (!projectId) return;
    
    setSaving(true);
    try {
      // Store as JSONB in tariffs column for now
      const tariffData = {
        name: tariff.name,
        carrier_name: tariff.carrierName,
        base_cost: tariff.baseCost,
        cost_per_kg: tariff.costPerKg,
        cost_per_m3: tariff.costPerM3,
        cost_per_km: tariff.costPerKm,
        pricing_model: tariff.pricingModel,
        min_charge: tariff.minCharge,
        currency: tariff.currency,
        notes: tariff.notes,
      };

      const { data, error } = await supabase
        .from('logistics_tariffs')
        .insert({
          project_id: projectId,
          tariffs: tariffData,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setLogisticsTariffs(prev => [...prev, {
          id: data.id,
          projectId: data.project_id,
          ...tariff,
        }]);
        toast.success('Тариф добавлен');
      }
    } catch (error) {
      console.error('Error adding logistics tariff:', error);
      toast.error('Ошибка добавления тарифа');
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const updateLogisticsTariff = useCallback(async (id: string, updates: Partial<LogisticsTariffV2>) => {
    setSaving(true);
    try {
      const current = logisticsTariffs.find(t => t.id === id);
      if (!current) return;

      const updatedTariff = { ...current, ...updates };
      const tariffData = {
        name: updatedTariff.name,
        carrier_name: updatedTariff.carrierName,
        base_cost: updatedTariff.baseCost,
        cost_per_kg: updatedTariff.costPerKg,
        cost_per_m3: updatedTariff.costPerM3,
        cost_per_km: updatedTariff.costPerKm,
        pricing_model: updatedTariff.pricingModel,
        min_charge: updatedTariff.minCharge,
        currency: updatedTariff.currency,
        notes: updatedTariff.notes,
      };

      await supabase.from('logistics_tariffs').update({ tariffs: tariffData }).eq('id', id);
      setLogisticsTariffs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Error updating logistics tariff:', error);
      toast.error('Ошибка обновления');
    } finally {
      setSaving(false);
    }
  }, [logisticsTariffs]);

  const deleteLogisticsTariff = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await supabase.from('logistics_tariffs').delete().eq('id', id);
      setLogisticsTariffs(prev => prev.filter(t => t.id !== id));
      toast.success('Тариф удалён');
    } catch (error) {
      console.error('Error deleting logistics tariff:', error);
      toast.error('Ошибка удаления');
    } finally {
      setSaving(false);
    }
  }, []);

  // Delivery Tariffs CRUD
  const addDeliveryTariff = useCallback(async (tariff: Omit<DeliveryTariffV2, 'id' | 'projectId'>) => {
    if (!projectId) return;
    
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('delivery_tariffs')
        .insert({
          project_id: projectId,
          name: tariff.name,
          delivery_type: tariff.deliveryType,
          base_cost: tariff.baseCost,
          cost_per_kg: tariff.costPerKg,
          cost_per_m3: tariff.costPerM3,
          pricing_model: tariff.pricingModel,
          min_charge: tariff.minCharge,
          avg_distance_km: tariff.avgDistanceKm,
          currency: tariff.currency,
          notes: tariff.notes,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setDeliveryTariffs(prev => [...prev, {
          id: data.id,
          projectId: data.project_id,
          name: data.name,
          deliveryType: (data.delivery_type ?? 'standard') as DeliveryTariffV2['deliveryType'],
          baseCost: data.base_cost ?? 0,
          costPerKg: data.cost_per_kg ?? 0,
          costPerM3: data.cost_per_m3 ?? 0,
          pricingModel: (data.pricing_model ?? 'sum') as 'sum' | 'max',
          minCharge: data.min_charge ?? 0,
          avgDistanceKm: data.avg_distance_km ?? undefined,
          currency: data.currency ?? 'EUR',
          notes: data.notes ?? undefined,
        }]);
        toast.success('Тариф доставки добавлен');
      }
    } catch (error) {
      console.error('Error adding delivery tariff:', error);
      toast.error('Ошибка добавления');
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const updateDeliveryTariff = useCallback(async (id: string, updates: Partial<DeliveryTariffV2>) => {
    setSaving(true);
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.deliveryType !== undefined) dbUpdates.delivery_type = updates.deliveryType;
      if (updates.baseCost !== undefined) dbUpdates.base_cost = updates.baseCost;
      if (updates.costPerKg !== undefined) dbUpdates.cost_per_kg = updates.costPerKg;
      if (updates.costPerM3 !== undefined) dbUpdates.cost_per_m3 = updates.costPerM3;
      if (updates.pricingModel !== undefined) dbUpdates.pricing_model = updates.pricingModel;
      if (updates.minCharge !== undefined) dbUpdates.min_charge = updates.minCharge;
      if (updates.avgDistanceKm !== undefined) dbUpdates.avg_distance_km = updates.avgDistanceKm;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

      await supabase.from('delivery_tariffs').update(dbUpdates).eq('id', id);
      setDeliveryTariffs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Error updating delivery tariff:', error);
      toast.error('Ошибка обновления');
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteDeliveryTariff = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await supabase.from('delivery_tariffs').delete().eq('id', id);
      setDeliveryTariffs(prev => prev.filter(t => t.id !== id));
      toast.success('Тариф удалён');
    } catch (error) {
      console.error('Error deleting delivery tariff:', error);
      toast.error('Ошибка удаления');
    } finally {
      setSaving(false);
    }
  }, []);

  // Sales Channels CRUD
  const addSalesChannel = useCallback(async (channel: Omit<SalesChannelV2, 'id' | 'projectId'>) => {
    if (!projectId) return;
    
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('sales_channels')
        .insert({
          project_id: projectId,
          name: channel.name,
          type: channel.channelType,
          commission_percent: channel.commissionPercent,
          discount_percent: channel.discountPercent,
          payment_delay_days: channel.paymentTermsDays,
          return_rate_percent: channel.returnsPercent,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSalesChannels(prev => [...prev, {
          id: data.id,
          projectId: data.project_id,
          name: data.name,
          channelType: (data.type ?? 'direct') as SalesChannelV2['channelType'],
          commissionPercent: data.commission_percent ?? 0,
          commissionFixed: 0,
          discountPercent: data.discount_percent ?? 0,
          paymentTermsDays: data.payment_delay_days ?? 0,
          returnsPercent: data.return_rate_percent ?? 0,
          currency: 'EUR',
          isActive: true,
        }]);
        toast.success('Канал добавлен');
      }
    } catch (error) {
      console.error('Error adding sales channel:', error);
      toast.error('Ошибка добавления канала');
    } finally {
      setSaving(false);
    }
  }, [projectId]);

  const updateSalesChannel = useCallback(async (id: string, updates: Partial<SalesChannelV2>) => {
    setSaving(true);
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.channelType !== undefined) dbUpdates.type = updates.channelType;
      if (updates.commissionPercent !== undefined) dbUpdates.commission_percent = updates.commissionPercent;
      if (updates.discountPercent !== undefined) dbUpdates.discount_percent = updates.discountPercent;
      if (updates.paymentTermsDays !== undefined) dbUpdates.payment_delay_days = updates.paymentTermsDays;
      if (updates.returnsPercent !== undefined) dbUpdates.return_rate_percent = updates.returnsPercent;

      await supabase.from('sales_channels').update(dbUpdates).eq('id', id);
      setSalesChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (error) {
      console.error('Error updating sales channel:', error);
      toast.error('Ошибка обновления');
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteSalesChannel = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await supabase.from('sales_channels').delete().eq('id', id);
      setSalesChannels(prev => prev.filter(c => c.id !== id));
      toast.success('Канал удалён');
    } catch (error) {
      console.error('Error deleting sales channel:', error);
      toast.error('Ошибка удаления');
    } finally {
      setSaving(false);
    }
  }, []);

  // Product Channels CRUD
  const addProductChannel = useCallback(async (link: Omit<ProductChannelV2, 'id'>) => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('product_channels')
        .insert({
          product_id: link.productId,
          channel_id: link.channelId,
          price_override: link.priceOverride,
          channel_share_percent: link.channelSharePercent,
          is_active: link.isActive,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProductChannels(prev => [...prev, {
          id: data.id,
          productId: data.product_id,
          channelId: data.channel_id,
          priceOverride: data.price_override ?? undefined,
          channelSharePercent: data.channel_share_percent ?? 100,
          isActive: data.is_active !== false,
        }]);
      }
    } catch (error) {
      console.error('Error adding product channel:', error);
      toast.error('Ошибка привязки канала');
    } finally {
      setSaving(false);
    }
  }, []);

  const updateProductChannel = useCallback(async (id: string, updates: Partial<ProductChannelV2>) => {
    setSaving(true);
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.priceOverride !== undefined) dbUpdates.price_override = updates.priceOverride;
      if (updates.channelSharePercent !== undefined) dbUpdates.channel_share_percent = updates.channelSharePercent;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      await supabase.from('product_channels').update(dbUpdates).eq('id', id);
      setProductChannels(prev => prev.map(pc => pc.id === id ? { ...pc, ...updates } : pc));
    } catch (error) {
      console.error('Error updating product channel:', error);
      toast.error('Ошибка обновления');
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteProductChannel = useCallback(async (id: string) => {
    setSaving(true);
    try {
      await supabase.from('product_channels').delete().eq('id', id);
      setProductChannels(prev => prev.filter(pc => pc.id !== id));
    } catch (error) {
      console.error('Error deleting product channel:', error);
      toast.error('Ошибка удаления');
    } finally {
      setSaving(false);
    }
  }, []);

  // Product Distribution fields update
  const updateProductDistribution = useCallback(async (id: string, updates: Partial<ProductDistributionV2>) => {
    setSaving(true);
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.weightKg !== undefined) dbUpdates.weight_per_unit = updates.weightKg;
      if (updates.volumeM3 !== undefined) dbUpdates.volume_per_unit = updates.volumeM3;
      if (updates.deliveryTariffId !== undefined) dbUpdates.delivery_tariff_id = updates.deliveryTariffId;
      if (updates.manualDeliveryOverride !== undefined) dbUpdates.manual_delivery_override = updates.manualDeliveryOverride;
      if (updates.manualDeliveryCost !== undefined) dbUpdates.manual_delivery_cost = updates.manualDeliveryCost;

      await supabase.from('products').update(dbUpdates).eq('id', id);
      setProductsDistribution(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (error) {
      console.error('Error updating product distribution:', error);
      toast.error('Ошибка обновления продукта');
    } finally {
      setSaving(false);
    }
  }, []);

  // Calculation helpers
  const getMaterialShippingCost = useCallback((materialId: string): number => {
    const material = rawMaterials.find(m => m.id === materialId);
    if (!material) return 0;
    
    const tariff = logisticsTariffs.find(t => t.id === material.logisticsTariffId);
    return calculateRawMaterialShippingCost(material, tariff);
  }, [rawMaterials, logisticsTariffs]);

  const productsWithDeliveryCost = useMemo(() => {
    return productsDistribution.map(product => {
      const tariff = deliveryTariffs.find(t => t.id === product.deliveryTariffId);
      const computedCost = calculateDeliveryCostPerUnit(product, tariff);
      const effectiveCost = product.manualDeliveryOverride 
        ? product.manualDeliveryCost 
        : computedCost;
      
      return {
        ...product,
        computedDeliveryCost: computedCost,
        effectiveDeliveryCost: effectiveCost,
      };
    });
  }, [productsDistribution, deliveryTariffs]);

  const getChannelRevenue = useCallback((productId: string, channelId: string): ChannelRevenueCalculation | null => {
    const product = productsWithDeliveryCost.find(p => p.id === productId);
    const channel = salesChannels.find(c => c.id === channelId);
    const productChannel = productChannels.find(pc => pc.productId === productId && pc.channelId === channelId);
    
    if (!product || !channel || !productChannel) return null;
    
    return calculateChannelRevenue(product, channel, productChannel, planningPeriod);
  }, [productsWithDeliveryCost, salesChannels, productChannels, planningPeriod]);

  const getTotalNetRevenue = useCallback((): number => {
    let total = 0;
    
    for (const product of productsWithDeliveryCost) {
      const linkedChannels = productChannels.filter(pc => pc.productId === product.id && pc.isActive);
      
      for (const link of linkedChannels) {
        const channel = salesChannels.find(c => c.id === link.channelId);
        if (!channel || !channel.isActive) continue;
        
        const calculation = calculateChannelRevenue(product, channel, link, planningPeriod);
        total += calculation.revenueChannel;
      }
    }
    
    return total;
  }, [productsWithDeliveryCost, productChannels, salesChannels, planningPeriod]);

  return {
    planningPeriod,
    setPlanningPeriod,
    rawMaterials,
    addRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    logisticsTariffs,
    addLogisticsTariff,
    updateLogisticsTariff,
    deleteLogisticsTariff,
    deliveryTariffs,
    addDeliveryTariff,
    updateDeliveryTariff,
    deleteDeliveryTariff,
    salesChannels,
    addSalesChannel,
    updateSalesChannel,
    deleteSalesChannel,
    productChannels,
    addProductChannel,
    updateProductChannel,
    deleteProductChannel,
    productsDistribution: productsWithDeliveryCost,
    updateProductDistribution,
    getChannelRevenue,
    getTotalNetRevenue,
    getMaterialShippingCost,
    loading,
    saving,
  };
};
