import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const emptyCart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(emptyCart);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data.cart || emptyCart);
    } catch {
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const res = await api.post('/cart/add', { productId, quantity });
    setCart(res.data.cart);
    return res.data;
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.put(`/cart/item/${productId}`, { quantity });
    setCart(res.data.cart);
    return res.data;
  };

  const removeItem = async (productId) => {
    const res = await api.delete(`/cart/item/${productId}`);
    setCart(res.data.cart);
    return res.data;
  };

  const clearCart = async () => {
    const res = await api.delete('/cart/clear');
    setCart(res.data.cart);
    return res.data;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
