-- Add quality column to products table (1-20 scale)
ALTER TABLE public.products 
ADD COLUMN quality integer DEFAULT 10 CHECK (quality >= 1 AND quality <= 20);