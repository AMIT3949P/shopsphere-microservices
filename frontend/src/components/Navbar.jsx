import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Bell, User, LogOut, ShieldCheck, Store, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

export default function Navbar({ onNotify }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // Ignore transient errors
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      onNotify?.('error', 'Could not update notifications');
    }
  };

  const handleLogout = () => {
    logout();
    onNotify?.('info', 'Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
          <Store className="w-6 h-6" />
          <span>ShopSphere</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
          <Link to="/products" className="hover:text-indigo-600 transition">Products</Link>
          {isAuthenticated && (
            <Link to="/orders" className="hover:text-indigo-600 transition flex items-center gap-1">
              <Package className="w-4 h-4" /> Orders
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-amber-600 hover:text-amber-700 transition flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-4 h-4" /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifs((s) => !s);
                  loadNotifications();
                }}
                className="relative p-2 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="font-semibold text-sm text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-2.5 rounded-lg text-xs ${
                            n.read ? 'bg-slate-50 text-slate-600' : 'bg-indigo-50/80 text-slate-900 border border-indigo-100'
                          }`}
                        >
                          <p className="font-semibold">{n.title}</p>
                          <p className="mt-0.5 text-slate-600">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <Link
            to="/cart"
            className="relative p-2 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-indigo-600 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
