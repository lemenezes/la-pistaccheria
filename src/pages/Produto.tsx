import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { products as fallbackProducts } from "../data/products";
import type { Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/formatPrice";
import { openCartDrawer } from "../lib/whatsappOrder";
import StoreCard from "../components/StoreCard";
import {
  fetchPublicProductBySlug,
  fetchPublicProducts
} from "../lib/publicProducts";

function ProductSkeleton() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-28 md:pt-36 mb-10">
        <div className="h-3 w-40 bg-cream-deep animate-pulse" />
      </div>

      <section className="max-w-7xl mx-auto px-5 md:px-10 pb-20 grid md:grid-cols-2 gap-12 md:gap-20">
        <div className="relative aspect-square overflow-hidden bg-cream-deep animate-pulse" />

        <div className="flex flex-col justify-center">
          <div className="h-3 w-28 bg-cream-deep animate-pulse mb-4" />
          <div className="h-12 md:h-14 w-3/4 bg-cream-deep animate-pulse mb-5" />
          <div className="h-10 w-32 bg-cream-deep animate-pulse mb-7" />

          <div className="h-px bg-pistachio-border/40 mb-7" />

          <div className="space-y-3 mb-8 max-w-md">
            <div className="h-3 w-full bg-cream-deep animate-pulse" />
            <div className="h-3 w-11/12 bg-cream-deep animate-pulse" />
            <div className="h-3 w-4/5 bg-cream-deep animate-pulse" />
          </div>

          <div className="h-12 w-full sm:w-[360px] bg-cream-deep animate-pulse mb-6" />
          <div className="h-12 w-full sm:w-[360px] bg-cream-deep animate-pulse mb-8" />
          <div className="h-3 w-44 bg-cream-deep animate-pulse" />
        </div>
      </section>
    </>
  );
}

