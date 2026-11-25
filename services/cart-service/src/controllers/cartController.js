const axios = require('axios');
const Cart = require('../models/Cart');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';

const formatCartResponse = (cart) => {
  const items = cart ? cart.items : [];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Number((subtotal * 0.18).toFixed(2)); // 18% GST simulation
  const shipping = subtotal === 0 || subtotal >= 2000 ? 0 : 99;
  const total = Number((subtotal + tax + shipping).toFixed(2));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    userId: cart ? cart.userId : null,
    items,
    itemCount,
    subtotal,
    tax,
    shipping,
    total,
  };
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    res.status(200).json({ success: true, cart: formatCartResponse(cart) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve cart.' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Valid productId and quantity >= 1 required.' });
    }

    const productRes = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
    const product = productRes.data?.product;

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingIndex = cart.items.findIndex((i) => i.productId === productId);
    const desiredQty =
      existingIndex > -1 ? cart.items[existingIndex].quantity + Number(quantity) : Number(quantity);

    if (desiredQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units of ${product.name} available in stock.`,
      });
    }

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = desiredQty;
      cart.items[existingIndex].price = product.price;
      cart.items[existingIndex].name = product.name;
      cart.items[existingIndex].imageUrl = product.imageUrl;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity: Number(quantity),
        imageUrl: product.imageUrl,
      });
    }

    await cart.save();
    res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Failed to add item to cart.';
    res.status(status).json({ success: false, message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const idx = cart.items.findIndex((i) => i.productId === productId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart.' });
    }

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      const productRes = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
      const product = productRes.data?.product;
      if (product && quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available in stock.`,
        });
      }
      cart.items[idx].quantity = Number(quantity);
    }

    await cart.save();
    res.status(200).json({
      success: true,
      message: 'Cart updated.',
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update cart item.' });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    cart.items = cart.items.filter((i) => i.productId !== productId);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove cart item.' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Cart cleared.',
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
};
