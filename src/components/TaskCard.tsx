import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Video, CheckCircle2, Circle, ExternalLink, MoreVertical, Edit2, X, Clock, Trash2 } from 'lucide-react';

import type { Task } from '@/types';
import { VoiceNotePlayer } from './VoiceRecorder';

function CardMenu({ btnRef, isOpen, onClose, onEdit, onDelete }: {
  btnRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
  }, [isOpen, btnRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen, btnRef, onClose]);

  if (!isOpen) return null;
  return createPortal(
    <div ref={menuRef} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, background: '#fdfaf6', border: '1px solid #ddd0bc', boxShadow: '0 4px 16px rgba(44,24,16,0.12)', borderRadius: '12px', overflow: 'hidden', minWidth: '120px' }}>
      <button onClick={() => { onEdit(); onClose(); }}
        className="w-full inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[#f0e6da]"
        style={{ color: '#4a3728' }}>
        <Edit2 className="w-4 h-4" /> Edit
      </button>
      <div style={{ borderTop: '1px solid #e8ddd0' }} />
      <button onClick={() => { onDelete(); onClose(); }}
        className="w-full inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-50"
        style={{ color: '#dc2626' }}>
        <Trash2 className="w-4 h-4" /> Delete
      </button>
    </div>,
    document.body
  );
}

interface TaskCardProps {
  task: Task;
  weekIndex: number;
  taskIndex: number;
  onEdit: (weekIndex: number, taskIndex: number) => void;
  onUpdateTask: (weekIndex: number, taskIndex: number, updated: Task) => void;
  onDeleteTask: (weekIndex: number, taskIndex: number) => void;
}

