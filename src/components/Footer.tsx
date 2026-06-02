import { Link } from 'react-router-dom'

const footerNav = [
  {
    title: 'Coleção',
    links: [
      { label: 'Pasta Artesanal', to: '/loja' },
      { label: 'Bomboneria', to: '/loja' },
      { label: 'Confeitaria', to: '/loja' },
      { label: 'Doces Sicilianos', to: '/loja' },
    ],
  },
  {
    title: 'La Pistaccheria',
    links: [
      { label: 'Nossa história', to: '/' },
      { label: 'Ingredientes', to: '/' },
      { label: 'Encomendas especiais', to: '/' },
      { label: 'Contato', to: '/' },
    ],
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-charcoal pt-16 pb-10 md:pt-20 md:pb-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-5 md:px-10">

        {/* Grade principal */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-12 md:gap-20 mb-14 md:mb-16">

          {/* Marca */}
          <div>
            <Link to="/" aria-label="La Pistaccheria — Página inicial" className="inline-block">
              <p
                className="text-[1.4rem] font-light tracking-wide text-cream/85 mb-1 hover:text-cream transition-colors duration-200"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                La Pistaccheria
              </p>
            </Link>
            <p className="text-[9px] tracking-[0.28em] uppercase text-warm-gray font-light mb-6">
              Confeitaria italiana · Bronte, Sicília
            </p>
            <p className="text-[13px] font-light text-warm-gray/60 leading-[1.8] max-w-[240px]">
              Confeitaria artesanal com pistache DOP de Bronte, criada com amor e
              respeito às tradições sicilianas.
            </p>

            {/* Social */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da La Pistaccheria"
                className="text-warm-gray hover:text-cream/60 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp da La Pistaccheria"
                className="text-warm-gray hover:text-cream/60 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Colunas de navegação */}
          {footerNav.map((col) => (
            <div key={col.title}>
              <p className="text-[9px] tracking-[0.28em] uppercase text-warm-gray font-light mb-5">
                {col.title}
              </p>
              <ul className="space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[13px] font-light text-warm-gray/60 hover:text-cream/70 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider + copyright */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-warm-gray/50 font-light">
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

