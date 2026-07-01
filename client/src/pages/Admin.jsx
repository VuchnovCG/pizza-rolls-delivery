import { useState, useEffect } from 'react'

const STATUSES = ['new', 'cooking', 'delivering', 'done', 'cancelled']
const STATUS_LABELS = { new: 'Новый', cooking: 'Готовится', delivering: 'В пути', done: 'Доставлен', cancelled: 'Отменён' }
const STATUS_CLASSES = { new: 'status-new', cooking: 'status-cooking', delivering: 'status-delivering', done: 'status-done', cancelled: 'status-cancelled' }

export default function Admin({ onNavigate }) {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [menu, setMenu] = useState([])
  const [editItems, setEditItems] = useState({})
  const [newItem, setNewItem] = useState({ category_id: 1, name: '', description: '', price: 200, image: '🍕' })
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (token) {
      fetch('/api/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }).then(r => r.json()).then(d => {
        if (d.ok) { setChecked(true); loadData() }
        else { setToken(''); localStorage.removeItem('admin_token'); setChecked(false) }
      })
    } else {
      setChecked(false)
    }
  }, [token])

  const loadData = async () => {
    const [ordersRes, menuRes] = await Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/menu').then(r => r.json())
    ])
    setOrders(ordersRes)
    setMenu(menuRes)
    // init edit items
    const edits = {}
    menuRes.forEach(cat => cat.items.forEach(item => { edits[item.id] = { ...item } }))
    setEditItems(edits)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    const data = await res.json()
    if (data.token) {
      setToken(data.token)
      localStorage.setItem('admin_token', data.token)
      setChecked(true)
      loadData()
    } else {
      setLoginError('Неверный пароль')
    }
  }

  const updateStatus = async (id, status) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    loadData()
  }

  const saveItem = async (id) => {
    const item = editItems[id]
    await fetch(`/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
    loadData()
  }

  const deleteItem = async (id) => {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' })
    loadData()
  }

  const addItem = async () => {
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    })
    setNewItem({ category_id: 1, name: '', description: '', price: 200, image: '🍕' })
    loadData()
  }

  // Login screen
  if (!checked) {
    return (
      <div className="login-box">
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>🔑</h1>
        <div className="modal-title">Вход в админку</div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              className="form-input"
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {loginError && <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{loginError}</p>}
          <button type="submit" className="submit-btn">Войти</button>
        </form>
        <button className="checkout-btn" style={{ marginTop: 12, background: 'transparent', border: '1px solid var(--border)' }} onClick={() => onNavigate('shop')}>
          ← На главную
        </button>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <h1 style={{ fontSize: 24 }}>🔑 Панель управления</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="header-btn" onClick={() => onNavigate('shop')}>🍕 В магазин</button>
          <button className="header-btn" onClick={() => { setToken(''); localStorage.removeItem('admin_token'); setChecked(false) }}>
            🚪 Выйти
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab${tab === 'orders' ? ' active' : ''}`} onClick={() => setTab('orders')}>
          📋 Заказы ({orders.filter(o => o.status === 'new').length})
        </button>
        <button className={`admin-tab${tab === 'menu' ? ' active' : ''}`} onClick={() => { setTab('menu'); loadData() }}>
          🍕 Меню
        </button>
      </div>

      {tab === 'orders' && (
        <div style={{ overflowX: 'auto' }}>
          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Заказов пока нет</p>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Клиент</th>
                  <th>Telegram</th>
                  <th>Товары</th>
                  <th>Сумма</th>
                  <th>Адрес</th>
                  <th>Оплата</th>
                  <th>Статус</th>
                  <th>Время</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <div>{order.customer_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.phone}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {order.telegram_user_id ? (
                        <span style={{ color: 'var(--emerald-light)' }}>🤖 {order.telegram_user_id}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {Array.isArray(order.items) ? order.items.map((item, i) => (
                        <div key={i}>{item.image} {item.name} ×{item.qty}</div>
                      )) : order.items}
                    </td>
                    <td style={{ color: 'var(--emerald-light)', fontWeight: 600 }}>{order.total_price} ₽</td>
                    <td style={{ fontSize: 13, maxWidth: 200 }}>
                      <div>{order.address}</div>
                      {order.entrance && <div style={{ color: 'var(--text-muted)' }}>П: {order.entrance}, Эт: {order.floor}, Дом: {order.intercom}</div>}
                      {order.comment && <div style={{ color: 'var(--warning)', fontSize: 12 }}>📝 {order.comment}</div>}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {order.payment_method === 'card' ? '💳 Карта' : '💵 Наличные'}
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{order.payment_status}</div>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {order.created_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'menu' && (
        <>
          <div style={{ marginBottom: 24, padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: 12, color: 'var(--emerald-light)' }}>➕ Добавить товар</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label className="form-label">Категория</label>
                <select className="form-input" value={newItem.category_id} onChange={e => setNewItem(n => ({ ...n, category_id: Number(e.target.value) }))}>
                  {menu.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div style={{ flex: 2, minWidth: 120 }}>
                <label className="form-label">Название</label>
                <input className="form-input" value={newItem.name} onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))} placeholder="Название" />
              </div>
              <div style={{ flex: 1, minWidth: 80 }}>
                <label className="form-label">Цена</label>
                <input className="form-input" type="number" value={newItem.price} onChange={e => setNewItem(n => ({ ...n, price: Number(e.target.value) }))} />
              </div>
              <div style={{ flex: 1, minWidth: 80 }}>
                <label className="form-label">Эмодзи</label>
                <input className="form-input" value={newItem.image} onChange={e => setNewItem(n => ({ ...n, image: e.target.value }))} />
              </div>
              <button className="btn-sm primary" style={{ padding: '10px 20px', marginTop: 4 }} onClick={addItem}>Добавить</button>
            </div>
          </div>

          <div className="menu-grid">
            {menu.map(cat => (
              <div key={cat.id}>
                <h3 style={{ color: 'var(--emerald-light)', marginBottom: 8, fontSize: 16 }}>{cat.name}</h3>
                {cat.items.map(item => (
                  <div key={item.id} className="menu-edit-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{editItems[item.id]?.image || item.image}</span>
                      <input className="form-input" value={editItems[item.id]?.name || ''}
                        onChange={e => setEditItems(ei => ({ ...ei, [item.id]: { ...ei[item.id], name: e.target.value } }))} />
                    </div>
                    <input className="form-input" value={editItems[item.id]?.description || ''}
                      onChange={e => setEditItems(ei => ({ ...ei, [item.id]: { ...ei[item.id], description: e.target.value } }))}
                      placeholder="Описание" />
                    <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
                      <input className="form-input" style={{ width: 100 }} type="number" value={editItems[item.id]?.price || 0}
                        onChange={e => setEditItems(ei => ({ ...ei, [item.id]: { ...ei[item.id], price: Number(e.target.value) } }))} />
                      <input className="form-input" style={{ width: 70 }} value={editItems[item.id]?.image || ''}
                        onChange={e => setEditItems(ei => ({ ...ei, [item.id]: { ...ei[item.id], image: e.target.value } }))}
                        placeholder="Эмодзи" />
                    </div>
                    <div className="menu-actions">
                      <button className="btn-sm primary" onClick={() => saveItem(item.id)}>💾 Сохранить</button>
                      <button className="btn-sm danger" onClick={() => { if (confirm('Удалить?')) deleteItem(item.id) }}>🗑 Удалить</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
