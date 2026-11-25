import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function OrdersPage({ onNotify }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.orders || []);
    } catch {
      onNotify?.('error', 'Failed to fetch order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      onNotify?.('info', `Order ${orderId} cancelled.`);
      loadOrders();
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Could not cancel order');
    }
  };

  if (loading) {
    return <div className="h-64 bg-slate-200 animate-pulse rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Order History</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500">
          You have not placed any orders yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono font-bold text-slate-900">{order.orderId}</span>
                  <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {order.orderStatus}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    Payment: {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-900">Total: ₹{Number(order.totalAmount).toLocaleString()}</span>
                {!['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus) && (
                  <button
                    onClick={() => handleCancel(order.orderId)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
