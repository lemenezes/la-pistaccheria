import { Link } from 'react-router-dom'

type FooterLink = { label: string; to: string } | { label: string; href: string }

const footerNav: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Explorar',
    links: [
      { label: 'Produtos', to: '/loja' },
      { label: 'Nossa história', to: '/sobre' },
      { label: 'Contato', href: '/#cta' },
    ],
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-charcoal pt-10 pb-6 md:pt-12 md:pb-7" role="contentinfo">
      <div className="max-w-7xl mx-auto px-5 md:px-10">

        {/* Grade principal */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-8 md:gap-10 mb-8 md:mb-10 items-start">

          {/* Marca */}
          <div>
            <Link to="/" aria-label="La Pistaccheria — Página inicial" className="inline-block">
              <p
                className="text-[1.4rem] font-light tracking-wide text-cream hover:text-cream transition-colors duration-200"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                La Pistaccheria
              </p>
            </Link>
            <p className="text-[9px] tracking-[0.28em] uppercase text-warm-gray-light/85 font-light mb-3">
              Confeitaria italiana · Bronte, Sicília
            </p>
            <p className="text-[13px] font-light text-warm-gray-light/88 leading-[1.75] max-w-[260px] md:whitespace-nowrap">
              Confeitaria artesanal inspirada na tradição italiana, com
              ingredientes selecionados e produção sob encomenda.
            </p>

            {/* Social */}
            <div className="flex items-center gap-4 mt-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da La Pistaccheria"
                className="text-warm-gray-light/86 hover:text-cream transition-colors duration-200"
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
                href="https://wa.me/5531981196886"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp da La Pistaccheria"
                className="text-warm-gray-light/86 hover:text-cream transition-colors duration-200"
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
              <p className="text-[9px] tracking-[0.28em] uppercase text-warm-gray-light/90 font-light mb-3">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'to' in link ? (
                      <Link
                        to={link.to}
                        className="text-[13px] font-light text-warm-gray-light/88 hover:text-cream transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-[13px] font-light text-warm-gray-light/88 hover:text-cream transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider + copyright */}
        <div className="border-t border-white/[0.06] pt-4 flex flex-col md:flex-row items-center justify-between gap-1.5">
          <p className="text-[11px] text-warm-gray-light/82 font-light">
            © {year} La Pistaccheria.
          </p>
        </div>

        <div className="pt-2 flex justify-center md:justify-end">
          <a
            href="https://leandrom.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.08em] text-warm-gray-light/86 font-light hover:text-warm-gray-light/95 transition-colors duration-200"
          >
            Site desenvolvido por Leandro M.
          </a>
        </div>
      </div>
    </footer>
  )
}

