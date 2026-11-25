import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppShell() {
  const [toast, setToast] = useState(null);

  const notify = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onNotify={notify} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage onNotify={notify} />} />
          <Route path="/login" element={<LoginPage onNotify={notify} />} />
          <Route path="/register" element={<RegisterPage onNotify={notify} />} />
          <Route path="/products" element={<ProductsPage onNotify={notify} />} />
          <Route path="/products/:id" element={<ProductDetailsPage onNotify={notify} />} />
          <Route path="/cart" element={<CartPage onNotify={notify} />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage onNotify={notify} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage onNotify={notify} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage onNotify={notify} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboardPage onNotify={notify} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        ShopSphere Microservices E-Commerce • API Gateway (:5000) + 6 Microservices (:5001–:5006) + React (:5173)
      </footer>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppShell />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
