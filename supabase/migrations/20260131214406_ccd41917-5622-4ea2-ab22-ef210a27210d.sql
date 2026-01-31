-- Add new_subscribers column for SaaS business type
-- Stores monthly new subscriber count per pricing plan/product
-- Nullable to not affect other business types (E-commerce, Services, etc.)

ALTER TABLE public.products 
ADD COLUMN new_subscribers INTEGER NULL;

-- Add CHECK constraint to prevent negative values
ALTER TABLE public.products 
ADD CONSTRAINT products_new_subscribers_check CHECK (new_subscribers >= 0);

-- Add comment for documentation
COMMENT ON COLUMN public.products.new_subscribers IS 'Monthly new subscribers count (SaaS only). NULL for non-SaaS business types.';