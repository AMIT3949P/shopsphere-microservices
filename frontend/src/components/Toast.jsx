import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${styles[toast.type] || styles.info}`}>
        {icons[toast.type] || icons.info}
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
