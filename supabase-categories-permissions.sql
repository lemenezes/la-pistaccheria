/*
 * Incremental: permissions + RLS para public.categories
 * Data: 2026-06-04
 *
 * Corrige erro: "permission denied for table categories"
 *
 * Mantem o padrao do CMS:
 * - leitura publica apenas de categorias ativas
 * - leitura autenticada de todas (admin)
 * - escrita apenas para is_cms_admin()
 * - sem delete fisico via policy
 */

-- ============================================================================
-- 1) Grants basicos de tabela
-- ============================================================================

grant usage on schema public to anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant insert, update on table public.categories to authenticated;

-- ============================================================================
-- 2) RLS em categories
-- ============================================================================

alter table public.categories enable row level security;

-- Remove policies antigas com mesmo nome para evitar conflito em reaplicacoes
drop policy if exists "Public can read active categories" on public.categories;
drop policy if exists "Authenticated can read all categories" on public.categories;
drop policy if exists "CMS admins can insert categories" on public.categories;
drop policy if exists "CMS admins can update categories" on public.categories;

-- Leitura publica: apenas categorias ativas
create policy "Public can read active categories"
on public.categories
for select
to anon, authenticated
using (active = true);

-- Leitura autenticada: todas as categorias (necessario no CMS para listar inativas)
create policy "Authenticated can read all categories"
on public.categories
for select
to authenticated
using (true);

-- Escrita: apenas admins da allowlist
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
