'use client'

export type CartItem = {
  brand?: string | null
  id: string
  imageUrl?: string | null
  price: number
  quantity: number
  stock: number
  title: string
}

export type CartProductInput = {
  brand?: string | null
  id: string
  imageUrl?: string | null
  price: number
  stock: number
  title: string
}

const cartStorageKey = 'kickscrew-cart'

export const readCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(cartStorageKey)
    if (!stored) return []

    const parsed = JSON.parse(stored) as unknown
    if (!Array.isArray(parsed)) return []

    const cartItems = parsed.reduce<CartItem[]>((items, item) => {
      if (!item || typeof item !== 'object') return items

      const candidate = item as Partial<CartItem>
      if (typeof candidate.id !== 'string' || typeof candidate.title !== 'string') return items
      if (typeof candidate.price !== 'number' || typeof candidate.quantity !== 'number') return items
      if (typeof candidate.stock !== 'number') return items

      items.push({
        brand: candidate.brand ?? null,
        id: candidate.id,
        imageUrl: candidate.imageUrl ?? null,
        price: candidate.price,
        quantity: candidate.quantity,
        stock: candidate.stock,
        title: candidate.title,
      })

      return items
    }, [])

    return cartItems
  } catch {
    return []
  }
}

export const writeCartToStorage = (items: CartItem[]) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(cartStorageKey, JSON.stringify(items))
}

export const createCartItem = (product: CartProductInput): CartItem => ({
  brand: product.brand ?? null,
  id: product.id,
  imageUrl: product.imageUrl ?? null,
  price: product.price,
  quantity: 1,
  stock: product.stock,
  title: product.title,
})

