const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || process.env.PORT || 5004;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Order Service' });
});

app.use('/api/orders', orderRoutes);

app.use((err, req, res, next) => {
  console.error('[Order Service Error]:', err);
  res.status(500).json({ success: false, message: 'Internal Order Service Error' });
});

app.listen(PORT, () => {
  console.log(`📑 Order Service running on http://localhost:${PORT}`);
});
