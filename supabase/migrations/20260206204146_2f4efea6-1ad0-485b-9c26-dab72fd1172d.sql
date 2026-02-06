-- =============================================
-- Distribution V2: Dropshipping/Distribution Modules
-- =============================================

-- 1. Add planning_period to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS planning_period text DEFAULT 'month' 
CHECK (planning_period IN ('week', 'month', 'quarter', 'year'));

-- 2. Raw Materials table
CREATE TABLE IF NOT EXISTS raw_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  unit_cost numeric NOT NULL DEFAULT 0,
  unit_type text NOT NULL DEFAULT 'piece', -- piece, kg, liter, meter, etc.
  weight_per_unit numeric DEFAULT 0, -- kg
  volume_per_unit numeric DEFAULT 0, -- m³
  shipment_size integer NOT NULL DEFAULT 1, -- units per shipment (prevents /0)
  supplier_name text,
  lead_time_days integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT raw_materials_shipment_size_positive CHECK (shipment_size > 0)
);

-- 3. Logistics Tariffs (for raw materials shipping)
CREATE TABLE IF NOT EXISTS logistics_tariffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  carrier_name text,
  base_cost numeric NOT NULL DEFAULT 0, -- per shipment
  cost_per_kg numeric DEFAULT 0,
  cost_per_m3 numeric DEFAULT 0,
  cost_per_km numeric DEFAULT 0,
  pricing_model text NOT NULL DEFAULT 'sum' CHECK (pricing_model IN ('sum', 'max')),
  min_charge numeric DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Raw Material - Logistics Tariff link (which tariff applies to which material)
CREATE TABLE IF NOT EXISTS raw_material_logistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_material_id uuid NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
  logistics_tariff_id uuid NOT NULL REFERENCES logistics_tariffs(id) ON DELETE CASCADE,
  distance_km numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(raw_material_id, logistics_tariff_id)
);

-- 5. Delivery Tariffs (for customer delivery)
CREATE TABLE IF NOT EXISTS delivery_tariffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  delivery_type text NOT NULL DEFAULT 'standard', -- standard, express, pickup, etc.
  base_cost numeric NOT NULL DEFAULT 0, -- per delivery
  cost_per_kg numeric DEFAULT 0,
  cost_per_m3 numeric DEFAULT 0,
  pricing_model text NOT NULL DEFAULT 'sum' CHECK (pricing_model IN ('sum', 'max')),
  min_charge numeric DEFAULT 0,
  avg_distance_km numeric DEFAULT 0, -- optional, for averaged tariffs
  currency text NOT NULL DEFAULT 'EUR',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Sales Channels
CREATE TABLE IF NOT EXISTS sales_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  channel_type text NOT NULL DEFAULT 'direct', -- direct, marketplace, wholesale, retail, affiliate
  commission_percent numeric DEFAULT 0 CHECK (commission_percent >= 0 AND commission_percent <= 100),
  commission_fixed numeric DEFAULT 0, -- fixed fee per sale
  discount_percent numeric DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  payment_terms_days integer DEFAULT 0,
  returns_percent numeric DEFAULT 0 CHECK (returns_percent >= 0 AND returns_percent <= 100),
  currency text NOT NULL DEFAULT 'EUR',
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Product-Channel link table (for net revenue calculation)
CREATE TABLE IF NOT EXISTS product_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
  price_override numeric, -- nullable, uses product.price if null
  channel_share_percent numeric DEFAULT 100 CHECK (channel_share_percent >= 0 AND channel_share_percent <= 100),
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, channel_id)
);

-- 8. Add distribution fields to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight_kg numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS volume_m3 numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_tariff_id uuid REFERENCES delivery_tariffs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS manual_delivery_override boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS manual_delivery_cost numeric DEFAULT 0;

-- 9. Enable RLS on all new tables
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE logistics_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_material_logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_channels ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for raw_materials
CREATE POLICY "Users can view their own raw_materials"
ON raw_materials FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = raw_materials.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create raw_materials for their projects"
ON raw_materials FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = raw_materials.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own raw_materials"
ON raw_materials FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = raw_materials.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own raw_materials"
ON raw_materials FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = raw_materials.project_id
    AND p.user_id = auth.uid()
  )
);

