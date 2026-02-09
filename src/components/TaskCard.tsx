import { Edit2, Video, Clock, CheckCircle2, Circle } from 'lucide-react';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  weekIndex: number;
  taskIndex: number;
  onEdit: (weekIndex: number, taskIndex: number) => void;
  onChangeStatus: (weekIndex: number, taskIndex: number) => void;
}

export function TaskCard({ task, weekIndex, taskIndex, onEdit, onChangeStatus }: TaskCardProps) {
  const isWeekend = task.day === 'Saturday' || task.day === 'Sunday';
  const isHoliday = task.isHoliday || false;

  // Format date to "Feb 12"
  let displayDate = task.date;
  if (task.date && task.date.includes('-')) {
    const dateObj = new Date(task.date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[dateObj.getMonth()];
    const day = dateObj.getDate();
    displayDate = `${month} ${day}`;
  }

  // Format study time
  const studyMinutes = parseInt(task.studyTime) || 0;
  let displayTime = '';
  if (studyMinutes >= 60) {
    const hours = Math.floor(studyMinutes / 60);
    const mins = studyMinutes % 60;
    displayTime = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    displayTime = `${studyMinutes}m`;
  }

  // Status display with theme-matched colors and icons
  const statusConfig = {
    todo: {
      icon: Circle,
      text: 'To Do',
      bgClass: 'bg-gradient-to-r from-[#c28659] to-[#ab6e47]',
      borderClass: 'border-[#c28659]',
      textClass: 'text-white',
      hoverClass: 'hover:from-[#ab6e47] hover:to-[#8b5a3c]',
      shadowClass: 'shadow-[#ab6e47]/30'
    },
    completed: {
      icon: CheckCircle2,
      text: 'Completed',
      bgClass: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      borderClass: 'border-emerald-400',
      textClass: 'text-white',
      hoverClass: 'hover:from-emerald-600 hover:to-emerald-700',
      shadowClass: 'shadow-emerald-500/30'
    }
  };

  const status = task.status === 'holiday' ? 'todo' : task.status;
  const config = statusConfig[status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  if (isHoliday) {
    return (
      <div className="bg-gradient-to-br from-amber-100/50 to-orange-100/50 rounded-2xl p-6 border-2 border-dashed border-amber-400 shadow-md animate-fadeInUp relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-amber-200/50">
          <div>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-[#ab6e47] to-[#9b6b4f] bg-clip-text text-transparent">
              {displayDate}
            </div>
            <div className="text-sm text-[#8c7a6a] uppercase tracking-wider font-semibold mt-1">
              {task.day}
            </div>
          </div>
          <button
            onClick={() => onEdit(weekIndex, taskIndex)}
            className="p-2 bg-[#e5dccf] hover:bg-[#ab6e47] text-[#5c4a3a] hover:text-white rounded-lg transition-all duration-200 border border-[#d9cfc1] hover:border-[#ab6e47]"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-bold text-lg shadow-md">
          <span className="text-xl">🏖️</span>
          <span>Holiday</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#faf7f2] rounded-2xl p-6 border border-[#d9cfc1] shadow-md animate-fadeInUp relative overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${task.status === 'completed' ? 'opacity-80' : ''} ${isWeekend ? 'bg-gradient-to-br from-rose-50/50 to-purple-50/50 border-rose-200' : ''}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ab6e47] to-[#c28659] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
      
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-[#e5dccf]">
        <div className="flex-1">
          <div className="text-2xl font-extrabold bg-gradient-to-r from-[#ab6e47] to-[#9b6b4f] bg-clip-text text-transparent">
            {displayDate}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-[#8c7a6a] uppercase tracking-wider font-semibold">
              {task.day}
            </span>
            {task.hasMeet && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full shadow-md">
                <Video className="w-3 h-3" />
                Meet
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-full text-sm font-bold text-white bg-gradient-to-r ${isWeekend ? 'from-amber-600 to-amber-700' : 'from-[#ab6e47] to-[#8b5a3c]'} shadow-md flex items-center gap-1.5`}>
            <Clock className="w-3.5 h-3.5" />
            {displayTime}
          </div>
          <button
            onClick={() => onEdit(weekIndex, taskIndex)}
            className="p-2 bg-[#e5dccf] hover:bg-[#ab6e47] text-[#5c4a3a] hover:text-white rounded-lg transition-all duration-200 border border-[#d9cfc1] hover:border-[#ab6e47]"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4 min-h-[70px]">
        <p className="text-base text-[#2c1810] leading-relaxed font-medium">{task.task || ''}</p>
      </div>

      {/* Beautiful Status Button - Theme Matched with Icon */}
      <button
        onClick={() => onChangeStatus(weekIndex, taskIndex)}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm uppercase tracking-wider border-2 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2.5 cursor-pointer shadow-md hover:shadow-lg ${config.bgClass} ${config.borderClass} ${config.textClass} ${config.hoverClass} ${config.shadowClass}`}
        title="Click to change status"
      >
        <StatusIcon className="w-5 h-5" />
        <span>{config.text}</span>
      </button>
    </div>
  );
}