import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage({ onNotify }) {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-4 max-w-lg mx-auto">
        <ShoppingBag className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign in to view your cart</h2>
        <p className="text-sm text-slate-500">Your shopping cart is persisted per user in Cart Service (:5003).</p>
        <Link to="/login" className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="h-64 bg-slate-200 animate-pulse rounded-2xl" />;
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
        <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-sm text-slate-500">Explore our products and add items to get started.</p>
        <Link to="/products" className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Shopping Cart ({cart.itemCount})</h1>
          <button
            onClick={async () => {
              await clearCart();
              onNotify?.('info', 'Cart cleared');
            }}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            Clear Cart
          </button>
        </div>

        {cart.items.map((item) => (
          <div
            key={item.productId}
            className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm"
          >
            <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-slate-100" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{item.name}</h3>
              <p className="text-sm text-slate-500">₹{Number(item.price).toLocaleString()} each</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right font-bold text-slate-900 w-24">
              ₹{(item.price * item.quantity).toLocaleString()}
            </div>

            <button
              onClick={() => removeItem(item.productId)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
              title="Remove item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
        <div className="space-y-2 text-sm text-slate-600 border-b border-slate-100 pb-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{cart.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Tax (18%)</span>
            <span>₹{cart.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{cart.shipping === 0 ? 'FREE' : `₹${cart.shipping}`}</span>
          </div>
        </div>
        <div className="flex justify-between text-base font-bold text-slate-900">
          <span>Total</span>
          <span>₹{cart.total.toLocaleString()}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
