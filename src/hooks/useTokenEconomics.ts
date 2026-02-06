import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ==========================================
// CONSTANTS - Single Source of Truth
// ==========================================
export const IT_VALUE_USD = 0.001;
export const MARKUP_TEXT = 1.5;
export const MARKUP_IMAGE = 2.0;
export const MARKUP_IMAGE_PREMIUM = 2.2;

export const DEFAULT_IN_TOK = 300;
export const DEFAULT_OUT_TOK = 400;

// ==========================================
// Types
// ==========================================
export interface Provider {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  baseUrl?: string;
}

export interface TextModel {
  id: string;
  projectId: string;
  providerId: string;
  providerName?: string;
  modelName: string;
  modelCode: string;
  modelType: "text" | "image";
  modelClass: "text" | "image" | "image_premium";
  modeOrVariant: string;
  active: boolean;
  pricing?: {
    priceIn1m: number;
    priceCachedIn1m: number | null;
    priceOut1m: number;
  };
}

export interface ImageModel {
  id: string;
  projectId: string;
  providerId: string;
  providerName?: string;
  modelName: string;
  modelCode: string;
  modelType: "text" | "image";
  modelClass: "text" | "image" | "image_premium";
  modeOrVariant: string;
  active: boolean;
  pricing?: {
    pricePerImage: number;
  };
}

export interface Operation {
  id: string;
  projectId: string;
  operationCode: string;
  name: string;
  description?: string;
  operationType: "text" | "image";
  modelId?: string;
  modelName?: string;
  providerName?: string;
  modeOrVariant?: string;
  defaultInTok: number;
  defaultOutTok: number;
  apiCostUsd: number;
  markupMultiplier: number;
  userPriceUsd: number;
  itCost: number;
  marginUsd: number;
  active: boolean;
}

export interface TokenPackage {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  itAmount: number;
  priceUsd: number;
  active: boolean;
  sortOrder: number;
}

export interface PackageCapacity {
  id: string;
  packageId: string;
  operationId: string;
  approxCount: number;
  operationName?: string;
}

// ==========================================
// Pricing JSON - Single Source of Truth
// ==========================================
export const PRICING_DATA = {
  text_models: [
    { provider: "OpenAI", model: "gpt-4o-mini", mode: "Batch", price_in_1m: 0.15, price_cached_in_1m: 0.075, price_out_1m: 0.60 },
    { provider: "OpenAI", model: "gpt-4o-mini", mode: "Standard", price_in_1m: 0.30, price_cached_in_1m: 0.15, price_out_1m: 1.20 },
    { provider: "OpenAI", model: "gpt-4o", mode: "Batch", price_in_1m: 2.50, price_cached_in_1m: 1.25, price_out_1m: 10.00 },
    { provider: "OpenAI", model: "gpt-4o", mode: "Standard", price_in_1m: 3.75, price_cached_in_1m: 1.875, price_out_1m: 15.00 },
    { provider: "Google", model: "Gemini 2.5 Flash", mode: "Standard", price_in_1m: 0.30, price_cached_in_1m: null, price_out_1m: 2.50 },
    { provider: "Google", model: "Gemini 2.5 Flash", mode: "Batch", price_in_1m: 0.15, price_cached_in_1m: null, price_out_1m: 1.25 },
    { provider: "Google", model: "Gemini 2.5 Flash-Lite", mode: "Standard", price_in_1m: 0.10, price_cached_in_1m: null, price_out_1m: 0.40 },
    { provider: "Google", model: "Gemini 2.5 Flash-Lite", mode: "Batch", price_in_1m: 0.05, price_cached_in_1m: null, price_out_1m: 0.20 },
    { provider: "Anthropic", model: "Claude Sonnet 4.5", mode: "Standard", price_in_1m: 3.00, price_cached_in_1m: null, price_out_1m: 15.00 },
  ],
  image_models: [
    { provider: "OpenAI", model: "DALL·E 3", variant: "Standard 1024x1024", price_per_image: 0.04, class: "image" },
    { provider: "OpenAI", model: "DALL·E 3", variant: "Standard 1024x1792", price_per_image: 0.08, class: "image" },
    { provider: "OpenAI", model: "DALL·E 3", variant: "HD 1024x1024", price_per_image: 0.08, class: "image" },
    { provider: "OpenAI", model: "DALL·E 3", variant: "HD 1024x1792", price_per_image: 0.12, class: "image_premium" },
    { provider: "OpenAI", model: "GPT-Image-1", variant: "Low 1024x1024", price_per_image: 0.011, class: "image" },
    { provider: "OpenAI", model: "GPT-Image-1", variant: "Medium 1024x1024", price_per_image: 0.042, class: "image" },
    { provider: "OpenAI", model: "GPT-Image-1", variant: "High 1024x1024", price_per_image: 0.167, class: "image_premium" },
    { provider: "OpenAI", model: "chatgpt-image-latest", variant: "Low 1024x1024", price_per_image: 0.009, class: "image" },
    { provider: "OpenAI", model: "chatgpt-image-latest", variant: "Medium 1024x1024", price_per_image: 0.034, class: "image" },
    { provider: "OpenAI", model: "chatgpt-image-latest", variant: "High 1024x1024", price_per_image: 0.133, class: "image_premium" },
    { provider: "Google", model: "Gemini Image Output", variant: "up to 1024x1024", price_per_image: 0.039, class: "image" },
    { provider: "NanoBanana", model: "NanoBanana", variant: "1 image", price_per_image: 0.09, class: "image_premium" },
    { provider: "NanoBanana", model: "NanoBanana Pro", variant: "1 image", price_per_image: 0.12, class: "image_premium" },
  ],
};

