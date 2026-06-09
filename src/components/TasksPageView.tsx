import { Plus, ChevronLeft } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { Week, Task } from '@/types';

interface TasksPageViewProps {
  week: Week;
  weekIndex: number;
  onClose: () => void;
  onAddTask: (weekIndex: number) => void;
  onEditTask: (weekIndex: number, taskIndex: number) => void;
  onUpdateTask: (weekIndex: number, taskIndex: number, updated: Task) => void;
  onDeleteTask: (weekIndex: number, taskIndex: number) => void;
}

export function TasksPageView({ week, weekIndex, onClose, onAddTask, onEditTask, onUpdateTask, onDeleteTask }: TasksPageViewProps) {
  const sortedTasks = (week.tasks || [])
    .map((task, originalIndex) => ({ task, originalIndex }))
    .sort((a, b) => {
      if (!a.task.date) return 1;
      if (!b.task.date) return -1;
      return a.task.date.localeCompare(b.task.date);
    });


  return (
    <div className="fixed inset-0 z-40 overflow-y-auto" style={{ background: '#f5ede3' }}>

      {/* Sticky header */}
      <div className="sticky top-0 z-50"
        style={{
          background: 'rgba(245,237,227,0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(221,208,188,0.60)',
          boxShadow: '0 2px 20px rgba(44,24,16,0.07)',
        }}>

        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(171,110,71,0.50), transparent)' }} />

        <div className="w-full px-5 sm:px-10 lg:px-16">
          {/* Back button */}
          <div className="py-3 border-b border-[#e8ddd0]/60">
            <button onClick={onClose}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#4a3728] hover:text-[#ab6e47] transition-colors duration-200">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:bg-[#ab6e47] group-hover:text-white"
                style={{ background: 'linear-gradient(135deg, #ede4d8, #e4d8c8)', color: '#4a3728' }}>
                <ChevronLeft className="w-4 h-4" />
              </span>
              Back to Weekly List
            </button>
          </div>

          {/* Week info + mini stats */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#1e1208] leading-tight">
                {week.title}
              </h1>
              <p className="text-sm text-[#7a6858] font-medium mt-0.5">{week.dates}</p>
              {week.description && (
                <p className="text-sm text-[#7a6858] mt-1 max-w-xl">{week.description}</p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-5 sm:px-10 lg:px-16 py-8">
        {sortedTasks.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20 rounded-2xl border"
            style={{ background: 'rgba(253,250,246,0.70)', border: '1px solid #ddd0bc' }}>
            <div className="text-6xl mb-5">📝</div>
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#1e1208] mb-2">No Tasks Yet</h2>
            <p className="text-[#7a6858] mb-6">Start adding tasks to plan your week!</p>
            <button onClick={() => onAddTask(weekIndex)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 4px 16px rgba(171,110,71,0.30)' }}>
              <Plus className="w-5 h-5" /> Add Your First Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 pb-28">
            {sortedTasks.map(({ task, originalIndex }) => (
              <TaskCard key={originalIndex} task={task} weekIndex={weekIndex} taskIndex={originalIndex}
                onEdit={onEditTask} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {sortedTasks.length > 0 && (
        <button onClick={() => onAddTask(weekIndex)}
          className="fixed bottom-7 right-7 w-14 h-14 rounded-2xl text-white flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 hover:rotate-90 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)',
            boxShadow: '0 6px 24px rgba(171,110,71,0.42)',
          }}>
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
