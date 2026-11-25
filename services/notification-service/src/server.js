const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || process.env.PORT || 5006;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Notification Service' });
});

app.use('/api/notifications', notificationRoutes);

app.use((err, req, res, next) => {
  console.error('[Notification Service Error]:', err);
  res.status(500).json({ success: false, message: 'Internal Notification Service Error' });
});

app.listen(PORT, () => {
  console.log(`🔔 Notification Service running on http://localhost:${PORT}`);
});