export const DEFAULT_PACKAGES = [
  { name: "Basic", itAmount: 25000, priceUsd: 25 },
  { name: "Pro", itAmount: 75000, priceUsd: 75 },
  { name: "Enterprise", itAmount: 200000, priceUsd: 200 },
];

// ==========================================
// Calculation Functions
// ==========================================
export function calculateTextApiCost(
  priceIn1m: number,
  priceOut1m: number,
  inTok: number = DEFAULT_IN_TOK,
  outTok: number = DEFAULT_OUT_TOK
): number {
  return (inTok / 1_000_000) * priceIn1m + (outTok / 1_000_000) * priceOut1m;
}

export function calculateUserPrice(apiCostUsd: number, markup: number): number {
  return apiCostUsd * markup;
}

export function calculateItCost(userPriceUsd: number): number {
  return userPriceUsd / IT_VALUE_USD;
}

export function calculateMargin(userPriceUsd: number, apiCostUsd: number): number {
  return userPriceUsd - apiCostUsd;
}

export function getMarkupForClass(modelClass: "text" | "image" | "image_premium"): number {
  switch (modelClass) {
    case "text": return MARKUP_TEXT;
    case "image": return MARKUP_IMAGE;
    case "image_premium": return MARKUP_IMAGE_PREMIUM;
    default: return MARKUP_TEXT;
  }
}

export function generateOperationCode(
  provider: string,
  model: string,
  modeOrVariant: string,
  type: "text" | "image"
): string {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  return `${type}_${clean(provider)}_${clean(model)}_${clean(modeOrVariant)}_default`;
}

