import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Categories from '../components/Categories'
import ProductCard from '../components/ProductCard'
import Cart from '../components/Cart'
import DeliveryForm from '../components/DeliveryForm'

export default function Shop({ onNavigate }) {
  const [menu, setMenu] = useState([])
  const [activeCat, setActiveCat] = useState(null)
  const [cart, setCart] = useState([])
  const [showDelivery, setShowDelivery] = useState(false)
  const [scrollToCart, setScrollToCart] = useState(false)

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => {
        setMenu(data)
        if (data.length > 0) setActiveCat(data[0].slug)
      })
  }, [])

  const activeCategory = menu.find(c => c.slug === activeCat)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const addToCart = (item) => {
    setCart(c => {
      const exists = c.find(i => i.id === item.id)
      if (exists) {
        return c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...c, { ...item, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCart(c => {
      const newCart = c.map(i =>
        i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i
      ).filter(i => i.qty > 0)
      return newCart
    })
  }

  const handleCheckout = () => {
    if (cart.length === 0) return
    setShowDelivery(true)
  }

  const handleOrderSuccess = (order) => {
    setCart([])
    setShowDelivery(false)
  }

  // Mobile scroll to cart
  useEffect(() => {
    if (scrollToCart) {
      document.getElementById('cart-panel')?.scrollIntoView({ behavior: 'smooth' })
      setScrollToCart(false)
    }
  }, [scrollToCart])

  return (
    <>
      <Header
        cartCount={cartCount}
        onCartClick={() => {
          if (window.innerWidth <= 1024) setScrollToCart(true)
        }}
        onAdminClick={() => onNavigate('admin')}
      />

      {/* Modal overlay for delivery form */}
      {showDelivery && (
        <div className="modal-overlay" onClick={() => setShowDelivery(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
<DeliveryForm
  total={cartTotal}
  items={cart}
  onBack={() => setShowDelivery(false)}
  onSuccess={handleOrderSuccess}
/>
          </div>
        </div>
      )}

      <div className="shop">
        {/* Categories sidebar */}
        <Categories
          categories={menu}
          active={activeCat}
          onSelect={setActiveCat}
        />

        {/* Products grid */}
        <div className="products">
          {activeCategory?.items?.map(item => (
            <ProductCard key={item.id} item={item} onAdd={addToCart} />
          ))}
        </div>

        {/* Cart panel */}
        <div id="cart-panel">
          <Cart
            items={cart}
            onUpdateQty={updateQty}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </>
  )
}
