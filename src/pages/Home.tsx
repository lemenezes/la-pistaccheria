import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import CTA from '../components/CTA'
import { products } from '../data/products'
import { formatPrice } from '../lib/formatPrice'
import type { Product } from '../data/products'

const ORIGIN_IMG =
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=900&h=1100&q=88&auto=format&fit=crop'

const ORIGIN_BG =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1800&h=900&q=75&auto=format&fit=crop'

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
}

const pillars = [
  {
    num: '01',
    title: 'Pistache DOP',
    text: 'Somente pistaches com Denominação de Origem Protegida de Bronte, colhidos à mão nas encostas do Etna a cada dois anos.',
  },
  {
    num: '02',
    title: 'Feito à mão',
    text: 'Cada peça é produzida em pequenos lotes, com técnicas tradicionais sicilianas e atenção individual a cada detalhe.',
  },
  {
    num: '03',
    title: 'Por encomenda',
    text: 'Preparamos sob medida para cada pedido, garantindo frescor e qualidade máxima sem compromisso.',
  },
]

// ── Card padrão (pequeno)
function HomeProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/produto/${product.slug}`} className="group block">
        <div className="aspect-[4/5] overflow-hidden bg-cream-deep mb-4 relative">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              style={{ filter: 'sepia(0.06) saturate(0.88) brightness(1.02)' }}
            />
          )}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-cream/90 text-[8px] tracking-[0.22em] uppercase font-light text-pistachio px-2.5 py-1">
              {product.badge}
            </span>
          )}
        </div>
        <p className="text-[9px] tracking-[0.28em] uppercase text-warm-gray font-normal mb-1">
          {product.category}
        </p>
        <h3
          className="text-[1.15rem] font-light text-charcoal mb-1.5 group-hover:text-pistachio transition-colors duration-200"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {product.name}
        </h3>
        {product.weight && (
          <p className="text-[11px] font-light text-warm-gray-light mb-3">{product.weight}</p>
        )}
        <div className="flex items-center justify-between">
          <span
            className="text-[1.05rem] font-light text-charcoal"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {formatPrice(product.price)}
          </span>
          <span className="text-[9px] tracking-[0.15em] uppercase text-warm-gray border-b border-warm-gray/45 pb-px group-hover:text-pistachio group-hover:border-pistachio transition-colors duration-200">
            Ver produto
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

// ── Card editorial grande (destaque principal — 2 colunas no grid)
function LargeHomeProductCard({ product }: { product: Product }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className="lg:col-span-2"
    >
      <Link to={`/produto/${product.slug}`} className="group block">
        <div className="aspect-[4/5] lg:aspect-[3/2] overflow-hidden bg-cream-deep mb-5 relative">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              loading="eager"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              style={{ filter: 'sepia(0.06) saturate(0.88) brightness(1.02)' }}
            />
          )}
          {product.badge && (
            <span className="absolute top-4 left-4 bg-cream/90 text-[8px] tracking-[0.22em] uppercase font-light text-pistachio px-3 py-1.5">
              {product.badge}
            </span>
          )}
        </div>
        <p className="text-[9px] tracking-[0.28em] uppercase text-warm-gray font-normal mb-1.5">
          {product.category}
        </p>
        <h3
          className="text-[1.4rem] md:text-[1.65rem] font-light text-charcoal mb-2 group-hover:text-pistachio transition-colors duration-200"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {product.name}
        </h3>
        {product.weight && (
          <p className="text-[12px] font-light text-warm-gray-light mb-3">{product.weight}</p>
        )}
        <div className="flex items-center justify-between">
          <span
            className="text-[1.2rem] font-light text-charcoal"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            {formatPrice(product.price)}
          </span>
          <span className="text-[9px] tracking-[0.15em] uppercase text-warm-gray border-b border-warm-gray/45 pb-px group-hover:text-pistachio group-hover:border-pistachio transition-colors duration-200">
            Ver produto
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

export default function Home() {
  const featured = products.filter((p) => p.featured)
  const rest = products.filter((p) => !p.featured)

  return (
    <>
      <Hero />

      {/* ── SEÇÃO 2: DESTAQUES ──────────────────────────────────────── */}
      <section className="bg-cream py-20 md:py-28" aria-labelledby="destaques-heading">
        <div className="max-w-6xl mx-auto px-5 md:px-10">
          <div className="flex items-end justify-between mb-12 md:mb-16">
            <motion.div {...fadeUp}>
              <p className="text-[9px] tracking-[0.32em] uppercase text-gold font-normal mb-2">
                Destaques
              </p>
              <h2
                id="destaques-heading"
                className="text-[2rem] md:text-[2.5rem] font-light text-charcoal leading-[1.1]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Nossos favoritos
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <Link
                to="/loja"
                className="text-[10px] tracking-[0.18em] uppercase font-normal text-warm-gray hover:text-charcoal border-b border-warm-gray/45 hover:border-charcoal/50 pb-px transition-colors duration-200"
              >
                Ver todos
              </Link>
            </motion.div>
          </div>

          {/* Grid editorial: 1 card grande (2 colunas) + coluna com 2 cards pequenos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 md:gap-10">
            {featured[0] && <LargeHomeProductCard product={featured[0]} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-7 md:gap-10">
              {featured.slice(1, 3).map((p, i) => (
                <HomeProductCard key={p.id} product={p} index={i + 1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO STRIP ──────────────────────────────────────────── */}
      <section className="bg-pistachio-pale py-16 md:py-20" aria-label="Manifesto">
        <div className="max-w-3xl mx-auto px-5 md:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="h-px w-10 bg-gold/50 mx-auto mb-8" aria-hidden="true" />
            <blockquote
              className="text-[1.55rem] md:text-[1.9rem] lg:text-[2.25rem] font-light italic text-pistachio leading-[1.3]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              "Do vulcão Etna para a sua mesa — cada receita começa onde a terra encontra o céu."
            </blockquote>
            <div className="h-px w-10 bg-gold/50 mx-auto mt-8" aria-hidden="true" />
          </motion.div>
        </div>
      </section>

      {/* ── SEÇÃO 3: ORIGEM ────────────────────────────────────────── */}
      <section id="sobre" className="relative overflow-hidden" aria-label="Nossa origem">
        {/* Fundo texturizado: pistaches reais */}
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src={ORIGIN_BG}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-cream/88" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2">
            {/* Imagem */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden min-h-[70vw] lg:min-h-[560px]"
            >
              <img
                src={ORIGIN_IMG}
                alt="Cannolo al pistacchio artesanal"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>

            {/* Texto */}
            <motion.div
              {...fadeUp}
              className="flex flex-col justify-center px-8 sm:px-10 lg:px-14 xl:px-16 py-16 lg:py-24 bg-cream/55 backdrop-blur-[2px]"
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="h-px w-5 bg-gold flex-shrink-0" aria-hidden="true" />
                <p className="text-[9px] tracking-[0.32em] uppercase text-gold font-normal">
                  Bronte · Sicília
                </p>
              </div>

              <h2
                className="text-[2.2rem] md:text-[2.8rem] lg:text-[3.2rem] font-light text-charcoal leading-[1.1] mb-6"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Do Etna
                <br />
                <em className="italic text-pistachio">para sua mesa</em>
              </h2>

              <p className="text-[13px] font-light text-warm-gray leading-[1.95] mb-5 max-w-sm">
                O Pistache di Bronte DOP cresce nas encostas do vulcão Etna, em
                solo vulcânico único no mundo. Colhido à mão a cada dois anos,
                tem sabor intenso e cor esmeralda inigualáveis.
              </p>
              <p className="text-[13px] font-light text-warm-gray leading-[1.95] mb-10 max-w-sm">
                Cada receita da La Pistaccheria começa por esse ingrediente
                excepcional — sem atalhos, sem substitutos.
              </p>

              <Link
                to="/loja"
                className="self-start text-[10px] tracking-[0.22em] uppercase font-light text-charcoal border-b border-charcoal/30 hover:border-pistachio hover:text-pistachio pb-px transition-colors duration-200"
              >
                Descobrir a coleção
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PILARES ──────────────────────────────────────────────────── */}
      <section className="bg-cream-deep py-20 md:py-28" aria-label="Nossos pilares">
        <div className="max-w-5xl mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <p
                  className="text-[3.5rem] font-light text-pistachio/[0.22] leading-none mb-5 select-none"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  aria-hidden="true"
                >
                  {pillar.num}
                </p>
                <div className="h-px w-8 bg-gold/60 mb-5" aria-hidden="true" />
                <h3
                  className="text-[1.1rem] font-light text-charcoal mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {pillar.title}
                </h3>
                <p className="text-[13px] font-light text-warm-gray leading-[1.85]">
                  {pillar.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO 4: MAIS PRODUTOS ─────────────────────────────────── */}
      {rest.length > 0 && (
        <section className="bg-cream py-20 md:py-28" aria-labelledby="colecao-heading">
          <div className="max-w-6xl mx-auto px-5 md:px-10">
            <div className="flex items-end justify-between mb-12 md:mb-16">
              <motion.div {...fadeUp}>
                <p className="text-[9px] tracking-[0.32em] uppercase text-gold font-normal mb-2">
                  Coleção completa
                </p>
                <h2
                  id="colecao-heading"
                  className="text-[2rem] md:text-[2.5rem] font-light text-charcoal leading-[1.1]"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  Mais para explorar
                </h2>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.7 }}
              >
                <Link
                  to="/loja"
                  className="text-[10px] tracking-[0.18em] uppercase font-normal text-warm-gray hover:text-charcoal border-b border-warm-gray/45 hover:border-charcoal/50 pb-px transition-colors duration-200"
                >
                  Ver loja
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 md:gap-10">
              {rest.map((p, i) => (
                <HomeProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTA />
    </>
  )
}

