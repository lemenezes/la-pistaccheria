import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProducts } from "../../lib/supabase";
import { formatPrice } from "../../lib/formatPrice";
import type { DatabaseProduct } from "../../types/database";

export default function AdminProdutos() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      const { data, error: queryError } = await getProducts();

      if (ignore) return;

      if (queryError) {
        setError(queryError.message || "Falha ao carregar produtos.");
        setProducts([]);
      } else {
        setProducts((data || []) as DatabaseProduct[]);
      }

      setIsLoading(false);
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao sair.";
      setError(message);
    }
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

          <button
            type="button"
            onClick={handleLogout}
            className="self-start md:self-auto px-5 h-10 border border-cream-deep text-[10px] tracking-[0.16em] uppercase text-warm-gray hover:text-charcoal hover:border-charcoal/35 transition-colors"
          >
            Sair
          </button>
        </div>

        {error && (
          <div className="mb-5 border border-[#E0C8C8] bg-[#FBF2F2] text-[#8A3A3A] px-4 py-3 text-[13px]">
            {error}
          </div>
        )}

        <div className="border border-cream-deep bg-cream overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_minmax(0,0.6fr)] gap-4 px-4 py-3 border-b border-cream-deep text-[10px] tracking-[0.14em] uppercase text-warm-gray">
            <span>Produto</span>
            <span>Categoria</span>
            <span>Preço</span>
            <span>Status</span>
          </div>

          {isLoading ? (
            <div className="px-4 py-8 text-sm text-warm-gray">Carregando produtos...</div>
          ) : products.length === 0 ? (
            <div className="px-4 py-8 text-sm text-warm-gray">Nenhum produto encontrado.</div>
          ) : (
            <ul>
              {products.map((product) => (
                <li
                  key={product.id}
                  className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.6fr)_minmax(0,0.6fr)] gap-4 px-4 py-4 border-b border-cream-deep/70 last:border-b-0"
                >
                  <div>
                    <p
                      className="text-[1.1rem] font-light text-charcoal leading-tight"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {product.name}
                    </p>
                    <p className="text-[11px] text-warm-gray mt-1">/{product.slug}</p>
                  </div>

                  <p className="text-[12px] text-warm-gray self-center">{product.category}</p>
                  <p className="text-[12px] text-charcoal self-center">{formatPrice(product.price)}</p>
                  <p className="text-[12px] text-warm-gray self-center">
                    {product.active ? "Ativo" : "Inativo"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
