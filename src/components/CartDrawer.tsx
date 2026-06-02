import { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/formatPrice";
import { buildWhatsAppOrderUrl } from "../lib/whatsappOrder";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, total, removeItem, updateQuantity } = useCart();
  const { pathname } = useLocation();
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    // Fecha apenas em navegação real de rota, não ao abrir o drawer.
    if (open && previousPathname !== pathname) onClose();
  }, [pathname, open, onClose]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleSendOrder() {
    if (items.length === 0) return;
    window.open(buildWhatsAppOrderUrl(items), "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[115] bg-charcoal/18 backdrop-blur-[2px]"
            aria-label="Fechar carrinho"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "tween",
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="fixed top-0 right-0 bottom-0 z-[120] w-[min(420px,100vw)] bg-cream border-l border-cream-deep shadow-[0_24px_80px_rgba(28,28,26,0.16)] flex flex-col"
            aria-label="Carrinho">
            <div className="h-16 md:h-20 px-6 md:px-7 border-b border-cream-deep flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-[0.28em] uppercase text-gold font-normal mb-1">
                  Seu pedido
                </p>
                <p
                  className="text-[1.5rem] font-light text-charcoal"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif"
                  }}>
                  Carrinho
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-warm-gray hover:text-charcoal transition-colors p-1 cursor-pointer"
                aria-label="Fechar carrinho">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
                <ShoppingBag
                  size={34}
                  strokeWidth={1.2}
                  className="text-pistachio/35 mb-5"
                  aria-hidden="true"
                />
                <p
                  className="text-[1.8rem] font-light text-charcoal mb-3"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif"
                  }}>
                  Seu carrinho está vazio
                </p>
                <p className="text-[13px] font-light text-warm-gray leading-[1.8] max-w-[18rem]">
                  Adicione produtos para montar um pedido e enviar tudo de uma
                  vez pelo WhatsApp.
                </p>
                <Link
                  to="/loja"
                  onClick={onClose}
                  className="mt-7 inline-flex items-center justify-center px-6 py-3 bg-pistachio text-cream text-[10px] tracking-[0.18em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-300">
                  Ver produtos
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 md:px-7 py-6 flex flex-col gap-5">
                  {items.map(item => (
                    <article
                      key={item.product.id}
                      className="border-b border-cream-deep pb-5 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="text-[9px] tracking-[0.22em] uppercase text-warm-gray font-normal mb-1">
                            {item.product.category}
                          </p>
                          <p
                            className="text-[1.05rem] font-light text-charcoal leading-snug"
                            style={{
                              fontFamily: "'Cormorant Garamond', Georgia, serif"
                            }}>
                            {item.product.name}
                          </p>
                          {item.product.weight && (
                            <p className="text-[11px] text-warm-gray-light font-light mt-1">
                              {item.product.weight}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="text-warm-gray-light hover:text-charcoal transition-colors p-1 cursor-pointer"
                          aria-label={`Remover ${item.product.name}`}>
                          <X size={14} strokeWidth={1.5} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center border border-cream-deep">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
                            aria-label="Diminuir quantidade">
                            <Minus size={11} strokeWidth={1.5} />
                          </button>
                          <span className="w-8 text-center text-xs font-light text-charcoal">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
                            aria-label="Aumentar quantidade">
                            <Plus size={11} strokeWidth={1.5} />
                          </button>
                        </div>

                        <span
                          className="text-[1rem] font-light text-charcoal"
                          style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif"
                          }}>
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="border-t border-cream-deep px-6 md:px-7 py-6 bg-cream-card/65">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] tracking-[0.22em] uppercase text-warm-gray font-normal">
                      Subtotal
                    </span>
                    <span
                      className="text-[1.35rem] font-light text-charcoal"
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif"
                      }}>
                      {formatPrice(total)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOrder}
                    className="w-full inline-flex items-center justify-center gap-3 py-4 bg-pistachio text-cream text-[11px] tracking-[0.18em] uppercase font-normal hover:bg-pistachio-mid transition-colors duration-300 cursor-pointer">
                    <MessageCircle
                      size={16}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    Enviar pedido pelo WhatsApp
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