-- 11. RLS Policies for logistics_tariffs
CREATE POLICY "Users can view their own logistics_tariffs"
ON logistics_tariffs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = logistics_tariffs.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create logistics_tariffs for their projects"
ON logistics_tariffs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = logistics_tariffs.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own logistics_tariffs"
ON logistics_tariffs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = logistics_tariffs.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own logistics_tariffs"
ON logistics_tariffs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = logistics_tariffs.project_id
    AND p.user_id = auth.uid()
  )
);

-- 12. RLS Policies for raw_material_logistics
CREATE POLICY "Users can view their own raw_material_logistics"
ON raw_material_logistics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM raw_materials rm
    JOIN projects p ON p.id = rm.project_id
    WHERE rm.id = raw_material_logistics.raw_material_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create raw_material_logistics"
ON raw_material_logistics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM raw_materials rm
    JOIN projects p ON p.id = rm.project_id
    WHERE rm.id = raw_material_logistics.raw_material_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own raw_material_logistics"
ON raw_material_logistics FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM raw_materials rm
    JOIN projects p ON p.id = rm.project_id
    WHERE rm.id = raw_material_logistics.raw_material_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own raw_material_logistics"
ON raw_material_logistics FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM raw_materials rm
    JOIN projects p ON p.id = rm.project_id
    WHERE rm.id = raw_material_logistics.raw_material_id
    AND p.user_id = auth.uid()
  )
);

-- 13. RLS Policies for delivery_tariffs
CREATE POLICY "Users can view their own delivery_tariffs"
ON delivery_tariffs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = delivery_tariffs.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create delivery_tariffs for their projects"
ON delivery_tariffs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = delivery_tariffs.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own delivery_tariffs"
ON delivery_tariffs FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = delivery_tariffs.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own delivery_tariffs"
ON delivery_tariffs FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = delivery_tariffs.project_id
    AND p.user_id = auth.uid()
  )
);

-- 14. RLS Policies for sales_channels
CREATE POLICY "Users can view their own sales_channels"
ON sales_channels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = sales_channels.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create sales_channels for their projects"
ON sales_channels FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = sales_channels.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own sales_channels"
ON sales_channels FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = sales_channels.project_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own sales_channels"
ON sales_channels FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = sales_channels.project_id
    AND p.user_id = auth.uid()
  )
);

-- 15. RLS Policies for product_channels
CREATE POLICY "Users can view their own product_channels"
ON product_channels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM products pr
    JOIN projects p ON p.id = pr.project_id
    WHERE pr.id = product_channels.product_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create product_channels"
ON product_channels FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products pr
    JOIN projects p ON p.id = pr.project_id
    WHERE pr.id = product_channels.product_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own product_channels"
ON product_channels FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products pr
    JOIN projects p ON p.id = pr.project_id
    WHERE pr.id = product_channels.product_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own product_channels"
ON product_channels FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM products pr
    JOIN projects p ON p.id = pr.project_id
    WHERE pr.id = product_channels.product_id
    AND p.user_id = auth.uid()
  )
);

-- 16. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_raw_materials_project ON raw_materials(project_id);
CREATE INDEX IF NOT EXISTS idx_logistics_tariffs_project ON logistics_tariffs(project_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tariffs_project ON delivery_tariffs(project_id);
CREATE INDEX IF NOT EXISTS idx_sales_channels_project ON sales_channels(project_id);
CREATE INDEX IF NOT EXISTS idx_product_channels_product ON product_channels(product_id);
CREATE INDEX IF NOT EXISTS idx_product_channels_channel ON product_channels(channel_id);
CREATE INDEX IF NOT EXISTS idx_raw_material_logistics_material ON raw_material_logistics(raw_material_id);

-- 17. Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_raw_materials_updated_at ON raw_materials;
CREATE TRIGGER update_raw_materials_updated_at
BEFORE UPDATE ON raw_materials
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_logistics_tariffs_updated_at ON logistics_tariffs;
CREATE TRIGGER update_logistics_tariffs_updated_at
BEFORE UPDATE ON logistics_tariffs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_delivery_tariffs_updated_at ON delivery_tariffs;
CREATE TRIGGER update_delivery_tariffs_updated_at
BEFORE UPDATE ON delivery_tariffs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_channels_updated_at ON sales_channels;
CREATE TRIGGER update_sales_channels_updated_at
BEFORE UPDATE ON sales_channels
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_channels_updated_at ON product_channels;
CREATE TRIGGER update_product_channels_updated_at
BEFORE UPDATE ON product_channels
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();