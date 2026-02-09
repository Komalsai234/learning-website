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

  const statusOptions = [
    {
      status: 'todo' as TaskStatus,
      label: 'To Do',
      icon: Circle,
      borderColor: 'border-[#c28659]',
      bgColor: 'bg-[#faf7f2]',
      hoverGradient: 'hover:bg-gradient-to-r hover:from-[#c28659] hover:to-[#ab6e47]',
      textColor: 'text-[#5c4a3a]',
      hoverTextColor: 'hover:text-white'
    },
    {
      status: 'completed' as TaskStatus,
      label: 'Completed',
      icon: CheckCircle2,
      borderColor: 'border-emerald-400',
      bgColor: 'bg-[#faf7f2]',
      hoverGradient: 'hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-600',
      textColor: 'text-[#5c4a3a]',
      hoverTextColor: 'hover:text-white'
    }
  ];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#faf7f2] rounded-3xl w-full max-w-md shadow-2xl animate-[slideInDown_0.4s_cubic-bezier(0.4,0,0.2,1)] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#ab6e47] to-[#9b6b4f] px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Change Status</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-3">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.status}
                  onClick={() => handleStatusChange(option.status)}
                  className={`w-full p-4 border-2 ${option.borderColor} rounded-xl font-semibold text-base flex items-center gap-4 ${option.bgColor} ${option.hoverGradient} ${option.textColor} ${option.hoverTextColor} transition-all duration-200 hover:translate-x-1 hover:shadow-md`}
                >
                  <Icon className="w-6 h-6" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}