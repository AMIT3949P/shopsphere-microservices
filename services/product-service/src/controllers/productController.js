const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { description: regex }, { brand: regex }];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    const categories = await Product.distinct('category');

    res.status(200).json({
      success: true,
      count: products.length,
      categories,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products.',
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid product ID.',
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    if (req.headers['x-user-role'] !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to create products.',
      });
    }

    const { name, description, price, category, stock, imageUrl, brand, rating } = req.body;
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock ?? 10),
      imageUrl: imageUrl || undefined,
      brand: brand || 'ShopSphere',
      rating: rating ? Number(rating) : 4.5,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create product.',
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    if (req.headers['x-user-role'] !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to update products.',
      });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update product.',
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    if (req.headers['x-user-role'] !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to delete products.',
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete product.',
    });
  }
};

exports.reserveStock = async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Items array is required.' });
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }
    }

    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    res.status(200).json({ success: true, message: 'Stock reserved.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reserve stock.' });
  }
};