// ==========================================
// Hook
// ==========================================
export function useTokenEconomics(projectId: string | undefined) {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [textModels, setTextModels] = useState<TextModel[]>([]);
  const [imageModels, setImageModels] = useState<ImageModel[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [capacities, setCapacities] = useState<PackageCapacity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);

    try {
      // Fetch providers
      const { data: providersData } = await supabase
        .from("api_providers")
        .select("*")
        .eq("project_id", projectId);

      // Fetch models with pricing
      const { data: modelsData } = await supabase
        .from("api_models")
        .select("*, api_providers(name)")
        .eq("project_id", projectId);

      // Fetch text pricing
      const { data: textPricingData } = await supabase
        .from("model_pricing_text")
        .select("*");

      // Fetch image pricing
      const { data: imagePricingData } = await supabase
        .from("model_pricing_image")
        .select("*");

      // Fetch operations
      const { data: opsData } = await supabase
        .from("operations_catalog")
        .select("*, api_models(model_name, mode_or_variant, api_providers(name))")
        .eq("project_id", projectId);

      // Fetch packages
      const { data: packagesData } = await supabase
        .from("token_packages")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order");

      // Fetch capacities
      const { data: capacitiesData } = await supabase
        .from("package_capacities")
        .select("*, operations_catalog(name)");

      // Map providers
      setProviders(
        (providersData || []).map((p) => ({
          id: p.id,
          projectId: p.project_id,
          name: p.name,
          description: p.description || undefined,
          baseUrl: p.base_url || undefined,
        }))
      );

      // Build pricing maps
      const textPricingMap = new Map(
        (textPricingData || []).map((tp) => [tp.model_id, tp])
      );
      const imagePricingMap = new Map(
        (imagePricingData || []).map((ip) => [ip.model_id, ip])
      );

      // Map text models
      const textModelsArr: TextModel[] = [];
      const imageModelsArr: ImageModel[] = [];

      (modelsData || []).forEach((m) => {
        const base = {
          id: m.id,
          projectId: m.project_id,
          providerId: m.provider_id || "",
          providerName: (m.api_providers as any)?.name || "",
          modelName: m.model_name,
          modelCode: m.model_code,
          modelType: (m.model_type || "text") as "text" | "image",
          modelClass: (m.model_class || "text") as "text" | "image" | "image_premium",
          modeOrVariant: m.mode_or_variant || "",
          active: m.active,
        };

        if (base.modelType === "text") {
          const tp = textPricingMap.get(m.id);
          textModelsArr.push({
            ...base,
            pricing: tp
              ? {
                  priceIn1m: Number(tp.price_in_1m),
                  priceCachedIn1m: tp.price_cached_in_1m ? Number(tp.price_cached_in_1m) : null,
                  priceOut1m: Number(tp.price_out_1m),
                }
              : undefined,
          });
        } else {
          const ip = imagePricingMap.get(m.id);
          imageModelsArr.push({
            ...base,
            pricing: ip
              ? { pricePerImage: Number(ip.price_per_image) }
              : undefined,
          });
        }
      });

      setTextModels(textModelsArr);
      setImageModels(imageModelsArr);

      // Map operations
      setOperations(
        (opsData || []).map((op) => ({
          id: op.id,
          projectId: op.project_id,
          operationCode: op.operation_code,
          name: op.name,
          description: op.description || undefined,
          operationType: (op.operation_type || "text") as "text" | "image",
          modelId: op.api_model_id || undefined,
          modelName: (op.api_models as any)?.model_name || undefined,
          providerName: (op.api_models as any)?.api_providers?.name || undefined,
          modeOrVariant: (op.api_models as any)?.mode_or_variant || undefined,
          defaultInTok: op.default_in_tok || DEFAULT_IN_TOK,
          defaultOutTok: op.default_out_tok || DEFAULT_OUT_TOK,
          apiCostUsd: Number(op.api_cost_usd),
          markupMultiplier: Number(op.markup_multiplier),
          userPriceUsd: Number(op.user_price_usd),
          itCost: Number(op.it_cost),
          marginUsd: Number(op.margin_usd),
          active: op.active,
        }))
      );

      // Map packages
      setPackages(
        (packagesData || []).map((p) => ({
          id: p.id,
          projectId: p.project_id,
          name: p.name,
          description: p.description || undefined,
          itAmount: Number(p.it_amount),
          priceUsd: Number(p.price_usd),
          active: p.active,
          sortOrder: p.sort_order || 0,
        }))
      );

      // Map capacities
      setCapacities(
        (capacitiesData || []).map((c) => ({
          id: c.id,
          packageId: c.package_id,
          operationId: c.operation_id,
          approxCount: c.approx_count,
          operationName: (c.operations_catalog as any)?.name || undefined,
        }))
      );
    } catch (err) {
      console.error("Error fetching token economics data:", err);
      toast({ title: "Ошибка загрузки данных", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Seed the database with pricing data
  const seedPricingData = useCallback(async () => {
    if (!projectId) return;

    try {
      // 1. Get or create providers
      const providerNames = [...new Set([
        ...PRICING_DATA.text_models.map((m) => m.provider),
        ...PRICING_DATA.image_models.map((m) => m.provider),
      ])];

      const providerMap = new Map<string, string>();

      for (const name of providerNames) {
        // Check if exists
        const { data: existing } = await supabase
          .from("api_providers")
          .select("id")
          .eq("project_id", projectId)
          .eq("name", name)
          .single();

        if (existing) {
          providerMap.set(name, existing.id);
        } else {
          const { data: newProvider, error } = await supabase
            .from("api_providers")
            .insert({ project_id: projectId, name })
            .select("id")
            .single();
          if (error) throw error;
          providerMap.set(name, newProvider.id);
        }
      }

      // 2. Create text models with pricing
      for (const tm of PRICING_DATA.text_models) {
        const providerId = providerMap.get(tm.provider);
        const modelCode = generateOperationCode(tm.provider, tm.model, tm.mode, "text");

        // Check if model exists
        const { data: existingModel } = await supabase
          .from("api_models")
          .select("id")
          .eq("project_id", projectId)
          .eq("model_code", modelCode)
          .single();

        let modelId: string;

        if (existingModel) {
          modelId = existingModel.id;
          // Update
          await supabase
            .from("api_models")
            .update({
              provider_id: providerId,
              model_name: tm.model,
              mode_or_variant: tm.mode,
              model_type: "text",
              model_class: "text",
            })
            .eq("id", modelId);
        } else {
          const { data: newModel, error } = await supabase
            .from("api_models")
            .insert({
              project_id: projectId,
              provider_id: providerId,
              model_name: tm.model,
              model_code: modelCode,
              mode_or_variant: tm.mode,
              model_type: "text",
              model_class: "text",
            })
            .select("id")
            .single();
          if (error) throw error;
          modelId = newModel.id;
        }

        // Upsert pricing
        const { error: pricingError } = await supabase
          .from("model_pricing_text")
          .upsert({
            model_id: modelId,
            price_in_1m: tm.price_in_1m,
            price_cached_in_1m: tm.price_cached_in_1m,
            price_out_1m: tm.price_out_1m,
          }, { onConflict: "model_id" });
        if (pricingError) throw pricingError;
      }

      // 3. Create image models with pricing
      for (const im of PRICING_DATA.image_models) {
        const providerId = providerMap.get(im.provider);
        const modelCode = generateOperationCode(im.provider, im.model, im.variant, "image");

        const { data: existingModel } = await supabase
          .from("api_models")
          .select("id")
          .eq("project_id", projectId)
          .eq("model_code", modelCode)
          .single();

        let modelId: string;

        if (existingModel) {
          modelId = existingModel.id;
          await supabase
            .from("api_models")
            .update({
              provider_id: providerId,
              model_name: im.model,
              mode_or_variant: im.variant,
              model_type: "image",
              model_class: im.class as "image" | "image_premium",
            })
            .eq("id", modelId);
        } else {
          const { data: newModel, error } = await supabase
            .from("api_models")
            .insert({
              project_id: projectId,
              provider_id: providerId,
              model_name: im.model,
              model_code: modelCode,
              mode_or_variant: im.variant,
              model_type: "image",
              model_class: im.class,
            })
            .select("id")
            .single();
          if (error) throw error;
          modelId = newModel.id;
        }

        const { error: pricingError } = await supabase
          .from("model_pricing_image")
          .upsert({
            model_id: modelId,
            price_per_image: im.price_per_image,
          }, { onConflict: "model_id" });
        if (pricingError) throw pricingError;
      }

      toast({ title: "Данные успешно загружены" });
      await fetchData();
    } catch (err) {
      console.error("Error seeding pricing data:", err);
      toast({ title: "Ошибка загрузки данных", variant: "destructive" });
    }
  }, [projectId, fetchData, toast]);

  // Generate operations from models
  const generateOperations = useCallback(async () => {
    if (!projectId) return;

    try {
      // Fetch all models with pricing
      const { data: models } = await supabase
        .from("api_models")
        .select("*, api_providers(name)")
        .eq("project_id", projectId);

      const { data: textPricing } = await supabase.from("model_pricing_text").select("*");
      const { data: imagePricing } = await supabase.from("model_pricing_image").select("*");

      const textPricingMap = new Map((textPricing || []).map((p) => [p.model_id, p]));
      const imagePricingMap = new Map((imagePricing || []).map((p) => [p.model_id, p]));

      for (const model of models || []) {
        const providerName = (model.api_providers as any)?.name || "";
        const opCode = model.model_code;
        const opType = model.model_type as "text" | "image";
        const modelClass = (model.model_class || "text") as "text" | "image" | "image_premium";
        const markup = getMarkupForClass(modelClass);

        let apiCostUsd = 0;

        if (opType === "text") {
          const pricing = textPricingMap.get(model.id);
          if (pricing) {
            apiCostUsd = calculateTextApiCost(
              Number(pricing.price_in_1m),
              Number(pricing.price_out_1m),
              DEFAULT_IN_TOK,
              DEFAULT_OUT_TOK
            );
          }
        } else {
          const pricing = imagePricingMap.get(model.id);
          if (pricing) {
            apiCostUsd = Number(pricing.price_per_image);
          }
        }

        const userPriceUsd = calculateUserPrice(apiCostUsd, markup);
        const itCost = calculateItCost(userPriceUsd);
        const marginUsd = calculateMargin(userPriceUsd, apiCostUsd);

        // Check if operation exists
        const { data: existingOp } = await supabase
          .from("operations_catalog")
          .select("id")
          .eq("project_id", projectId)
          .eq("operation_code", opCode)
          .single();

        const opData = {
          project_id: projectId,
          operation_code: opCode,
          name: `${providerName} ${model.model_name} (${model.mode_or_variant})`,
          description: `Atomic ${opType} operation`,
          operation_type: opType,
          api_model_id: model.id,
          api_cost_usd: apiCostUsd,
          markup_multiplier: markup,
          user_price_usd: userPriceUsd,
          it_cost: itCost,
          margin_usd: marginUsd,
          default_in_tok: opType === "text" ? DEFAULT_IN_TOK : 0,
          default_out_tok: opType === "text" ? DEFAULT_OUT_TOK : 0,
        };

        if (existingOp) {
          await supabase.from("operations_catalog").update(opData).eq("id", existingOp.id);
        } else {
          await supabase.from("operations_catalog").insert(opData);
        }
      }

      toast({ title: "Операции сгенерированы" });
      await fetchData();
    } catch (err) {
      console.error("Error generating operations:", err);
      toast({ title: "Ошибка генерации операций", variant: "destructive" });
    }
  }, [projectId, fetchData, toast]);

  // Create default packages
  const createDefaultPackages = useCallback(async () => {
    if (!projectId) return;

    try {
      for (let i = 0; i < DEFAULT_PACKAGES.length; i++) {
        const pkg = DEFAULT_PACKAGES[i];

        const { data: existing } = await supabase
          .from("token_packages")
          .select("id")
          .eq("project_id", projectId)
          .eq("name", pkg.name)
          .single();

        if (!existing) {
          await supabase.from("token_packages").insert({
            project_id: projectId,
            name: pkg.name,
            it_amount: pkg.itAmount,
            price_usd: pkg.priceUsd,
            sort_order: i,
          });
        }
      }

      toast({ title: "Пакеты созданы" });
      await fetchData();
    } catch (err) {
      console.error("Error creating packages:", err);
      toast({ title: "Ошибка создания пакетов", variant: "destructive" });
    }
  }, [projectId, fetchData, toast]);

  // Calculate package capacities
  const calculateCapacities = useCallback(async () => {
    if (!projectId) return;

    try {
      // Fetch current packages and operations
      const { data: pkgs } = await supabase
        .from("token_packages")
        .select("id, it_amount")
        .eq("project_id", projectId);

      const { data: ops } = await supabase
        .from("operations_catalog")
        .select("id, it_cost")
        .eq("project_id", projectId)
        .eq("active", true);

      if (!pkgs || !ops) return;

      for (const pkg of pkgs) {
        for (const op of ops) {
          const itCost = Number(op.it_cost);
          const approxCount = itCost > 0 ? Math.floor(Number(pkg.it_amount) / itCost) : 0;

          await supabase
            .from("package_capacities")
            .upsert({
              package_id: pkg.id,
              operation_id: op.id,
              approx_count: approxCount,
            }, { onConflict: "package_id,operation_id" });
        }
      }

      toast({ title: "Ёмкости рассчитаны" });
      await fetchData();
    } catch (err) {
      console.error("Error calculating capacities:", err);
      toast({ title: "Ошибка расчёта ёмкостей", variant: "destructive" });
    }
  }, [projectId, fetchData, toast]);

  // Run full seed pipeline
  const runFullSeed = useCallback(async () => {
    await seedPricingData();
    await generateOperations();
    await createDefaultPackages();
    await calculateCapacities();
  }, [seedPricingData, generateOperations, createDefaultPackages, calculateCapacities]);

  // Computed summary table
  const operationsSummary = useMemo(() => {
    return operations.map((op) => ({
      operation: op.name,
      provider: op.providerName || "-",
      model: op.modelName || "-",
      modeVariant: op.modeOrVariant || "-",
      apiCostUsd: op.apiCostUsd,
      userPriceUsd: op.userPriceUsd,
      itCost: op.itCost,
      marginUsd: op.marginUsd,
    }));
  }, [operations]);

  // Package capacities matrix
  const packageCapacitiesMatrix = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};

    for (const pkg of packages) {
      result[pkg.name] = {};
      const pkgCapacities = capacities.filter((c) => c.packageId === pkg.id);
      for (const cap of pkgCapacities) {
        const op = operations.find((o) => o.id === cap.operationId);
        if (op) {
          result[pkg.name][op.name] = cap.approxCount;
        }
      }
    }

    return result;
  }, [packages, capacities, operations]);

  return {
    loading,
    providers,
    textModels,
    imageModels,
    operations,
    packages,
    capacities,
    operationsSummary,
    packageCapacitiesMatrix,
    // Actions
    refresh: fetchData,
    seedPricingData,
    generateOperations,
    createDefaultPackages,
    calculateCapacities,
    runFullSeed,
  };
}
