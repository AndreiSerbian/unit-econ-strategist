-- Create competitor_products table for storing competitor product data
CREATE TABLE public.competitor_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id UUID NOT NULL REFERENCES public.competitors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  annual_sales INTEGER DEFAULT 0,
  annual_revenue NUMERIC DEFAULT 0,
  sales_channels TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.competitor_products ENABLE ROW LEVEL SECURITY;

-- Create policy for user access through competitor ownership
CREATE POLICY "Users can manage competitor products"
ON public.competitor_products
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM competitors c
    JOIN projects p ON p.id = c.project_id
    WHERE c.id = competitor_products.competitor_id
    AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM competitors c
    JOIN projects p ON p.id = c.project_id
    WHERE c.id = competitor_products.competitor_id
    AND p.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_competitor_products_updated_at
BEFORE UPDATE ON public.competitor_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();