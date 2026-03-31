import { Plus, ChevronLeft } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Week } from '@/types';

interface TasksPageViewProps {
  week: Week;
  weekIndex: number;
  onClose: () => void;
  onAddTask: (weekIndex: number) => void;
  onEditTask: (weekIndex: number, taskIndex: number) => void;
  onChangeStatus: (weekIndex: number, taskIndex: number) => void;
}

export function TasksPageView({ week, weekIndex, onClose, onAddTask, onEditTask, onChangeStatus }: TasksPageViewProps) {
  return (
    <div className="fixed inset-0 bg-[#f4ede4] z-40 overflow-y-auto">

      {/* Sticky header */}
      <div
        className="sticky top-0 z-50 border-b border-[#d9cfc1]/60"
        style={{
          background: 'rgba(244, 237, 228, 0.96)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 1px 16px rgba(44,24,16,0.06)',
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ab6e47]/50 to-transparent" />

        {/* Back button row */}
        <div className="w-full px-6 sm:px-10 lg:px-16 py-3 border-b border-[#e5dccf]/60">
          <button
            onClick={onClose}
            className="group flex items-center gap-2 text-[#5c4a3a] hover:text-[#ab6e47] font-semibold transition-all duration-200"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 group-hover:text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #ece4da, #e0d4c8)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #ab6e47, #8b5a3c)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #ece4da, #e0d4c8)')}
            >
              <ChevronLeft className="w-4 h-4" />
            </span>
            <span className="group-hover:translate-x-1 transition-transform duration-200 text-sm">
              Back to Weekly List
            </span>
          </button>
        </div>

        {/* Week title row */}
        <div className="w-full px-6 sm:px-10 lg:px-16 py-4">
          <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#2c1810] mb-0.5">
            {week.title}
          </h1>
          <p className="text-sm text-[#8c7a6a] font-medium">{week.dates}</p>
          {week.description && (
            <p className="mt-1.5 text-sm text-[#8c7a6a] max-w-2xl">{week.description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-6 sm:px-10 lg:px-16 py-8">
        {week.tasks.length === 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-2xl border border-[#d9cfc1]/50 max-w-lg mx-auto">
            <div className="text-7xl mb-6">📝</div>
            <h2 className="text-2xl font-bold text-[#2c1810] mb-3">No Tasks Yet</h2>
            <p className="text-lg text-[#5c4a3a] mb-6">Start adding tasks to plan your week!</p>
            <button
              onClick={() => onAddTask(weekIndex)}
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)' }}
            >
              <Plus className="w-5 h-5" /> Add Your First Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
            {week.tasks.map((task, taskIndex) => (
              <TaskCard
                key={taskIndex}
                task={task}
                weekIndex={weekIndex}
                taskIndex={taskIndex}
                onEdit={onEditTask}
                onChangeStatus={onChangeStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {week.tasks.length > 0 && (
        <button
          onClick={() => onAddTask(weekIndex)}
          className="fixed bottom-8 right-8 w-14 h-14 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-90 flex items-center justify-center z-50"
          style={{
            background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)',
            boxShadow: '0 4px 20px rgba(171,110,71,0.4)',
          }}
        >
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  );
}