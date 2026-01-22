-- Services fields
ALTER TABLE products ADD COLUMN hourly_rate NUMERIC NULL CHECK (hourly_rate >= 0);
ALTER TABLE products ADD COLUMN hours_per_week NUMERIC NULL CHECK (hours_per_week >= 0 AND hours_per_week <= 168);
ALTER TABLE products ADD COLUMN utilization NUMERIC NULL CHECK (utilization >= 0 AND utilization <= 100);

-- SaaS / Freemium fields
ALTER TABLE products ADD COLUMN churn_rate NUMERIC NULL CHECK (churn_rate >= 0 AND churn_rate <= 100);
ALTER TABLE products ADD COLUMN free_to_pay_conversion NUMERIC NULL CHECK (free_to_pay_conversion >= 0 AND free_to_pay_conversion <= 100);

-- Sharing / Marketplace fields
ALTER TABLE products ADD COLUMN utilization_rate NUMERIC NULL CHECK (utilization_rate >= 0 AND utilization_rate <= 100);
ALTER TABLE products ADD COLUMN take_rate NUMERIC NULL CHECK (take_rate >= 0 AND take_rate <= 100);
ALTER TABLE products ADD COLUMN gmv NUMERIC NULL CHECK (gmv >= 0);
ALTER TABLE products ADD COLUMN avg_order_value NUMERIC NULL CHECK (avg_order_value >= 0);

-- Production field
ALTER TABLE products ADD COLUMN defect_rate NUMERIC NULL CHECK (defect_rate >= 0 AND defect_rate <= 100);