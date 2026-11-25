const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment');

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:5004';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5006';

exports.simulatePayment = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { orderId, amount, method = 'SIMULATED_CARD', cardNumber = '', simulateOutcome = 'SUCCESS' } = req.body;

    if (!orderId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'orderId and amount are required for payment simulation.',
      });
    }

    const isSuccess = simulateOutcome !== 'FAILED';
    const status = isSuccess ? 'SUCCESS' : 'FAILED';
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const cardLast4 = cardNumber && cardNumber.length >= 4 ? cardNumber.slice(-4) : '4242';
    const failureReason = isSuccess ? null : 'Simulated bank issuer decline (test failure mode).';

    const payment = await Payment.create({
      transactionId,
      orderId,
      userId,
      amount: Number(amount),
      method,
      cardLast4,
      status,
      failureReason,
    });

    await axios.patch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/payment`, {
      paymentStatus: isSuccess ? 'PAID' : 'FAILED',
      transactionId,
    });

    try {
      await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications`, {
        userId,
        type: isSuccess ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
        title: isSuccess ? 'Payment Confirmed' : 'Payment Failed',
        message: isSuccess
          ? `Payment of ₹${Number(amount).toFixed(2)} succeeded for Order ${orderId} (Txn: ${transactionId}).`
          : `Payment for Order ${orderId} failed: ${failureReason}`,
        metadata: { orderId, transactionId, amount: Number(amount), status },
      });
    } catch (notifErr) {
      console.warn('[Payment Service] Notification dispatch warning:', notifErr.message);
    }

    res.status(isSuccess ? 200 : 402).json({
      success: isSuccess,
      message: isSuccess ? 'Simulated payment succeeded.' : failureReason,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Payment simulation error.',
    });
  }
};

exports.getPaymentsByOrder = async (req, res) => {
  try {
    const payments = await Payment.find({ orderId: req.params.orderId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve payment records.' });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user payments.' });
  }
};
