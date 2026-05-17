import { motion } from 'framer-motion'
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
      <div className="relative aspect-square bg-pistachio-pale/35 overflow-hidden mb-5">
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-cream text-[9px] tracking-[0.22em] uppercase font-normal text-pistachio">
            {product.badge}
          </span>
        )}

        {/* Placeholder frame */}
        <div className="absolute inset-0 flex items-center justify-center select-none">
          <div className="text-center">
            <div className="w-8 h-[1px] bg-pistachio-border mx-auto mb-3" />
            <p
              className="text-sm text-pistachio/35 italic"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              foto do produto
            </p>
            <div className="w-8 h-[1px] bg-pistachio-border mx-auto mt-3" />
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-pistachio/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1">
        <p className="text-[9px] tracking-[0.28em] uppercase text-warm-gray-light mb-2 font-light">
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
            {product.price}
          </span>

          <a
            href={`https://wa.me/5511999999999?text=${waMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.22em] uppercase font-normal text-pistachio hover:text-pistachio-mid border-b border-pistachio/30 hover:border-pistachio transition-all duration-200 pb-px"
          >
            Encomendar
          </a>
        </div>
      </div>
    </motion.article>
  )
}
