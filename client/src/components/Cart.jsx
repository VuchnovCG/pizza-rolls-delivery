export default function Cart({ items, onUpdateQty, onCheckout }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
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
          <div className="cart-total">
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
