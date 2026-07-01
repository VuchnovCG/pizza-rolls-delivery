export default function Header({ cartCount, onCartClick, onAdminClick }) {
  return (
    <header className="header">
      <a href="/" className="header-logo">
        <span>🍕</span> Pizza & Rolls
      </a>
      <div className="header-actions">
        <button className="header-btn" onClick={onCartClick}>
          🛒 Корзина
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
        <button className="header-btn" onClick={onAdminClick}>
          🔑 Админ
        </button>
      </div>
    </header>
  )
}
