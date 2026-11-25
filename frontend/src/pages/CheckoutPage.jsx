import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage({ onNotify }) {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: user?.address?.street || '221B Baker Street',
    city: user?.address?.city || 'Prayagraj',
    state: user?.address?.state || 'Uttar Pradesh',
    zipCode: user?.address?.zipCode || '211001',
    country: user?.address?.country || 'India',
  });

  const [createdOrder, setCreatedOrder] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    method: 'SIMULATED_CARD',
    cardNumber: '4242 4242 4242 4242',
    simulateOutcome: 'SUCCESS',
  });
  const [placing, setPlacing] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const res = await api.post('/orders', { shippingAddress: address });
      setCreatedOrder(res.data.order);
      await fetchCart();
      onNotify?.('success', `Order ${res.data.order.orderId} created! Now simulate payment.`);
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    if (!createdOrder) return;
    setPaying(true);
    try {
      const res = await api.post('/payments/simulate', {
        orderId: createdOrder.orderId,
        amount: createdOrder.totalAmount,
        method: paymentForm.method,
        cardNumber: paymentForm.cardNumber,
        simulateOutcome: paymentForm.simulateOutcome,
      });
      onNotify?.('success', `Payment successful! Txn: ${res.data.payment.transactionId}`);
      navigate('/orders');
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Simulated payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (!createdOrder) {
    return (
      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handlePlaceOrder} className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Checkout & Shipping</h1>
          <p className="text-sm text-slate-500">Order Service (:5004) reserves stock and clears cart upon order creation.</p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={address.street}
              onChange={(e) => setAddress({ ...address, street: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Postal / ZIP Code</label>
              <input
                type="text"
                required
                value={address.zipCode}
                onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={placing || !cart.items?.length}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 transition"
          >
            {placing ? 'Creating Order...' : `Place Order (₹${cart.total.toLocaleString()})`}
          </button>
        </form>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit space-y-3 shadow-sm">
          <h2 className="font-bold text-slate-900">Cart Total</h2>
          <p className="text-2xl font-extrabold text-indigo-600">₹{cart.total.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Includes 18% GST and free shipping above ₹2,000.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-3 text-emerald-600">
        <CreditCard className="w-7 h-7" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Payment Simulation</h1>
          <p className="text-xs text-slate-500">Order ID: <span className="font-mono font-semibold">{createdOrder.orderId}</span></p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
        <span className="text-sm text-slate-600">Amount to Simulate</span>
        <span className="text-xl font-bold text-slate-900">₹{Number(createdOrder.totalAmount).toLocaleString()}</span>
      </div>

      <form onSubmit={handleSimulatePayment} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
          <select
            value={paymentForm.method}
            onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
          >
            <option value="SIMULATED_CARD">Simulated Credit/Debit Card</option>
            <option value="SIMULATED_UPI">Simulated UPI</option>
            <option value="SIMULATED_WALLET">Simulated Wallet</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Test Card Number (Demo)</label>
          <input
            type="text"
            value={paymentForm.cardNumber}
            onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Simulated Gateway Outcome</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentForm({ ...paymentForm, simulateOutcome: 'SUCCESS' })}
              className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 ${
                paymentForm.simulateOutcome === 'SUCCESS'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> Approve
            </button>
            <button
              type="button"
              onClick={() => setPaymentForm({ ...paymentForm, simulateOutcome: 'FAILED' })}
              className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 ${
                paymentForm.simulateOutcome === 'FAILED'
                  ? 'border-rose-600 bg-rose-50 text-rose-700'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <XCircle className="w-4 h-4" /> Decline
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={paying}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-slate-400 transition"
        >
          {paying ? 'Processing Simulation...' : 'Execute Simulated Payment'}
        </button>
      </form>
    </div>
  );
}
