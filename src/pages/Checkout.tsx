import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/formatPrice'

const WA_NUMBER = '5511999999999'

interface FormData {
  nome: string
  telefone: string
  email: string
  observacoes: string
}

function buildWhatsAppMessage(items: ReturnType<typeof useCart>['items'], total: number, data: FormData): string {
  const lines = [
    'Olá! Gostaria de fazer um pedido na La Pistaccheria.',
    '',
    'Itens do pedido:',
    ...items.map(
      (i) => `• ${i.product.name} × ${i.quantity} — ${formatPrice(i.product.price * i.quantity)}`
    ),
    '',
    `Total: ${formatPrice(total)}`,
    '',
    `Nome: ${data.nome}`,
    `Telefone: ${data.telefone}`,
    data.email ? `E-mail: ${data.email}` : null,
    data.observacoes ? `Observações: ${data.observacoes}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n')

  return lines
}

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>({
    nome: '',
    telefone: '',
    email: '',
    observacoes: '',
  })

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-5">
        <p
          className="text-2xl font-light text-charcoal"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Carrinho vazio
        </p>
        <Link
          to="/loja"
          className="text-[11px] tracking-[0.2em] uppercase font-light text-pistachio border-b border-pistachio/40 pb-px"
        >
          Explorar a loja
        </Link>
      </div>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const message = buildWhatsAppMessage(items, total, form)
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, '_blank', 'noopener,noreferrer')
    clearCart()
    navigate('/pedido-confirmado')
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 pt-28 md:pt-36 pb-20">

      {/* Título */}
      <div className="mb-12">
        <p className="text-[10px] tracking-[0.35em] uppercase text-gold font-light mb-3">
          Finalizar
        </p>
        <h1
          className="text-[2.4rem] md:text-[3rem] font-light text-charcoal leading-tight"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Checkout
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid md:grid-cols-[1fr_360px] gap-10 md:gap-14 items-start"
      >
        {/* Formulário */}
        <div>
          <p
            className="text-lg font-light text-charcoal mb-8"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Seus dados
          </p>

          <div className="flex flex-col gap-6">
            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-[10px] tracking-[0.22em] uppercase font-light text-warm-gray mb-2">
                Nome completo <span className="text-gold" aria-hidden="true">*</span>
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                autoComplete="name"
                value={form.nome}
                onChange={handleChange}
                placeholder="Seu nome"
                className="w-full bg-transparent border border-cream-deep px-4 py-3 text-[14px] font-light text-charcoal placeholder:text-warm-gray-light focus:outline-none focus:border-pistachio/60 transition-colors duration-200"
              />
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="telefone" className="block text-[10px] tracking-[0.22em] uppercase font-light text-warm-gray mb-2">
                WhatsApp / Telefone <span className="text-gold" aria-hidden="true">*</span>
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                autoComplete="tel"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                className="w-full bg-transparent border border-cream-deep px-4 py-3 text-[14px] font-light text-charcoal placeholder:text-warm-gray-light focus:outline-none focus:border-pistachio/60 transition-colors duration-200"
              />
            </div>

            {/* E-mail */}
            <div>
              <label htmlFor="email" className="block text-[10px] tracking-[0.22em] uppercase font-light text-warm-gray mb-2">
                E-mail <span className="text-warm-gray-light font-light text-[9px]">(opcional)</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full bg-transparent border border-cream-deep px-4 py-3 text-[14px] font-light text-charcoal placeholder:text-warm-gray-light focus:outline-none focus:border-pistachio/60 transition-colors duration-200"
              />
            </div>

            {/* Observações */}
            <div>
              <label htmlFor="observacoes" className="block text-[10px] tracking-[0.22em] uppercase font-light text-warm-gray mb-2">
                Observações <span className="text-warm-gray-light font-light text-[9px]">(opcional)</span>
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                rows={3}
                value={form.observacoes}
                onChange={handleChange}
                placeholder="Alguma preferência, restrição alimentar ou data de entrega..."
                className="w-full bg-transparent border border-cream-deep px-4 py-3 text-[14px] font-light text-charcoal placeholder:text-warm-gray-light focus:outline-none focus:border-pistachio/60 transition-colors duration-200 resize-none"
              />
            </div>
          </div>

          <p className="text-[11px] font-light text-warm-gray-light mt-6">
            <span className="text-gold">*</span> Campos obrigatórios
          </p>
        </div>

        {/* Resumo + submit */}
        <div className="bg-cream-card border border-cream-deep p-6 sticky top-24">
          <p
            className="text-lg font-light text-charcoal mb-6"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Seu pedido
          </p>

          <div className="flex flex-col gap-3 mb-6">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-[12.5px] font-light text-warm-gray">
                <span className="truncate mr-2">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="flex-shrink-0 text-charcoal">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-cream-deep pt-5 mb-6">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] tracking-[0.2em] uppercase font-light text-warm-gray">
                Total
              </span>
              <span
                className="text-xl font-light text-charcoal"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {formatPrice(total)}
              </span>
            </div>
            <p className="text-[11px] font-light text-warm-gray-light mt-2">
              Frete combinado via WhatsApp
            </p>
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            className="w-full inline-flex items-center justify-center gap-3 py-4 bg-pistachio text-cream text-[11px] tracking-[0.18em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-300 cursor-pointer mb-4"
          >
            <MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" />
            Finalizar pelo WhatsApp
          </motion.button>

          <p className="text-[10px] font-light text-warm-gray-light text-center leading-[1.6]">
            Você será redirecionado ao WhatsApp com o resumo do pedido para confirmar diretamente com nossa equipe.
          </p>
        </div>
      </form>
    </div>
  )
}
