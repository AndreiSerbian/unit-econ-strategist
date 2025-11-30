-- Add currency field to projects table
ALTER TABLE public.projects ADD COLUMN currency TEXT NOT NULL DEFAULT 'RUB';

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Users can view products of their projects"
  ON public.products
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = products.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create products in their projects"
  ON public.products
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = products.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update products of their projects"
  ON public.products
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = products.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete products of their projects"
  ON public.products
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = products.project_id
    AND projects.user_id = auth.uid()
  ));

-- Create trigger for automatic timestamp updates on products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();