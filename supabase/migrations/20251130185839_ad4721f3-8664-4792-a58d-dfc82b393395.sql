-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scenarios table
CREATE TABLE public.scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('current', 'scenarioA', 'scenarioB')),
  revenue NUMERIC DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  returning_clients INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  avg_check NUMERIC DEFAULT 0,
  fixed_costs NUMERIC DEFAULT 0,
  variable_costs NUMERIC DEFAULT 0,
  marketing_costs NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, scenario_type)
);

-- Create competitors table
CREATE TABLE public.competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  revenue NUMERIC DEFAULT 0,
  market_share NUMERIC DEFAULT 0,
  pricing NUMERIC DEFAULT 0,
  quality NUMERIC DEFAULT 0,
  marketing_spend NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for scenarios
CREATE POLICY "Users can view scenarios of their projects"
  ON public.scenarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = scenarios.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scenarios in their projects"
  ON public.scenarios FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = scenarios.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scenarios of their projects"
  ON public.scenarios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = scenarios.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scenarios of their projects"
  ON public.scenarios FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = scenarios.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create policies for competitors
CREATE POLICY "Users can view competitors of their projects"
  ON public.competitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create competitors in their projects"
  ON public.competitors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update competitors of their projects"
  ON public.competitors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete competitors of their projects"
  ON public.competitors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = competitors.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competitors_updated_at
  BEFORE UPDATE ON public.competitors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();