-- Create raw materials table for product cost and expense calculations
create table if not exists public.raw_materials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  unit text,
  price_per_unit numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create product-material usage table (bill of materials per product unit)
create table if not exists public.product_materials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  material_id uuid not null references public.raw_materials(id) on delete cascade,
  quantity_per_unit numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.raw_materials enable row level security;
alter table public.product_materials enable row level security;

-- RLS policies: users can manage only data linked to their own projects
create policy "Users can manage own raw materials"
  on public.raw_materials
  for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = raw_materials.project_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = raw_materials.project_id
        and p.user_id = auth.uid()
    )
  );

create policy "Users can manage own product materials"
  on public.product_materials
  for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = product_materials.project_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = product_materials.project_id
        and p.user_id = auth.uid()
    )
  );

-- Updated-at triggers using existing helper function
create trigger set_raw_materials_updated_at
  before update on public.raw_materials
  for each row
  execute function public.update_updated_at_column();

create trigger set_product_materials_updated_at
  before update on public.product_materials
  for each row
  execute function public.update_updated_at_column();
