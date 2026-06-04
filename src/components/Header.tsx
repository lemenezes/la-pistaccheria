import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import CartDrawer from "./CartDrawer";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/formatPrice";
import {
  OPEN_CART_DRAWER_EVENT,
  emitCartDrawerState,
  emitFullscreenOverlayState
} from "../lib/whatsappOrder";

type NavLink =
  | { label: string; to: string; hash?: never }
  | { label: string; hash: string; to?: never };

const navLinks: NavLink[] = [
  { label: "Produtos", to: "/loja" },
  { label: "Sobre", to: "/sobre" },
  { label: "Contato", hash: "cta" }
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const { count, items, total } = useCart();
  const navigate = useNavigate();
  const isHome =
    typeof window !== "undefined" && window.location.pathname === "/";
  const isTransparentHomeHeader = isHome && !scrolled;
  const distinctProducts = items.length;
  const cartSummary =
    distinctProducts > 0
      ? `${distinctProducts} ${distinctProducts === 1 ? "produto" : "produtos"} • ${formatPrice(total)}`
      : "Nenhum produto selecionado";

  function scrollToSection(hash: string) {
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) closeMenu();
      if (e.key === "Escape" && cartOpen) setCartOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [cartOpen, menuOpen]);

  useEffect(() => {
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener(OPEN_CART_DRAWER_EVENT, handleOpenCart);
    return () =>
      window.removeEventListener(OPEN_CART_DRAWER_EVENT, handleOpenCart);
  }, []);

  useEffect(() => {
    emitCartDrawerState(cartOpen);
  }, [cartOpen]);

  useEffect(() => {
    emitFullscreenOverlayState(menuOpen || cartOpen);
  }, [menuOpen, cartOpen]);

  function openMenu() {
    setCartOpen(false);
    setMenuOpen(true);
    const y = window.scrollY;
    document.body.style.cssText = `overflow:hidden;position:fixed;top:-${y}px;width:100%`;
    setTimeout(() => {
      const first = drawerRef.current?.querySelector<HTMLElement>("a, button");
      first?.focus();
    }, 120);
  }

  function closeMenu() {
    const top = document.body.style.top;
    document.body.style.cssText = "";
    window.scrollTo(0, -parseInt(top || "0"));
    setMenuOpen(false);
    hamburgerRef.current?.focus();
  }

  function openCart() {
    if (menuOpen) {
      const top = document.body.style.top;
      document.body.style.cssText = "";
      window.scrollTo(0, -parseInt(top || "0"));
    }
    setMenuOpen(false);
    setCartOpen(true);
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          isTransparentHomeHeader
            ? "bg-transparent border-b border-transparent"
            : "bg-cream/95 backdrop-blur-sm border-b border-cream-deep"
        }`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            aria-label="La Pistaccheria — Página inicial"
            className="flex flex-col leading-none group">
            <span
              className={`font-serif text-[1.35rem] md:text-2xl font-light tracking-wide transition-colors duration-300 group-hover:text-pistachio ${
                isTransparentHomeHeader
                    ? "text-cream md:text-charcoal drop-shadow-[0_2px_12px_rgba(20,18,14,0.5)] md:drop-shadow-none"
                  : "text-charcoal"
              }`}
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              La Pistaccheria
            </span>
            <span
              className={`text-[9px] tracking-[0.28em] uppercase mt-0.5 font-normal transition-colors duration-300 ${
                isTransparentHomeHeader
                    ? "text-cream/92 md:text-warm-gray drop-shadow-[0_1px_10px_rgba(20,18,14,0.46)] md:drop-shadow-none"
                  : "text-warm-gray"
              }`}>
              confeitaria italiana
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-8 px-5 py-2 rounded-full border border-cream-deep bg-cream/95 transition-[background-color,border-color,opacity] duration-500">
            {navLinks.map(link =>
              link.hash ? (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.hash!)}
                  className="text-xs tracking-[0.08em] uppercase font-medium text-charcoal transition-colors duration-200 cursor-pointer bg-transparent border-none hover:text-pistachio">
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.to}
                  to={link.to!}
                  className="text-xs tracking-[0.08em] uppercase font-medium text-charcoal transition-colors duration-200 hover:text-pistachio">
                  {link.label}
                </Link>
              )
            )}

            <button
              type="button"
              onClick={openCart}
              aria-label={`Carrinho com ${count} ${count === 1 ? "item" : "itens"}`}
              className="relative inline-flex items-center gap-2 pl-3 pr-3 h-10 rounded-full border border-cream-deep bg-cream/95 text-charcoal transition-colors duration-200 hover:text-pistachio cursor-pointer">
              <ShoppingBag size={17} strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.12em] uppercase font-medium">
                Carrinho
              </span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-pistachio text-cream text-[8px] font-normal flex items-center justify-center leading-none rounded-full">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            <a
              href="https://wa.me/5531981196886"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 px-5 py-2.5 bg-pistachio text-cream text-[11px] tracking-[0.15em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-200">
              Encomendar
            </a>
          </nav>

          {/* Mobile: cart + hamburger */}
          <div className="md:hidden flex items-center gap-4">
            <button
              type="button"
              onClick={openCart}
              aria-label={`Carrinho com ${count} ${count === 1 ? "item" : "itens"}`}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 cursor-pointer ${
                isTransparentHomeHeader
                    ? "border border-cream/72 bg-cream/18 backdrop-blur-[2px] text-cream shadow-[0_6px_18px_rgba(20,18,14,0.28)]"
                  : "border border-cream-deep bg-cream/95 text-charcoal"
              }`}>
              <ShoppingBag size={18} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 bg-pistachio text-cream text-[8px] font-normal flex items-center justify-center leading-none rounded-full">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>

            <button
              ref={hamburgerRef}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
              onClick={menuOpen ? closeMenu : openMenu}
              className="flex flex-col gap-[5px] p-2 -mr-2 cursor-pointer">
              <span
                className={`block h-[1.5px] w-5 transition-all duration-300 origin-center ${
                  isTransparentHomeHeader ? "bg-cream" : "bg-charcoal"
                } ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`}
                style={
                  isTransparentHomeHeader
                      ? { filter: "drop-shadow(0 1px 7px rgba(20,18,14,0.48))" }
                    : undefined
                }
              />
              <span
                className={`block h-[1.5px] w-5 transition-all duration-300 ${
                  isTransparentHomeHeader ? "bg-cream" : "bg-charcoal"
                } ${menuOpen ? "opacity-0 scale-x-0" : ""}`}
                style={
                  isTransparentHomeHeader
                      ? { filter: "drop-shadow(0 1px 7px rgba(20,18,14,0.48))" }
                    : undefined
                }
              />
              <span
                className={`block h-[1.5px] w-5 transition-all duration-300 origin-center ${
                  isTransparentHomeHeader ? "bg-cream" : "bg-charcoal"
                } ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`}
                style={
                  isTransparentHomeHeader
                      ? { filter: "drop-shadow(0 1px 7px rgba(20,18,14,0.48))" }
                    : undefined
                }
              />
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

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Drawer mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "tween",
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="fixed top-0 right-0 bottom-0 z-[110] w-[min(320px,88vw)] bg-cream flex flex-col md:hidden shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-cream-deep">
              <span
                className="font-serif text-lg font-light text-charcoal"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                La Pistaccheria
              </span>
              <button
                onClick={closeMenu}
                aria-label="Fechar menu"
                className="text-warm-gray hover:text-charcoal transition-colors p-1 cursor-pointer">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true">
                  <path
                    d="M2 2l12 12M14 2L2 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col px-6 py-6 gap-0">
              {navLinks.map(link =>
                link.hash ? (
                  <button
                    key={link.label}
                    onClick={() => {
                      scrollToSection(link.hash!);
                      closeMenu();
                    }}
                    className="py-4 text-[15px] font-light text-charcoal border-b border-cream-deep/60 tracking-wide hover:text-pistachio transition-colors duration-200 text-left cursor-pointer bg-transparent border-x-0 border-t-0 w-full">
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to!}
                    onClick={closeMenu}
                    className="py-4 text-[15px] font-light text-charcoal border-b border-cream-deep/60 tracking-wide hover:text-pistachio transition-colors duration-200">
                    {link.label}
                  </Link>
                )
              )}

              <button
                type="button"
                onClick={openCart}
                aria-label={`Abrir carrinho. ${cartSummary}`}
                className="py-4 text-[15px] font-light text-charcoal border-b border-cream-deep/60 hover:text-pistachio transition-colors duration-200 text-left cursor-pointer bg-transparent border-x-0 border-t-0 w-full flex flex-col items-start gap-1">
                <span>Carrinho</span>
                <span className="text-[10px] tracking-[0.08em] uppercase text-warm-gray">
                  {cartSummary}
                </span>
              </button>
            </nav>

            <div className="px-6 mt-auto pb-10 pt-4">
              <a
                href="https://wa.me/5531981196886"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-4 bg-pistachio text-cream text-xs tracking-[0.15em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-200">
                Encomendar
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
