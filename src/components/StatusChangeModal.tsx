import { X, Circle, CheckCircle2 } from 'lucide-react';
import type { TaskStatus } from '@/types';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (status: TaskStatus) => void;
}

export function StatusChangeModal({ isOpen, onClose, onChangeStatus }: StatusChangeModalProps) {
  if (!isOpen) return null;

  const handleStatusChange = (status: TaskStatus) => {
    onChangeStatus(status);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#faf7f2] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-[slideInDown_0.4s_cubic-bezier(0.4,0,0.2,1)]">
          <div className="bg-gradient-to-r from-[#ab6e47] to-[#9b6b4f] px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Change Status</h2>
            <button onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 text-white hover:bg-white/20 rounded-xl transition-all duration-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-3">
            <button
              onClick={() => handleStatusChange('todo')}
              className="w-full p-4 border-2 border-[#c28659] rounded-xl font-semibold text-base inline-flex items-center gap-4 bg-[#faf7f2] text-[#5c4a3a] hover:bg-gradient-to-r hover:from-[#c28659] hover:to-[#ab6e47] hover:text-white hover:border-[#ab6e47] transition-all duration-200 hover:translate-x-1 shadow-sm"
            >
              <Circle className="w-5 h-5" /> To Do
            </button>
            <button
              onClick={() => handleStatusChange('completed')}
              className="w-full p-4 border-2 border-emerald-400 rounded-xl font-semibold text-base inline-flex items-center gap-4 bg-[#faf7f2] text-[#5c4a3a] hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-600 hover:text-white hover:border-emerald-500 transition-all duration-200 hover:translate-x-1 shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5" /> Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}