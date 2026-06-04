/*
 * LA PISTACCHERIA - Supabase Setup SQL (Consolidado v1)
 *
 * Execucao unica em projeto novo:
 * 1) Abra Supabase Dashboard -> SQL Editor -> New Query
 * 2) Antes de executar, confirme o UUID de admin:
 *    - aab02bda-97ba-4404-b7f3-9879f0098bf0
 * 3) Cole este arquivo inteiro e rode uma vez
 */

-- ============================================================================
-- 0) Pre requisitos
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1) Funcao de allowlist para escrita no CMS
--    Admin inicial configurado com o UUID informado.
--    Authentication -> Users -> coluna ID
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_cms_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT auth.uid() = ANY (
    ARRAY[
      'aab02bda-97ba-4404-b7f3-9879f0098bf0'::uuid
    ]
  );
$$;

-- ============================================================================
-- 2) Tabela products
-- ============================================================================

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  weight TEXT,
  badge TEXT CHECK (badge IS NULL OR badge IN ('Novo', 'Destaque', 'Edição Limitada')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  image_url TEXT,
  gallery_urls JSONB NOT NULL DEFAULT '[]'::JSONB CHECK (jsonb_typeof(gallery_urls) = 'array'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indices
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_display_order ON public.products(display_order);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_created_by ON public.products(created_by);

-- ============================================================================
-- 3) Trigger de updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_products_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_updated_at_trigger
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_products_updated_at();

-- ============================================================================
-- 4) RLS: products
-- ============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Leitura publica: apenas produtos ativos
CREATE POLICY "Public can read active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (active = TRUE);

-- Leitura autenticada: todos os produtos (necessario para area admin)
CREATE POLICY "Authenticated can read all products"
ON public.products
FOR SELECT
TO authenticated
USING (TRUE);

-- Escrita: apenas usuarios da allowlist is_cms_admin()
CREATE POLICY "CMS admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_cms_admin());

CREATE POLICY "CMS admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_cms_admin())
WITH CHECK (public.is_cms_admin());

CREATE POLICY "CMS admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_cms_admin());

-- ============================================================================
-- 5) Seed inicial (produtos atuais do products.ts)
--    created_by mantido como NULL para seed inicial.
-- ============================================================================

INSERT INTO public.products (
  slug,
  name,
  category,
  short_description,
  description,
  price,
  weight,
  badge,
  featured,
  active,
  display_order,
  meta_title,
  meta_description,
  image_url,
  gallery_urls,
  created_by
) VALUES
(
  'pasta-di-pistacchio',
  'Pasta di Pistacchio',
  'Pasta Artesanal',
  'Pasta pura de pistache de Bronte DOP, aveludada e sem aditivos.',
  'Pasta pura de pistache siciliano, sem aditivos. Feita com pistaches de Bronte DOP, de sabor intenso e textura aveludada. Perfeita para rechear, cobrir ou saborear pura.',
  89.00,
  '200g',
  'Destaque',
  TRUE,
  TRUE,
  20,
  'Pasta di Pistacchio | La Pistaccheria',
  'Pasta pura de pistache de Bronte DOP, aveludada e sem aditivos.',
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900&h=900&q=85&auto=format&fit=crop',
  '[]'::JSONB,
  NULL
),
(
  'cremino-al-pistacchio',
  'Cremino al Pistacchio',
  'Bomboneria',
  'Bombom de camadas com ganache de pistache e chocolate branco belga.',
  'Bombom de camadas com ganache de pistache e chocolate branco belga. Acabamento em folha de ouro comestível. Embalagem para presente inclusa.',
  128.00,
  'Caixa com 4 unidades',
  'Edição Limitada',
  TRUE,
  TRUE,
  10,
  'Cremino al Pistacchio | La Pistaccheria',
  'Bombom de camadas com ganache de pistache e chocolate branco belga.',
  'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=900&h=900&q=85&auto=format&fit=crop',
  '[]'::JSONB,
  NULL
),
(
  'torta-pistacchio-e-limone',
  'Torta Pistacchio e Limone',
  'Confeitaria',
  'Torta de massa amanteigada com creme de pistache e limão siciliano.',
  'Torta de massa amanteigada com creme de pistache e limão siciliano. Crosta delicada, recheio cremoso e finalização de pistaches inteiros torrados.',
  215.00,
  '22cm de diâmetro',
  NULL,
  TRUE,
  TRUE,
  30,
  'Torta Pistacchio e Limone | La Pistaccheria',
  'Torta de massa amanteigada com creme de pistache e limão siciliano.',
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&h=900&q=85&auto=format&fit=crop',
  '[]'::JSONB,
  NULL
),
(
  'cannolo-al-pistacchio',
  'Cannolo al Pistacchio',
  'Doces Sicilianos',
  'Cannoli siciliani com creme de ricota e pistache, casquinha crocante.',
  'Cannoli siciliani com creme de ricota e pistache de Bronte, casquinha crocante frita artesanalmente. Servidos em caixa de 6 unidades.',
  98.00,
  'Caixa com 6 unidades',
  'Novo',
  FALSE,
  TRUE,
  40,
  'Cannolo al Pistacchio | La Pistaccheria',
  'Cannoli siciliani com creme de ricota e pistache, casquinha crocante.',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&h=900&q=85&auto=format&fit=crop',
  '[]'::JSONB,
  NULL
),
(
  'tartufo-di-pistacchio',
  'Tartufo di Pistacchio',
  'Bomboneria',
  'Trufa artesanal com cobertura de chocolate 70% e interior cremoso.',
  'Trufa artesanal de pistache com cobertura de chocolate amargo 70%. Interior cremoso e intenso, finalizada com granella di pistacchio.',
  68.00,
  'Caixa com 6 unidades',
  NULL,
  FALSE,
  TRUE,
  50,
  'Tartufo di Pistacchio | La Pistaccheria',
  'Trufa artesanal com cobertura de chocolate 70% e interior cremoso.',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&h=900&q=85&auto=format&fit=crop',
  '[]'::JSONB,
  NULL
),
(
  'granella-croccante',
  'Granella Croccante',
  'Ingredientes',
  'Pistache de Bronte torrado e granulado com flor de sal siciliana.',
  'Pistache de Bronte torrado e granulado, finalizado com flor de sal siciliana. Ideal para finalizar sobremesas, sorvetes e saladas.',
  52.00,
  '150g',
  NULL,
  FALSE,
  TRUE,
  60,
  'Granella Croccante | La Pistaccheria',
  'Pistache de Bronte torrado e granulado com flor de sal siciliana.',
  'https://commons.wikimedia.org/wiki/Special:FilePath/Cezerye_with_pistachio_nuts.jpg',
  '[]'::JSONB,
  NULL
);
