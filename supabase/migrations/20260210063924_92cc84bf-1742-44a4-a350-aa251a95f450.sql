
-- 1) Add 'enabled' flag to api_models (active = in catalog, enabled = used for calculations)
ALTER TABLE public.api_models ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT true;

-- 2) Add default token profile to token_economics_config
ALTER TABLE public.token_economics_config 
  ADD COLUMN IF NOT EXISTS default_in_tok INTEGER NOT NULL DEFAULT 300,
  ADD COLUMN IF NOT EXISTS default_out_tok INTEGER NOT NULL DEFAULT 400;

-- 3) Add unique constraint on operation_code + project_id for UPSERT
ALTER TABLE public.operations_catalog 
  DROP CONSTRAINT IF EXISTS operations_catalog_op_code_project_unique;
ALTER TABLE public.operations_catalog 
  ADD CONSTRAINT operations_catalog_op_code_project_unique UNIQUE (operation_code, project_id);

-- 4) Create the seed function: inserts reference providers/models/pricing for a project
CREATE OR REPLACE FUNCTION public.seed_reference_catalog(p_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_openai_id uuid;
  v_google_id uuid;
  v_anthropic_id uuid;
  v_nanobanana_id uuid;
  v_model_id uuid;
BEGIN
  -- Providers (upsert by name+project)
  INSERT INTO api_providers (project_id, name, description)
  VALUES (p_project_id, 'OpenAI', 'OpenAI API')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_openai_id;
  IF v_openai_id IS NULL THEN
    SELECT id INTO v_openai_id FROM api_providers WHERE project_id = p_project_id AND name = 'OpenAI';
  END IF;

  INSERT INTO api_providers (project_id, name, description)
  VALUES (p_project_id, 'Google', 'Google AI')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_google_id;
  IF v_google_id IS NULL THEN
    SELECT id INTO v_google_id FROM api_providers WHERE project_id = p_project_id AND name = 'Google';
  END IF;

  INSERT INTO api_providers (project_id, name, description)
  VALUES (p_project_id, 'Anthropic', 'Anthropic AI')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_anthropic_id;
  IF v_anthropic_id IS NULL THEN
    SELECT id INTO v_anthropic_id FROM api_providers WHERE project_id = p_project_id AND name = 'Anthropic';
  END IF;

  INSERT INTO api_providers (project_id, name, description)
  VALUES (p_project_id, 'NanoBanana', 'NanoBanana Image Gen')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_nanobanana_id;
  IF v_nanobanana_id IS NULL THEN
    SELECT id INTO v_nanobanana_id FROM api_providers WHERE project_id = p_project_id AND name = 'NanoBanana';
  END IF;

  -- ========== TEXT MODELS ==========
  -- gpt-4o-mini Batch
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'gpt-4o-mini', 'gpt-4o-mini-batch', 'text', 'text', 'Batch', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gpt-4o-mini-batch'; END IF;
  INSERT INTO model_pricing_text (model_id, price_in_1m, price_cached_in_1m, price_out_1m) VALUES (v_model_id, 0.15, 0.075, 0.60) ON CONFLICT (model_id) DO UPDATE SET price_in_1m = EXCLUDED.price_in_1m, price_cached_in_1m = EXCLUDED.price_cached_in_1m, price_out_1m = EXCLUDED.price_out_1m;

  -- gpt-4o-mini Standard
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'gpt-4o-mini', 'gpt-4o-mini-standard', 'text', 'text', 'Standard', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gpt-4o-mini-standard'; END IF;
  INSERT INTO model_pricing_text (model_id, price_in_1m, price_cached_in_1m, price_out_1m) VALUES (v_model_id, 0.30, 0.15, 1.20) ON CONFLICT (model_id) DO UPDATE SET price_in_1m = EXCLUDED.price_in_1m, price_cached_in_1m = EXCLUDED.price_cached_in_1m, price_out_1m = EXCLUDED.price_out_1m;

  -- gpt-4o Batch
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'gpt-4o', 'gpt-4o-batch', 'text', 'text', 'Batch', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gpt-4o-batch'; END IF;
  INSERT INTO model_pricing_text (model_id, price_in_1m, price_cached_in_1m, price_out_1m) VALUES (v_model_id, 2.50, 1.25, 10.00) ON CONFLICT (model_id) DO UPDATE SET price_in_1m = EXCLUDED.price_in_1m, price_cached_in_1m = EXCLUDED.price_cached_in_1m, price_out_1m = EXCLUDED.price_out_1m;

  -- gpt-4o Standard
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'gpt-4o', 'gpt-4o-standard', 'text', 'text', 'Standard', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gpt-4o-standard'; END IF;
  INSERT INTO model_pricing_text (model_id, price_in_1m, price_cached_in_1m, price_out_1m) VALUES (v_model_id, 3.75, 1.875, 15.00) ON CONFLICT (model_id) DO UPDATE SET price_in_1m = EXCLUDED.price_in_1m, price_cached_in_1m = EXCLUDED.price_cached_in_1m, price_out_1m = EXCLUDED.price_out_1m;

  -- Gemini 2.5 Flash Standard
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_google_id, 'Gemini 2.5 Flash', 'gemini-25-flash-standard', 'text', 'text', 'Standard', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gemini-25-flash-standard'; END IF;
  INSERT INTO model_pricing_text (model_id, price_in_1m, price_cached_in_1m, price_out_1m) VALUES (v_model_id, 0.30, NULL, 2.50) ON CONFLICT (model_id) DO UPDATE SET price_in_1m = EXCLUDED.price_in_1m, price_cached_in_1m = EXCLUDED.price_cached_in_1m, price_out_1m = EXCLUDED.price_out_1m;

  -- Gemini 2.5 Flash Batch
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_google_id, 'Gemini 2.5 Flash', 'gemini-25-flash-batch', 'text', 'text', 'Batch', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gemini-25-flash-batch'; END IF;
  INSERT INTO model_pricing_text (model_id, price_in_1m, price_cached_in_1m, price_out_1m) VALUES (v_model_id, 0.15, NULL, 1.25) ON CONFLICT (model_id) DO UPDATE SET price_in_1m = EXCLUDED.price_in_1m, price_cached_in_1m = EXCLUDED.price_cached_in_1m, price_out_1m = EXCLUDED.price_out_1m;

  -- Gemini 2.5 Flash-Lite Standard
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_google_id, 'Gemini 2.5 Flash-Lite', 'gemini-25-flash-lite-standard', 'text', 'text', 'Standard', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gemini-25-flash-lite-standard'; END IF;
  INSERT INTO model_pricing_text (model_id, price_in_1m, price_cached_in_1m, price_out_1m) VALUES (v_model_id, 0.10, NULL, 0.40) ON CONFLICT (model_id) DO UPDATE SET price_in_1m = EXCLUDED.price_in_1m, price_cached_in_1m = EXCLUDED.price_cached_in_1m, price_out_1m = EXCLUDED.price_out_1m;

  -- Gemini 2.5 Flash-Lite Batch
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_google_id, 'Gemini 2.5 Flash-Lite', 'gemini-25-flash-lite-batch', 'text', 'text', 'Batch', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gemini-25-flash-lite-batch'; END IF;
  INSERT INTO model_pricing_text (model_id, price_in_1m, price_cached_in_1m, price_out_1m) VALUES (v_model_id, 0.05, NULL, 0.20) ON CONFLICT (model_id) DO UPDATE SET price_in_1m = EXCLUDED.price_in_1m, price_cached_in_1m = EXCLUDED.price_cached_in_1m, price_out_1m = EXCLUDED.price_out_1m;

  -- Claude Sonnet 4.5
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_anthropic_id, 'Claude Sonnet 4.5', 'claude-sonnet-45-standard', 'text', 'text', 'Standard', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'claude-sonnet-45-standard'; END IF;
  INSERT INTO model_pricing_text (model_id, price_in_1m, price_cached_in_1m, price_out_1m) VALUES (v_model_id, 3.00, NULL, 15.00) ON CONFLICT (model_id) DO UPDATE SET price_in_1m = EXCLUDED.price_in_1m, price_cached_in_1m = EXCLUDED.price_cached_in_1m, price_out_1m = EXCLUDED.price_out_1m;

  -- ========== IMAGE MODELS ==========
  -- DALL·E 3 Standard 1024×1024
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'DALL·E 3', 'dalle3-std-1024', 'image', 'image', 'Standard 1024×1024', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'dalle3-std-1024'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.04) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- DALL·E 3 Standard 1024×1792
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'DALL·E 3', 'dalle3-std-1792', 'image', 'image', 'Standard 1024×1792', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'dalle3-std-1792'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.08) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- DALL·E 3 HD 1024×1024
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'DALL·E 3', 'dalle3-hd-1024', 'image', 'image', 'HD 1024×1024', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'dalle3-hd-1024'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.08) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- DALL·E 3 HD 1024×1792 (premium)
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'DALL·E 3', 'dalle3-hd-1792', 'image', 'image_premium', 'HD 1024×1792', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'dalle3-hd-1792'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.12) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- GPT-Image-1 Low
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'GPT-Image-1', 'gpt-image-1-low', 'image', 'image', 'Low 1024×1024', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gpt-image-1-low'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.011) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- GPT-Image-1 Medium
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'GPT-Image-1', 'gpt-image-1-medium', 'image', 'image', 'Medium 1024×1024', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gpt-image-1-medium'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.042) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- GPT-Image-1 High (premium)
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'GPT-Image-1', 'gpt-image-1-high', 'image', 'image_premium', 'High 1024×1024', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gpt-image-1-high'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.167) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- chatgpt-image-latest Low
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'chatgpt-image-latest', 'chatgpt-image-low', 'image', 'image', 'Low 1024×1024', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'chatgpt-image-low'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.009) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- chatgpt-image-latest Medium
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'chatgpt-image-latest', 'chatgpt-image-medium', 'image', 'image', 'Medium 1024×1024', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'chatgpt-image-medium'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.034) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- chatgpt-image-latest High (premium)
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_openai_id, 'chatgpt-image-latest', 'chatgpt-image-high', 'image', 'image_premium', 'High 1024×1024', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'chatgpt-image-high'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.133) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- Gemini Image Output
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_google_id, 'Gemini Image Output', 'gemini-image-output', 'image', 'image', 'up to 1024×1024', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'gemini-image-output'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.039) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- NanoBanana
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_nanobanana_id, 'NanoBanana', 'nanobanana-std', 'image', 'image_premium', '1 image', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'nanobanana-std'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.09) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

  -- NanoBanana Pro
  INSERT INTO api_models (project_id, provider_id, model_name, model_code, model_type, model_class, mode_or_variant, active, enabled)
  VALUES (p_project_id, v_nanobanana_id, 'NanoBanana Pro', 'nanobanana-pro', 'image', 'image_premium', '1 image', true, true)
  ON CONFLICT (model_code, project_id) DO UPDATE SET provider_id = EXCLUDED.provider_id
  RETURNING id INTO v_model_id;
  IF v_model_id IS NULL THEN SELECT id INTO v_model_id FROM api_models WHERE project_id = p_project_id AND model_code = 'nanobanana-pro'; END IF;
  INSERT INTO model_pricing_image (model_id, price_per_image) VALUES (v_model_id, 0.12) ON CONFLICT (model_id) DO UPDATE SET price_per_image = EXCLUDED.price_per_image;

