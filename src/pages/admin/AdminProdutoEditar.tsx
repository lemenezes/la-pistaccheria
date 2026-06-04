import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProductById, updateProduct } from "../../lib/supabase";
import type { DatabaseProduct } from "../../types/database";
import ProductForm, { type ProductFormValues } from "./ProductForm";

export default function AdminProdutoEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [product, setProduct] = useState<DatabaseProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate("/admin/produtos", { replace: true });
      return;
    }

    let ignore = false;

    async function loadProduct() {
      setIsLoading(true);
      setLoadError(null);

      const { data, error } = await getProductById(id!);

      if (ignore) return;

      if (error || !data) {
        setLoadError(error?.message || "Produto não encontrado.");
      } else {
        setProduct(data as DatabaseProduct);
      }

      setIsLoading(false);
    }

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [id, navigate]);

  async function handleSubmit(values: ProductFormValues) {
    if (!id) return;
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const { error: apiError } = await updateProduct(id, {
        name: values.name,
        slug: values.slug,
        category: values.category,
        short_description: values.short_description,
        description: values.description,
        price: parseFloat(values.price) || 0,
        image_url: values.image_url || null,
        active: values.active,
        featured: values.featured,
      });

      if (apiError) {
        setSubmitError(apiError.message || "Erro ao atualizar produto.");
        return;
      }

      navigate("/admin/produtos", { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro inesperado.");
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
              {isLoading ? "Carregando…" : product ? product.name : "Produto"}
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

        {loadError ? (
          <div className="border border-[#E0C8C8] bg-[#FBF2F2] text-[#8A3A3A] px-4 py-3 text-[13px]">
            {loadError}
          </div>
        ) : isLoading ? (
          <div className="text-[13px] text-warm-gray py-8">
            Carregando produto…
          </div>
        ) : product ? (
          <div className="border border-cream-deep bg-cream p-6 md:p-8">
            <ProductForm
              initialData={product}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Salvar Alterações"
              onCancel={() => navigate("/admin/produtos")}
              error={submitError}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
