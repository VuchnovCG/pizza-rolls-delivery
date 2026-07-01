import { useState } from 'react'
import { isTelegram, closeApp, showAlert, getUser } from '../telegram.js'

export default function DeliveryForm({ total, items = [], onBack, onSuccess }) {
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    address: '',
    entrance: '',
    floor: '',
    intercom: '',
    comment: '',
    delivery_time: 'now',
    payment_method: 'cash'
  })
  const [step, setStep] = useState('form') // form | payment | success
  const [loading, setLoading] = useState(false)

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.customer_name || !form.phone || !form.address) return
    setStep('payment')
  }

  const handlePayment = async (method) => {
    setLoading(true)
    const tgUser = getUser()
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items, total_price: total, payment_method: method, telegram_user_id: tgUser?.id ? String(tgUser.id) : undefined })
      })
      const data = await res.json()

      if (method === 'card') {
        // Test YooKassa payment
        await fetch('/api/payment/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, order_id: data.id })
        })
      }

      setStep('success')
      setTimeout(() => onSuccess(data), 500)
    } catch (err) {
      if (isTelegram()) { showAlert('Ошибка при оформлении заказа') } else { alert('Ошибка при оформлении заказа') }
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Success screen
  if (step === 'success') {
    return (
      <div className="success-screen">
        <div className="success-icon">✅</div>
        <div className="success-title">Заказ принят!</div>
        <div className="success-text">
          Спасибо! Ваш заказ на <strong>{total} ₽</strong> передан в обработку.<br />
          Ожидайте звонка оператора для подтверждения.
        </div>
        <button className="submit-btn" onClick={onBack}>
          Вернуться в меню
        </button>
        {isTelegram() && (
          <button className="checkout-btn" style={{ marginTop: 8, background: 'transparent', border: '1px solid var(--border)' }} onClick={closeApp}>
            ✖ Закрыть
          </button>
        )}
      </div>
    )
  }

  // Step 2: Payment method selection
  if (step === 'payment') {
    return (
      <>
        <div className="modal-title">Выберите способ оплаты</div>

        <div className="payment-methods">
          <label className={`payment-option${form.payment_method === 'cash' ? ' selected' : ''}`}>
            <input
              type="radio"
              name="payment"
              checked={form.payment_method === 'cash'}
              onChange={() => update('payment_method', 'cash')}
            />
            <span className="payment-emoji">💵</span>
            <div>
              <div className="payment-label">Наличные</div>
              <div className="payment-desc">Оплата при получении курьеру</div>
            </div>
          </label>

          <label className={`payment-option${form.payment_method === 'card' ? ' selected' : ''}`}>
            <input
              type="radio"
              name="payment"
              checked={form.payment_method === 'card'}
              onChange={() => update('payment_method', 'card')}
            />
            <span className="payment-emoji">💳</span>
            <div>
              <div className="payment-label">Картой онлайн</div>
              <div className="payment-desc">Оплата через ЮKassa (тестовый режим)</div>
            </div>
          </label>
        </div>

        {form.payment_method === 'card' && (
          <div className="test-card-info">
            🧪 Тестовый режим. Карта: <strong>5555 5555 5555 5555</strong>, любой CVV/срок
          </div>
        )}

        <div style={{ marginBottom: 16, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Сумма заказа: <strong style={{ color: 'var(--emerald-light)' }}>{total} ₽</strong>
        </div>

        <button className="submit-btn" onClick={() => handlePayment(form.payment_method)} disabled={loading}>
          {loading ? 'Обработка...' : `Оплатить ${total} ₽`}
        </button>
        <button className="checkout-btn" style={{ marginTop: 8, background: 'transparent', border: '1px solid var(--border)' }} onClick={() => setStep('form')}>
          ← Назад
        </button>
      </>
    )
  }

  // Step 1: Delivery form (WB-style)
  return (
    <>
      <div className="modal-title">Оформление заказа</div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Имя *</label>
            <input className="form-input" placeholder="Ваше имя" value={form.customer_name}
              onChange={e => update('customer_name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Телефон *</label>
            <input className="form-input" placeholder="+7 (999) 999-99-99" type="tel" value={form.phone}
              onChange={e => update('phone', e.target.value)} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Адрес доставки *</label>
          <input className="form-input" placeholder="Улица, дом, корпус" value={form.address}
            onChange={e => update('address', e.target.value)} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Подъезд</label>
            <input className="form-input" placeholder="№ подъезда" value={form.entrance}
              onChange={e => update('entrance', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Этаж</label>
            <input className="form-input" placeholder="№ этажа" value={form.floor}
              onChange={e => update('floor', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Домофон</label>
          <input className="form-input" placeholder="Код домофона" value={form.intercom}
            onChange={e => update('intercom', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Комментарий курьеру</label>
          <textarea className="form-textarea" placeholder="Дополнительные указания" value={form.comment}
            onChange={e => update('comment', e.target.value)} rows={2} />
        </div>

        <div className="form-group">
          <label className="form-label">Время доставки</label>
          <select className="form-select" value={form.delivery_time}
            onChange={e => update('delivery_time', e.target.value)}>
            <option value="now">Как можно скорее</option>
            <option value="12-13">12:00 — 13:00</option>
            <option value="13-14">13:00 — 14:00</option>
            <option value="14-15">14:00 — 15:00</option>
            <option value="15-16">15:00 — 16:00</option>
            <option value="16-17">16:00 — 17:00</option>
            <option value="17-18">17:00 — 18:00</option>
            <option value="18-19">18:00 — 19:00</option>
            <option value="19-20">19:00 — 20:00</option>
          </select>
        </div>

        <div style={{ marginBottom: 12, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Сумма заказа: <strong style={{ color: 'var(--emerald-light)' }}>{total} ₽</strong>
        </div>

        <button type="submit" className="submit-btn">Продолжить к оплате</button>
        <button type="button" className="checkout-btn" style={{ marginTop: 8, background: 'transparent', border: '1px solid var(--border)' }} onClick={onBack}>
          ← Вернуться
        </button>
      </form>
    </>
  )
}