export default function Produto() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const currentSlug = slug;
    let ignore = false;

    async function loadProductData() {
      setIsLoading(true);
      setLoadError(false);

      try {
        const [loadedProduct, loadedProducts] = await Promise.all([
          fetchPublicProductBySlug(currentSlug),
          fetchPublicProducts()
        ]);

        if (!ignore) {
          // fetchPublicProductBySlug já lida com fallback internamente
          // Se retorna null, significa que o produto não está disponível publicamente
          // (pode estar inativo, não existir, ou erro de conexão sem fallback)
          setProduct(loadedProduct);
          setProducts(loadedProducts.length > 0 ? loadedProducts : fallbackProducts);

          if (!loadedProduct) {
            setLoadError(true);
          }

          setIsLoading(false);
        }
      } catch {
        if (!ignore) {
          setLoadError(true);
          setIsLoading(false);
        }
      }
    }

    loadProductData();

    return () => {
      ignore = true;
    };
  }, [slug]);

  const related = useMemo(() => {
    if (!product) return [];

    return products
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product, products]);

  if (isLoading && !product) {
    return <ProductSkeleton />;
  }

  if (!product || loadError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-5">
        <p
          className="text-3xl font-light text-charcoal"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          Produto não encontrado
        </p>
        <Link
          to="/loja"
          className="text-[11px] tracking-[0.2em] uppercase font-light text-pistachio border-b border-pistachio/40 pb-px">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  function handleAdd() {
    if (!product) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const waMessage = encodeURIComponent(
    `Olá! Gostaria de saber mais sobre o ${product.name} (${product.weight ?? ""}).`
  );

  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 pt-28 md:pt-36 mb-10">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase font-light text-warm-gray">
          <Link to="/" className="hover:text-pistachio transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/loja" className="hover:text-pistachio transition-colors">
            Loja
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>
      </div>

      {/* ── Produto principal ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 pb-20 grid md:grid-cols-2 gap-12 md:gap-20">
        {/* Imagem */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-square overflow-hidden">
          {product.image ? (
            <>
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                decoding="async"
              />
              <div className="absolute inset-0 bg-charcoal/10" />
            </>
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 42% 35%, #EDF2E8 0%, #DDE8D4 50%, #C4D4BA 100%)"
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, #3A4D2C 0px, #3A4D2C 1px, transparent 1px, transparent 14px)"
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at center, transparent 50%, rgba(58,77,44,0.08) 100%)"
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
                <p
                  className="text-xl italic text-pistachio/35 text-center px-8 leading-snug"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif"
                  }}>
                  {product.name}
                </p>
              </div>
            </>
          )}

          {product.badge && (
            <span className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-charcoal/75 backdrop-blur-sm text-[9px] tracking-[0.22em] uppercase font-normal text-cream">
              {product.badge}
            </span>
          )}

          {/* Corner marks */}
          <div
            className="absolute top-4 left-4 w-5 h-5 border-t border-l border-pistachio/20"
            aria-hidden="true"
          />
          <div
            className="absolute top-4 right-4 w-5 h-5 border-t border-r border-pistachio/20"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-pistachio/20"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-pistachio/20"
            aria-hidden="true"
          />
        </motion.div>

        {/* Detalhes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center">
          <p className="text-[9px] tracking-[0.32em] uppercase text-warm-gray mb-4 font-light">
            {product.category}
            {product.weight && (
              <span className="ml-2 text-warm-gray-light">
                · {product.weight}
              </span>
            )}
          </p>

          <h1
            className="text-[2.4rem] md:text-[3rem] font-light text-charcoal leading-[1.05] mb-5"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            {product.name}
          </h1>

          <p
            className="text-[2rem] font-light text-gold mb-7"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            {formatPrice(product.price)}
          </p>

          <div className="h-px bg-pistachio-border/40 mb-7" />

          <p className="text-[13.5px] font-light text-warm-gray leading-[1.85] mb-8 max-w-md">
            {product.description}
          </p>

          {/* Seletor de quantidade */}
          <div className="flex items-center gap-5 mb-6">
            <span className="text-[10px] tracking-[0.2em] uppercase font-light text-warm-gray">
              Quantidade
            </span>
            <div className="flex items-center border border-cream-deep">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                aria-label="Diminuir quantidade"
                className="w-10 h-10 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors cursor-pointer">
                <Minus size={13} strokeWidth={1.5} />
              </button>
              <span className="w-10 text-center text-sm font-light text-charcoal">
                {qty}
              </span>
              <button
                onClick={() => setQty(q => Math.min(99, q + 1))}
                aria-label="Aumentar quantidade"
                className="w-10 h-10 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors cursor-pointer">
                <Plus size={13} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleAdd}
              className={`flex-1 inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[11px] tracking-[0.18em] uppercase font-normal transition-all duration-300 cursor-pointer ${
                added
                  ? "bg-pistachio-pale text-pistachio"
                  : "bg-pistachio text-cream hover:bg-pistachio-mid"
              }`}>
              <ShoppingBag size={15} strokeWidth={1.5} aria-hidden="true" />
              {added ? "Adicionado ao carrinho" : "Adicionar ao carrinho"}
            </button>

            <button
              type="button"
              onClick={openCartDrawer}
              className="inline-flex items-center justify-center px-8 py-4 border border-charcoal/20 text-charcoal text-[11px] tracking-[0.18em] uppercase font-light hover:border-pistachio hover:text-pistachio transition-all duration-300">
              Abrir carrinho
            </button>
          </div>

          <a
            href={`https://wa.me/5531981196886?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] tracking-[0.15em] uppercase font-light text-warm-gray hover:text-pistachio transition-colors duration-200 border-b border-warm-gray/35 hover:border-pistachio/50 pb-px self-start">
            Encomendar via WhatsApp
          </a>

          {/* Detalhes de serviço */}
          <div className="mt-8 pt-7 border-t border-cream-deep grid grid-cols-2 gap-4">
            {[
              { label: "Feito por encomenda", detail: "48h de antecedência" },
              { label: "Ingredientes DOP", detail: "Pistache de Bronte IGP" }
            ].map(item => (
              <div key={item.label}>
                <p className="text-[9px] tracking-[0.2em] uppercase text-warm-gray-light font-light mb-0.5">
                  {item.label}
                </p>
                <p className="text-xs font-light text-charcoal">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Produtos relacionados ────────────────────────── */}
      {related.length > 0 && (
        <section className="border-t border-cream-deep">
          <div className="max-w-7xl mx-auto px-5 md:px-10 py-16 md:py-20">
            <div className="flex items-center gap-4 mb-12">
              <div
                className="h-px w-8 bg-pistachio-border"
                aria-hidden="true"
              />
              <p className="text-[10px] tracking-[0.3em] uppercase text-warm-gray font-light">
                Da mesma coleção
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {related.map((p, i) => (
                <StoreCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Voltar ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase font-light text-warm-gray hover:text-pistachio transition-colors duration-200 cursor-pointer">
          <ArrowLeft size={12} strokeWidth={1.5} aria-hidden="true" />
          Voltar
        </button>
      </div>
    </>
  );
}
