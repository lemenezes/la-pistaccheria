import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.14, duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Hero() {
  return (
    <section aria-label="Apresentação" className="relative min-h-screen bg-cream flex flex-col overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-pistachio-pale/50 blur-3xl" />
        <div className="absolute bottom-20 -left-32 w-[500px] h-[500px] rounded-full bg-cream-deep/70 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-[60%] bg-pistachio-border/20 hidden lg:block" />
      </div>

      <div className="relative flex-1 max-w-7xl mx-auto w-full px-5 md:px-10 pt-28 md:pt-40 pb-16 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Left: texto */}
        <div className="flex flex-col">
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-[10px] tracking-[0.35em] uppercase text-gold font-light mb-7"
          >
            Confeitaria Italiana · Est. 2024
          </motion.p>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-[2.8rem] md:text-[3.4rem] lg:text-[4rem] font-light leading-[1.06] text-charcoal mb-7"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            A arte do{' '}
            <em className="text-pistachio" style={{ fontStyle: 'italic' }}>
              pistache
            </em>
            <br />
            em cada{' '}
            <span className="text-gold">criação</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-base md:text-[1.05rem] font-light text-warm-gray leading-[1.75] mb-10 max-w-md"
          >
            Confeitos artesanais inspirados na Sicília, preparados com pistache
            de Bronte DOP — a mais rara e saborosa variedade do mundo.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-3"
          >
            <a
              href="#colecao"
              className="inline-flex items-center justify-center px-8 py-4 bg-pistachio text-cream text-[11px] tracking-[0.18em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-300"
            >
              Ver Coleção
            </a>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 border border-charcoal/20 text-charcoal text-[11px] tracking-[0.18em] uppercase font-light hover:border-pistachio hover:text-pistachio transition-all duration-300"
            >
              Encomendar
            </a>
          </motion.div>

          {/* Detalhe tipográfico */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-12 flex items-center gap-4"
          >
            <div className="h-[1px] w-8 bg-pistachio-border" />
            <p className="text-[10px] tracking-[0.22em] uppercase text-warm-gray-light font-light">
              Pistache Bronte DOP · Sicília
            </p>
          </motion.div>
        </div>

        {/* Right: frame visual */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          {/* Frame principal */}
          <div className="relative aspect-[3/4] md:aspect-auto md:h-[600px] bg-pistachio-pale/40 overflow-hidden">
            {/* Placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 select-none">
              <div className="w-12 h-[1px] bg-pistachio-border" />
              <p
                className="text-2xl text-pistachio/40 italic"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                sua imagem aqui
              </p>
              <p className="text-[11px] tracking-[0.2em] uppercase text-warm-gray-light/60 font-light">
                1080 × 1440 px recomendado
              </p>
              <div className="w-12 h-[1px] bg-pistachio-border" />
            </div>
            {/* Corner marks */}
            <div className="absolute top-0 left-0 w-7 h-7 border-t border-l border-pistachio/25" aria-hidden="true" />
            <div className="absolute top-0 right-0 w-7 h-7 border-t border-r border-pistachio/25" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-7 h-7 border-b border-l border-pistachio/25" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-7 h-7 border-b border-r border-pistachio/25" aria-hidden="true" />
          </div>

          {/* Floating card decorativo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-6 -left-6 md:-left-10 bg-cream border border-cream-deep px-5 py-4 shadow-sm"
          >
            <p className="text-[10px] tracking-[0.25em] uppercase text-warm-gray-light mb-1 font-light">
              Ingrediente
            </p>
            <p
              className="text-base font-light text-charcoal"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Pistache de Bronte DOP
            </p>
            <p className="text-[11px] text-pistachio font-light mt-0.5">Sicília, Itália</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        className="relative flex justify-center pb-8 md:pb-10"
      >
        <a
          href="#colecao"
          aria-label="Ir para a coleção"
          className="flex flex-col items-center gap-2 text-warm-gray hover:text-pistachio transition-colors duration-300"
        >
          <span className="text-[9px] tracking-[0.3em] uppercase font-light">Explorar</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={13} strokeWidth={1.5} />
          </motion.div>
        </a>
      </motion.div>
    </section>
  )
}
