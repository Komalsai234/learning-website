import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

  const handleSave = async () => {
    if (!title || !startDate || !endDate) {
      alert('Please fill in all required fields (Title, Start Date, End Date)');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      alert('End date must be after start date');
      return;
    }

    setIsSubmitting(true);
    
    const success = await onSave({
      title,
      startDate,
      endDate,
      description
    });
    
    setIsSubmitting(false);
    
    if (success) {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setTitle('');
    setStartDate('');
    setEndDate('');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease]"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#faf7f2] rounded-3xl w-full max-w-xl shadow-2xl animate-[slideInDown_0.4s_cubic-bezier(0.4,0,0.2,1)] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#ab6e47] to-[#9b6b4f] px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Create New Week</h2>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div>
              <Label htmlFor="weekTitle" className="text-sm font-semibold text-[#2c1810] mb-2 block">
                Week Title
              </Label>
              <Input
                id="weekTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter the title for this learning week"
                className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:ring-[#ab6e47]/20 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weekStartDate" className="text-sm font-semibold text-[#2c1810] mb-2 block">
                  Start Date
                </Label>
                <Input
                  id="weekStartDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:ring-[#ab6e47]/20 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="weekEndDate" className="text-sm font-semibold text-[#2c1810] mb-2 block">
                  End Date
                </Label>
                <Input
                  id="weekEndDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:ring-[#ab6e47]/20 bg-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="weekDescription" className="text-sm font-semibold text-[#2c1810] mb-2 block">
                Description (Optional)
              </Label>
              <Textarea
                id="weekDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this week's focus and goals"
                rows={3}
                className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:ring-[#ab6e47]/20 bg-white resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#ece4da] border-t border-[#d9cfc1] flex justify-end gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="px-6 py-2 border-2 border-[#d9cfc1] text-[#5c4a3a] hover:bg-[#d9cfc1] hover:text-[#2c1810] font-semibold rounded-xl transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-[#ab6e47] to-[#8b5a3c] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              Create Week
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}