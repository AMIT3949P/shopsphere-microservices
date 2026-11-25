import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product, onNotify }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onNotify?.('info', 'Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product._id, 1);
      onNotify?.('success', `${product.name} added to cart!`);
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Failed to add item');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
      <Link to={`/products/${product._id}`} className="block relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700">
          {product.category}
        </span>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{product.brand}</span>
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {product.rating ?? 4.5}
            </span>
          </div>
          <Link to={`/products/${product._id}`} className="font-semibold text-slate-900 hover:text-indigo-600 line-clamp-1">
            {product.name}
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{product.description}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-lg font-bold text-slate-900">₹{Number(product.price).toLocaleString()}</span>
            <p className="text-[11px] text-slate-400">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || product.stock <= 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
