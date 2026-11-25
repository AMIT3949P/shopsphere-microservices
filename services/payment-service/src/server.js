const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PAYMENT_SERVICE_PORT || process.env.PORT || 5005;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Payment Service' });
});

app.use('/api/payments', paymentRoutes);

app.use((err, req, res, next) => {
  console.error('[Payment Service Error]:', err);
  res.status(500).json({ success: false, message: 'Internal Payment Service Error' });
});

app.listen(PORT, () => {
  console.log(`💳 Payment Service running on http://localhost:${PORT}`);
});
