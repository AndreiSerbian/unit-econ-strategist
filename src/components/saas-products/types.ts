export type BillingType = 'subscription' | 'one_time';

export interface SaasProduct {
  id: string;
  project_id: string;
  name: string;
  planning_period: 'week' | 'month' | 'quarter' | 'year';
  default_channel_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaasPlan {
  id: string;
  product_id: string;
  name: string;
  billing_type: BillingType;
  price_eur: number;
  subscribers: number;
  new_subscribers_per_period: number;
  cost_per_subscriber_per_month_eur: number;
  is_free_plan: boolean;
  churn_rate_percent: number | null;
  cost_per_buyer_eur: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SaasProductWithPlans extends SaasProduct {
  plans: SaasPlan[];
}

export interface ProductKPIs {
  subscriptionMRR: number;
  oneTimeRevenue: number;
  totalRevenue: number;
  totalVariableCost: number;
  /** Revenue − Variable Costs. NOTE: contribution profit, not strict gross profit. */
  grossProfit: number;
  /**
   * FIN-004 — Contribution margin %, kept under legacy name for backward compatibility.
   * @deprecated Prefer `contributionMarginPercent`.
   */
  grossMarginPercent: number;
  /** Contribution margin % = (Revenue − Variable Costs) / Revenue. */
  contributionMarginPercent: number;
  totalSubscribers: number;
  totalFreeTierUsers: number;
  totalBuyers: number;
}

export interface PlanFormData {
  name: string;
  billing_type: BillingType;
  price_eur: number;
  subscribers: number;
  new_subscribers_per_period: number;
  cost_per_subscriber_per_month_eur: number;
  is_free_plan: boolean;
  churn_rate_percent: number | null;
  cost_per_buyer_eur: number | null;
}
