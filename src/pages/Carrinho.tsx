import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Minus, Plus, X, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/formatPrice'

export default function Carrinho() {
  const { items, removeItem, updateQuantity, total, count } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 px-5">
        <ShoppingBag size={40} strokeWidth={1} className="text-pistachio-border" aria-hidden="true" />
        <div className="text-center">
          <p
            className="text-2xl font-light text-charcoal mb-3"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Seu carrinho está vazio
          </p>
          <p className="text-sm font-light text-warm-gray">
            Explore nossa coleção e adicione produtos
          </p>
        </div>
        <Link
          to="/loja"
          className="px-8 py-3.5 bg-pistachio text-cream text-[11px] tracking-[0.18em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-300"
        >
          Ver Coleção
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 pt-28 md:pt-36 pb-20">

      {/* Título */}
      <div className="mb-10 md:mb-14">
        <p className="text-[10px] tracking-[0.35em] uppercase text-gold font-light mb-3">
          Resumo
        </p>
        <h1
          className="text-[2.4rem] md:text-[3rem] font-light text-charcoal leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Carrinho
          <span className="text-warm-gray text-[1.4rem] ml-3 font-light">
            ({count} {count === 1 ? 'item' : 'itens'})
          </span>
        </h1>
      </div>

      <div className="grid md:grid-cols-[1fr_340px] gap-10 md:gap-14 items-start">

        {/* Lista de itens */}
        <div className="flex flex-col gap-0">
          {items.map((item, i) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="flex gap-4 py-6 border-b border-cream-deep last:border-b-0"
            >
              {/* Imagem mini */}
              <Link
                to={`/produto/${item.product.slug}`}
                className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 relative overflow-hidden"
                aria-label={item.product.name}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at 40% 32%, #EDF2E8 0%, #DDE8D4 60%, #C4D4BA 100%)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <p
                    className="text-[10px] italic text-pistachio/40 text-center px-1.5 leading-tight"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {item.product.name}
                  </p>
                </div>
              </Link>

              {/* Info */}
              <div className="flex flex-col flex-1 gap-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] tracking-[0.22em] uppercase text-warm-gray font-light mb-1">
                      {item.product.category}
                    </p>
                    <Link to={`/produto/${item.product.slug}`}>
                      <p
                        className="text-base font-light text-charcoal hover:text-pistachio transition-colors leading-snug"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      >
                        {item.product.name}
                      </p>
                    </Link>
                    {item.product.weight && (
                      <p className="text-[11px] text-warm-gray-light font-light mt-0.5">
                        {item.product.weight}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeItem(item.product.id)}
                    aria-label={`Remover ${item.product.name}`}
                    className="text-warm-gray-light hover:text-charcoal transition-colors p-1 flex-shrink-0 cursor-pointer"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2">
                  {/* Qty control */}
                  <div className="flex items-center border border-cream-deep">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      aria-label="Diminuir"
                      className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
                    >
                      <Minus size={11} strokeWidth={1.5} />
                    </button>
                    <span className="w-8 text-center text-xs font-light text-charcoal">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      aria-label="Aumentar"
                      className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
                    >
                      <Plus size={11} strokeWidth={1.5} />
                    </button>
                  </div>

                  <span
                    className="text-base font-light text-charcoal"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Resumo do pedido */}
        <div className="bg-cream-card border border-cream-deep p-6 sticky top-24">
          <p
            className="text-lg font-light text-charcoal mb-6"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Resumo do pedido
          </p>

          <div className="flex flex-col gap-3 mb-6">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-[12.5px] font-light text-warm-gray">
                <span className="truncate mr-2">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="flex-shrink-0 text-charcoal">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-cream-deep pt-5 mb-6">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] tracking-[0.2em] uppercase font-light text-warm-gray">
                Subtotal
              </span>
              <span
                className="text-xl font-light text-charcoal"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-[11px] font-light text-warm-gray-light mt-2">
              Frete e entrega combinados via WhatsApp
            </p>
          </div>

          <Link
            to="/checkout"
            className="block w-full text-center py-4 bg-pistachio text-cream text-[11px] tracking-[0.18em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-300 mb-3"
          >
            Finalizar pedido
          </Link>
          <Link
            to="/loja"
            className="block w-full text-center py-3 text-[10px] tracking-[0.15em] uppercase font-light text-warm-gray hover:text-pistachio transition-colors duration-200"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
