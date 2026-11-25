import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage({ onNotify }) {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    zipCode: user?.address?.zipCode || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          zipCode: form.zipCode,
        },
      });
      onNotify?.('success', 'Profile updated!');
    } catch (err) {
      onNotify?.('error', err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500">{user?.email} • Role: <span className="uppercase font-semibold">{user?.role}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Street</label>
          <input
            type="text"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code</label>
            <input
              type="text"
              value={form.zipCode}
              onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-slate-400 transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
