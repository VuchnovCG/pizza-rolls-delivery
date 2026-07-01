const DELIVERY_COST = 300
const PICKUP_ADDRESS = 'г. Ельня, ул. Первомайская, 27'

export default function Cart({ items, onUpdateQty, onCheckout, orderType, onOrderTypeChange }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const delivery = orderType === 'delivery' ? DELIVERY_COST : 0
  const total = subtotal + delivery
  const isImg = (src) => src?.startsWith('/') || src?.startsWith('http')

  return (
    <div className="cart-panel">
      <div className="cart-title">🛒 Корзина</div>
      <div className="cart-items">
        {items.length === 0 && (
          <div className="cart-empty">Добавьте товары из меню</div>
        )}
        {items.map(item => (
          <div key={item.id} className="cart-item">
            {isImg(item.image) ? (
              <img src={item.image} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6 }} />
            ) : (
              <span className="cart-item-emoji">{item.image || '🍕'}</span>
            )}
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">{item.price} ₽</div>
            </div>
            <div className="cart-item-qty">
              <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)}>−</button>
              <span className="qty-value">{item.qty}</span>
              <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <>
          {/* Delivery / Pickup toggle */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <button
                onClick={() => onOrderTypeChange?.('delivery')}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer', fontSize: 13,
                  background: orderType === 'delivery' ? 'var(--emerald)' : 'var(--bg-card)',
                  color: orderType === 'delivery' ? '#000' : 'var(--text-secondary)',
                  fontWeight: orderType === 'delivery' ? 700 : 400,
                  transition: 'all 0.2s'
                }}
              >🚚 Доставка</button>
              <button
                onClick={() => onOrderTypeChange?.('pickup')}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer', fontSize: 13,
                  background: orderType === 'pickup' ? 'var(--emerald)' : 'var(--bg-card)',
                  color: orderType === 'pickup' ? '#000' : 'var(--text-secondary)',
                  fontWeight: orderType === 'pickup' ? 700 : 400,
                  transition: 'all 0.2s'
                }}
              >📍 Самовывоз</button>
            </div>
          </div>

          {/* Pickup address hint */}
          {orderType === 'pickup' && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, padding: '8px 10px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              📍 Самовывоз: <strong style={{ color: 'var(--emerald-light)' }}>{PICKUP_ADDRESS}</strong>
            </div>
          )}

          {/* Totals */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
              <span>Товары</span>
              <span>{subtotal} ₽</span>
            </div>
            {delivery > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
                <span>Доставка</span>
                <span>{delivery} ₽</span>
              </div>
            )}
          </div>

          <div className="cart-total" style={{ borderTop: 'none', paddingTop: 0 }}>
            <span>Итого</span>
            <span className="cart-total-amount">{total} ₽</span>
          </div>

          <button className="checkout-btn" onClick={onCheckout}>
            Оформить заказ
          </button>
        </>
      )}
    </div>
  )
}
