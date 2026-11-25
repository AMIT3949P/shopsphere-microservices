import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onNotify }) {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      onNotify?.('success', 'Account created! You are now signed in.');
      navigate('/products');
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-6">
      <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
      <p className="text-sm text-slate-500 mt-1">Register a new customer or admin account</p>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Aarav Sharma"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="aarav@example.com"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone (Optional)</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 9876543210"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password (min 6 chars)</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-slate-400 transition"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="text-sm text-slate-600 mt-5 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
