const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.USER_SERVICE_PORT || process.env.PORT || 5001;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'User Service' });
});

app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error('[User Service Error]:', err);
  res.status(500).json({ success: false, message: 'Internal User Service Error' });
});

app.listen(PORT, () => {
  console.log(`👤 User Service running on http://localhost:${PORT}`);
});
