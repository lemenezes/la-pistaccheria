import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export default function CTA() {
  const waMessage = encodeURIComponent(
    'Olá! Gostaria de fazer uma encomenda especial na La Pistaccheria.'
  )

  return (
    <section
      id="contato"
      aria-labelledby="cta-title"
      className="bg-pistachio py-20 md:py-32 overflow-hidden relative"
    >
      {/* Decoração de fundo */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-pistachio-mid/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-charcoal/20 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 md:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold-light font-light mb-6">
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

          <p className="text-[15px] md:text-base font-light text-cream/65 leading-[1.8] mb-12 max-w-lg mx-auto">
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

          {/* Linha decorativa */}
          <div className="mt-20 flex items-center gap-5 justify-center" aria-hidden="true">
            <div className="h-[1px] flex-1 max-w-[80px] bg-cream/15" />
            <p
              className="text-[11px] tracking-[0.25em] text-cream/25 font-light uppercase"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              La Pistaccheria
            </p>
            <div className="h-[1px] flex-1 max-w-[80px] bg-cream/15" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
