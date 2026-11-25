const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order');

const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:5003';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5006';

const sendNotification = async (payload) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, payload);
  } catch (err) {
    console.warn('[Order Service] Notification dispatch skipped:', err.message);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'] || '';
    const { shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address (street, city, zipCode) is required.',
      });
    }

    const cartRes = await axios.get(`${CART_SERVICE_URL}/api/cart`, {
      headers: { 'x-user-id': userId },
    });
    const cart = cartRes.data?.cart;

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot place an order with an empty cart.',
      });
    }

    await axios.post(`${PRODUCT_SERVICE_URL}/api/products/reserve-stock`, {
      items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });

    const randomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderId = `ORD-${Date.now()}-${randomCode}`;

    const order = await Order.create({
      orderId,
      userId,
      userEmail,
      items: cart.items,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      totalAmount: cart.total,
      shippingAddress,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING_PAYMENT',
    });

    await axios.delete(`${CART_SERVICE_URL}/api/cart/clear`, {
      headers: { 'x-user-id': userId },
    });

    await sendNotification({
      userId,
      type: 'ORDER_CREATED',
      title: 'Order Placed — Awaiting Payment',
      message: `Order ${order.orderId} for ₹${order.totalAmount.toFixed(2)} has been created. Complete payment to confirm.`,
      metadata: { orderId: order.orderId, totalAmount: order.totalAmount },
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order,
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Failed to place order.';
    res.status(status).json({ success: false, message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    if (req.headers['x-user-role'] !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch all orders.' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];
    const order = await Order.findOne({
      $or: [{ orderId: req.params.id }, ...(req.params.id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: req.params.id }] : [])],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.userId !== userId && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid order lookup.' });
  }
};

exports.updateOrderPayment = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentStatus = paymentStatus;
    if (transactionId) order.transactionId = transactionId;

    if (paymentStatus === 'PAID') {
      order.orderStatus = 'CONFIRMED';
    } else if (paymentStatus === 'FAILED') {
      order.orderStatus = 'PENDING_PAYMENT';
    }

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order payment status.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    const { orderStatus } = req.body;
    const validStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status.' });
    }

    if (role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required to update order status.' });
    }

    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    await sendNotification({
      userId: order.userId,
      type: 'ORDER_STATUS',
      title: `Order ${orderStatus}`,
      message: `Your order ${order.orderId} status is now ${orderStatus}.`,
      metadata: { orderId: order.orderId, orderStatus },
    });

    res.status(200).json({ success: true, message: 'Order status updated.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.userId !== userId && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order.' });
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order in ${order.orderStatus} state.`,
      });
    }

    order.orderStatus = 'CANCELLED';
    await order.save();

    await sendNotification({
      userId: order.userId,
      type: 'ORDER_CANCELLED',
      title: 'Order Cancelled',
      message: `Order ${order.orderId} has been cancelled.`,
      metadata: { orderId: order.orderId },
    });

    res.status(200).json({ success: true, message: 'Order cancelled.', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel order.' });
  }
};
