const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const connectDB = require('./config/db');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'Wireless Noise-Canceling Studio Headphones',
    description: 'Over-ear active noise cancellation, 40-hour battery life, plush memory foam earcups, and lossless USB-C audio.',
    price: 7999,
    category: 'Electronics',
    stock: 25,
    brand: 'SonicWave',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  },
  {
    name: 'Minimalist Mechanical Keyboard 75%',
    description: 'Hot-swappable tactile switches, CNC aluminum frame, PBT keycaps, and customizable per-key RGB backlight.',
    price: 5499,
    category: 'Electronics',
    stock: 18,
    brand: 'KeyCraft',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
  },
  {
    name: 'Classic Cotton Oversized Hoodie',
    description: 'Heavyweight 420 GSM combed organic cotton fleece with drop shoulders and breathable ribbed cuffs.',
    price: 1899,
    category: 'Fashion',
    stock: 40,
    brand: 'UrbanLoom',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80',
  },
  {
    name: 'Ceramic Pour-Over Coffee Brewer Set',
    description: 'Hand-glazed stoneware dripper with matching thermal carafe for clean, aromatic morning brews.',
    price: 2299,
    category: 'Home & Living',
    stock: 30,
    brand: 'HearthStudio',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80',
  },
  {
    name: 'Designing Data-Intensive Microservices',
    description: 'Comprehensive guide to distributed systems, event choreography, resilience patterns, and observability.',
    price: 1299,
    category: 'Books',
    stock: 50,
    brand: 'TechPress',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
  },
  {
    name: 'All-Weather Running & Training Shoes',
    description: 'Responsive dual-density midsole foam, engineered mesh upper, and high-grip rubber outsole.',
    price: 4299,
    category: 'Sports',
    stock: 22,
    brand: 'StridePro',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  },
];

const seedProducts = async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log(`🌱 Seeded ${sampleProducts.length} products into shopsphere_products.`);
  process.exit(0);
};

seedProducts();
