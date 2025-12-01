-- Create market_overview table
CREATE TABLE public.market_overview (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  market_size NUMERIC NOT NULL DEFAULT 0,
  market_growth_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);

-- Enable Row Level Security
ALTER TABLE public.market_overview ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view market overview of their projects"
ON public.market_overview
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = market_overview.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert market overview in their projects"
ON public.market_overview
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = market_overview.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update market overview of their projects"
ON public.market_overview
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = market_overview.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete market overview of their projects"
ON public.market_overview
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = market_overview.project_id
    AND projects.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_market_overview_updated_at
BEFORE UPDATE ON public.market_overview
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();