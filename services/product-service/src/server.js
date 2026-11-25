const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PRODUCT_SERVICE_PORT || process.env.PORT || 5002;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Product Service' });
});

app.use('/api/products', productRoutes);

app.use((err, req, res, next) => {
  console.error('[Product Service Error]:', err);
  res.status(500).json({ success: false, message: 'Internal Product Service Error' });
});

app.listen(PORT, () => {
  console.log(`📦 Product Service running on http://localhost:${PORT}`);
});
