const mongoose = require('mongoose');

const connectDB = async () => {
  const baseUri = process.env.MONGO_BASE_URI || 'mongodb://127.0.0.1:27017';
  const mongoUri = process.env.MONGO_URI || `${baseUri}/shopsphere_products`;

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ [Product Service] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ [Product Service] MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
