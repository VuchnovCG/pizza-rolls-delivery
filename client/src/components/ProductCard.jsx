export default function ProductCard({ item, onAdd }) {
  const isImg = item.image?.startsWith('/') || item.image?.startsWith('http')

  return (
    <div className="product-card">
      <div className="product-emoji">
        {isImg ? <img src={item.image} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} /> : (item.image || '🍕')}
      </div>
      <div className="product-name">{item.name}</div>
      <div className="product-desc">{item.description}</div>
      <div className="product-footer">
        <div className="product-price">{item.price}</div>
        <button className="add-btn" onClick={() => onAdd(item)}>+</button>
      </div>
    </div>
  )
}
