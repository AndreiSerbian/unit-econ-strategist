CREATE OR REPLACE FUNCTION public.seed_moldova_ecommerce_demo(p_project_id uuid)
RETURNS TABLE(competitor_id uuid, name text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
  v_name text;
BEGIN
  -- Idempotent reseed: remove existing demo competitors by name marker
  DELETE FROM competitors
  WHERE project_id = p_project_id
    AND name IN ('Cactus.md', 'PandaShop.md', 'Bigshop.md', 'Darwin.md');

  -- Cactus.md (revenue=estimate)
  INSERT INTO competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'Cactus.md', 146847700, 7.49, 3801, 14, 10279339)
  RETURNING id, name INTO v_id, v_name;
  competitor_id := v_id; name := v_name;
  INSERT INTO competitor_metrics (competitor_id, metrics)
  VALUES (v_id, jsonb_build_object(
    'avgCheck', 3801,
    'totalClients', 32197,
    'newClients', 25758,
    'returningClients', 6439,
    'repeatRate', 20,
    'customerLifetimeMonths', 12,
    'purchaseFrequency', 1.2
  ));
  RETURN NEXT;

  -- PandaShop.md (revenue=fact, B2BHint ELITEH TRADE S.R.L.)
  INSERT INTO competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'PandaShop.md', 140060088, 7.14, 2764, 14, 11204807)
  RETURNING id, name INTO v_id, v_name;
  competitor_id := v_id; name := v_name;
  INSERT INTO competitor_metrics (competitor_id, metrics)
  VALUES (v_id, jsonb_build_object(
    'avgCheck', 2764,
    'totalClients', 40536,
    'newClients', 30402,
    'returningClients', 10134,
    'repeatRate', 25,
    'customerLifetimeMonths', 12,
    'purchaseFrequency', 1.25
  ));
  RETURN NEXT;

  -- Bigshop.md (revenue=fact, B2BHint BIGSHOP S.R.L.)
  INSERT INTO competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'Bigshop.md', 25982593, 1.32, 3110, 12, 2598259)
  RETURNING id, name INTO v_id, v_name;
  competitor_id := v_id; name := v_name;
  INSERT INTO competitor_metrics (competitor_id, metrics)
  VALUES (v_id, jsonb_build_object(
    'avgCheck', 3110,
    'totalClients', 7081,
    'newClients', 5806,
    'returningClients', 1275,
    'repeatRate', 18,
    'customerLifetimeMonths', 12,
    'purchaseFrequency', 1.18
  ));
  RETURN NEXT;

  -- Darwin.md (placeholder, no public financials)
  INSERT INTO competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'Darwin.md', 0, 0, 0, 10, 0)
  RETURNING id, name INTO v_id, v_name;
  competitor_id := v_id; name := v_name;
  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION public.seed_moldova_ecommerce_demo(uuid) IS
'Seeds 4 demo competitors for Moldova e-commerce electronics market: Cactus.md, PandaShop.md, Bigshop.md (with full metrics), Darwin.md (placeholder). Idempotent — safe to call multiple times. Uses SECURITY INVOKER so RLS applies: caller must own the project.';