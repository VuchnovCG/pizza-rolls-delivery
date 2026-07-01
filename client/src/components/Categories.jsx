export default function Categories({ categories, active, onSelect }) {
  return (
    <div className="categories">
      <div className="categories-title">Категории</div>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`cat-btn${active === cat.slug ? ' active' : ''}`}
          onClick={() => onSelect(cat.slug)}
        >
          <span className="cat-icon">
            {cat.items?.[0]?.image || '📦'}
          </span>
          {cat.name}
        </button>
      ))}
    </div>
  )
}
