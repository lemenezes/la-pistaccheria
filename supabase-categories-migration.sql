/*
 * Incremental: categories + products.category_id migration (compat mode)
 * Data: 2026-06-04
 *
 * Objetivo:
 * - criar tabela categories com image_url
 * - adicionar products.category_id
 * - popular category_id a partir de products.category atual
 * - manter compatibilidade temporaria entre category_id e category (texto)
 *
 * Nao altera Auth, RLS ou paginas publicas.
 */

-- ============================================================================
-- 0) Pre requisitos
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- 1) Tabela categories
-- ============================================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Garante evolucao segura caso a tabela ja exista parcialmente
alter table public.categories
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists active boolean not null default true,
  add column if not exists display_order integer not null default 0,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

create index if not exists idx_categories_active_display_order
  on public.categories (active, display_order, name);

create unique index if not exists idx_categories_slug_lower_unique
  on public.categories (lower(slug));

-- updated_at automatico para categories
create or replace function public.update_categories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'categories_updated_at_trigger'
  ) then
    create trigger categories_updated_at_trigger
    before update on public.categories
    for each row
    execute function public.update_categories_updated_at();
  end if;
end;
$$;

-- ============================================================================
-- 2) Seed inicial de categorias
-- ============================================================================

insert into public.categories (name, slug, description, image_url, active, display_order)
values
  ('Confeitaria', 'confeitaria', null, null, true, 10),
  ('Bomboneria', 'bomboneria', null, null, true, 20),
  ('Pasta Artesanal', 'pasta-artesanal', null, null, true, 30),
  ('Doces Sicilianos', 'doces-sicilianos', null, null, true, 40),
  ('Ingredientes', 'ingredientes', null, null, true, 50)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  active = excluded.active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

-- ============================================================================
-- 3) Evolucao de products para category_id (compatibilidade temporaria)
-- ============================================================================

alter table public.products
  add column if not exists category_id uuid null;

create index if not exists idx_products_category_id
  on public.products(category_id);

-- FK nao destrutiva: ao remover categoria, category_id volta a null
-- (delete fisico nao faz parte do fluxo do CMS)
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'products'
      and constraint_name = 'products_category_id_fkey'
  ) then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id)
      references public.categories(id)
      on delete set null;
  end if;
end;
$$;

-- Backfill inicial: mapeia products.category (texto) -> categories.id
update public.products p
set category_id = c.id
from public.categories c
where p.category_id is null
  and (
    lower(trim(p.category)) = lower(trim(c.name))
    or lower(trim(p.category)) = lower(trim(c.slug))
  );

-- ============================================================================
-- 4) Trigger de compatibilidade temporaria entre category_id e category
-- ============================================================================

create or replace function public.sync_product_category_fields()
returns trigger
language plpgsql
as $$
declare
  v_category_name text;
begin
  -- Prioridade 1: se veio category_id, category texto acompanha categories.name
  if new.category_id is not null then
    select c.name into v_category_name
    from public.categories c
    where c.id = new.category_id;

    if v_category_name is not null then
      new.category = v_category_name;
      return new;
    end if;
  end if;

  -- Prioridade 2: sem category_id, tenta resolver pelo texto legado
  if new.category_id is null and new.category is not null and btrim(new.category) <> '' then
    select c.id, c.name
      into new.category_id, v_category_name
    from public.categories c
    where lower(trim(c.name)) = lower(trim(new.category))
       or lower(trim(c.slug)) = lower(trim(new.category))
    order by c.active desc, c.display_order asc, c.name asc
    limit 1;

    if v_category_name is not null then
      new.category = v_category_name;
    end if;
  end if;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'products_category_compat_trigger'
  ) then
    create trigger products_category_compat_trigger
    before insert or update on public.products
    for each row
    execute function public.sync_product_category_fields();
  end if;
end;
$$;

-- Reaplica sincronizacao nos registros existentes apos criar trigger
update public.products p
set
  category_id = p.category_id,
  category = p.category;

-- ============================================================================
-- 5) Permissoes e RLS de categories
-- ============================================================================

grant usage on schema public to anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant insert, update on table public.categories to authenticated;

alter table public.categories enable row level security;

drop policy if exists "Public can read active categories" on public.categories;
drop policy if exists "Authenticated can read all categories" on public.categories;
drop policy if exists "CMS admins can insert categories" on public.categories;
drop policy if exists "CMS admins can update categories" on public.categories;

create policy "Public can read active categories"
on public.categories
for select
to anon, authenticated
using (active = true);

create policy "Authenticated can read all categories"
on public.categories
for select
to authenticated
using (true);

create policy "CMS admins can insert categories"
on public.categories
for insert
to authenticated
with check (public.is_cms_admin());

create policy "CMS admins can update categories"
on public.categories
for update
to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());
