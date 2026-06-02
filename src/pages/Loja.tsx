import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";
import StoreCard from "../components/StoreCard";
import { useCart } from "../context/CartContext";
import { products } from "../data/products";
import { openCartDrawer } from "../lib/whatsappOrder";

const ALL = "Todos";
const categories = [ALL, ...Array.from(new Set(products.map(p => p.category)))];

export default function Loja() {
  const [active, setActive] = useState(ALL);
  const [toastProductName, setToastProductName] = useState<string | null>(null);
  const { count, total } = useCart();

  const filtered =
    active === ALL ? products : products.filter(p => p.category === active);

  function handleProductAdded(productName: string) {
    setToastProductName(productName);
    window.setTimeout(() => setToastProductName(null), 1700);
  }

  return (
    <>
      {/* ── Cabeçalho editorial da loja ────────────────── */}
      <section className="bg-cream max-w-6xl mx-auto px-5 md:px-10 pt-32 md:pt-40 pb-12 md:pb-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-[10px] tracking-[0.38em] uppercase text-gold font-light mb-5">
          Coleção 2024
        </motion.p>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-[3rem] md:text-[4rem] font-light text-charcoal leading-[1.0]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Nossa Loja
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="md:max-w-[300px] text-[13px] font-light text-warm-gray leading-[1.75]">
            Todos os confeitos artesanais, preparados por encomenda com pistache
            de Bronte DOP.
          </motion.p>
        </div>
      </section>

      {/* ── Filtro de categorias ───────────────────────── */}
      <div className="border-y border-cream-deep overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="flex gap-0 min-w-max md:min-w-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-4 text-[10px] tracking-[0.22em] uppercase font-light whitespace-nowrap transition-all duration-200 border-b-[1.5px] -mb-px cursor-pointer ${
                  active === cat
                    ? "text-pistachio border-pistachio"
                    : "text-warm-gray border-transparent hover:text-charcoal"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid de produtos ───────────────────────────── */}
      <section
        aria-label="Produtos"
        className="max-w-6xl mx-auto px-5 md:px-10 py-12 md:py-16 bg-cream">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filtered.map((product, i) => (
            <StoreCard
              key={product.id}
              product={product}
              index={i}
              onAdded={handleProductAdded}
            />
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <p className="text-center text-warm-gray font-light py-16">
            Nenhum produto nesta categoria.
          </p>
        )}
      </section>

      {/* ── Nota de encomendas ─────────────────────────── */}
      <div className="border-t border-cream-deep">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] font-light text-warm-gray text-center sm:text-left">
            Peças preparadas por encomenda com{" "}
            <span className="text-pistachio font-normal">
              48h de antecedência
            </span>
          </p>
          <a
            href="https://wa.me/5531981196886"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.2em] uppercase font-light text-warm-gray hover:text-pistachio transition-colors duration-200 border-b border-warm-gray/40 hover:border-pistachio pb-px">
            Encomenda especial via WhatsApp
          </a>
        </div>
      </div>

      {/* Feedback de adição */}
      {toastProductName && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed right-4 md:right-8 top-20 md:top-24 z-[130] bg-charcoal text-cream border border-pistachio/35 shadow-[0_12px_40px_rgba(28,28,26,0.25)] px-4 py-3"
          role="status"
          aria-live="polite">
          <p className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase font-medium">
            <Check
              size={13}
              strokeWidth={2}
              className="text-gold-light"
              aria-hidden="true"
            />
            Produto adicionado
          </p>
          <p
            className="text-[1rem] font-light leading-snug mt-1"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            {toastProductName}
          </p>
        </motion.div>
      )}

      {/* CTA fixo para carrinho */}
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[125] w-[calc(100%-2rem)] max-w-md">
          <button
            type="button"
            onClick={openCartDrawer}
            className="w-full flex items-center justify-between gap-3 bg-pistachio text-cream px-5 py-4 shadow-[0_14px_35px_rgba(58,77,44,0.35)] border border-pistachio-mid hover:bg-pistachio-mid transition-colors duration-200 cursor-pointer"
            aria-label={`Ver carrinho com ${count} ${count === 1 ? "item" : "itens"}`}>
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase font-medium">
              <ShoppingBag size={15} strokeWidth={1.7} aria-hidden="true" />
              Ver carrinho
            </span>
            <span
              className="text-[1.12rem] font-light"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              {count} {count === 1 ? "item" : "itens"} • R${" "}
              {total.toFixed(2).replace(".", ",")}
            </span>
          </button>
        </motion.div>
      )}
    </>
  );
}
