-- Scale existing quality data from 1-10 to 1-20 (multiply by 2)
UPDATE public.competitors 
SET quality = quality * 2 
WHERE quality IS NOT NULL AND quality <= 10;

-- Add CHECK constraint for quality 1-20
ALTER TABLE public.competitors 
DROP CONSTRAINT IF EXISTS competitors_quality_check;

ALTER TABLE public.competitors 
ADD CONSTRAINT competitors_quality_check 
CHECK (quality >= 1 AND quality <= 20);