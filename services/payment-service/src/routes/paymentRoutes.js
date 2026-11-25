const express = require('express');
const router = express.Router();
const {
  simulatePayment,
  getPaymentsByOrder,
  getMyPayments,
} = require('../controllers/paymentController');

router.post('/simulate', simulatePayment);
router.get('/my-payments', getMyPayments);
router.get('/order/:orderId', getPaymentsByOrder);

module.exports = router;
