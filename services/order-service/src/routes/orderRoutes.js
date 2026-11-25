const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderPayment,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/all', getAllOrders);
router.get('/:id', getOrderById);
router.patch('/:orderId/payment', updateOrderPayment);
router.patch('/:orderId/status', updateOrderStatus);
router.patch('/:orderId/cancel', cancelOrder);

module.exports = router;
