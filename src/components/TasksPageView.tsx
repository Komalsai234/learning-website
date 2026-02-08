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
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-[#faf7f2] to-[#f4ede4] border-b border-[#d9cfc1] shadow-lg">
        {/* Back Button Bar */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 border-b border-[#e5dccf]">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={onClose}
              className="group flex items-center gap-2 text-[#5c4a3a] hover:text-[#ab6e47] font-semibold transition-all duration-200"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#e5dccf] group-hover:bg-[#ab6e47] text-[#5c4a3a] group-hover:text-white transition-all duration-200 shadow-sm">
                <ChevronLeft className="w-5 h-5" />
              </span>
              <span className="group-hover:translate-x-1 transition-transform duration-200">Back to Weekly List</span>
            </button>
          </div>
        </div>
        
        {/* Title Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-[#2c1810] mb-1">{week.title}</h1>
            <p className="text-base text-[#5c4a3a] font-medium">{week.dates}</p>
            {week.description && (
              <p className="mt-2 text-[#8c7a6a] max-w-2xl">{week.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {week.tasks.length === 0 ? (
            <div className="text-center py-20 bg-white/40 rounded-3xl border border-[#d9cfc1]/50">
              <div className="text-7xl mb-6">📝</div>
              <h2 className="text-2xl font-bold text-[#2c1810] mb-3">No Tasks Yet</h2>
              <p className="text-lg text-[#5c4a3a] mb-6">Start adding tasks to plan your week!</p>
              <button
                onClick={() => onAddTask(weekIndex)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ab6e47] to-[#8b5a3c] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Add Your First Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
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
      </div>

      {/* Floating Add Button */}
      {week.tasks.length > 0 && (
        <button
          onClick={() => onAddTask(weekIndex)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-[#ab6e47] to-[#8b5a3c] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-90 flex items-center justify-center z-50"
        >
          <Plus className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}
