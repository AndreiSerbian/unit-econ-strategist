-- =============================================
-- TOKEN-BASED SAAS PRICING SYSTEM SCHEMA
-- =============================================

-- 1. Add columns to api_models for mode/variant and class
ALTER TABLE api_models 
ADD COLUMN IF NOT EXISTS mode_or_variant text,
ADD COLUMN IF NOT EXISTS model_class text DEFAULT 'text' CHECK (model_class IN ('text', 'image', 'image_premium')),
ADD COLUMN IF NOT EXISTS model_type text DEFAULT 'text' CHECK (model_type IN ('text', 'image'));

-- 2. Create model_pricing_text table
CREATE TABLE IF NOT EXISTS model_pricing_text (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES api_models(id) ON DELETE CASCADE,
  price_in_1m numeric NOT NULL DEFAULT 0,
  price_cached_in_1m numeric,
  price_out_1m numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(model_id)
);

-- 3. Create model_pricing_image table
CREATE TABLE IF NOT EXISTS model_pricing_image (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES api_models(id) ON DELETE CASCADE,
  price_per_image numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(model_id)
);

-- 4. Add columns to operations_catalog for full economics
ALTER TABLE operations_catalog 
ADD COLUMN IF NOT EXISTS default_in_tok integer DEFAULT 300,
ADD COLUMN IF NOT EXISTS default_out_tok integer DEFAULT 400,
ADD COLUMN IF NOT EXISTS user_price_usd numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS it_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS margin_usd numeric DEFAULT 0;

-- 5. Create package_capacities table
CREATE TABLE IF NOT EXISTS package_capacities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES token_packages(id) ON DELETE CASCADE,
  operation_id uuid NOT NULL REFERENCES operations_catalog(id) ON DELETE CASCADE,
  approx_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(package_id, operation_id)
);

-- 6. Enable RLS on new tables
ALTER TABLE model_pricing_text ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_pricing_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_capacities ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for model_pricing_text
CREATE POLICY "Users can view pricing for their models"
ON model_pricing_text FOR SELECT
USING (EXISTS (
  SELECT 1 FROM api_models m
  JOIN projects p ON p.id = m.project_id
  WHERE m.id = model_pricing_text.model_id AND p.user_id = auth.uid()
));

CREATE POLICY "Users can manage pricing for their models"
ON model_pricing_text FOR ALL
USING (EXISTS (
  SELECT 1 FROM api_models m
  JOIN projects p ON p.id = m.project_id
  WHERE m.id = model_pricing_text.model_id AND p.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM api_models m
  JOIN projects p ON p.id = m.project_id
  WHERE m.id = model_pricing_text.model_id AND p.user_id = auth.uid()
));

-- 8. RLS Policies for model_pricing_image
CREATE POLICY "Users can view image pricing for their models"
ON model_pricing_image FOR SELECT
USING (EXISTS (
  SELECT 1 FROM api_models m
  JOIN projects p ON p.id = m.project_id
  WHERE m.id = model_pricing_image.model_id AND p.user_id = auth.uid()
));

CREATE POLICY "Users can manage image pricing for their models"
ON model_pricing_image FOR ALL
USING (EXISTS (
  SELECT 1 FROM api_models m
  JOIN projects p ON p.id = m.project_id
  WHERE m.id = model_pricing_image.model_id AND p.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM api_models m
  JOIN projects p ON p.id = m.project_id
  WHERE m.id = model_pricing_image.model_id AND p.user_id = auth.uid()
));

-- 9. RLS Policies for package_capacities
CREATE POLICY "Users can view package capacities"
ON package_capacities FOR SELECT
USING (EXISTS (
  SELECT 1 FROM token_packages tp
  JOIN projects p ON p.id = tp.project_id
  WHERE tp.id = package_capacities.package_id AND p.user_id = auth.uid()
));

CREATE POLICY "Users can manage package capacities"
ON package_capacities FOR ALL
USING (EXISTS (
  SELECT 1 FROM token_packages tp
  JOIN projects p ON p.id = tp.project_id
  WHERE tp.id = package_capacities.package_id AND p.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM token_packages tp
  JOIN projects p ON p.id = tp.project_id
  WHERE tp.id = package_capacities.package_id AND p.user_id = auth.uid()
));

-- 10. Triggers for updated_at
CREATE TRIGGER update_model_pricing_text_updated_at
BEFORE UPDATE ON model_pricing_text
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_model_pricing_image_updated_at
BEFORE UPDATE ON model_pricing_image
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();