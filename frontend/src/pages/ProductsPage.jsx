import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home & Living', 'Books', 'Sports', 'Accessories'];

export default function ProductsPage({ onNotify }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (category && category !== 'All') params.category = category;
        if (search.trim()) params.search = search.trim();
        const res = await api.get('/products', { params });
        setProducts(res.data.products || []);
      } catch {
        onNotify?.('error', 'Failed to load products from Product Service.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalog</h1>
          <p className="text-sm text-slate-500">Search and filter products served by Product Service (:5002)</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or brands..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          No products match your search or category filter.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onNotify={onNotify} />
          ))}
        </div>
      )}
    </div>
  );
}
