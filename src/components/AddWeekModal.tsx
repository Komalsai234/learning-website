import { useState } from 'react';
import { X, Loader2, Calendar } from 'lucide-react';

interface AddWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weekData: { title: string; startDate: string; endDate: string; description: string }) => Promise<boolean>;
}

export function AddWeekModal({ isOpen, onClose, onSave }: AddWeekModalProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => { setTitle(''); setStartDate(''); setEndDate(''); setDescription(''); };
  const handleClose = () => { resetForm(); onClose(); };

  const handleSave = async () => {
    if (!title || !startDate || !endDate) { alert('Please fill in all required fields'); return; }
    if (new Date(endDate) < new Date(startDate)) { alert('End date must be after start date'); return; }
    setIsSubmitting(true);
    const success = await onSave({ title, startDate, endDate, description });
    setIsSubmitting(false);
    if (success) { resetForm(); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden animate-scaleIn"
        style={{ boxShadow: '0 24px 60px rgba(44,24,16,0.22), 0 8px 24px rgba(44,24,16,0.12)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] text-lg font-bold text-white">Create New Week</h2>
              <p className="text-xs text-white/65 mt-0.5">Plan your learning journey</p>
            </div>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5" style={{ background: '#fdfaf6' }}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7a6858] mb-2">Week Title <span className="text-red-500">*</span></label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Week 1 — React Fundamentals"
              className="w-full px-4 py-3 rounded-xl text-sm text-[#1e1208] placeholder-[#9a8878] transition-all duration-200 field-focus"
              style={{ background: '#fff', border: '1.5px solid #ddd0bc' }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7a6858] mb-2">Start Date <span className="text-red-500">*</span></label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-[#1e1208] transition-all duration-200 field-focus"
                style={{ background: '#fff', border: '1.5px solid #ddd0bc' }} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7a6858] mb-2">End Date <span className="text-red-500">*</span></label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-[#1e1208] transition-all duration-200 field-focus"
                style={{ background: '#fff', border: '1.5px solid #ddd0bc' }} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7a6858] mb-2">
              Description <span className="text-[#9a8878] font-normal normal-case">(optional)</span>
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Brief overview of this week's focus and goals…" rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm text-[#1e1208] placeholder-[#9a8878] resize-none transition-all duration-200 field-focus"
              style={{ background: '#fff', border: '1.5px solid #ddd0bc' }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4"
          style={{ background: '#f5ede3', borderTop: '1px solid #ddd0bc' }}>
          <button onClick={handleClose} disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#4a3728] hover:bg-[#ddd0bc] transition-all duration-200 disabled:opacity-50"
            style={{ border: '1.5px solid #ddd0bc', background: 'transparent' }}>
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={handleSave} disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 10px rgba(171,110,71,0.30)' }}>
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : 'Create Week'}
          </button>
        </div>
      </div>
    </div>
  );
}