function TaskDetailModal({ task, displayDate, displayTime, onClose }: {
  task: Task;
  displayDate: string;
  displayTime: string;
  onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden"
        style={{ background: '#fdfaf6', boxShadow: '0 32px 80px rgba(44,24,16,0.28)', border: '1px solid #ddd0bc', minHeight: '460px' }}
        onClick={e => e.stopPropagation()}>

        {/* Header: date left, time badge right */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-[#e8ddd0]"
          style={{ background: '#fdfaf6' }}>
          <div>
            <div className="font-['Playfair_Display'] text-3xl font-bold leading-none" style={{ color: '#1e1208' }}>{displayDate}</div>
            <div className="text-xs font-semibold uppercase tracking-widest mt-1.5" style={{ color: '#9a8878' }}>{task.day}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', color: '#fff', boxShadow: '0 2px 8px rgba(139,90,60,0.28)' }}>
              <Clock className="w-3.5 h-3.5" /> {displayTime}
            </span>
            <button onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#7a6858] hover:bg-[#ab6e47] hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-10 py-9 space-y-16">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8b5a3c' }}>
              Task Details
            </p>
            <div
              className="px-6 py-5 rounded-2xl text-base text-[#1e1208] leading-relaxed quiz-answer-preview"
              style={{ background: 'rgba(171,110,71,0.06)', border: '1.5px solid rgba(171,110,71,0.16)' }}
              dangerouslySetInnerHTML={{ __html: task.task || '' }}
            />
          </div>
          {(task.voiceNotes?.length || task.voiceNote) && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#8b5a3c' }}>
                Voice Message{(task.voiceNotes?.length ?? 0) > 1 ? 's' : ''}
              </p>
              <div className="space-y-2">
                {task.voiceNotes && task.voiceNotes.length > 0
                  ? task.voiceNotes.map((src, i) => <VoiceNotePlayer key={src} src={src} index={i} />)
                  : task.voiceNote ? <VoiceNotePlayer src={task.voiceNote} /> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function TaskCard({ task, weekIndex, taskIndex, onEdit, onUpdateTask, onDeleteTask }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const isWeekend = task.day === 'Saturday' || task.day === 'Sunday';
  const isHoliday = task.isHoliday || false;
  const isCompleted = task.status === 'completed';

  let displayDate = task.date;
  if (task.date?.includes('-')) {
    const d = new Date(task.date);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    displayDate = `${months[d.getMonth()]} ${d.getDate()}`;
  }

  const studyMinutes = parseInt(task.studyTime) || 0;
  const displayTime = studyMinutes >= 60
    ? studyMinutes % 60 ? `${Math.floor(studyMinutes / 60)}h ${studyMinutes % 60}m` : `${Math.floor(studyMinutes / 60)}h`
    : `${studyMinutes}m`;

  const resources = task.resources || (task.resource ? [{ url: task.resource, label: 'Resource' }] : []);

  const toggleStatus = () => {
    const next = isCompleted ? 'todo' : 'completed';
    onUpdateTask(weekIndex, taskIndex, { ...task, status: next });
  };

  // ── Holiday ──────────────────────────────────────────────────────
  if (isHoliday) {
    return (
      <div className="day-card animate-fadeInUp relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #c26b48 0%, #e8856a 50%, #f0a07a 100%)',
          boxShadow: '0 4px 20px rgba(194,107,72,0.32)',
          minHeight: '300px',
        }}>

        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.5)' }} />
        <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.5)' }} />

        <div className="relative px-6 pt-6 pb-6 flex flex-col gap-5">
          {/* Top row: date + ⋮ */}
          <div className="flex items-start justify-between">
            <div>
              <div className="font-['Playfair_Display'] text-2xl font-bold text-white leading-none">{displayDate}</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-white/70 mt-1">{task.day}</div>
            </div>
            <div className="relative">
              <button ref={menuBtnRef} onClick={() => setMenuOpen(v => !v)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/80 hover:bg-white/20 transition-all active:scale-95">
                <MoreVertical className="w-4 h-4" />
              </button>
              <CardMenu btnRef={menuBtnRef} isOpen={menuOpen} onClose={() => setMenuOpen(false)}
                onEdit={() => onEdit(weekIndex, taskIndex)}
                onDelete={() => onDeleteTask(weekIndex, taskIndex)} />
            </div>
          </div>

          {/* Center emoji */}

          <div className="flex justify-center py-2">
            <span className="text-5xl drop-shadow-sm select-none">🌴</span>
          </div>

          {/* Holiday badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.22)', color: '#fff', backdropFilter: 'blur(8px)' }}>
              Holiday
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Task card ────────────────────────────────────────────────────
  return (
    <>
      <div className="day-card animate-fadeInUp relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col"
        style={{
          background: isWeekend ? 'linear-gradient(160deg, #fdfaf6 0%, #fdf4ff 100%)' : 'linear-gradient(160deg, #fdfaf6 0%, #faf5ee 100%)',
          border: isWeekend ? '1px solid rgba(168,85,247,0.20)' : '1px solid #ddd0bc',
          boxShadow: isCompleted ? '0 2px 12px rgba(5,150,105,0.09)' : '0 2px 12px rgba(44,24,16,0.07)',
          opacity: isCompleted ? 0.90 : 1,
          minHeight: '300px',
        }}>

        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{
            background: isCompleted
              ? 'linear-gradient(90deg, transparent, #059669, transparent)'
              : isWeekend
              ? 'linear-gradient(90deg, transparent, #a855f7, transparent)'
              : 'linear-gradient(90deg, transparent, #ab6e47, transparent)',
          }} />

        <div className="px-8 pt-8 pb-8 flex-1 flex flex-col gap-5">

          {/* Header: date + day | [Meet] [Resource] [⋮] */}
          <div className="flex items-start justify-between pb-4 border-b border-[#e8ddd0]">
            <div>
              <div className="font-['Playfair_Display'] text-2xl font-bold text-[#1e1208] leading-none">{displayDate}</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#7a6858] mt-1">{task.day}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {task.hasMeet && (
                task.meetLink
                  ? <a href={task.meetLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white hover:scale-105 transition-transform"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', boxShadow: '0 1px 4px rgba(59,130,246,0.28)' }}>
                      <Video className="w-3 h-3" /> Meet
                    </a>
                  : <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                      <Video className="w-3 h-3" /> Meet
                    </span>
              )}
              {resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title={r.label || r.url}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 1px 4px rgba(139,92,246,0.28)' }}>
                  <ExternalLink className="w-3 h-3" /> {r.label || 'Resource'}
                </a>
              ))}
              <div className="relative">
                <button ref={menuBtnRef} onClick={() => setMenuOpen(v => !v)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7a6858] hover:bg-[#ab6e47] hover:text-white transition-all active:scale-95"
                  style={{ background: 'rgba(171,110,71,0.10)' }}>
                  <MoreVertical className="w-4 h-4" />
                </button>
                <CardMenu btnRef={menuBtnRef} isOpen={menuOpen} onClose={() => setMenuOpen(false)}
                  onEdit={() => onEdit(weekIndex, taskIndex)}
                  onDelete={() => onDeleteTask(weekIndex, taskIndex)} />
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* View Details */}
          <button onClick={() => setDetailOpen(true)}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            style={isWeekend
              ? { background: 'rgba(168,85,247,0.09)', color: '#7c3aed', border: '1.5px solid rgba(168,85,247,0.22)' }
              : { background: 'rgba(171,110,71,0.09)', color: '#8b5a3c', border: '1.5px solid rgba(171,110,71,0.22)' }}>
            View Task Details
          </button>

          {/* Status */}
          <button onClick={toggleStatus}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            style={isCompleted
              ? { background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 2px 10px rgba(5,150,105,0.25)' }
              : { background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 10px rgba(171,110,71,0.25)' }}>
            {isCompleted ? <><CheckCircle2 className="w-4 h-4" /> Completed</> : <><Circle className="w-4 h-4" /> Mark Complete</>}
          </button>
        </div>
      </div>

      {detailOpen && (
        <TaskDetailModal
          task={task}
          displayDate={displayDate}
          displayTime={displayTime}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  );
}
