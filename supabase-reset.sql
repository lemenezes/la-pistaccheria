/*
 * RESET - La Pistaccheria CMS v1
 *
 * Use somente se quiser apagar setup e recomecar.
 */

DROP TRIGGER IF EXISTS products_updated_at_trigger ON public.products;
DROP FUNCTION IF EXISTS public.update_products_updated_at();
DROP FUNCTION IF EXISTS public.is_cms_admin();

DROP TABLE IF EXISTS public.products CASCADE;

SELECT 'Reset concluido';
