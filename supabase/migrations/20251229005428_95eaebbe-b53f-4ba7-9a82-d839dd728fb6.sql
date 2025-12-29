-- Добавляем недостающие поля в таблицу products для сохранения полных данных
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_per_unit NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS volume_per_unit NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_type TEXT DEFAULT 'courier';
ALTER TABLE products ADD COLUMN IF NOT EXISTS logistics_to_client NUMERIC DEFAULT 0;

-- Создаем таблицу для детализированных расходов сценариев
CREATE TABLE IF NOT EXISTS detailed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scenario_type TEXT NOT NULL,
  expenses JSONB NOT NULL DEFAULT '{}',
  lead_sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, scenario_type)
);

-- RLS для detailed_expenses
ALTER TABLE detailed_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own detailed expenses" 
ON detailed_expenses 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM projects p WHERE p.id = detailed_expenses.project_id AND p.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM projects p WHERE p.id = detailed_expenses.project_id AND p.user_id = auth.uid()
));

-- Триггер для обновления updated_at
CREATE TRIGGER update_detailed_expenses_updated_at
BEFORE UPDATE ON detailed_expenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Создаем таблицу для каналов продаж
CREATE TABLE IF NOT EXISTS sales_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'website',
  commission_percent NUMERIC DEFAULT 0,
  fulfillment_cost_per_unit NUMERIC DEFAULT 0,
  logistics_cost_per_unit NUMERIC DEFAULT 0,
  return_rate_percent NUMERIC DEFAULT 0,
  payment_delay_days INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS для sales_channels
ALTER TABLE sales_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sales channels" 
ON sales_channels 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM projects p WHERE p.id = sales_channels.project_id AND p.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM projects p WHERE p.id = sales_channels.project_id AND p.user_id = auth.uid()
));

-- Триггер для обновления updated_at
CREATE TRIGGER update_sales_channels_updated_at
BEFORE UPDATE ON sales_channels
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Создаем таблицу для распределения продуктов по каналам
CREATE TABLE IF NOT EXISTS product_channel_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 0,
  price_override NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, product_id, channel_id)
);

-- RLS для product_channel_allocations
ALTER TABLE product_channel_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own product channel allocations" 
ON product_channel_allocations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM projects p WHERE p.id = product_channel_allocations.project_id AND p.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM projects p WHERE p.id = product_channel_allocations.project_id AND p.user_id = auth.uid()
));

-- Триггер для обновления updated_at
CREATE TRIGGER update_product_channel_allocations_updated_at
BEFORE UPDATE ON product_channel_allocations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Добавляем поля логистики в raw_materials
ALTER TABLE raw_materials ADD COLUMN IF NOT EXISTS weight NUMERIC DEFAULT 0;
ALTER TABLE raw_materials ADD COLUMN IF NOT EXISTS volume NUMERIC DEFAULT 0;
ALTER TABLE raw_materials ADD COLUMN IF NOT EXISTS transport_type TEXT DEFAULT 'auto';
ALTER TABLE raw_materials ADD COLUMN IF NOT EXISTS distance NUMERIC DEFAULT 0;
ALTER TABLE raw_materials ADD COLUMN IF NOT EXISTS logistics_to_production NUMERIC DEFAULT 0;

-- Создаем таблицу для тарифов логистики
CREATE TABLE IF NOT EXISTS logistics_tariffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tariffs JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id)
);

-- RLS для logistics_tariffs
ALTER TABLE logistics_tariffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own logistics tariffs" 
ON logistics_tariffs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM projects p WHERE p.id = logistics_tariffs.project_id AND p.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM projects p WHERE p.id = logistics_tariffs.project_id AND p.user_id = auth.uid()
));

-- Триггер для обновления updated_at
CREATE TRIGGER update_logistics_tariffs_updated_at
BEFORE UPDATE ON logistics_tariffs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();