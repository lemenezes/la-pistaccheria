import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const HERO_IMG =
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=1200&h=1400&q=90&auto=format&fit=crop'

export default function Hero() {
  return (
    <section
      className="min-h-[88svh] flex flex-col lg:flex-row bg-cream"
      aria-label="Apresentação"
    >
      {/* ── LEFT: texto ─────────────────────────────────── */}
      <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-24 lg:py-32 lg:w-[46%] xl:w-[44%] order-2 lg:order-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-5 bg-gold flex-shrink-0" aria-hidden="true" />
            <p className="text-[10px] tracking-[0.35em] uppercase text-gold font-light">
              Confeitaria Italiana · Est. 2024
            </p>
          </div>

          {/* Heading */}
          <h1
            className="font-light text-charcoal leading-[1.02] mb-7"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            <span className="block text-[2.8rem] sm:text-[3.4rem] lg:text-[3.8rem] xl:text-[4.5rem]">
              A arte do
            </span>
            <span className="block text-[2.8rem] sm:text-[3.4rem] lg:text-[3.8rem] xl:text-[4.5rem] italic text-pistachio">
              pistache
            </span>
            <span className="block text-[2.8rem] sm:text-[3.4rem] lg:text-[3.8rem] xl:text-[4.5rem]">
              siciliano
            </span>
          </h1>

          {/* Body */}
          <p className="text-[13.5px] font-light text-warm-gray leading-[1.9] mb-10 max-w-[320px]">
            Criamos com pistaches de Bronte DOP — cultivados nas encostas do
            vulcão Etna, a 700 metros de altitude na Sicília.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/loja"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-pistachio text-cream text-[10px] tracking-[0.2em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-200"
            >
              Ver a coleção
              <ArrowRight size={12} strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-7 py-3.5 border border-charcoal/20 text-charcoal text-[10px] tracking-[0.2em] uppercase font-light hover:border-pistachio hover:text-pistachio transition-colors duration-200"
            >
              Encomendar
            </a>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex items-center gap-5 text-[9px] tracking-[0.2em] uppercase text-warm-gray/50 font-light">
            <span>Pistache DOP</span>
            <span className="text-pistachio-border" aria-hidden="true">·</span>
            <span>Bronte, Sicília</span>
            <span className="text-pistachio-border" aria-hidden="true">·</span>
            <span>Artesanal</span>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT: imagem ────────────────────────────────── */}
      <div className="relative overflow-hidden bg-cream-deep lg:flex-1 min-h-[60vw] sm:min-h-[50vw] lg:min-h-0 order-1 lg:order-2">
        <motion.img
          src={HERO_IMG}
          alt="Torta di Pistacchio e Limone da La Pistaccheria"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          fetchPriority="high"
        />

        {/* Badge de origem */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-6 left-6 bg-cream/92 backdrop-blur-sm px-4 py-3"
        >
          <p className="text-[8px] tracking-[0.3em] uppercase text-gold font-light mb-0.5">
            Origem
          </p>
          <p
            className="text-[13px] font-light text-charcoal"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Monte Etna, Sicília
          </p>
        </motion.div>
      </div>
    </section>
  )
}


