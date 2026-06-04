/**
 * LA PISTACCHERIA - Supabase Setup SQL
 * 
 * Execute esses comandos na order no SQL Editor do Supabase
 * Dashboard → SQL Editor → New Query → Cole e execute tudo
 */

-- ============================================================================
-- 1. CREATE TABLE: cms_users (extensão do auth.users)
-- ============================================================================

CREATE TABLE public.cms_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cms_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cms_users
CREATE POLICY "Users can read own cms_users" ON public.cms_users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all cms_users" ON public.cms_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cms_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 2. CREATE TABLE: products
-- ============================================================================

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  weight TEXT,
  badge TEXT CHECK (badge IN ('Novo', 'Destaque', 'Edição Limitada', NULL)),
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  image_storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  
  CONSTRAINT valid_price CHECK (price > 0)
);

-- Create indexes
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_created_by ON public.products(created_by);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. RLS POLICIES: products
-- ============================================================================

-- Qualquer um (autenticado ou não) pode ler produtos ativos
CREATE POLICY "Anyone can read active products" ON public.products
  FOR SELECT
  USING (active = TRUE);

-- Autenticados podem ler todos os produtos (para admin)
CREATE POLICY "Authenticated users can read all products" ON public.products
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Admins podem inserir produtos
CREATE POLICY "Admins can create products" ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cms_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem atualizar produtos
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cms_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cms_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem deletar produtos
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.cms_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 4. TRIGGER: atualizar updated_at em products
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at_trigger
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_products_updated_at();

-- ============================================================================
-- 5. SEED DATA: Produtos iniciais
-- ============================================================================

-- IMPORTANTE: Substitua 'YOUR-USER-ID-HERE' pelo UUID do seu usuário admin
-- Você pode encontrar no Supabase → Authentication → Users → copiar o UUID

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
  image_url,
  image_storage_path,
  created_by
) VALUES

-- 1. Pasta di Pistacchio
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
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900&h=900&q=85&auto=format&fit=crop',
  NULL,
  'YOUR-USER-ID-HERE'
),

-- 2. Cremino al Pistacchio
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
  'https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=900&h=900&q=85&auto=format&fit=crop',
  NULL,
  'YOUR-USER-ID-HERE'
),

-- 3. Torta Pistacchio e Limone
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
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&h=900&q=85&auto=format&fit=crop',
  NULL,
  'YOUR-USER-ID-HERE'
),

-- 4. Cannolo al Pistacchio
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
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&h=900&q=85&auto=format&fit=crop',
  NULL,
  'YOUR-USER-ID-HERE'
),

-- 5. Tartufo di Pistacchio
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
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&h=900&q=85&auto=format&fit=crop',
  NULL,
  'YOUR-USER-ID-HERE'
),

-- 6. Granella Croccante
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
  'https://commons.wikimedia.org/wiki/Special:FilePath/Cezerye_with_pistachio_nuts.jpg',
  NULL,
  'YOUR-USER-ID-HERE'
);
