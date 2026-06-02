import { motion } from 'framer-motion'
import { formatPrice } from '../lib/formatPrice'
import type { Product } from '../data/products'

interface ProductCardProps {
  product: Product
  index: number
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const waMessage = encodeURIComponent(
    `Olá! Gostaria de saber mais sobre o ${product.name}.`
  )

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.07, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col"
    >
      {/* Imagem */}
      <div className="relative aspect-square overflow-hidden mb-5">
        {product.image ? (
          <>
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            {/* Overlay escuro sutil + hover */}
            <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-charcoal/25 transition-colors duration-500" />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 40% 32%, #EDF2E8 0%, #DDE8D4 50%, #C4D4BA 100%)',
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg, #3A4D2C 0px, #3A4D2C 1px, transparent 1px, transparent 12px)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 48%, rgba(58,77,44,0.09) 100%)',
              }}
            />
            <div className="absolute inset-0 bg-pistachio/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        )}

        {product.badge && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-charcoal/80 backdrop-blur-sm text-[9px] tracking-[0.22em] uppercase font-normal text-cream">
            {product.badge}
          </span>
        )}

        {/* Nome como placeholder (só aparece sem imagem) */}
        {!product.image && (
          <div className="absolute inset-0 flex items-center justify-center select-none">
            <div className="text-center px-6">
              <div className="w-6 h-px bg-pistachio/22 mx-auto mb-3" />
              <p
                className="text-sm italic text-pistachio/45 leading-snug"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {product.name}
              </p>
              <div className="w-6 h-px bg-pistachio/22 mx-auto mt-3" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1">
        <p className="text-[9px] tracking-[0.28em] uppercase text-warm-gray mb-2 font-light">
          {product.category}
        </p>

        <h3
          className="text-[1.3rem] font-light text-charcoal mb-2.5 group-hover:text-pistachio transition-colors duration-200 leading-snug"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {product.name}
        </h3>

        <p className="text-[13px] font-light text-warm-gray leading-[1.7] mb-5 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-cream-deep">
          <span
            className="text-lg font-light text-gold"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {formatPrice(product.price)}
          </span>

          <a
            href={`https://wa.me/5511999999999?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.22em] uppercase font-normal text-pistachio hover:text-pistachio-mid border-b border-pistachio/45 hover:border-pistachio transition-all duration-200 pb-px"
          >
            Encomendar
          </a>
        </div>
      </div>
    </motion.article>
  )
}
