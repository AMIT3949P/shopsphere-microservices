const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { verifyGatewayAuth } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.GATEWAY_PORT || process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
  });
});

app.use(verifyGatewayAuth);

const createServiceProxy = (serviceName, targetUrl, pathPrefix) => {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: (reqPath) => `${pathPrefix}${reqPath}`,
    on: {
      error: (err, req, res) => {
        console.error(`[Gateway Error] ${serviceName} unavailable:`, err.message);
        if (!res.headersSent) {
          res.status(503).json({
            success: false,
            message: `${serviceName} is currently unavailable. Please try again shortly.`,
          });
        }
      },
    },
  });
};

const SERVICES = {
  users: process.env.USER_SERVICE_URL || 'http://localhost:5001',
  products: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002',
  cart: process.env.CART_SERVICE_URL || 'http://localhost:5003',
  orders: process.env.ORDER_SERVICE_URL || 'http://localhost:5004',
  payments: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5005',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5006',
};

app.use('/api/users', createServiceProxy('User Service', SERVICES.users, '/api/users'));
app.use('/api/products', createServiceProxy('Product Service', SERVICES.products, '/api/products'));
app.use('/api/cart', createServiceProxy('Cart Service', SERVICES.cart, '/api/cart'));
app.use('/api/orders', createServiceProxy('Order Service', SERVICES.orders, '/api/orders'));
app.use('/api/payments', createServiceProxy('Payment Service', SERVICES.payments, '/api/payments'));
app.use('/api/notifications', createServiceProxy('Notification Service', SERVICES.notifications, '/api/notifications'));

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on API Gateway.`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
});
