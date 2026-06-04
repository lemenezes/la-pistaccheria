import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProducts, deleteProduct } from "../../lib/supabase";
import { formatPrice } from "../../lib/formatPrice";
import type { DatabaseProduct } from "../../types/database";

export default function AdminProdutos() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await getProducts();

    if (queryError) {
      setError(queryError.message || "Falha ao carregar produtos.");
      setProducts([]);
    } else {
      setProducts((data || []) as DatabaseProduct[]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleLogout() {
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao sair.";
      setError(message);
    }
  }

  async function handleDelete(id: string) {
    setIsDeleting(true);
    setError(null);

    const { error: deleteError } = await deleteProduct(id);

    if (deleteError) {
      setError(deleteError.message || "Erro ao excluir produto.");
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }

    setConfirmDeleteId(null);
    setIsDeleting(false);
  }

  return (
    <div className="min-h-screen bg-cream px-5 md:px-10 py-8 md:py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
          <div>
            <p className="text-[9px] tracking-[0.28em] uppercase text-gold font-normal mb-2">
              CMS
            </p>
            <h1
              className="text-[2.2rem] md:text-[2.8rem] font-light text-charcoal leading-[1.05]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Produtos
            </h1>
            <p className="text-[12px] font-light text-warm-gray mt-2">
              Logado como {user?.email || "usuário autenticado"}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={() => navigate("/admin/produtos/novo")}
              className="px-5 h-10 bg-charcoal text-cream text-[10px] tracking-[0.2em] uppercase hover:bg-charcoal/85 transition-colors"
            >
              Novo Produto
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 h-10 border border-cream-deep text-[10px] tracking-[0.16em] uppercase text-warm-gray hover:text-charcoal hover:border-charcoal/35 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 border border-[#E0C8C8] bg-[#FBF2F2] text-[#8A3A3A] px-4 py-3 text-[13px]">
            {error}
          </div>
        )}

        <div className="border border-cream-deep bg-cream overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.5fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-3 px-4 py-3 border-b border-cream-deep text-[10px] tracking-[0.14em] uppercase text-warm-gray">
            <span>Produto</span>
            <span>Categoria</span>
            <span>Preço</span>
            <span>Status</span>
            <span>Destaque</span>
            <span>Ordem</span>
            <span />
          </div>

          {isLoading ? (
            <div className="px-4 py-8 text-sm text-warm-gray">
              Carregando produtos…
            </div>
          ) : products.length === 0 ? (
            <div className="px-4 py-8 text-sm text-warm-gray">
              Nenhum produto encontrado.{" "}
              <button
                type="button"
                onClick={() => navigate("/admin/produtos/novo")}
                className="underline underline-offset-2 text-charcoal"
              >
                Criar o primeiro
              </button>
            </div>
          ) : (
            <ul>
              {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-col md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)_minmax(0,0.6fr)_minmax(0,0.6fr)_minmax(0,0.5fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-2 md:gap-3 px-4 py-4 border-b border-cream-deep/70 last:border-b-0"
            >
              <div>
                <p
                  className="text-[1.1rem] font-light text-charcoal leading-tight"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                  }}
                >
                  {product.name}
                </p>
                <p className="text-[11px] text-warm-gray mt-1">
                  /{product.slug}
                </p>
              </div>

              <p className="text-[12px] text-warm-gray md:self-center">
                {product.category}
              </p>
              <p className="text-[12px] text-charcoal md:self-center">
                {formatPrice(product.price)}
              </p>
              
              {/* Status - Ativo/Inativo */}
              <div className="md:self-center">
                {product.active ? (
                  <span className="inline-block px-2 py-1 bg-pistachio/20 text-pistachio text-[10px] tracking-[0.1em] uppercase font-medium rounded">
                    Ativo
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 bg-warm-gray/15 text-warm-gray text-[10px] tracking-[0.1em] uppercase font-medium rounded">
                    Inativo
                  </span>
                )}
              </div>

              {/* Destaque */}
              <div className="md:self-center">
                {product.featured ? (
                  <span className="inline-block px-2 py-1 bg-gold/20 text-gold text-[10px] tracking-[0.1em] uppercase font-medium rounded">
                    Sim
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 text-warm-gray/50 text-[10px] tracking-[0.1em] uppercase">
                    —
                  </span>
                )}
              </div>

              {/* Ordem de exibição */}
              <p className="text-[12px] text-warm-gray md:self-center">
                {product.display_order}
              </p>

              {/* Ações */}
              <div className="flex items-center gap-2 md:justify-end mt-2 md:mt-0">
                {confirmDeleteId === product.id ? (
                  <>
                    <span className="text-[11px] text-[#8A3A3A] mr-1">
                      Excluir?
                    </span>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDelete(product.id)}
                      className="px-3 h-8 bg-[#8A3A3A] text-cream text-[10px] tracking-[0.12em] uppercase hover:bg-[#7a3030] disabled:opacity-50 transition-colors"
                    >
                      {isDeleting ? "…" : "Confirmar"}
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 h-8 border border-cream-deep text-[10px] tracking-[0.12em] uppercase text-warm-gray hover:text-charcoal transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/admin/produtos/${product.id}`)
                      }
                      className="px-3 h-8 border border-cream-deep text-[10px] tracking-[0.12em] uppercase text-warm-gray hover:text-charcoal hover:border-charcoal/35 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(product.id)}
                      className="px-3 h-8 border border-cream-deep text-[10px] tracking-[0.12em] uppercase text-warm-gray hover:text-[#8A3A3A] hover:border-[#E0C8C8] transition-colors"
                    >
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
