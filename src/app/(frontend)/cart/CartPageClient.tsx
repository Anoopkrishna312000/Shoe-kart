'use client'

import { useEffect, useState } from 'react'

import { readCartFromStorage, type CartItem, writeCartToStorage } from '../shared/cart-store'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  currency: 'INR',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function CartPageClient() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartReady, setCartReady] = useState(false)

  useEffect(() => {
    setCartItems(readCartFromStorage())
    setCartReady(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !cartReady) return
    writeCartToStorage(cartItems)
  }, [cartItems, cartReady])

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const cartSubtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

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
    <div className="cart-page">
      <header className="cart-page-header">
        <a className="cart-page-back" href="/">
          Back to shop
        </a>
        <div>
          <p className="cart-page-kicker">Cart</p>
          <h1>Your added items</h1>
        </div>
        <span className="cart-page-count">{cartCount}</span>
      </header>

      {cartItems.length ? (
        <div className="cart-page-layout">
          <div className="cart-page-list">
            {cartItems.map((item) => (
              <article className="cart-page-item" key={item.id}>
                <div className="cart-page-item-image">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} /> : <span aria-hidden="true" />}
                </div>
                <div className="cart-page-item-body">
                  <p>{item.brand || 'Sneaker'}</p>
                  <h2>{item.title}</h2>
                  <div className="cart-page-item-meta">
                    <span>{currencyFormatter.format(item.price)}</span>
                    <span>In cart {item.quantity}</span>
                    <span>Stock {item.stock}</span>
                  </div>
                  <div className="cart-page-actions">
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
              </article>
            ))}
          </div>

          <aside className="cart-page-summary" aria-label="Cart summary">
            <p className="cart-page-summary-kicker">Summary</p>
            <div className="cart-page-summary-row">
              <span>Subtotal</span>
              <strong>{currencyFormatter.format(cartSubtotal)}</strong>
            </div>
            <p className="cart-page-summary-note">Shipping and taxes are shown at checkout.</p>
            <button className="checkout-button" type="button">
              Checkout
            </button>
          </aside>
        </div>
      ) : (
        <div className="cart-page-empty">
          <h2>Your cart is empty</h2>
          <p>Add a pair from the storefront to start building your cart.</p>
          <a className="checkout-button" href="/">
            Shop now
          </a>
        </div>
      )}
    </div>
  )
}
