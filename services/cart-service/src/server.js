const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.CART_SERVICE_PORT || process.env.PORT || 5003;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Cart Service' });
});

app.use('/api/cart', cartRoutes);

app.use((err, req, res, next) => {
  console.error('[Cart Service Error]:', err);
  res.status(500).json({ success: false, message: 'Internal Cart Service Error' });
});

app.listen(PORT, () => {
  console.log(`🛒 Cart Service running on http://localhost:${PORT}`);
});
