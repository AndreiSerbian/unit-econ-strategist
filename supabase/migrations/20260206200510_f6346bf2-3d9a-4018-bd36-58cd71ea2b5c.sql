-- Services v2: Add billing model, planning period, and enhanced metrics
-- Add new columns to products_services table

ALTER TABLE products_services
  ADD COLUMN IF NOT EXISTS billing_model text DEFAULT 'fixed_project' 
    CHECK (billing_model IN ('fixed_project', 'hourly', 'retainer')),
  ADD COLUMN IF NOT EXISTS planning_period text DEFAULT 'month'
    CHECK (planning_period IN ('week', 'month', 'quarter', 'year')),
  ADD COLUMN IF NOT EXISTS estimated_hours_per_project numeric CHECK (estimated_hours_per_project >= 0),
  ADD COLUMN IF NOT EXISTS planned_billable_hours_per_period numeric CHECK (planned_billable_hours_per_period >= 0),
  ADD COLUMN IF NOT EXISTS billable_percent numeric DEFAULT 100 CHECK (billable_percent >= 0 AND billable_percent <= 100),
  ADD COLUMN IF NOT EXISTS allocation_percent numeric DEFAULT 100 CHECK (allocation_percent >= 0 AND allocation_percent <= 100),
  ADD COLUMN IF NOT EXISTS retainer_fee numeric CHECK (retainer_fee >= 0),
  ADD COLUMN IF NOT EXISTS clients_count integer DEFAULT 0 CHECK (clients_count >= 0);

-- Rename utilization to billable_percent for clarity (keep old column as alias during migration)
-- Note: We're adding billable_percent as new column, utilization remains for backward compatibility

-- Update the products_full view to include new services fields
DROP VIEW IF EXISTS products_full;
CREATE OR REPLACE VIEW products_full WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.project_id,
  p.name,
  p.price,
  p.cost,
  p.quantity,
  p.quality,
  p.weight_per_unit,
  p.volume_per_unit,
  p.logistics_to_client,
  p.delivery_type,
  p.created_at,
  p.updated_at,
  -- SaaS fields
  ps_saas.churn_rate,
  ps_saas.free_to_pay_conversion,
  ps_saas.new_subscribers,
  ps_saas.arpu AS saas_arpu,
  ps_saas.mrr AS saas_mrr,
  -- Services fields (existing)
  ps_svc.hourly_rate,
  ps_svc.hours_per_week,
  ps_svc.utilization,
  -- Services fields (new v2)
  ps_svc.billing_model,
  ps_svc.planning_period,
  ps_svc.estimated_hours_per_project,
  ps_svc.planned_billable_hours_per_period,
  ps_svc.billable_percent,
  ps_svc.allocation_percent,
  ps_svc.retainer_fee,
  ps_svc.clients_count AS services_clients_count,
  -- Marketplace fields
  ps_mp.take_rate AS marketplace_take_rate,
  ps_mp.gmv,
  ps_mp.avg_order_value,
  -- Sharing fields
  ps_sh.utilization_rate,
  ps_sh.take_rate AS sharing_take_rate,
  -- Production fields
  ps_prod.defect_rate
FROM products p
LEFT JOIN products_saas ps_saas ON ps_saas.product_id = p.id
LEFT JOIN products_services ps_svc ON ps_svc.product_id = p.id
LEFT JOIN products_marketplace ps_mp ON ps_mp.product_id = p.id
LEFT JOIN products_sharing ps_sh ON ps_sh.product_id = p.id
LEFT JOIN products_production ps_prod ON ps_prod.product_id = p.id;

-- Add comment for documentation
COMMENT ON COLUMN products_services.billing_model IS 'Billing model: fixed_project, hourly, or retainer';
COMMENT ON COLUMN products_services.planning_period IS 'Planning period: week, month, quarter, or year';
COMMENT ON COLUMN products_services.estimated_hours_per_project IS 'Estimated hours per project (required for fixed_project model)';
COMMENT ON COLUMN products_services.planned_billable_hours_per_period IS 'Planned billable hours per period (for hourly model)';
COMMENT ON COLUMN products_services.billable_percent IS 'Percentage of hours that are billable (0-100)';
COMMENT ON COLUMN products_services.allocation_percent IS 'Percentage of capacity allocated to this service (0-100)';
COMMENT ON COLUMN products_services.retainer_fee IS 'Monthly retainer fee (for retainer model)';
COMMENT ON COLUMN products_services.clients_count IS 'Number of clients on retainer (for retainer model)';