import React, { useEffect, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import api from '../api/axios';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Books', 'Sports', 'Accessories'];
const ORDER_STATUSES = ['PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminDashboardPage({ onNotify }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    stock: '15',
    brand: 'ShopSphere',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  });

  const loadAdminData = async () => {
    try {
      const [prodRes, ordRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders/all'),
      ]);
      setProducts(prodRes.data.products || []);
      setOrders(ordRes.data.orders || []);
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Admin access required or failed to load data');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      onNotify?.('success', 'Product created!');
      setForm({ ...form, name: '', description: '', price: '', stock: '15' });
      loadAdminData();
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      onNotify?.('info', 'Product deleted.');
      loadAdminData();
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { orderStatus });
      onNotify?.('success', `Order ${orderId} updated to ${orderStatus}`);
      loadAdminData();
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleCreateProduct} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 h-fit shadow-sm">
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> Add New Product
          </h2>
          <input
            type="text"
            required
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm"
          />
          <textarea
            required
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              required
              min={1}
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm"
            />
            <input
              type="number"
              required
              min={0}
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm"
            />
          </div>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm"
          />
          <button type="submit" className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 text-sm">
            Create Product
          </button>
        </form>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-slate-900">Products ({products.length})</h2>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {products.map((p) => (
              <div key={p._id} className="py-3 flex items-center justify-between gap-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.category} • ₹{p.price} • Stock: {p.stock}</p>
                </div>
                <button
                  onClick={() => handleDeleteProduct(p._id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Delete product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-lg text-slate-900">All Orders ({orders.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
                <th className="py-2 pr-4">Order ID</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Payment</th>
                <th className="py-2">Order Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="py-3 pr-4 font-mono text-xs font-semibold">{o.orderId}</td>
                  <td className="py-3 pr-4 font-semibold">₹{Number(o.totalAmount).toLocaleString()}</td>
                  <td className="py-3 pr-4">{o.paymentStatus}</td>
                  <td className="py-3">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                      className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
