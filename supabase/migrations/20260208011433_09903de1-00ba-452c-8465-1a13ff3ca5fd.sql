-- Marketplace V2 Schema: Categories + Channel Mix + Computed Metrics

-- 1) Marketplace Categories table
CREATE TABLE public.marketplace_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  -- Volume metrics (per planning period)
  transactions_count INTEGER NOT NULL DEFAULT 0,
  avg_check NUMERIC(15,2) NOT NULL DEFAULT 0,
  -- GMV: computed vs override
  gmv_computed NUMERIC(15,2) GENERATED ALWAYS AS (transactions_count * avg_check) STORED,
  gmv_override NUMERIC(15,2), -- nullable, user can override
  -- Take rate for this category (default, can be overridden per channel)
  take_rate_percent NUMERIC(5,2) NOT NULL DEFAULT 10 CHECK (take_rate_percent >= 0 AND take_rate_percent <= 100),
  -- Metadata
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for project lookup
CREATE INDEX idx_marketplace_categories_project ON public.marketplace_categories(project_id);

-- RLS for marketplace_categories
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own marketplace categories"
  ON public.marketplace_categories FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own marketplace categories"
  ON public.marketplace_categories FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own marketplace categories"
  ON public.marketplace_categories FOR UPDATE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own marketplace categories"
  ON public.marketplace_categories FOR DELETE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- 2) Category-Channel Stats (join table for channel mix)
CREATE TABLE public.category_channel_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.marketplace_categories(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.sales_channels(id) ON DELETE CASCADE,
  -- User provides either transactions OR share (validation in app)
  transactions_per_period INTEGER, -- nullable
  share_percent NUMERIC(5,2) CHECK (share_percent IS NULL OR (share_percent >= 0 AND share_percent <= 100)),
  -- Override take rate for this specific category-channel pair
  take_rate_override_percent NUMERIC(5,2) CHECK (take_rate_override_percent IS NULL OR (take_rate_override_percent >= 0 AND take_rate_override_percent <= 100)),
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Unique constraint
  UNIQUE (category_id, channel_id)
);

-- Indexes
CREATE INDEX idx_category_channel_stats_category ON public.category_channel_stats(category_id);
CREATE INDEX idx_category_channel_stats_channel ON public.category_channel_stats(channel_id);

-- RLS for category_channel_stats
ALTER TABLE public.category_channel_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own category channel stats"
  ON public.category_channel_stats FOR SELECT
  USING (category_id IN (
    SELECT mc.id FROM public.marketplace_categories mc 
    JOIN public.projects p ON mc.project_id = p.id 
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own category channel stats"
  ON public.category_channel_stats FOR INSERT
  WITH CHECK (category_id IN (
    SELECT mc.id FROM public.marketplace_categories mc 
    JOIN public.projects p ON mc.project_id = p.id 
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own category channel stats"
  ON public.category_channel_stats FOR UPDATE
  USING (category_id IN (
    SELECT mc.id FROM public.marketplace_categories mc 
    JOIN public.projects p ON mc.project_id = p.id 
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own category channel stats"
  ON public.category_channel_stats FOR DELETE
  USING (category_id IN (
    SELECT mc.id FROM public.marketplace_categories mc 
    JOIN public.projects p ON mc.project_id = p.id 
    WHERE p.user_id = auth.uid()
  ));

-- 3) Add commission_fixed to sales_channels for per-transaction fixed fees
ALTER TABLE public.sales_channels 
ADD COLUMN IF NOT EXISTS commission_fixed NUMERIC(10,2) DEFAULT 0;

-- 4) Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_marketplace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_marketplace_categories_updated_at
  BEFORE UPDATE ON public.marketplace_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketplace_updated_at();

CREATE TRIGGER update_category_channel_stats_updated_at
  BEFORE UPDATE ON public.category_channel_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_marketplace_updated_at();