import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Check } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailsPage({ onNotify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => onNotify?.('error', 'Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      onNotify?.('info', 'Please sign in first.');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product._id, quantity);
      onNotify?.('success', `Added ${quantity} × ${product.name} to cart`);
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="h-96 bg-slate-200 animate-pulse rounded-2xl" />;
  }

  if (!product) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-slate-600 mb-4">Product not found.</p>
        <button onClick={() => navigate('/products')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10 grid md:grid-cols-2 gap-8 shadow-sm">
        <div className="rounded-2xl overflow-hidden bg-slate-100 h-80 md:h-96">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                {product.category}
              </span>
              <span className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
                <Star className="w-4 h-4 fill-amber-400" /> {product.rating ?? 4.5}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{product.name}</h1>
            <p className="text-sm text-slate-500">Brand: <span className="font-medium text-slate-700">{product.brand}</span></p>
            <p className="text-slate-600 leading-relaxed">{product.description}</p>

            <div className="pt-2">
              <span className="text-3xl font-extrabold text-slate-900">₹{Number(product.price).toLocaleString()}</span>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <Check className="w-4 h-4" /> {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <input
              type="number"
              min={1}
              max={product.stock || 1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-20 px-3 py-2.5 border border-slate-300 rounded-xl text-center font-semibold"
            />
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock <= 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
