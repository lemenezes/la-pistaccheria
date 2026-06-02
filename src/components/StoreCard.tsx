import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/formatPrice'
import type { Product } from '../data/products'

interface StoreCardProps {
  product: Product
  index: number
}

export default function StoreCard({ product, index }: StoreCardProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col"
    >
      {/* Imagem */}
      <Link
        to={`/produto/${product.slug}`}
        className="block relative aspect-[4/5] overflow-hidden mb-4 bg-cream-deep focus-visible:outline-2 focus-visible:outline-pistachio"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            style={{ filter: 'sepia(0.06) saturate(0.88) brightness(1.02)' }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 40% 32%, #EDF2E8 0%, #DDE8D4 50%, #C4D4BA 100%)',
            }}
          />
        )}

        {product.badge && (
          <span className="absolute top-3 left-3 z-10 bg-cream/90 text-[8px] tracking-[0.22em] uppercase font-light text-pistachio px-2.5 py-1">
            {product.badge}
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1">
        <p className="text-[9px] tracking-[0.28em] uppercase text-warm-gray/60 font-light mb-1">
          {product.category}
          {product.weight && (
            <span className="ml-2 text-warm-gray/40">· {product.weight}</span>
          )}
        </p>

        <Link to={`/produto/${product.slug}`}>
          <h3
            className="text-[1.15rem] font-light text-charcoal mb-1.5 group-hover:text-pistachio transition-colors duration-200 leading-snug"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {product.name}
          </h3>
        </Link>

        <p className="text-[12px] font-light text-warm-gray leading-[1.75] mb-4 flex-1">
          {product.shortDescription}
        </p>

        <div className="flex items-center justify-between pt-3.5 border-t border-cream-deep">
          <span
            className="text-[1.05rem] font-light text-charcoal"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {formatPrice(product.price)}
          </span>

          <button
            onClick={handleAdd}
            aria-label={`Adicionar ${product.name} ao carrinho`}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-[9px] tracking-[0.15em] uppercase font-normal transition-all duration-300 cursor-pointer border ${
              added
                ? 'border-pistachio/40 text-pistachio bg-pistachio-pale'
                : 'border-charcoal/20 text-charcoal hover:border-pistachio hover:text-pistachio'
            }`}
          >
            {added ? (
              <>
                <Check size={10} strokeWidth={2} aria-hidden="true" />
                Adicionado
              </>
            ) : (
              <>
                <Plus size={10} strokeWidth={2} aria-hidden="true" />
                Adicionar
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  )
}
