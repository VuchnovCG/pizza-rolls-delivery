const API_BASE = '/api';

export async function getMenu() {
  const res = await fetch(`${API_BASE}/menu`);
  return res.json();
}

export async function createOrder(order) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  return res.json();
}

export async function getOrders(token) {
  const res = await fetch(`${API_BASE}/orders`, {
    headers: { 'Authorization': token }
  });
  return res.json();
}

export async function updateOrderStatus(id, status, token) {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function updateMenuItem(id, data, token) {
  const res = await fetch(`${API_BASE}/menu/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function createMenuItem(data, token) {
  const res = await fetch(`${API_BASE}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': token },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteMenuItem(id, token) {
  const res = await fetch(`${API_BASE}/menu/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': token }
  });
  return res.json();
}

export async function adminLogin(password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  return res.json();
}

export async function adminCheck(token) {
  const res = await fetch(`${API_BASE}/admin/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  return res.json();
}

export async function testPayment(amount, orderId) {
  const res = await fetch(`${API_BASE}/payment/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, order_id: orderId })
  });
  return res.json();
}
