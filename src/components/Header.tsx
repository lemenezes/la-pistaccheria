import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

type NavLink = { label: string; to: string; hash?: never } | { label: string; hash: string; to?: never }

const navLinks: NavLink[] = [
  { label: 'Loja', to: '/loja' },
  { label: 'Sobre', hash: 'sobre' },
  { label: 'Contato', hash: 'cta' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const { count } = useCart()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isHome = pathname === '/'
  const isDark = isHome && !scrolled

  function scrollToSection(hash: string) {
    const el = document.getElementById(hash)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/')
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) closeMenu()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [menuOpen])

  function openMenu() {
    setMenuOpen(true)
    const y = window.scrollY
    document.body.style.cssText = `overflow:hidden;position:fixed;top:-${y}px;width:100%`
    setTimeout(() => {
      const first = drawerRef.current?.querySelector<HTMLElement>('a, button')
      first?.focus()
    }, 120)
  }

  function closeMenu() {
    const top = document.body.style.top
    document.body.style.cssText = ''
    window.scrollTo(0, -parseInt(top || '0'))
    setMenuOpen(false)
    hamburgerRef.current?.focus()
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          isDark
            ? 'bg-transparent'
            : 'bg-cream/95 backdrop-blur-sm border-b border-cream-deep'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 md:h-20 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            aria-label="La Pistaccheria — Página inicial"
            className="flex flex-col leading-none group"
          >
            <span
              className={`font-serif text-[1.35rem] md:text-2xl font-light tracking-wide transition-colors duration-300 ${isDark ? 'text-charcoal/92 group-hover:text-pistachio' : 'text-charcoal group-hover:text-pistachio'}`}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              La Pistaccheria
            </span>
            <span
              className={`text-[9px] tracking-[0.28em] uppercase mt-0.5 font-normal transition-colors duration-300 ${isDark ? 'text-charcoal/70' : 'text-warm-gray'}`}
            >
              confeitaria italiana
            </span>
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.hash ? (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.hash!)}
                  className={`text-xs tracking-[0.12em] uppercase font-normal transition-colors duration-200 cursor-pointer bg-transparent border-none ${isDark ? 'text-cream/82 hover:text-cream' : 'text-warm-gray hover:text-charcoal'}`}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.to}
                  to={link.to!}
                  className={`text-xs tracking-[0.12em] uppercase font-normal transition-colors duration-200 ${isDark ? 'text-cream/82 hover:text-cream' : 'text-warm-gray hover:text-charcoal'}`}
                >
                  {link.label}
                </Link>
              )
            )}

            {/* Carrinho */}
            <Link
              to="/carrinho"
              aria-label={`Carrinho — ${count} ${count === 1 ? 'item' : 'itens'}`}
              className={`relative transition-colors duration-200 ${isDark ? 'text-cream/82 hover:text-cream' : 'text-warm-gray hover:text-charcoal'}`}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-cream text-[9px] font-normal flex items-center justify-center leading-none"
                  >
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 px-5 py-2.5 bg-pistachio text-cream text-[11px] tracking-[0.15em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-200"
            >
              Encomendar
            </a>
          </nav>

          {/* Mobile: cart + hamburger */}
          <div className="md:hidden flex items-center gap-4">
            <Link
              to="/carrinho"
              aria-label={`Carrinho — ${count} ${count === 1 ? 'item' : 'itens'}`}
              className={`relative transition-colors duration-300 ${isDark ? 'text-cream/82' : 'text-warm-gray'}`}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-cream text-[9px] font-normal flex items-center justify-center leading-none">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            <button
              ref={hamburgerRef}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
              onClick={menuOpen ? closeMenu : openMenu}
              className="flex flex-col gap-[5px] p-2 -mr-2 cursor-pointer"
            >
              <span className={`block h-[1.5px] w-5 transition-all duration-300 origin-center ${isDark ? 'bg-cream' : 'bg-charcoal'} ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block h-[1.5px] w-5 transition-all duration-300 ${isDark ? 'bg-cream' : 'bg-charcoal'} ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-[1.5px] w-5 transition-all duration-300 origin-center ${isDark ? 'bg-cream' : 'bg-charcoal'} ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMenu}
            className="fixed inset-0 z-[105] bg-charcoal/30 backdrop-blur-[2px] md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Drawer mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[110] w-[min(320px,88vw)] bg-cream flex flex-col md:hidden shadow-2xl"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-cream-deep">
              <span
                className="font-serif text-lg font-light text-charcoal"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                La Pistaccheria
              </span>
              <button
                onClick={closeMenu}
                aria-label="Fechar menu"
                className="text-warm-gray hover:text-charcoal transition-colors p-1 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col px-6 py-6 gap-0">
              {navLinks.map((link) =>
                link.hash ? (
                  <button
                    key={link.label}
                    onClick={() => { scrollToSection(link.hash!); closeMenu() }}
                    className="py-4 text-[15px] font-light text-charcoal border-b border-cream-deep/60 tracking-wide hover:text-pistachio transition-colors duration-200 text-left cursor-pointer bg-transparent border-x-0 border-t-0 w-full"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to!}
                    onClick={closeMenu}
                    className="py-4 text-[15px] font-light text-charcoal border-b border-cream-deep/60 tracking-wide hover:text-pistachio transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <Link
                to="/carrinho"
                onClick={closeMenu}
                className="py-4 text-[15px] font-light text-charcoal border-b border-cream-deep/60 tracking-wide hover:text-pistachio transition-colors duration-200 flex items-center gap-3"
              >
                <ShoppingBag size={15} strokeWidth={1.5} aria-hidden="true" />
                Carrinho
                {count > 0 && (
                  <span className="ml-auto text-[10px] tracking-[0.15em] text-gold font-normal">
                    {count} {count === 1 ? 'item' : 'itens'}
                  </span>
                )}
              </Link>
            </nav>

            <div className="px-6 mt-auto pb-10 pt-4">
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-4 bg-pistachio text-cream text-xs tracking-[0.15em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-200"
              >
                Encomendar
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
