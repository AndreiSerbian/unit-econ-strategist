-- =====================================================
-- PRODUCTS SUBTYPE TABLES MIGRATION
-- Move from wide table to base + subtype tables pattern
-- =====================================================

-- 1. CREATE SUBTYPE TABLES
-- =====================================================

-- SaaS/Freemium specific fields
CREATE TABLE public.products_saas (
  product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  churn_rate NUMERIC NULL CHECK (churn_rate >= 0 AND churn_rate <= 100),
  free_to_pay_conversion NUMERIC NULL CHECK (free_to_pay_conversion >= 0 AND free_to_pay_conversion <= 100),
  new_subscribers INTEGER NULL CHECK (new_subscribers >= 0),
  arpu NUMERIC NULL CHECK (arpu >= 0),
  mrr NUMERIC NULL CHECK (mrr >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services specific fields
CREATE TABLE public.products_services (
  product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  hourly_rate NUMERIC NULL CHECK (hourly_rate >= 0),
  hours_per_week NUMERIC NULL CHECK (hours_per_week >= 0 AND hours_per_week <= 168),
  utilization NUMERIC NULL CHECK (utilization >= 0 AND utilization <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketplace specific fields
CREATE TABLE public.products_marketplace (
  product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  take_rate NUMERIC NULL CHECK (take_rate >= 0 AND take_rate <= 100),
  gmv NUMERIC NULL CHECK (gmv >= 0),
  avg_order_value NUMERIC NULL CHECK (avg_order_value >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sharing Economy specific fields
CREATE TABLE public.products_sharing (
  product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  utilization_rate NUMERIC NULL CHECK (utilization_rate >= 0 AND utilization_rate <= 100),
  take_rate NUMERIC NULL CHECK (take_rate >= 0 AND take_rate <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Production specific fields
CREATE TABLE public.products_production (
  product_id UUID PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  defect_rate NUMERIC NULL CHECK (defect_rate >= 0 AND defect_rate <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ADD TRIGGERS FOR updated_at
-- =====================================================

CREATE TRIGGER update_products_saas_updated_at
  BEFORE UPDATE ON public.products_saas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_services_updated_at
  BEFORE UPDATE ON public.products_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_marketplace_updated_at
  BEFORE UPDATE ON public.products_marketplace
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_sharing_updated_at
  BEFORE UPDATE ON public.products_sharing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_production_updated_at
  BEFORE UPDATE ON public.products_production
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3. ENABLE RLS ON SUBTYPE TABLES
-- =====================================================

ALTER TABLE public.products_saas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_production ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES (using existing products access pattern)
-- =====================================================

-- products_saas policies
CREATE POLICY "Users can view saas data of their products"
  ON public.products_saas FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_saas.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert saas data for their products"
  ON public.products_saas FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_saas.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can update saas data of their products"
  ON public.products_saas FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_saas.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete saas data of their products"
  ON public.products_saas FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_saas.product_id AND pr.user_id = auth.uid()
  ));

-- products_services policies
CREATE POLICY "Users can view services data of their products"
  ON public.products_services FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_services.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert services data for their products"
  ON public.products_services FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_services.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can update services data of their products"
  ON public.products_services FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_services.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete services data of their products"
  ON public.products_services FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_services.product_id AND pr.user_id = auth.uid()
  ));

-- products_marketplace policies
CREATE POLICY "Users can view marketplace data of their products"
  ON public.products_marketplace FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_marketplace.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert marketplace data for their products"
  ON public.products_marketplace FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_marketplace.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can update marketplace data of their products"
  ON public.products_marketplace FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_marketplace.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete marketplace data of their products"
  ON public.products_marketplace FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_marketplace.product_id AND pr.user_id = auth.uid()
  ));

-- products_sharing policies
CREATE POLICY "Users can view sharing data of their products"
  ON public.products_sharing FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_sharing.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert sharing data for their products"
  ON public.products_sharing FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_sharing.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can update sharing data of their products"
  ON public.products_sharing FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_sharing.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete sharing data of their products"
  ON public.products_sharing FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_sharing.product_id AND pr.user_id = auth.uid()
  ));

-- products_production policies
CREATE POLICY "Users can view production data of their products"
  ON public.products_production FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_production.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert production data for their products"
  ON public.products_production FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_production.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can update production data of their products"
  ON public.products_production FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_production.product_id AND pr.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete production data of their products"
  ON public.products_production FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.projects pr ON pr.id = p.project_id
    WHERE p.id = products_production.product_id AND pr.user_id = auth.uid()
  ));

