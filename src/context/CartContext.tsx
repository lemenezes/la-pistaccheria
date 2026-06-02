/**
 * CartContext — gerenciamento global do carrinho.
 *
 * Preparado para integração futura com:
 * - Stripe / Mercado Pago (adicionar sessionId, paymentIntent)
 * - CMS headless (substituir Product local por produto remoto)
 * - Backend de pedidos (substituir WhatsApp por POST /orders)
 */
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react'
import type { Product } from '../data/products'

// ── Tipos ────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity?: number }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'CLEAR_CART' }

export interface CartContextValue {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  count: number   // total de unidades
  total: number   // valor total em BRL
}

// ── Reducer ──────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const qty = action.quantity ?? 1
      const existing = state.items.find((i) => i.product.id === action.product.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + qty }
              : i
          ),
        }
      }
      return { items: [...state.items, { product: action.product, quantity: qty }] }
    }
    case 'REMOVE_ITEM':
      return { items: state.items.filter((i) => i.product.id !== action.id) }
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.product.id !== action.id) }
      }
      return {
        items: state.items.map((i) =>
          i.product.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      }
    }
    case 'CLEAR_CART':
      return { items: [] }
    default:
      return state
  }
}

// ── Persistência ─────────────────────────────────────────────────────

const STORAGE_KEY = 'lp-cart-v1'

function loadFromStorage(): CartState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as CartState) : { items: [] }
  } catch {
    return { items: [] }
  }
}

// ── Provider ─────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadFromStorage)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage indisponível ou cheio — falha silenciosa
    }
  }, [state])

  const count = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const total = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem: (product, quantity = 1) =>
          dispatch({ type: 'ADD_ITEM', product, quantity }),
        removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', id }),
        updateQuantity: (id, quantity) =>
          dispatch({ type: 'UPDATE_QUANTITY', id, quantity }),
        clearCart: () => dispatch({ type: 'CLEAR_CART' }),
        count,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de <CartProvider>')
  return ctx
}
