import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Shield, Zap } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function HomePage({ onNotify }) {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products')
      .then((res) => setFeatured((res.data.products || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-14">
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white rounded-3xl p-8 md:p-14 shadow-lg">
        <div className="max-w-2xl space-y-5">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-semibold tracking-wide">
            6 Independent Microservices • API Gateway • MongoDB
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Modern Commerce Built on Distributed Microservices
          </h1>
          <p className="text-indigo-100 text-base md:text-lg">
            Explore curated products, manage a persistent cart, simulate payments, and track orders across decoupled services on ShopSphere.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition"
            >
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500/30 border border-white/25 text-white font-semibold rounded-xl hover:bg-indigo-500/40 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Layers className="w-8 h-8 text-indigo-600 mb-3" />
          <h3 className="font-bold text-slate-900 text-lg">Decoupled Services</h3>
          <p className="text-sm text-slate-600 mt-1">
            User, Product, Cart, Order, Payment, and Notification services run on dedicated ports with isolated databases.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Shield className="w-8 h-8 text-emerald-600 mb-3" />
          <h3 className="font-bold text-slate-900 text-lg">Centralized Gateway</h3>
          <p className="text-sm text-slate-600 mt-1">
            Single entry point on port 5000 handling JWT verification, request routing, and graceful fallback errors.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Zap className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="font-bold text-slate-900 text-lg">End-to-End Checkout Flow</h3>
          <p className="text-sm text-slate-600 mt-1">
            Stock reservation, order generation, payment simulation, and real-time notification history.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Featured Products</h2>
          <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} onNotify={onNotify} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