-- 5. MIGRATE EXISTING DATA FROM WIDE TABLE TO SUBTYPE TABLES
-- =====================================================

-- Migrate SaaS data (churn_rate, free_to_pay_conversion, new_subscribers are SaaS fields)
INSERT INTO public.products_saas (product_id, churn_rate, free_to_pay_conversion, new_subscribers)
SELECT id, churn_rate, free_to_pay_conversion, new_subscribers
FROM public.products
WHERE churn_rate IS NOT NULL 
   OR free_to_pay_conversion IS NOT NULL 
   OR new_subscribers IS NOT NULL;

-- Migrate Services data
INSERT INTO public.products_services (product_id, hourly_rate, hours_per_week, utilization)
SELECT id, hourly_rate, hours_per_week, utilization
FROM public.products
WHERE hourly_rate IS NOT NULL 
   OR hours_per_week IS NOT NULL 
   OR utilization IS NOT NULL;

-- Migrate Marketplace data
INSERT INTO public.products_marketplace (product_id, take_rate, gmv, avg_order_value)
SELECT id, take_rate, gmv, avg_order_value
FROM public.products
WHERE take_rate IS NOT NULL 
   OR gmv IS NOT NULL 
   OR avg_order_value IS NOT NULL;

-- Migrate Sharing data
INSERT INTO public.products_sharing (product_id, utilization_rate, take_rate)
SELECT id, utilization_rate, take_rate
FROM public.products
WHERE utilization_rate IS NOT NULL;

-- Migrate Production data
INSERT INTO public.products_production (product_id, defect_rate)
SELECT id, defect_rate
FROM public.products
WHERE defect_rate IS NOT NULL;

-- 6. CREATE COMPATIBILITY VIEW (products_full)
-- =====================================================

CREATE OR REPLACE VIEW public.products_full AS
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

-- 7. ADD INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_products_saas_product_id ON public.products_saas(product_id);
CREATE INDEX idx_products_services_product_id ON public.products_services(product_id);
CREATE INDEX idx_products_marketplace_product_id ON public.products_marketplace(product_id);
CREATE INDEX idx_products_sharing_product_id ON public.products_sharing(product_id);
CREATE INDEX idx_products_production_product_id ON public.products_production(product_id);

-- 8. RENAME DEPRECATED COLUMNS (keep for backward compatibility during transition)
-- =====================================================

-- We'll keep the old columns for now but mark them as deprecated in comments
COMMENT ON COLUMN public.products.churn_rate IS 'DEPRECATED: Use products_saas.churn_rate instead';
COMMENT ON COLUMN public.products.free_to_pay_conversion IS 'DEPRECATED: Use products_saas.free_to_pay_conversion instead';
COMMENT ON COLUMN public.products.new_subscribers IS 'DEPRECATED: Use products_saas.new_subscribers instead';
COMMENT ON COLUMN public.products.hourly_rate IS 'DEPRECATED: Use products_services.hourly_rate instead';
COMMENT ON COLUMN public.products.hours_per_week IS 'DEPRECATED: Use products_services.hours_per_week instead';
COMMENT ON COLUMN public.products.utilization IS 'DEPRECATED: Use products_services.utilization instead';
COMMENT ON COLUMN public.products.take_rate IS 'DEPRECATED: Use products_marketplace.take_rate or products_sharing.take_rate instead';
COMMENT ON COLUMN public.products.gmv IS 'DEPRECATED: Use products_marketplace.gmv instead';
COMMENT ON COLUMN public.products.avg_order_value IS 'DEPRECATED: Use products_marketplace.avg_order_value instead';
COMMENT ON COLUMN public.products.utilization_rate IS 'DEPRECATED: Use products_sharing.utilization_rate instead';
COMMENT ON COLUMN public.products.defect_rate IS 'DEPRECATED: Use products_production.defect_rate instead';

-- Add comments to new tables
COMMENT ON TABLE public.products_saas IS 'SaaS/Freemium specific product fields (1:1 with products)';
COMMENT ON TABLE public.products_services IS 'Services/Consulting specific product fields (1:1 with products)';
COMMENT ON TABLE public.products_marketplace IS 'Marketplace specific product fields (1:1 with products)';
COMMENT ON TABLE public.products_sharing IS 'Sharing Economy specific product fields (1:1 with products)';
COMMENT ON TABLE public.products_production IS 'Production/Manufacturing specific product fields (1:1 with products)';