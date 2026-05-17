import { motion } from 'framer-motion'
import { products } from '../data/products'
import ProductCard from './ProductCard'

export default function Collection() {
  return (
    <section
      id="colecao"
      aria-labelledby="collection-title"
      className="bg-cream py-20 md:py-32"
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        {/* Cabeçalho da seção */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 md:mb-20 gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-[10px] tracking-[0.35em] uppercase text-gold font-light mb-4"
            >
              2024 · Primeira edição
            </motion.p>
            <motion.h2
              id="collection-title"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="text-[2.2rem] md:text-[2.8rem] font-light text-charcoal leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Coleção Inaugural
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="md:max-w-[280px] text-[13px] font-light text-warm-gray leading-[1.75]"
          >
            Cada peça é preparada por encomenda, com pistache de Bronte DOP
            e ingredientes selecionados da Sicília.
          </motion.p>
        </div>

        {/* Divisória */}
        <div className="h-[1px] bg-pistachio-border/40 mb-14 md:mb-20" />

        {/* Grid de produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* Nota inferior */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 md:mt-20 pt-10 border-t border-cream-deep flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-[12px] font-light text-warm-gray text-center sm:text-left">
            Peças preparadas por encomenda com{' '}
            <span className="text-pistachio font-normal">48h de antecedência</span>
          </p>
          <a
            href="#contato"
            className="text-[10px] tracking-[0.2em] uppercase font-light text-warm-gray hover:text-pistachio transition-colors duration-200 border-b border-warm-gray/30 hover:border-pistachio pb-px"
          >
            Fazer uma encomenda
          </a>
        </motion.div>
      </div>
    </section>
  )
}
