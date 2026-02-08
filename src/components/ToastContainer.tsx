import { X } from 'lucide-react';
import type { Toast } from '@/types';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="min-w-[300px] p-4 bg-[#faf7f2] rounded-xl shadow-lg border border-[#d9cfc1] flex items-center gap-3 animate-[slideInRight_0.4s_ease]"
        >
          <span className="text-2xl">{toast.icon}</span>
          <span className="flex-1 font-semibold text-[#2c1810]">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-[#8c7a6a] hover:text-[#2c1810] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
