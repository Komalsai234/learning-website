import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Layers, MoreVertical, FileUp, Trash2 } from 'lucide-react';
import type { Project } from '@/types';

function CardMenu({ btnRef, isOpen, onClose, onModify, onDelete }: {
  btnRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
  onModify: () => void;
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
      if (!btnRef.current?.contains(e.target as Node) && !menuRef.current?.contains(e.target as Node))
        onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen, btnRef, onClose]);

  if (!isOpen) return null;
  return createPortal(
    <div ref={menuRef} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, background: '#fdfaf6', border: '1px solid #ddd0bc', boxShadow: '0 4px 16px rgba(44,24,16,0.12)', borderRadius: '12px', overflow: 'hidden', minWidth: '160px' }}>
      <button onClick={() => { onModify(); onClose(); }}
        className="w-full inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[#f0e6da]"
        style={{ color: '#4a3728' }}>
        <FileUp className="w-4 h-4" /> Replace File
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

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onModify: (projectId: number, content: string) => void;
  onDelete: (projectId: number) => void;
}

export function ProjectCard({ project, onView, onModify, onDelete }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onModify(project.id, ev.target?.result as string ?? '');
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="animate-fadeInUp relative rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #fdfaf6 0%, #faf5ee 100%)',
        border: '1px solid #ddd0bc',
        boxShadow: '0 2px 12px rgba(44,24,16,0.07)',
        minHeight: '160px',
      }}
      onClick={() => onView(project)}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, transparent, #ab6e47, transparent)' }} />

      <div className="p-6 flex-1 flex flex-col gap-4">
        {/* Icon + name + menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 8px rgba(139,90,60,0.28)' }}>
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#1e1208] leading-tight truncate">
              {project.name}
            </h3>
          </div>

          <button
            ref={menuBtnRef}
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{ background: 'rgba(171,110,71,0.10)', color: '#7a6858' }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <CardMenu
            btnRef={menuBtnRef}
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onModify={() => fileRef.current?.click()}
            onDelete={() => onDelete(project.id)}
          />
        </div>

        <div className="flex-1" />

        <div className="pt-3 border-t border-[#e8ddd0] flex justify-end">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(171,110,71,0.10)', color: '#8b5a3c' }}>
            View Details →
          </span>
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".md,text/markdown" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
