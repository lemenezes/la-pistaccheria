import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function PedidoConfirmado() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-5 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md"
      >
        {/* Ornamento */}
        <div className="flex items-center gap-4 justify-center mb-10">
          <div className="h-px w-12 bg-pistachio-border" aria-hidden="true" />
          <div className="w-2 h-2 border border-pistachio/40 rotate-45" aria-hidden="true" />
          <div className="h-px w-12 bg-pistachio-border" aria-hidden="true" />
        </div>

        <p className="text-[10px] tracking-[0.38em] uppercase text-gold font-light mb-6">
          Pedido enviado
        </p>

        <h1
          className="text-[2.6rem] md:text-[3.2rem] font-light text-charcoal leading-[1.05] mb-6"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Obrigado pelo<br />
          <em style={{ fontStyle: 'italic' }} className="text-pistachio">seu pedido</em>
        </h1>

        <p className="text-[13.5px] font-light text-warm-gray leading-[1.85] mb-10">
          Seu resumo foi enviado para o WhatsApp. Nossa equipe entrará em
          contato em breve para confirmar os detalhes e combinar a entrega.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="px-8 py-3.5 bg-pistachio text-cream text-[11px] tracking-[0.18em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-300"
          >
            Voltar ao início
          </Link>
          <Link
            to="/loja"
            className="px-8 py-3.5 border border-charcoal/20 text-charcoal text-[11px] tracking-[0.18em] uppercase font-light hover:border-pistachio hover:text-pistachio transition-all duration-300"
          >
            Continuar comprando
          </Link>
        </div>

        <p className="text-[11px] font-light text-warm-gray-light mt-12">
          La Pistaccheria · São Paulo, Brasil
        </p>
      </motion.div>
    </div>
  )
}
