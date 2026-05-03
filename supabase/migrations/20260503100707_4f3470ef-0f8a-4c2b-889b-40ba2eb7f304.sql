DROP FUNCTION IF EXISTS public.seed_moldova_ecommerce_demo(uuid);

CREATE FUNCTION public.seed_moldova_ecommerce_demo(p_project_id uuid)
RETURNS TABLE(out_competitor_id uuid, out_name text)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
  v_name text;
BEGIN
  DELETE FROM public.competitors c
  WHERE c.project_id = p_project_id
    AND c.name IN ('Cactus.md', 'PandaShop.md', 'Bigshop.md', 'Darwin.md');

  INSERT INTO public.competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'Cactus.md', 146847700, 7.49, 3801, 14, 10279339)
  RETURNING id, competitors.name INTO v_id, v_name;
  out_competitor_id := v_id; out_name := v_name;
  INSERT INTO public.competitor_metrics (competitor_id, metrics)
  VALUES (v_id, jsonb_build_object(
    'avgCheck', 3801, 'totalClients', 32197, 'newClients', 25758,
    'returningClients', 6439, 'repeatRate', 20,
    'customerLifetimeMonths', 12, 'purchaseFrequency', 1.2
  ));
  RETURN NEXT;

  INSERT INTO public.competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'PandaShop.md', 140060088, 7.14, 2764, 14, 11204807)
  RETURNING id, competitors.name INTO v_id, v_name;
  out_competitor_id := v_id; out_name := v_name;
  INSERT INTO public.competitor_metrics (competitor_id, metrics)
  VALUES (v_id, jsonb_build_object(
    'avgCheck', 2764, 'totalClients', 40536, 'newClients', 30402,
    'returningClients', 10134, 'repeatRate', 25,
    'customerLifetimeMonths', 12, 'purchaseFrequency', 1.25
  ));
  RETURN NEXT;

  INSERT INTO public.competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'Bigshop.md', 25982593, 1.32, 3110, 12, 2598259)
  RETURNING id, competitors.name INTO v_id, v_name;
  out_competitor_id := v_id; out_name := v_name;
  INSERT INTO public.competitor_metrics (competitor_id, metrics)
  VALUES (v_id, jsonb_build_object(
    'avgCheck', 3110, 'totalClients', 7081, 'newClients', 5806,
    'returningClients', 1275, 'repeatRate', 18,
    'customerLifetimeMonths', 12, 'purchaseFrequency', 1.18
  ));
  RETURN NEXT;

  INSERT INTO public.competitors (project_id, name, revenue, market_share, pricing, quality, marketing_spend)
  VALUES (p_project_id, 'Darwin.md', 0, 0, 0, 10, 0)
  RETURNING id, competitors.name INTO v_id, v_name;
  out_competitor_id := v_id; out_name := v_name;
  RETURN NEXT;
END;
$$;