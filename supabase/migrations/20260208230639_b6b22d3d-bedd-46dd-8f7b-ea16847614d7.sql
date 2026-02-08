-- Create billing_type enum
CREATE TYPE billing_type AS ENUM ('subscription', 'one_time');

-- Create SaaS Products table
CREATE TABLE public.saas_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  planning_period TEXT NOT NULL DEFAULT 'month',
  default_channel_id UUID REFERENCES public.sales_channels(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SaaS Plans table
CREATE TABLE public.saas_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.saas_products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  billing_type billing_type NOT NULL DEFAULT 'subscription',
  price_eur NUMERIC NOT NULL DEFAULT 0 CHECK (price_eur >= 0),
  subscribers INTEGER NOT NULL DEFAULT 0 CHECK (subscribers >= 0),
  new_subscribers_per_period INTEGER NOT NULL DEFAULT 0 CHECK (new_subscribers_per_period >= 0),
  cost_per_subscriber_per_month_eur NUMERIC NOT NULL DEFAULT 0 CHECK (cost_per_subscriber_per_month_eur >= 0),
  is_free_plan BOOLEAN NOT NULL DEFAULT false,
  churn_rate_percent NUMERIC DEFAULT NULL CHECK (churn_rate_percent IS NULL OR (churn_rate_percent >= 0 AND churn_rate_percent <= 100)),
  cost_per_buyer_eur NUMERIC DEFAULT NULL CHECK (cost_per_buyer_eur IS NULL OR cost_per_buyer_eur >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saas_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for saas_products
CREATE POLICY "Users can view their own saas products"
  ON public.saas_products FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own saas products"
  ON public.saas_products FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own saas products"
  ON public.saas_products FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own saas products"
  ON public.saas_products FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = auth.uid()
    )
  );

-- RLS policies for saas_plans (via product ownership)
CREATE POLICY "Users can view their own saas plans"
  ON public.saas_plans FOR SELECT
  USING (
    product_id IN (
      SELECT sp.id FROM public.saas_products sp
      JOIN public.projects p ON sp.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own saas plans"
  ON public.saas_plans FOR INSERT
  WITH CHECK (
    product_id IN (
      SELECT sp.id FROM public.saas_products sp
      JOIN public.projects p ON sp.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own saas plans"
  ON public.saas_plans FOR UPDATE
  USING (
    product_id IN (
      SELECT sp.id FROM public.saas_products sp
      JOIN public.projects p ON sp.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own saas plans"
  ON public.saas_plans FOR DELETE
  USING (
    product_id IN (
      SELECT sp.id FROM public.saas_products sp
      JOIN public.projects p ON sp.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_saas_products_updated_at
  BEFORE UPDATE ON public.saas_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saas_plans_updated_at
  BEFORE UPDATE ON public.saas_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_saas_products_project_id ON public.saas_products(project_id);
CREATE INDEX idx_saas_plans_product_id ON public.saas_plans(product_id);