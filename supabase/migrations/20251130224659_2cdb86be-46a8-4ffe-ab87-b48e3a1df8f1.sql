-- Create SWOT analysis table
CREATE TABLE public.swot_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('company', 'competitor')),
  entity_id UUID,
  entity_name TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  opportunities TEXT[] DEFAULT '{}',
  threats TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, entity_type, entity_id)
);

-- Enable RLS
ALTER TABLE public.swot_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view SWOT analyses of their projects"
  ON public.swot_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = swot_analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create SWOT analyses in their projects"
  ON public.swot_analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = swot_analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update SWOT analyses of their projects"
  ON public.swot_analyses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = swot_analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete SWOT analyses of their projects"
  ON public.swot_analyses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = swot_analyses.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX idx_swot_analyses_project_id ON public.swot_analyses(project_id);

-- Create trigger for updated_at
CREATE TRIGGER update_swot_analyses_updated_at
  BEFORE UPDATE ON public.swot_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();