-- Fix SECURITY DEFINER VIEW warning
-- Drop and recreate view with SECURITY INVOKER (default, but explicit)

DROP VIEW IF EXISTS public.products_full;

CREATE VIEW public.products_full
WITH (security_invoker = true)
AS
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
  p.delivery_type,
  p.logistics_to_client,
  p.created_at,
  p.updated_at,
  -- SaaS fields
  s.churn_rate,
  s.free_to_pay_conversion,
  s.new_subscribers,
  s.arpu AS saas_arpu,
  s.mrr AS saas_mrr,
  -- Services fields
  sv.hourly_rate,
  sv.hours_per_week,
  sv.utilization,
  -- Marketplace fields
  m.take_rate AS marketplace_take_rate,
  m.gmv,
  m.avg_order_value,
  -- Sharing fields
  sh.utilization_rate,
  sh.take_rate AS sharing_take_rate,
  -- Production fields
  pr.defect_rate
FROM public.products p
LEFT JOIN public.products_saas s ON s.product_id = p.id
LEFT JOIN public.products_services sv ON sv.product_id = p.id
LEFT JOIN public.products_marketplace m ON m.product_id = p.id
LEFT JOIN public.products_sharing sh ON sh.product_id = p.id
LEFT JOIN public.products_production pr ON pr.product_id = p.id;

-- Grant select on view to authenticated users
GRANT SELECT ON public.products_full TO authenticated;

COMMENT ON VIEW public.products_full IS 'Compatibility view joining products with all subtype tables. Uses SECURITY INVOKER to respect RLS policies of querying user.';