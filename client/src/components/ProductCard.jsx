export default function ProductCard({ item, onAdd }) {
  return (
    <div className="product-card">
      <div className="product-emoji">{item.image || '🍕'}</div>
      <div className="product-name">{item.name}</div>
      <div className="product-desc">{item.description}</div>
      <div className="product-footer">
        <div className="product-price">{item.price}</div>
        <button className="add-btn" onClick={() => onAdd(item)}>+</button>
      </div>
    </div>
  )
}
