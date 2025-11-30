-- Create business_tools table for optimization instruments
CREATE TABLE public.business_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert predefined business tools
INSERT INTO public.business_tools (name, category, description) VALUES
  ('Диагностика бизнеса', 'Анализ', 'Комплексный анализ бизнес-процессов'),
  ('Оптимизация ФОТ', 'Расходы', 'Оптимизация фонда оплаты труда'),
  ('Прототип Landing Page', 'Маркетинг', 'Разработка прототипа посадочной страницы'),
  ('Бизнес-процессы', 'Процессы', 'Оптимизация и автоматизация процессов'),
  ('CRM внедрение', 'Технологии', 'Внедрение системы управления клиентами'),
  ('Автоматизация маркетинга', 'Маркетинг', 'Автоматизация маркетинговых процессов'),
  ('Обучение персонала', 'HR', 'Программы обучения сотрудников'),
  ('Аналитика продаж', 'Продажи', 'Внедрение аналитики продаж'),
  ('Оптимизация логистики', 'Операции', 'Улучшение логистических процессов'),
  ('Контроль качества', 'Качество', 'Система контроля качества продукции');

-- Create expense_tools junction table
CREATE TABLE public.expense_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scenario_type TEXT NOT NULL,
  expense_category TEXT NOT NULL,
  tool_id UUID NOT NULL REFERENCES public.business_tools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, scenario_type, expense_category, tool_id)
);

-- Create scenario_summaries table
CREATE TABLE public.scenario_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scenario_type TEXT NOT NULL,
  summary TEXT,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, scenario_type)
);

-- Create metric_history table for tracking changes over time
CREATE TABLE public.metric_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scenario_type TEXT NOT NULL,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  revenue NUMERIC,
  total_clients INTEGER,
  new_clients INTEGER,
  returning_clients INTEGER,
  conversion_rate NUMERIC,
  avg_check NUMERIC,
  fixed_costs NUMERIC,
  variable_costs NUMERIC,
  marketing_costs NUMERIC,
  cac NUMERIC,
  cpl NUMERIC,
  profit NUMERIC,
  profit_margin NUMERIC,
  break_even_point INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create action_plans table
CREATE TABLE public.action_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  impact_score NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  related_metric TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_tools (public read)
CREATE POLICY "Business tools are viewable by everyone"
  ON public.business_tools FOR SELECT
  USING (true);

-- RLS policies for expense_tools
CREATE POLICY "Users can view expense tools of their projects"
  ON public.expense_tools FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = expense_tools.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create expense tools in their projects"
  ON public.expense_tools FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = expense_tools.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update expense tools of their projects"
  ON public.expense_tools FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = expense_tools.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete expense tools of their projects"
  ON public.expense_tools FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = expense_tools.project_id
    AND projects.user_id = auth.uid()
  ));

-- RLS policies for scenario_summaries
CREATE POLICY "Users can view summaries of their projects"
  ON public.scenario_summaries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = scenario_summaries.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create summaries in their projects"
  ON public.scenario_summaries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = scenario_summaries.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update summaries of their projects"
  ON public.scenario_summaries FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = scenario_summaries.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete summaries of their projects"
  ON public.scenario_summaries FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = scenario_summaries.project_id
    AND projects.user_id = auth.uid()
  ));

-- RLS policies for metric_history
CREATE POLICY "Users can view metric history of their projects"
  ON public.metric_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = metric_history.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create metric history in their projects"
  ON public.metric_history FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = metric_history.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete metric history of their projects"
  ON public.metric_history FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = metric_history.project_id
    AND projects.user_id = auth.uid()
  ));

-- RLS policies for action_plans
CREATE POLICY "Users can view action plans of their projects"
  ON public.action_plans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = action_plans.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create action plans in their projects"
  ON public.action_plans FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = action_plans.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update action plans of their projects"
  ON public.action_plans FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = action_plans.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete action plans of their projects"
  ON public.action_plans FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = action_plans.project_id
    AND projects.user_id = auth.uid()
  ));

-- Triggers for updated_at
CREATE TRIGGER update_scenario_summaries_updated_at
  BEFORE UPDATE ON public.scenario_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON public.action_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_expense_tools_project_id ON public.expense_tools(project_id);
CREATE INDEX idx_scenario_summaries_project_id ON public.scenario_summaries(project_id);
CREATE INDEX idx_metric_history_project_id ON public.metric_history(project_id);
CREATE INDEX idx_metric_history_date ON public.metric_history(snapshot_date DESC);
CREATE INDEX idx_action_plans_project_id ON public.action_plans(project_id);
CREATE INDEX idx_action_plans_status ON public.action_plans(status);