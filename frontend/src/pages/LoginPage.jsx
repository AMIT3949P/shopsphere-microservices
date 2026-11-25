import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNotify }) {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      onNotify?.('success', 'Welcome back to ShopSphere!');
      navigate('/products');
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-6">
      <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
      <p className="text-sm text-slate-500 mt-1">Authenticate via User Service & API Gateway</p>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-slate-400 transition"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-xs text-slate-400 mt-4">
        Tip: Register with <span className="font-mono text-slate-600">admin@shopsphere.com</span> to get Admin role access.
      </p>

      <p className="text-sm text-slate-600 mt-5 text-center">
        New to ShopSphere?{' '}
        <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
