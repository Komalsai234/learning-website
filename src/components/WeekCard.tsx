import { useState, useRef, useEffect } from 'react';
import { Eye, Trash2, MoreVertical } from 'lucide-react';

import type { Week } from '@/types';

interface WeekCardProps {
  week: Week;
  weekIndex: number;
  onViewTasks: (weekIndex: number) => void;
  onDeleteWeek: (weekIndex: number) => void;
}

export function WeekCard({ week, weekIndex, onViewTasks, onDeleteWeek }: WeekCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);
  const tasks = week.tasks || [];
  const totalDays = tasks.length;
  const nonHolidayTasks = tasks.filter(t => !t.isHoliday && t.status !== 'holiday');
  const totalTasks = nonHolidayTasks.length;
  const completed = nonHolidayTasks.filter(t => t.status === 'completed').length;
  const pending = nonHolidayTasks.filter(t => t.status === 'todo').length;

  const stats = [
    { label: 'Total Days',  value: totalDays },
    { label: 'Total Tasks', value: totalTasks },
    { label: 'Completed',   value: completed },
    { label: 'Pending',     value: pending },
  ];

  return (
    <div className="animate-fadeInUp relative rounded-2xl transition-all duration-300 hover:shadow-lg"
      style={{
        background: 'linear-gradient(160deg, #fdfaf6 0%, #faf5ee 100%)',
        border: '1px solid #ddd0bc',
        boxShadow: '0 2px 12px rgba(44,24,16,0.07), 0 1px 3px rgba(44,24,16,0.04)',
      }}>

      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: 'linear-gradient(180deg, #c28659, #8b5a3c)' }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-4 border-b border-[#e8ddd0]">
          <div className="flex-1 min-w-0">
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#1e1208] leading-tight">
              {week.title}
            </h2>
            <div className="text-base text-[#7a6858] font-medium mt-1">{week.dates}</div>
            {week.description && (
              <p className="text-sm text-[#7a6858] leading-relaxed mt-1">{week.description}</p>
            )}
          </div>

          <div className="flex gap-3 flex-shrink-0 items-center">
            <button
              onClick={() => onViewTasks(weekIndex)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 10px rgba(171,110,71,0.30)' }}
            >
              <Eye className="w-4 h-4" />
              View Tasks
            </button>

            <div ref={menuRef} className="relative">
              <button onClick={() => setMenuOpen(v => !v)}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:bg-[#f0e6da] active:scale-95"
                style={{ color: '#8b5a3c', border: '1.5px solid rgba(171,110,71,0.25)' }}>
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute left-0 top-full mt-1 z-50 rounded-xl overflow-hidden"
                  style={{ background: '#fdfaf6', border: '1px solid #ddd0bc', boxShadow: '0 4px 16px rgba(44,24,16,0.12)', minWidth: '140px' }}>
                  <button onClick={() => { onDeleteWeek(weekIndex); setMenuOpen(false); }}
                    className="w-full inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-150 hover:bg-red-50"
                    style={{ color: '#e53e3e' }}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ label, value }) => (
            <div key={label}
              className="rounded-xl py-4 px-2 text-center border border-[#e8ddd0]"
              style={{ background: '#f5ede3' }}>
              <div className="text-3xl font-bold text-[#ab6e47] mb-1">{value}</div>
              <div className="text-xs text-[#8c7a6a] uppercase tracking-wider font-semibold">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
