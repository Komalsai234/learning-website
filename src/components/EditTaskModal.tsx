import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Task } from '@/types';
import { getDayOfWeek } from '@/utils/dateUtils';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: () => void;
  task: Task | null;
}

export function EditTaskModal({ isOpen, onClose, onSave, onDelete, task }: EditTaskModalProps) {
  const [date, setDate] = useState('');
  const [studyTime, setStudyTime] = useState('');
  const [description, setDescription] = useState('');
  const [isHoliday, setIsHoliday] = useState(false);
  const [hasMeet, setHasMeet] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setDate(task.date);
      setStudyTime(task.studyTime || '');
      setDescription(task.task || '');
      setIsHoliday(task.isHoliday || false);
      setHasMeet(task.hasMeet || false);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    if (!date) {
      alert('Please select a date');
      return;
    }

    if (!isHoliday) {
      if (!studyTime) {
        alert('Please select study duration');
        return;
      }
      if (!description) {
        alert('Please enter task description');
        return;
      }
    }

    const autoDay = getDayOfWeek(date);

    const updatedTask: Task = {
      ...task,
      date,
      day: autoDay,
      studyTime,
      task: description,
      isHoliday,
      hasMeet,
      status: isHoliday ? 'holiday' : task.status
    };

    onSave(updatedTask);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete();
    }
  };

  // Format display for date input (shows dd/mm/yy)
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#faf7f2] rounded-3xl w-full max-w-xl shadow-2xl animate-[slideInDown_0.4s_cubic-bezier(0.4,0,0.2,1)] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#ab6e47] to-[#9b6b4f] px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Edit Task</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-all duration-300 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            <div>
              <Label htmlFor="editTaskDate" className="text-sm font-semibold text-[#2c1810] mb-2 block">
                Date
                {date && (
                  <span className="ml-2 text-xs text-purple-600 font-normal">
                    ({formatDateDisplay(date)})
                  </span>
                )}
              </Label>
              <Input
                id="editTaskDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:ring-[#ab6e47]/20 bg-white"
              />
            </div>

            {!isHoliday && (
              <>
                <div>
                  <Label htmlFor="editTaskStudyTime" className="text-sm font-semibold text-[#2c1810] mb-2 block">
                    Study Duration
                  </Label>
                  <select
                    id="editTaskStudyTime"
                    value={studyTime}
                    onChange={(e) => setStudyTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:ring-[#ab6e47]/20 bg-white text-[#2c1810]"
                  >
                    <option value="">Select study duration</option>
                    <option value="20">20 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="50">50 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1 hour 30 minutes</option>
                    <option value="120">2 hours</option>
                    <option value="150">2 hours 30 minutes</option>
                    <option value="180">3 hours</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="editTaskDescription" className="text-sm font-semibold text-[#2c1810] mb-2 block">
                    Task Description
                  </Label>
                  <Textarea
                    id="editTaskDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you will be learning or working on during this session"
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:ring-[#ab6e47]/20 bg-white resize-none"
                  />
                </div>
              </>
            )}

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="editTaskIsHoliday"
                  checked={isHoliday}
                  onCheckedChange={(checked) => setIsHoliday(checked as boolean)}
                  className="w-5 h-5 border-2 border-[#d9cfc1] data-[state=checked]:bg-[#ab6e47] data-[state=checked]:border-[#ab6e47]"
                />
                <Label htmlFor="editTaskIsHoliday" className="text-sm font-medium text-[#2c1810] cursor-pointer">
                  Mark this day as a holiday
                </Label>
              </div>

              {!isHoliday && (
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="editTaskHasMeet"
                    checked={hasMeet}
                    onCheckedChange={(checked) => setHasMeet(checked as boolean)}
                    className="w-5 h-5 border-2 border-[#d9cfc1] data-[state=checked]:bg-[#ab6e47] data-[state=checked]:border-[#ab6e47]"
                  />
                  <Label htmlFor="editTaskHasMeet" className="text-sm font-medium text-[#2c1810] cursor-pointer">
                    Has Google Meet
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#ece4da] border-t border-[#d9cfc1] flex justify-between items-center">
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="px-6 py-2 border-2 border-[#d9cfc1] text-[#5c4a3a] hover:bg-[#d9cfc1] hover:text-[#2c1810] font-semibold rounded-xl transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-[#ab6e47] to-[#8b5a3c] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}