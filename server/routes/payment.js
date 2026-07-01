const express = require('express');
const router = express.Router();

// POST /api/payment/test — имитация тестового платежа ЮKassa
// В боевом режиме здесь будет запрос к API ЮKassa
router.post('/test', (req, res) => {
  const { amount, order_id } = req.body;

  // В тестовом режиме всегда возвращаем успех
  // ЮKassa test card: 5555 5555 5555 5555, любой CVV, любая дата
  res.json({
    success: true,
    payment_id: 'test-' + Date.now(),
    order_id,
    amount,
    status: 'succeeded',
    message: 'Тестовый платёж выполнен. Карта: 5555 55XX **** 5555'
  });
});

// POST /api/payment/confirm — подтверждение платежа (в тестовом режиме)
router.post('/confirm', (req, res) => {
  res.json({
    success: true,
    status: 'succeeded'
  });
});

module.exports = router;