END;
$$;

-- 5) Create the operations generator function
CREATE OR REPLACE FUNCTION public.generate_token_operations(p_project_id uuid)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_it_value numeric := 0.001;
  v_markup_text numeric := 1.5;
  v_markup_image numeric := 2.0;
  v_markup_premium numeric := 2.2;
  v_default_in integer := 300;
  v_default_out integer := 400;
  v_count integer := 0;
  rec record;
  v_api_cost numeric;
  v_markup numeric;
  v_user_price numeric;
  v_it_cost numeric;
  v_margin numeric;
  v_op_code text;
  v_op_name text;
  v_op_type text;
BEGIN
  -- Read settings if they exist
  SELECT it_value_usd, default_text_markup, default_image_markup, default_premium_markup,
         default_in_tok, default_out_tok
  INTO v_it_value, v_markup_text, v_markup_image, v_markup_premium, v_default_in, v_default_out
  FROM token_economics_config
  WHERE project_id = p_project_id
  LIMIT 1;

  -- Use defaults if no config
  v_it_value := COALESCE(v_it_value, 0.001);
  v_markup_text := COALESCE(v_markup_text, 1.5);
  v_markup_image := COALESCE(v_markup_image, 2.0);
  v_markup_premium := COALESCE(v_markup_premium, 2.2);
  v_default_in := COALESCE(v_default_in, 300);
  v_default_out := COALESCE(v_default_out, 400);

  -- Process TEXT models
  FOR rec IN
    SELECT m.id AS model_id, m.model_code, m.model_name, m.model_class, m.mode_or_variant,
           p.name AS provider_name,
           pt.price_in_1m, pt.price_out_1m
    FROM api_models m
    JOIN api_providers p ON p.id = m.provider_id
    JOIN model_pricing_text pt ON pt.model_id = m.id
    WHERE m.project_id = p_project_id
      AND m.active = true
      AND m.enabled = true
      AND m.model_type = 'text'
  LOOP
    v_api_cost := (v_default_in::numeric / 1000000.0) * rec.price_in_1m 
                + (v_default_out::numeric / 1000000.0) * rec.price_out_1m;
    v_markup := v_markup_text;
    v_user_price := v_api_cost * v_markup;
    v_it_cost := v_user_price / v_it_value;
    v_margin := v_user_price - v_api_cost;
    v_op_code := 'text_' || lower(replace(rec.provider_name, ' ', '_')) || '_' || rec.model_code || '_default_' || v_default_in || '_' || v_default_out;
    v_op_name := rec.provider_name || ' ' || rec.model_name || ' (' || COALESCE(rec.mode_or_variant, '') || ') ' || v_default_in || '/' || v_default_out;
    v_op_type := 'text';

    INSERT INTO operations_catalog (
      project_id, operation_code, name, operation_type, api_model_id,
      api_cost_usd, markup_multiplier, user_price_usd, it_cost, margin_usd,
      default_in_tok, default_out_tok, active
    ) VALUES (
      p_project_id, v_op_code, v_op_name, v_op_type, rec.model_id,
      v_api_cost, v_markup, v_user_price, v_it_cost, v_margin,
      v_default_in, v_default_out, true
    )
    ON CONFLICT (operation_code, project_id) DO UPDATE SET
      api_model_id = EXCLUDED.api_model_id,
      api_cost_usd = EXCLUDED.api_cost_usd,
      markup_multiplier = EXCLUDED.markup_multiplier,
      user_price_usd = EXCLUDED.user_price_usd,
      it_cost = EXCLUDED.it_cost,
      margin_usd = EXCLUDED.margin_usd,
      default_in_tok = EXCLUDED.default_in_tok,
      default_out_tok = EXCLUDED.default_out_tok,
      active = true,
      updated_at = now();

    v_count := v_count + 1;
  END LOOP;

  -- Process IMAGE models
  FOR rec IN
    SELECT m.id AS model_id, m.model_code, m.model_name, m.model_class, m.mode_or_variant,
           p.name AS provider_name,
           pi.price_per_image
    FROM api_models m
    JOIN api_providers p ON p.id = m.provider_id
    JOIN model_pricing_image pi ON pi.model_id = m.id
    WHERE m.project_id = p_project_id
      AND m.active = true
      AND m.enabled = true
      AND m.model_type = 'image'
  LOOP
    v_api_cost := rec.price_per_image;
    
    IF rec.model_class = 'image_premium' THEN
      v_markup := v_markup_premium;
    ELSE
      v_markup := v_markup_image;
    END IF;

    v_user_price := v_api_cost * v_markup;
    v_it_cost := v_user_price / v_it_value;
    v_margin := v_user_price - v_api_cost;
    v_op_code := 'img_' || lower(replace(rec.provider_name, ' ', '_')) || '_' || rec.model_code;
    v_op_name := rec.provider_name || ' ' || rec.model_name || ' (' || COALESCE(rec.mode_or_variant, '') || ')';
    v_op_type := 'image';

    INSERT INTO operations_catalog (
      project_id, operation_code, name, operation_type, api_model_id,
      api_cost_usd, markup_multiplier, user_price_usd, it_cost, margin_usd,
      active
    ) VALUES (
      p_project_id, v_op_code, v_op_name, v_op_type, rec.model_id,
      v_api_cost, v_markup, v_user_price, v_it_cost, v_margin,
      true
    )
    ON CONFLICT (operation_code, project_id) DO UPDATE SET
      api_model_id = EXCLUDED.api_model_id,
      api_cost_usd = EXCLUDED.api_cost_usd,
      markup_multiplier = EXCLUDED.markup_multiplier,
      user_price_usd = EXCLUDED.user_price_usd,
      it_cost = EXCLUDED.it_cost,
      margin_usd = EXCLUDED.margin_usd,
      active = true,
      updated_at = now();

    v_count := v_count + 1;
  END LOOP;

  -- Deactivate operations for models that are no longer enabled
  UPDATE operations_catalog oc
  SET active = false, updated_at = now()
  WHERE oc.project_id = p_project_id
    AND oc.api_model_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM api_models m
      WHERE m.id = oc.api_model_id
        AND m.active = true
        AND m.enabled = true
    );

  RETURN v_count;
END;
$$;

-- 6) Add unique constraint on model_code + project_id for api_models UPSERT
ALTER TABLE public.api_models 
  DROP CONSTRAINT IF EXISTS api_models_code_project_unique;
ALTER TABLE public.api_models 
  ADD CONSTRAINT api_models_code_project_unique UNIQUE (model_code, project_id);
