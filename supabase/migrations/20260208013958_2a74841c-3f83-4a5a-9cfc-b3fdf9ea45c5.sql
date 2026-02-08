-- Create cashflow_timelines table
CREATE TABLE public.cashflow_timelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scenario_type TEXT NOT NULL DEFAULT 'current' CHECK (scenario_type IN ('current', 'optimistic', 'pessimistic')),
  name TEXT NOT NULL DEFAULT 'Main Timeline',
  planning_period TEXT NOT NULL DEFAULT 'month' CHECK (planning_period IN ('week', 'month', 'quarter', 'year')),
  horizon_periods INTEGER NOT NULL DEFAULT 12 CHECK (horizon_periods >= 1 AND horizon_periods <= 120),
  discount_rate_annual NUMERIC NOT NULL DEFAULT 10 CHECK (discount_rate_annual >= 0 AND discount_rate_annual <= 100),
  start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cashflow_lines table
CREATE TABLE public.cashflow_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_id UUID NOT NULL REFERENCES public.cashflow_timelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  line_type TEXT NOT NULL CHECK (line_type IN ('inflow', 'outflow')),
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('revenue', 'cogs', 'logistics', 'fees', 'refunds', 'marketing', 'salaries', 'rent', 'taxes', 'other')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'linked')),
  source_adapter TEXT, -- e.g., 'marketplace', 'ecommerce', 'services'
  formula_config JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cashflow_points table for period values
CREATE TABLE public.cashflow_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_id UUID NOT NULL REFERENCES public.cashflow_lines(id) ON DELETE CASCADE,
  period_index INTEGER NOT NULL CHECK (period_index >= 0),
  amount NUMERIC NOT NULL DEFAULT 0,
  is_override BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(line_id, period_index)
);

-- Enable RLS
ALTER TABLE public.cashflow_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashflow_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashflow_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cashflow_timelines
CREATE POLICY "Users can view their project timelines"
  ON public.cashflow_timelines FOR SELECT
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can create timelines for their projects"
  ON public.cashflow_timelines FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their project timelines"
  ON public.cashflow_timelines FOR UPDATE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their project timelines"
  ON public.cashflow_timelines FOR DELETE
  USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- RLS Policies for cashflow_lines
CREATE POLICY "Users can view their timeline lines"
  ON public.cashflow_lines FOR SELECT
  USING (timeline_id IN (
    SELECT t.id FROM public.cashflow_timelines t
    JOIN public.projects p ON t.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create lines for their timelines"
  ON public.cashflow_lines FOR INSERT
  WITH CHECK (timeline_id IN (
    SELECT t.id FROM public.cashflow_timelines t
    JOIN public.projects p ON t.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their timeline lines"
  ON public.cashflow_lines FOR UPDATE
  USING (timeline_id IN (
    SELECT t.id FROM public.cashflow_timelines t
    JOIN public.projects p ON t.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their timeline lines"
  ON public.cashflow_lines FOR DELETE
  USING (timeline_id IN (
    SELECT t.id FROM public.cashflow_timelines t
    JOIN public.projects p ON t.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- RLS Policies for cashflow_points
CREATE POLICY "Users can view their line points"
  ON public.cashflow_points FOR SELECT
  USING (line_id IN (
    SELECT l.id FROM public.cashflow_lines l
    JOIN public.cashflow_timelines t ON l.timeline_id = t.id
    JOIN public.projects p ON t.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create points for their lines"
  ON public.cashflow_points FOR INSERT
  WITH CHECK (line_id IN (
    SELECT l.id FROM public.cashflow_lines l
    JOIN public.cashflow_timelines t ON l.timeline_id = t.id
    JOIN public.projects p ON t.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their line points"
  ON public.cashflow_points FOR UPDATE
  USING (line_id IN (
    SELECT l.id FROM public.cashflow_lines l
    JOIN public.cashflow_timelines t ON l.timeline_id = t.id
    JOIN public.projects p ON t.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their line points"
  ON public.cashflow_points FOR DELETE
  USING (line_id IN (
    SELECT l.id FROM public.cashflow_lines l
    JOIN public.cashflow_timelines t ON l.timeline_id = t.id
    JOIN public.projects p ON t.project_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- Triggers for updated_at
CREATE TRIGGER update_cashflow_timelines_updated_at
  BEFORE UPDATE ON public.cashflow_timelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cashflow_lines_updated_at
  BEFORE UPDATE ON public.cashflow_lines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_cashflow_timelines_project ON public.cashflow_timelines(project_id);
CREATE INDEX idx_cashflow_lines_timeline ON public.cashflow_lines(timeline_id);
CREATE INDEX idx_cashflow_points_line ON public.cashflow_points(line_id);