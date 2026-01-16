-- Add business_type column to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'ecommerce';

-- Add comment for documentation
COMMENT ON COLUMN public.projects.business_type IS 'Type of business: saas, ecommerce, production, services, freemium, sharing, marketplace';