-- ============================================================
-- competitor_metrics table for persisting business-type specific metrics
-- ============================================================

-- Create table for competitor metrics (JSONB storage)
CREATE TABLE IF NOT EXISTS public.competitor_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id uuid NOT NULL UNIQUE REFERENCES public.competitors(id) ON DELETE CASCADE,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_competitor_metrics_competitor_id ON public.competitor_metrics(competitor_id);

-- Enable Row Level Security
ALTER TABLE public.competitor_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policy: access only if competitor belongs to user's project
CREATE POLICY "Users can manage competitor metrics"
ON public.competitor_metrics
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.competitors c
    JOIN public.projects p ON p.id = c.project_id
    WHERE c.id = competitor_metrics.competitor_id
      AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.competitors c
    JOIN public.projects p ON p.id = c.project_id
    WHERE c.id = competitor_metrics.competitor_id
      AND p.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_competitor_metrics_updated_at
  BEFORE UPDATE ON public.competitor_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- competitors_full view for convenient reading
-- ============================================================

CREATE OR REPLACE VIEW public.competitors_full
WITH (security_invoker = true)
AS
SELECT 
  c.id,
  c.project_id,
  c.name,
  c.revenue,
  c.market_share,
  c.pricing,
  c.quality,
  c.marketing_spend,
  c.created_at,
  c.updated_at,
  COALESCE(cm.metrics, '{}'::jsonb) AS metrics
FROM public.competitors c
LEFT JOIN public.competitor_metrics cm ON cm.competitor_id = c.id;

-- ============================================================
-- Backfill: create empty metrics rows for existing competitors
-- ============================================================

INSERT INTO public.competitor_metrics (competitor_id, metrics)
SELECT id, '{}'::jsonb 
FROM public.competitors
ON CONFLICT (competitor_id) DO NOTHING;