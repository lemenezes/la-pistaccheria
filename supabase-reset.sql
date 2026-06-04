/**
 * LA PISTACCHERIA - Supabase Reset SQL
 * 
 * ⚠️ USE COM CUIDADO!
 * 
 * Esse script deleta TODAS as tabelas e políticas.
 * Execute isso APENAS se quiser limpar tudo e começar do zero.
 * 
 * Instruções:
 * 1. Dashboard → SQL Editor → New Query
 * 2. Cole este arquivo completo
 * 3. Clique "Run"
 * 4. Depois execute supabase-setup.sql novamente
 */

-- ============================================================================
-- DROP: Triggers (deve ser primeiro)
-- ============================================================================

DROP TRIGGER IF EXISTS products_updated_at_trigger ON public.products;
DROP FUNCTION IF EXISTS public.update_products_updated_at();

-- ============================================================================
-- DROP: Tabelas (RLS é deletado automaticamente com as tabelas)
-- ============================================================================

DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.cms_users CASCADE;

-- ============================================================================
-- Confirmação
-- ============================================================================

-- Se chegar aqui sem erros, tudo foi deletado com sucesso ✓
SELECT 'Reset completo! Você pode agora rodar supabase-setup.sql novamente.';
