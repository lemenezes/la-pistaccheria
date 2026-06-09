import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createProduct, getCategories } from "../../lib/supabase";
import ProductForm, { type ProductFormValues } from "./ProductForm";
import type { DatabaseCategory } from "../../types/database";

export default function AdminProdutoNovo() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      const { data, error: queryError } = await getCategories({
        activeOnly: true,
      });

      if (ignore) return;

      if (queryError) {
        setError(queryError.message || "Erro ao carregar categorias ativas.");
        setCategories([]);
      } else {
        setCategories((data || []) as DatabaseCategory[]);
      }
    }

    loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(values: ProductFormValues): Promise<boolean> {
    setError(null);
    setIsSubmitting(true);

    try {
      const galleryUrls = values.gallery_urls
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const { error: apiError } = await createProduct({
        name: values.name,
        slug: values.slug,
        category: values.category,
        category_id: values.category_id || null,
        short_description: values.short_description,
        description: values.description,
        price: parseFloat(values.price) || 0,
        image_url: values.image_url || null,
        active: values.active,
        featured: values.featured,
        weight: null,
        badge: null,
        display_order: parseInt(values.display_order) || 0,
        meta_title: values.meta_title || null,
        meta_description: values.meta_description || null,
        gallery_urls: galleryUrls,
      });

      if (apiError) {
        setError(apiError.message || "Erro ao criar produto.");
        return false;
      }

      navigate("/admin/produtos", { replace: true });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-cream px-5 md:px-10 py-8 md:py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
          <div>
            <p className="text-[9px] tracking-[0.28em] uppercase text-gold font-normal mb-2">
              CMS · Produtos
            </p>
            <h1
              className="text-[2.2rem] md:text-[2.8rem] font-light text-charcoal leading-[1.05]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Novo Produto
            </h1>
            <p className="text-[12px] font-light text-warm-gray mt-2">
              Logado como {user?.email || "usuário autenticado"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="self-start md:self-auto px-5 h-10 border border-cream-deep text-[10px] tracking-[0.16em] uppercase text-warm-gray hover:text-charcoal hover:border-charcoal/35 transition-colors"
          >
            Sair
          </button>
        </div>

        <div className="border border-cream-deep bg-cream p-6 md:p-8">
          <ProductForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Criar Produto"
            onCancel={() => navigate("/admin/produtos")}
            error={error}
            categories={categories}
          />
        </div>
      </div>
    </div>
  );
}
