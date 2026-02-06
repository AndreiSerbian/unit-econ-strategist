-- ============================================
-- TOKEN SAAS BUSINESS TYPE
-- ============================================

-- 1. Обновляем check constraint для business_type в projects
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_business_type_check;
ALTER TABLE projects ADD CONSTRAINT projects_business_type_check 
  CHECK (business_type IN ('ecommerce', 'saas', 'services', 'marketplace', 'sharing', 'freemium', 'production', 'token_saas'));

-- 2. API Providers - справочник провайдеров API
CREATE TABLE IF NOT EXISTS api_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  base_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE api_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own api providers"
  ON api_providers FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = api_providers.project_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = api_providers.project_id AND p.user_id = auth.uid()));

-- 3. API Models - модели провайдеров с себестоимостью
CREATE TABLE IF NOT EXISTS api_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES api_providers(id) ON DELETE SET NULL,
  model_name text NOT NULL,
  model_code text NOT NULL, -- уникальный код для ссылок
  api_cost_usd numeric NOT NULL DEFAULT 0 CHECK (api_cost_usd >= 0),
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE api_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own api models"
  ON api_models FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = api_models.project_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = api_models.project_id AND p.user_id = auth.uid()));

-- 4. Token Packages - пакеты токенов для продажи
CREATE TABLE IF NOT EXISTS token_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  it_amount numeric NOT NULL CHECK (it_amount > 0), -- количество IT в пакете
  price_usd numeric NOT NULL CHECK (price_usd > 0), -- цена пакета
  description text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  -- Сценарные данные
  scenario_type text NOT NULL DEFAULT 'current' CHECK (scenario_type IN ('current', 'optimistic', 'pessimistic')),
  expected_sales integer NOT NULL DEFAULT 0, -- ожидаемое кол-во продаж пакета
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own token packages"
  ON token_packages FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = token_packages.project_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = token_packages.project_id AND p.user_id = auth.uid()));

-- 5. Operations Catalog - каталог атомарных операций
CREATE TABLE IF NOT EXISTS operations_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  operation_code text NOT NULL, -- уникальный код операции
  name text NOT NULL,
  description text,
  operation_type text NOT NULL DEFAULT 'text' CHECK (operation_type IN ('text', 'image', 'image_premium', 'audio', 'video', 'custom')),
  api_model_id uuid REFERENCES api_models(id) ON DELETE SET NULL,
  api_cost_usd numeric NOT NULL DEFAULT 0 CHECK (api_cost_usd >= 0), -- себестоимость API вызова
  markup_multiplier numeric NOT NULL DEFAULT 1.5 CHECK (markup_multiplier >= 1), -- наценка
  base_it_cost numeric GENERATED ALWAYS AS (
    CASE WHEN api_cost_usd > 0 THEN ROUND((api_cost_usd * markup_multiplier) / 0.001, 2) ELSE 0 END
  ) STORED, -- IT стоимость = (API cost * markup) / IT value
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE operations_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own operations catalog"
  ON operations_catalog FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = operations_catalog.project_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = operations_catalog.project_id AND p.user_id = auth.uid()));

-- 6. Composite Operations - составные операции
CREATE TABLE IF NOT EXISTS composite_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE composite_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own composite operations"
  ON composite_operations FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = composite_operations.project_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = composite_operations.project_id AND p.user_id = auth.uid()));

-- 7. Composite Operation Items - элементы составных операций
CREATE TABLE IF NOT EXISTS composite_operation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  composite_id uuid NOT NULL REFERENCES composite_operations(id) ON DELETE CASCADE,
  operation_id uuid NOT NULL REFERENCES operations_catalog(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE composite_operation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage composite operation items"
  ON composite_operation_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM composite_operations co 
    JOIN projects p ON p.id = co.project_id 
    WHERE co.id = composite_operation_items.composite_id AND p.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM composite_operations co 
    JOIN projects p ON p.id = co.project_id 
    WHERE co.id = composite_operation_items.composite_id AND p.user_id = auth.uid()
  ));

-- 8. Token Economics Config - настройки токен-экономики для проекта
CREATE TABLE IF NOT EXISTS token_economics_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  it_value_usd numeric NOT NULL DEFAULT 0.001 CHECK (it_value_usd > 0), -- стоимость 1 IT в USD
  default_text_markup numeric NOT NULL DEFAULT 1.5 CHECK (default_text_markup >= 1),
  default_image_markup numeric NOT NULL DEFAULT 2.0 CHECK (default_image_markup >= 1),
  default_premium_markup numeric NOT NULL DEFAULT 2.2 CHECK (default_premium_markup >= 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE token_economics_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own token economics config"
  ON token_economics_config FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = token_economics_config.project_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = token_economics_config.project_id AND p.user_id = auth.uid()));

-- 9. Operation Usage Forecast - прогноз использования операций по сценариям
CREATE TABLE IF NOT EXISTS operation_usage_forecast (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  operation_id uuid REFERENCES operations_catalog(id) ON DELETE CASCADE,
  composite_id uuid REFERENCES composite_operations(id) ON DELETE CASCADE,
  scenario_type text NOT NULL DEFAULT 'current' CHECK (scenario_type IN ('current', 'optimistic', 'pessimistic')),
  expected_usage integer NOT NULL DEFAULT 0 CHECK (expected_usage >= 0), -- ожидаемое кол-во вызовов
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Либо operation_id, либо composite_id
  CHECK (
    (operation_id IS NOT NULL AND composite_id IS NULL) OR
    (operation_id IS NULL AND composite_id IS NOT NULL)
  )
);

ALTER TABLE operation_usage_forecast ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own operation usage forecast"
  ON operation_usage_forecast FOR ALL
  USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = operation_usage_forecast.project_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM projects p WHERE p.id = operation_usage_forecast.project_id AND p.user_id = auth.uid()));

-- Triggers для updated_at
CREATE TRIGGER update_api_providers_updated_at BEFORE UPDATE ON api_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_models_updated_at BEFORE UPDATE ON api_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_packages_updated_at BEFORE UPDATE ON token_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operations_catalog_updated_at BEFORE UPDATE ON operations_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_composite_operations_updated_at BEFORE UPDATE ON composite_operations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_economics_config_updated_at BEFORE UPDATE ON token_economics_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operation_usage_forecast_updated_at BEFORE UPDATE ON operation_usage_forecast
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();