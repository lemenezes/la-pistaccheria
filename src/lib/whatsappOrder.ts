import type { CartItem } from "../context/CartContext";

export const WHATSAPP_ORDER_NUMBER = "5531981196886";
export const OPEN_CART_DRAWER_EVENT = "lp:open-cart";
export const CART_DRAWER_STATE_EVENT = "lp:cart-drawer-state";
export const FULLSCREEN_OVERLAY_STATE_EVENT = "lp:fullscreen-overlay-state";

function formatEstimatedSubtotal(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function buildWhatsAppOrderMessage(items: CartItem[]): string {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const lines = [
    "Olá!",
    "",
    "Gostaria de encomendar:",
    "",
    ...items.map(item => `- ${item.quantity}x ${item.product.name}`),
    "",
    `Total de itens: ${totalItems}`,
    `Subtotal estimado: ${formatEstimatedSubtotal(subtotal)}`,
    "",
    "Obrigado!"
  ];

  return lines.join("\n");
}

export function buildWhatsAppOrderUrl(items: CartItem[]): string {
  return `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(
    buildWhatsAppOrderMessage(items)
  )}`;
}

export function openCartDrawer() {
  window.dispatchEvent(new CustomEvent(OPEN_CART_DRAWER_EVENT));
}

export function emitCartDrawerState(open: boolean) {
  window.dispatchEvent(
    new CustomEvent(CART_DRAWER_STATE_EVENT, {
      detail: { open }
    })
  );
}

export function emitFullscreenOverlayState(open: boolean) {
  window.dispatchEvent(
    new CustomEvent(FULLSCREEN_OVERLAY_STATE_EVENT, {
      detail: { open }
    })
  );
}
