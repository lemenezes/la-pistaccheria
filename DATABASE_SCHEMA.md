# Database Schema - La Pistaccheria CMS v1

## Visao Geral
Arquitetura simplificada para v1:
- Supabase Auth (auth.users)
- Uma tabela de dominio: products
- Controle de escrita por allowlist na funcao public.is_cms_admin()
- Imagens via image_url publica (Cloudflare R2/CDN)

## Tabela products

Campos:
- id UUID PK default gen_random_uuid()
- slug TEXT unique not null
- name TEXT not null
- category TEXT not null
- short_description TEXT not null
- description TEXT not null
- price NUMERIC(10,2) not null check > 0
- weight TEXT nullable
- badge TEXT nullable (Novo, Destaque, Edicao Limitada)
- featured BOOLEAN default false
- active BOOLEAN default true
- display_order INTEGER default 0
- meta_title TEXT nullable
- meta_description TEXT nullable
- image_url TEXT nullable
- gallery_urls JSONB not null default []
- created_at TIMESTAMPTZ default now()
- updated_at TIMESTAMPTZ default now()
- created_by UUID nullable references auth.users(id) on delete set null

Notas:
- created_by e nullable para nao quebrar historico quando usuario e removido.
- gallery_urls permite multiplas imagens sem nova tabela no v1.

## Indices
- idx_products_category
- idx_products_active
- idx_products_featured
- idx_products_display_order
- idx_products_created_at
- idx_products_created_by

## Trigger
- Funcao: public.update_products_updated_at()
- Trigger: products_updated_at_trigger
- Objetivo: atualizar updated_at automaticamente em UPDATE

## RLS
RLS ativo em public.products.

Politicas:
- Public can read active products
  - SELECT para anon e authenticated com active = true
- Authenticated can read all products
  - SELECT para authenticated sem filtro
- CMS admins can insert products
- CMS admins can update products
- CMS admins can delete products

As 3 politicas de escrita chamam public.is_cms_admin().

## Funcao de allowlist
public.is_cms_admin() usa auth.uid() em allowlist com:
- aab02bda-97ba-4404-b7f3-9879f0098bf0

Esses placeholders devem ser substituidos antes de executar o SQL.

## Midia (v1)
- image_url e preenchido manualmente no CMS com URL publica.
- Origem recomendada: Cloudflare R2/CDN.
- Upload direto via CMS para R2/CDN fica para fase futura.

## Seed
O setup insere os 6 produtos atuais com:
- display_order preenchido
- meta_title preenchido
- meta_description preenchido
- gallery_urls como []
- image_url com as URLs atuais
