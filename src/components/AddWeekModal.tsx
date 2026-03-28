import { useState } from 'react';
import { X, Save } from 'lucide-react';

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
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#faf7f2] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-[slideInDown_0.4s_cubic-bezier(0.4,0,0.2,1)]">
          <div className="bg-gradient-to-r from-[#ab6e47] to-[#9b6b4f] px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Create New Week</h2>
            <button onClick={handleClose}
              className="inline-flex items-center justify-center w-9 h-9 text-white hover:bg-white/20 rounded-xl transition-all duration-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="text-sm font-semibold text-[#2c1810] mb-2 block">Week Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Enter the title for this learning week"
                className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:outline-none bg-white text-[#2c1810]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-[#2c1810] mb-2 block">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:outline-none bg-white text-[#2c1810]" />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#2c1810] mb-2 block">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:outline-none bg-white text-[#2c1810]" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#2c1810] mb-2 block">
                Description <span className="text-[#8c7a6a] font-normal">(optional)</span>
              </label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of this week's focus and goals" rows={3}
                className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:outline-none bg-white text-[#2c1810] resize-none" />
            </div>
          </div>
          <div className="px-6 py-4 bg-[#ece4da] border-t border-[#d9cfc1] flex justify-end gap-3">
            <button onClick={handleClose} disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 border-2 border-[#d9cfc1] text-[#5c4a3a] hover:bg-[#d9cfc1] font-semibold rounded-xl transition-all duration-200 bg-transparent disabled:opacity-50">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave} disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#ab6e47] hover:bg-[#8b5a3c] text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <Save className="w-4 h-4" /> {isSubmitting ? 'Creating...' : 'Create Week'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}