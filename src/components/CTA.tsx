import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export default function CTA() {
  const waMessage = encodeURIComponent(
    'Olá! Gostaria de fazer uma encomenda especial na La Pistaccheria.'
  )

  return (
    <section
      id="cta"
      aria-labelledby="cta-title"
      className="bg-pistachio py-20 md:py-32 overflow-hidden relative"
    >
      {/* Textura de fundo */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-60 -right-60 w-[700px] h-[700px] rounded-full bg-pistachio-mid/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-charcoal/25 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, #FAF7F2 0px, #FAF7F2 1px, transparent 1px, transparent 18px)',
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-5 md:px-10">
        <div className="grid md:grid-cols-[1fr_260px] gap-12 md:gap-16 items-center">

          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] tracking-[0.35em] uppercase text-gold-light font-normal mb-6">
              Encomendas especiais
            </p>

            <h2
              id="cta-title"
              className="text-[2.4rem] md:text-[3.2rem] lg:text-[3.8rem] font-light text-cream leading-[1.1] mb-8"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Criamos para
              <br />
              <em className="text-gold-light" style={{ fontStyle: 'italic' }}>
                ocasiões únicas
              </em>
            </h2>

            <p className="text-[15px] md:text-base font-light text-cream/82 leading-[1.8] mb-12 max-w-lg">
              Casamentos, aniversários, presentes corporativos e celebrações
              especiais. Cada encomenda é tratada com cuidado artesanal e
              embalagem exclusiva.
            </p>

            <a
              href={`https://wa.me/5511999999999?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 bg-cream text-pistachio text-[11px] tracking-[0.18em] uppercase font-normal hover:bg-cream-deep transition-colors duration-300"
            >
              <MessageCircle size={17} strokeWidth={1.5} aria-hidden="true" />
              Falar pelo WhatsApp
            </a>
          </motion.div>

          {/* Marca tipográfica — refinada */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center md:justify-end"
            aria-hidden="true"
          >
            <div className="text-center select-none">
              <div className="w-8 h-px bg-gold/60 mx-auto mb-6" />
              <p
                className="text-[5rem] font-light text-cream/[0.12] leading-none tracking-[-0.02em]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                LP
              </p>
              <div className="w-8 h-px bg-gold/60 mx-auto mt-6 mb-5" />
              <p className="text-[8px] tracking-[0.4em] uppercase text-gold/85 font-normal mb-1">
                La Pistaccheria
              </p>
              <p className="text-[7px] tracking-[0.28em] uppercase text-cream/55 font-normal">
                Confeitaria Italiana · Est. 2024
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

