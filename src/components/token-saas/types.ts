// Types for Token SaaS business model

export interface ApiProvider {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  base_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiModel {
  id: string;
  project_id: string;
  provider_id?: string;
  model_name: string;
  model_code: string;
  model_type?: string;       // 'text' | 'image'
  model_class?: string;      // 'text' | 'image' | 'image_premium'
  mode_or_variant?: string;  // e.g. 'Batch', 'Standard', 'HD 1024×1024'
  api_cost_usd: number;
  description?: string;
  active: boolean;
  enabled: boolean;           // allowed for calculations (user can toggle)
  created_at: string;
  updated_at: string;
  // Joined field
  provider?: ApiProvider;
  // Pricing (joined)
  pricing_text?: { price_in_1m: number; price_cached_in_1m: number | null; price_out_1m: number };
  pricing_image?: { price_per_image: number };
}

export interface TokenPackage {
  id: string;
  project_id: string;
  name: string;
  it_amount: number;
  price_usd: number;
  description?: string;
  active: boolean;
  sort_order: number;
  scenario_type: 'current' | 'optimistic' | 'pessimistic';
  expected_sales: number;
  created_at: string;
  updated_at: string;
}

export type OperationType = 'text' | 'image' | 'image_premium' | 'audio' | 'video' | 'custom';

export interface OperationCatalogItem {
  id: string;
  project_id: string;
  operation_code: string;
  name: string;
  description?: string;
  operation_type: OperationType;
  api_model_id?: string;
  api_cost_usd: number;
  markup_multiplier: number;
  base_it_cost: number; // Generated column
  active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  api_model?: ApiModel;
}

export interface CompositeOperation {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Calculated fields
  items?: CompositeOperationItem[];
  total_it_cost?: number;
  total_api_cost?: number;
  total_user_price?: number;
  total_margin?: number;
}

export interface CompositeOperationItem {
  id: string;
  composite_id: string;
  operation_id: string;
  quantity: number;
  created_at: string;
  // Joined fields
  operation?: OperationCatalogItem;
}

export interface TokenEconomicsConfig {
  id: string;
  project_id: string;
  it_value_usd: number;
  default_text_markup: number;
  default_image_markup: number;
  default_premium_markup: number;
  default_in_tok: number;
  default_out_tok: number;
  created_at: string;
  updated_at: string;
}

export interface OperationUsageForecast {
  id: string;
  project_id: string;
  operation_id?: string;
  composite_id?: string;
  scenario_type: 'current' | 'optimistic' | 'pessimistic';
  expected_usage: number;
  created_at: string;
  updated_at: string;
}

// Calculated metrics
export interface TokenEconomicsMetrics {
  // Per package
  packageRevenue: number;
  packageITSold: number;
  effectiveITPrice: number; // price / it_amount
  
  // Per operation
  userPriceUsd: number;
  marginUsd: number;
  marginPercent: number;
  
  // Aggregate (per scenario)
  totalPackageRevenue: number;
  totalITSold: number;
  totalOperationsCost: number;
  totalOperationsMargin: number;
  platformProfit: number;
  
  // Utilization
  itUtilizationPercent: number; // (IT consumed / IT sold) * 100
}

// Default markups by operation type
export const DEFAULT_MARKUPS: Record<OperationType, number> = {
  text: 1.5,
  image: 2.0,
  image_premium: 2.2,
  audio: 1.8,
  video: 2.5,
  custom: 1.5,
};

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  text: 'Текст (LLM)',
  image: 'Изображение',
  image_premium: 'Premium изображение',
  audio: 'Аудио',
  video: 'Видео',
  custom: 'Кастомная',
};

export const OPERATION_TYPE_ICONS: Record<OperationType, string> = {
  text: '💬',
  image: '🖼️',
  image_premium: '✨',
  audio: '🎵',
  video: '🎬',
  custom: '⚙️',
};
