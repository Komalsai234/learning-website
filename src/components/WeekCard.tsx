import { Eye, Trash2 } from 'lucide-react';
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

  return (
    <div className="bg-[#faf7f2] rounded-xl border border-[#d9cfc1] shadow-md p-6 mb-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 pb-4 border-b border-[#e5dccf]">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#2c1810] mb-1">{week.title}</h2>
          <div className="text-base text-[#5c4a3a] font-medium">{week.dates}</div>
          {week.description && (
            <p className="text-sm text-[#8c7a6a] leading-relaxed mt-1">{week.description}</p>
          )}
        </div>
        <div className="flex gap-3 flex-shrink-0 items-center">
          <button
            onClick={() => onViewTasks(weekIndex)}
            className="inline-flex items-center gap-2 bg-[#ab6e47] hover:bg-[#8b5a3c] text-white font-semibold px-5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-sm shadow-sm"
          >
            <Eye className="w-4 h-4" />
            View Tasks
          </button>
          <button
            onClick={() => onDeleteWeek(weekIndex)}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 text-sm shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete Week
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Completed', value: completed },
          { label: 'Pending', value: pending },
          { label: 'Holidays', value: totalHolidays },
          { label: 'Total Tasks', value: tasks.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#f4ede4] rounded-xl py-4 px-2 text-center border border-[#e5dccf]">
            <div className="text-3xl font-bold text-[#ab6e47] mb-1">{value}</div>
            <div className="text-xs text-[#8c7a6a] uppercase tracking-wider font-semibold">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}