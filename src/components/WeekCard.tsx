import { Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Week } from '@/types';

interface WeekCardProps {
  week: Week;
  weekIndex: number;
  onViewTasks: (weekIndex: number) => void;
  onDeleteWeek: (weekIndex: number) => void;
}

export function WeekCard({ week, weekIndex, onViewTasks, onDeleteWeek }: WeekCardProps) {
  const tasks = week.tasks || [];
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'todo').length;
  const totalHolidays = tasks.filter(t => t.isHoliday || t.status === 'holiday').length;
  
  // Weekend holidays count
  const weekendHolidays = tasks.filter(t => {
    const isHoliday = t.isHoliday || t.status === 'holiday';
    const day = t.day;
    return isHoliday && ['Saturday', 'Sunday'].includes(day);
  }).length;

  return (
    <div className="bg-[#faf7f2] rounded-xl border border-[#d9cfc1] shadow-md p-6 mb-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 pb-4 border-b border-[#e5dccf]">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#2c1810] mb-2">{week.title}</h2>
          <div className="text-base text-[#5c4a3a] font-medium mb-2">{week.dates}</div>
          {week.description && (
            <p className="text-sm text-[#8c7a6a] leading-relaxed">{week.description}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => onViewTasks(weekIndex)}
            className="bg-[#ab6e47] hover:bg-[#8b5a3c] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Tasks
          </Button>
          <Button
            onClick={() => onDeleteWeek(weekIndex)}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Week
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#faf7f2] rounded-xl p-4 text-center border border-[#e5dccf]">
          <div className="text-3xl font-bold text-[#ab6e47] mb-1">{completed}</div>
          <div className="text-xs text-[#8c7a6a] uppercase tracking-wider font-semibold">Completed</div>
        </div>
        <div className="bg-[#faf7f2] rounded-xl p-4 text-center border border-[#e5dccf]">
          <div className="text-3xl font-bold text-[#ab6e47] mb-1">{pending}</div>
          <div className="text-xs text-[#8c7a6a] uppercase tracking-wider font-semibold">Pending</div>
        </div>
        <div className="bg-[#faf7f2] rounded-xl p-4 text-center border border-[#e5dccf]">
          <div className="text-3xl font-bold text-[#ab6e47] mb-1">{totalHolidays}</div>
          <div className="text-xs text-[#8c7a6a] uppercase tracking-wider font-semibold">Holidays</div>
          {weekendHolidays > 0 && (
            <div className="text-[10px] text-[#8c7a6a] mt-1">
              {weekendHolidays} weekend{weekendHolidays !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="bg-[#faf7f2] rounded-xl p-4 text-center border border-[#e5dccf]">
          <div className="text-3xl font-bold text-[#ab6e47] mb-1">{tasks.length}</div>
          <div className="text-xs text-[#8c7a6a] uppercase tracking-wider font-semibold">Total Tasks</div>
        </div>
      </div>
    </div>
  );
}