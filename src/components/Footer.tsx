import { Instagram } from 'lucide-react'

const footerLinks = [
  { label: 'Coleção', href: '#colecao' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Contato', href: '#contato' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-charcoal py-12 md:py-16" role="contentinfo">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 md:gap-12">
          {/* Marca */}
          <div className="text-center md:text-left">
            <p
              className="text-xl font-light tracking-wide text-cream/80 mb-1"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              La Pistaccheria
            </p>
            <p className="text-[9px] tracking-[0.28em] uppercase text-warm-gray font-light">
              confeitaria italiana
            </p>
          </div>

          {/* Nav */}
          <nav aria-label="Rodapé" className="flex gap-6 md:gap-8">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[11px] tracking-[0.15em] uppercase font-light text-warm-gray hover:text-cream/60 transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da La Pistaccheria"
              className="text-warm-gray hover:text-cream/60 transition-colors duration-200"
            >
              <Instagram size={17} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-warm-gray/60 font-light">
            © {year} La Pistaccheria. Todos os direitos reservados.
          </p>
          <p className="text-[11px] text-warm-gray/35 font-light">
            Feito com cuidado artesanal · São Paulo, Brasil
          </p>
        </div>
      </div>
    </footer>
  )
}
