import { Edit2, Video, Clock, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
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

  let displayDate = task.date;
  if (task.date && task.date.includes('-')) {
    const d = new Date(task.date);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    displayDate = `${months[d.getMonth()]} ${d.getDate()}`;
  }

  const studyMinutes = parseInt(task.studyTime) || 0;
  const displayTime =
    studyMinutes >= 60
      ? studyMinutes % 60
        ? `${Math.floor(studyMinutes / 60)}h ${studyMinutes % 60}m`
        : `${Math.floor(studyMinutes / 60)}h`
      : `${studyMinutes}m`;

  const resources = task.resources || (task.resource ? [{ url: task.resource, label: 'Resource' }] : []);

  if (isHoliday) {
    return (
      <div className="bg-gradient-to-br from-amber-100/50 to-orange-100/50 rounded-2xl p-6 border-2 border-dashed border-amber-400 shadow-md animate-fadeInUp relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4 pb-4 border-b border-amber-200/50">
          <div>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-[#ab6e47] to-[#9b6b4f] bg-clip-text text-transparent">{displayDate}</div>
            <div className="text-sm text-[#8c7a6a] uppercase tracking-wider font-semibold mt-1">{task.day}</div>
          </div>
          <button
            onClick={() => onEdit(weekIndex, taskIndex)}
            className="inline-flex items-center justify-center p-2 bg-[#e5dccf] hover:bg-[#ab6e47] text-[#5c4a3a] hover:text-white rounded-xl transition-all duration-200 border border-[#d9cfc1] hover:border-[#ab6e47]"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-bold text-lg shadow-sm">
          <span>🏖️</span><span>Holiday</span>
        </div>
      </div>
    );
  }

  const statusConfig: Record<'todo' | 'completed', { icon: typeof Circle; text: string; className: string }> = {
    todo: {
      icon: Circle,
      text: 'To Do',
      className: 'bg-gradient-to-r from-[#c28659] to-[#ab6e47] border-[#c28659] hover:from-[#ab6e47] hover:to-[#8b5a3c]',
    },
    completed: {
      icon: CheckCircle2,
      text: 'Completed',
      className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400 hover:from-emerald-600 hover:to-emerald-700',
    },
  };

  const status: 'todo' | 'completed' = task.status === 'completed' ? 'completed' : 'todo';
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={[
      'bg-[#faf7f2] rounded-2xl p-6 border border-[#d9cfc1] shadow-md animate-fadeInUp relative overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl',
      task.status === 'completed' ? 'opacity-80' : '',
      isWeekend ? 'bg-gradient-to-br from-rose-50/50 to-purple-50/50 border-rose-200' : '',
    ].join(' ')}>

      <div className="flex justify-between items-start mb-4 pb-4 border-b border-[#e5dccf]">
        <div className="flex-1">
          <div className="text-2xl font-extrabold bg-gradient-to-r from-[#ab6e47] to-[#9b6b4f] bg-clip-text text-transparent">
            {displayDate}
          </div>
          <div className="text-sm text-[#8c7a6a] uppercase tracking-wider font-semibold mt-1">
            {task.day}
          </div>

          {/* Meet + Resource icons side by side */}
          {(task.hasMeet || resources.length > 0) && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {task.hasMeet && (
                task.meetLink
                  ? <a href={task.meetLink} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 hover:scale-105">
                      <Video className="w-3 h-3" /> Meet
                    </a>
                  : <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-sm">
                      <Video className="w-3 h-3" /> Meet
                    </span>
              )}
              {resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  title={r.label || r.url}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 hover:scale-105">
                  <ExternalLink className="w-3 h-3" />
                  {r.label || 'Resource'}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className={[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r shadow-sm',
            isWeekend ? 'from-amber-600 to-amber-700' : 'from-[#ab6e47] to-[#8b5a3c]',
          ].join(' ')}>
            <Clock className="w-3.5 h-3.5" />{displayTime}
          </div>
          <button
            onClick={() => onEdit(weekIndex, taskIndex)}
            className="inline-flex items-center justify-center p-2 bg-[#e5dccf] hover:bg-[#ab6e47] text-[#5c4a3a] hover:text-white rounded-xl transition-all duration-200 border border-[#d9cfc1] hover:border-[#ab6e47]"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4 min-h-[70px]">
        <p className="text-base text-[#2c1810] leading-relaxed font-medium">{task.task || ''}</p>
      </div>

      <button
        onClick={() => onChangeStatus(weekIndex, taskIndex)}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm uppercase tracking-wider border-2 transition-all duration-300 hover:-translate-y-1 inline-flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:shadow-md text-white ${config.className}`}
      >
        <StatusIcon className="w-5 h-5" /><span>{config.text}</span>
      </button>
    </div>
  );
}