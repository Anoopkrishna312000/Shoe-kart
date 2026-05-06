'use client'

import { useEffect, useMemo, useState } from 'react'

export type StorefrontProduct = {
  badge?: string | null
  brand?: string | null
  category?: string | null
  colorway?: string | null
  id: string
  imageUrl?: string | null
  meta: string
  price: number
  stock: number
  title: string
}

type CartItem = {
  brand?: string | null
  id: string
  imageUrl?: string | null
  price: number
  quantity: number
  stock: number
  title: string
}

type StorefrontClientProps = {
  featuredImageUrl?: string | null
  featuredTitle: string
  navItems: string[]
  products: StorefrontProduct[]
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  currency: 'INR',
  maximumFractionDigits: 0,
  style: 'currency',
})

const searchableText = (product: StorefrontProduct) =>
  [product.title, product.brand, product.category, product.colorway, product.badge]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const cartStorageKey = 'kickscrew-cart'

const readCartFromStorage = (): CartItem[] => {
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

export function StorefrontClient({ featuredImageUrl, featuredTitle, navItems, products }: StorefrontClientProps) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartReady, setCartReady] = useState(false)
  const normalizedQuery = query.trim().toLowerCase()

  useEffect(() => {
    setCartItems(readCartFromStorage())
    setCartReady(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !cartReady) return
    window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems))
  }, [cartItems, cartReady])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = normalizedQuery ? searchableText(product).includes(normalizedQuery) : true
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true

      return matchesSearch && matchesCategory
    })
  }, [normalizedQuery, products, selectedCategory])

  const visibleProducts = filteredProducts.slice(0, 12)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  const addToCart = (product: StorefrontProduct) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      const nextQuantity = existing ? Math.min(existing.quantity + 1, product.stock) : 1

      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQuantity } : item,
        )
      }

      return [
        ...current,
        {
          brand: product.brand ?? null,
          id: product.id,
          imageUrl: product.imageUrl ?? null,
          price: product.price,
          quantity: 1,
          stock: product.stock,
          title: product.title,
        },
      ]
    })
  }

  const updateCartQuantity = (id: string, delta: number) => {
    setCartItems((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item

          const quantity = item.quantity + delta
          if (quantity <= 0) return null

          return {
            ...item,
            quantity: Math.min(quantity, item.stock),
          }
        })
        .filter((item): item is CartItem => item !== null),
    )
  }

  const removeFromCart = (id: string) => {
    setCartItems((current) => current.filter((item) => item.id !== id))
  }

  return (
    <div className="store-shell">
      <header className="site-header" aria-label="Store header">
        <div className="header-tools">
          <label className="search-box">
            <span className="search-icon" aria-hidden="true" />
            <input
              aria-label="Search products"
              type="search"
              placeholder="Find Your Pair."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button className="search-clear" type="button" aria-label="Clear search" onClick={() => setQuery('')}>
                x
              </button>
            )}
          </label>
          <a className="logo" href="/" aria-label="Kicks Crew home">
            <span>Kicks</span>
            <span>Crew</span>
          </a>
          <a className="cart-pill" href="#cart">
            Cart <span>{cartCount}</span>
          </a>
        </div>
        <nav className="category-nav" aria-label="Shoe categories">
          {navItems.map((item) => (
            <button
              className={selectedCategory === item ? 'active-category' : undefined}
              key={item}
              type="button"
              onClick={() => setSelectedCategory((current) => (current === item ? '' : item))}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      <section className="hero" aria-label="Featured shoe">
        <button className="hero-arrow hero-arrow-left" aria-label="Previous featured shoe">
          &lt;
        </button>
        <div className="hero-art">
          <img src="/assets/black-phantom-hero.png" alt="Black Phantom sneaker campaign" />
        </div>
        <div className="hero-copy">
          {featuredImageUrl && <img className="hero-copy-image" src={featuredImageUrl} alt="" aria-hidden="true" />}
          <p>Authenticity. 100% Guaranteed.</p>
          <h1>{featuredTitle}</h1>
          <a className="shop-button" href="#latest-drops">
            {products.length ? 'Shop Now' : 'Add Product'}
          </a>
        </div>
        <button className="hero-arrow hero-arrow-right" aria-label="Next featured shoe">
          &gt;
        </button>
      </section>

      <section className="latest-drops" id="latest-drops">
        <div className="section-heading">
          <div>
            <h2>{query || selectedCategory ? 'Search Results' : 'Latest Drops'}</h2>
            {(query || selectedCategory) && (
              <p className="results-count">
                {filteredProducts.length} pair{filteredProducts.length === 1 ? '' : 's'} found
              </p>
            )}
          </div>
        </div>

        <div className="store-layout">
          <div className="store-main">
            {products.length ? (
              visibleProducts.length ? (
                <div className="product-grid">
                  {visibleProducts.map((product, index) => {
                    const inCart = cartItems.find((item) => item.id === product.id)
                    const isAtLimit = Boolean(inCart && inCart.quantity >= product.stock)

                    return (
                      <article className="product-card" key={product.id}>
                        <div className="product-image">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.title} />
                          ) : (
                            <div className={`shoe-fallback shoe-fallback-${(index % 6) + 1}`} aria-hidden="true">
                              <span />
                            </div>
                          )}
                          {product.badge && <span className="product-badge">{product.badge}</span>}
                        </div>
                        <div className="product-details">
                          <p className="product-brand">{product.meta}</p>
                          <h3>{product.title}</h3>
                          <div className="product-card-footer">
                            <p className="product-price">From {currencyFormatter.format(product.price)}</p>
                            <p className="stock-status">{product.stock > 0 ? 'Available now' : 'Out of stock'}</p>
                          </div>
                          <button
                            className="add-to-cart"
                            type="button"
                            disabled={product.stock <= 0 || isAtLimit}
                            onClick={() => addToCart(product)}
                          >
                            {product.stock <= 0 ? 'Out of stock' : isAtLimit ? 'Added' : 'Add to cart'}
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="empty-store">
                  <h3>No matching pairs</h3>
                  <p>Try searching by brand, model, category, colorway, or badge.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setSelectedCategory('')
                    }}
                  >
                    Clear Search
                  </button>
                </div>
              )
            ) : (
              <div className="empty-store">
                <h3>No products yet</h3>
                <p>Add sneakers from the Payload admin panel and they will appear here automatically.</p>
                <a href="/admin/collections/products">Create Product</a>
              </div>
            )}
          </div>

          <aside className="cart-panel" id="cart" aria-label="Cart summary">
            <div className="cart-panel-head">
              <div>
                <p className="cart-kicker">Cart</p>
                <h3>Your picks</h3>
              </div>
              <span className="cart-count">{cartCount}</span>
            </div>

            {cartItems.length ? (
              <>
                <div className="cart-list">
                  {cartItems.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-image">
                        {item.imageUrl ? <img src={item.imageUrl} alt="" aria-hidden="true" /> : <span aria-hidden="true" />}
                      </div>
                      <div className="cart-item-body">
                        <p>{item.brand || 'Sneaker'}</p>
                        <h4>{item.title}</h4>
                        <div className="cart-item-meta">
                          <span>{currencyFormatter.format(item.price)}</span>
                          <span>Qty {item.quantity}</span>
                        </div>
                        <div className="cart-item-actions">
                          <button type="button" onClick={() => updateCartQuantity(item.id, -1)}>
                            -
                          </button>
                          <button type="button" onClick={() => updateCartQuantity(item.id, 1)} disabled={item.quantity >= item.stock}>
                            +
                          </button>
                          <button type="button" onClick={() => removeFromCart(item.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <div>
                    <span>Subtotal</span>
                    <strong>{currencyFormatter.format(cartSubtotal)}</strong>
                  </div>
                  <p>Shipping and taxes are shown at checkout.</p>
                </div>
                <button className="checkout-button" type="button">
                  Checkout
                </button>
              </>
            ) : (
              <div className="cart-empty">
                <p>Add a pair to start building your cart.</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  )
}
