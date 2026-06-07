import { X, Circle, CheckCircle2, RotateCcw } from 'lucide-react';
import type { TaskStatus } from '@/types';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (status: TaskStatus) => void;
}

const options = [
  {
    status: 'todo' as TaskStatus,
    icon: Circle,
    label: 'To Do',
    description: 'Mark this task as pending',
    color: '#d97706',
    bg: 'rgba(217,119,6,0.06)',
    border: 'rgba(217,119,6,0.22)',
    hoverBg: 'linear-gradient(135deg, #d97706, #b45309)',
  },
  {
    status: 'completed' as TaskStatus,
    icon: CheckCircle2,
    label: 'Completed',
    description: 'Great job! Mark as done',
    color: '#059669',
    bg: 'rgba(5,150,105,0.06)',
    border: 'rgba(5,150,105,0.22)',
    hoverBg: 'linear-gradient(135deg, #059669, #047857)',
  },
];

export function StatusChangeModal({ isOpen, onClose, onChangeStatus }: StatusChangeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm animate-scaleIn rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 24px 60px rgba(44,24,16,0.22), 0 8px 24px rgba(44,24,16,0.12)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)' }}>
          <div>
            <h2 className="font-['Playfair_Display'] text-lg font-bold text-white">Update Status</h2>
            <p className="text-xs text-white/70 mt-0.5">Choose the new status for this task</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 space-y-3" style={{ background: '#fdfaf6' }}>
          {options.map(({ status, icon: Icon, label, description, color, bg, border, hoverBg }) => (
            <button key={status} onClick={() => { onChangeStatus(status); onClose(); }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group"
              style={{ background: bg, border: `1.5px solid ${border}` }}
              onMouseEnter={e => {
                e.currentTarget.style.background = hoverBg;
                e.currentTarget.querySelector('.status-text')!.setAttribute('style', 'color: #fff');
                e.currentTarget.querySelector('.status-desc')!.setAttribute('style', 'color: rgba(255,255,255,0.75)');
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = bg;
                e.currentTarget.querySelector('.status-text')!.setAttribute('style', `color: ${color}`);
                e.currentTarget.querySelector('.status-desc')!.setAttribute('style', 'color: #7a6858');
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{ background: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="status-text text-sm font-bold transition-colors duration-200" style={{ color }}>{label}</div>
                <div className="status-desc text-xs mt-0.5 transition-colors duration-200" style={{ color: '#7a6858' }}>{description}</div>
              </div>
              <RotateCcw className="w-4 h-4 opacity-40 group-hover:opacity-80 transition-opacity duration-200 flex-shrink-0" style={{ color }} />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4" style={{ background: '#fdfaf6' }}>
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#7a6858] hover:bg-[#ede4d8] transition-all duration-200 border"
            style={{ border: '1px solid #ddd0bc' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
