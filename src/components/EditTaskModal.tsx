import { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Video, Edit3 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { VoiceRecorder } from './VoiceRecorder';
import type { Task, Resource } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task: Task | null;
}

const STUDY_OPTIONS = [
  { v: '30', l: '30 minutes' }, { v: '60', l: '1 hour' }, { v: '90', l: '1 h 30 m' },
  { v: '120', l: '2 hours' }, { v: '150', l: '2 h 30 m' }, { v: '180', l: '3 hours' },
];

const fieldCls = 'w-full px-4 py-3 rounded-xl text-sm text-[#1e1208] placeholder-[#9a8878] transition-all duration-200 field-focus';
const fieldStyle = { background: '#fff', border: '1.5px solid #ddd0bc' };
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-[#7a6858] mb-2';

export function EditTaskModal({ isOpen, onClose, onSave, task }: EditTaskModalProps) {
  const isMobile = useIsMobile();
  const [date, setDate] = useState('');
  const [studyTime, setStudyTime] = useState('');
  const [description, setDescription] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [voiceNote, setVoiceNote] = useState<string | undefined>(undefined);
  const [isHoliday, setIsHoliday] = useState(false);
  const [hasMeet, setHasMeet] = useState(false);
  const [meetLink, setMeetLink] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      setDate(task.date);
      setStudyTime(task.studyTime || '');
      setDescription(task.task || '');
      setIsHoliday(task.isHoliday || false);
      setHasMeet(task.hasMeet || false);
      setMeetLink(task.meetLink || '');
      setResources(task.resources || (task.resource ? [{ url: task.resource, label: 'Resource' }] : []));
      setVoiceNote(task.voiceNote);
    }
  }, [task, isOpen]);

  useEffect(() => {
    if (isOpen && isMobile) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isMobile]);

  if (!isOpen || !task) return null;

  const addResource = () => setResources(prev => [...prev, { url: '', label: '' }]);
  const updateResource = (i: number, field: keyof Resource, value: string) =>
    setResources(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  const removeResource = (i: number) => setResources(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!date) { alert('Please select a date'); return; }
    if (!isHoliday) {
      if (!studyTime) { alert('Please select study duration'); return; }
      if (!description || description.replace(/<[^>]+>/g, '').trim() === '') { alert('Please enter task description'); return; }
    }
    let finalMeetLink = meetLink.trim();
    if (finalMeetLink) {
      if (!/^https?:\/\//i.test(finalMeetLink)) finalMeetLink = 'https://' + finalMeetLink;
      try { new URL(finalMeetLink); } catch { alert('Please enter a valid Meet link URL'); return; }
    }
    const validResources = resources.filter(r => r.url.trim()).map(r => {
      let url = r.url.trim();
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      return { ...r, url };
    });
    for (const r of validResources) {
      try { new URL(r.url); } catch { alert(`Invalid URL: ${r.url}`); return; }
    }
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const updatedTask: Task = {
      ...task, date, day: dayNames[new Date(date).getDay()], studyTime, task: description,
      isHoliday, hasMeet,
      meetLink: hasMeet && finalMeetLink ? finalMeetLink : undefined,
      resources: validResources.map(r => ({ url: r.url, label: r.label.trim() || 'Resource' })),
      status: isHoliday ? 'holiday' : task.status,
      voiceNote: voiceNote || undefined,
    };
    onSave(updatedTask);
    onClose();
  };


  const formBody = (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>Date <span className="text-red-500">*</span></label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={fieldCls} style={fieldStyle} />
      </div>

      {!isHoliday && (
        <>
          <div>
            <label className={labelCls}>Study Duration <span className="text-red-500">*</span></label>
            <select value={studyTime} onChange={e => setStudyTime(e.target.value)} className={fieldCls} style={fieldStyle}>
              <option value="">Select duration…</option>
              {STUDY_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Task Description <span className="text-red-500">*</span></label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe what you'll be learning…"
              minRows={isMobile ? 3 : 4}
            />
          </div>

          <div>
            <label className={labelCls}>Voice Message <span className="text-[#9a8878] font-normal normal-case">(optional)</span></label>
            <VoiceRecorder value={voiceNote} onChange={setVoiceNote} />
          </div>

          <div>
            <label className={labelCls}>Resources <span className="text-[#9a8878] font-normal normal-case">(optional)</span></label>
            <div className="space-y-2">
              {resources.map((r, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="text" placeholder="https://…" value={r.url}
                    onChange={e => updateResource(i, 'url', e.target.value)}
                    className="flex-[2] px-3 py-2.5 rounded-xl text-sm field-focus" style={fieldStyle} />
                  <input type="text" placeholder="Label" value={r.label}
                    onChange={e => updateResource(i, 'label', e.target.value)}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm field-focus" style={fieldStyle} />
                  <button onClick={() => removeResource(i)}
                    className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addResource}
              className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:bg-violet-100"
              style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.07)', border: '1px dashed rgba(124,58,237,0.30)' }}>
              <Plus className="w-3.5 h-3.5" /> Add Resource Link
            </button>
          </div>

          <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${hasMeet ? 'border-blue-500 bg-blue-500' : 'border-[#ddd0bc] bg-white'}`}
                onClick={() => setHasMeet(!hasMeet)}>
                {hasMeet && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <input type="checkbox" checked={hasMeet} onChange={e => setHasMeet(e.target.checked)} className="sr-only" />
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-[#1e1208]">Has Google Meet</span>
              </div>
            </label>
            {hasMeet && (
              <div>
                <label className="block text-xs font-semibold text-blue-600 mb-1.5">Meet Link (optional)</label>
                <input type="text" value={meetLink} onChange={e => setMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full px-4 py-3 rounded-xl text-sm field-focus"
                  style={{ background: '#fff', border: '1.5px solid rgba(59,130,246,0.30)' }} />
              </div>
            )}
          </div>
        </>
      )}

      <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.20)' }}>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isHoliday ? 'border-amber-500 bg-amber-500' : 'border-[#ddd0bc] bg-white'}`}
            onClick={() => setIsHoliday(!isHoliday)}>
            {isHoliday && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <input type="checkbox" checked={isHoliday} onChange={e => setIsHoliday(e.target.checked)} className="sr-only" />
          <span className="text-sm font-semibold text-[#1e1208]">🏖️ Mark this day as a holiday</span>
        </label>
      </div>
    </div>
  );

  const header = (
    <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)' }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <Edit3 className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-['Playfair_Display'] text-lg font-bold text-white">Edit Task</h2>
      </div>
      <button onClick={onClose}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  const mobileFooter = (
    <div className="flex gap-3 px-5 py-4 flex-shrink-0" style={{ background: '#f5ede3', borderTop: '1px solid #ddd0bc' }}>
      <button onClick={onClose}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#4a3728] hover:bg-[#ddd0bc] transition-all"
        style={{ border: '1.5px solid #ddd0bc', background: 'transparent' }}>
        Cancel
      </button>
      <button onClick={handleSave}
        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
        style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 10px rgba(171,110,71,0.28)' }}>
        <Save className="w-4 h-4" /> Save
      </button>
    </div>
  );

  const desktopFooter = (
    <div className="flex gap-3 px-6 py-4"
      style={{ background: '#f5ede3', borderTop: '1px solid #ddd0bc' }}>
      <button onClick={onClose}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#4a3728] hover:bg-[#ddd0bc] transition-all"
        style={{ border: '1.5px solid #ddd0bc', background: 'transparent' }}>
        Cancel
      </button>
      <button onClick={handleSave}
        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
        style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 10px rgba(171,110,71,0.28)' }}>
        <Save className="w-4 h-4" /> Save Changes
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex items-end">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full rounded-t-3xl overflow-hidden flex flex-col animate-[slideUp_0.35s_cubic-bezier(0.4,0,0.2,1)]"
          style={{ maxHeight: '92dvh', background: '#fdfaf6', boxShadow: '0 -8px 40px rgba(44,24,16,0.18)' }}>
          <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-[#ddd0bc]" />
          </div>
          {header}
          <div className="flex-1 overflow-y-auto p-5 overscroll-contain">{formBody}</div>
          {mobileFooter}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden animate-scaleIn"
        style={{ boxShadow: '0 24px 60px rgba(44,24,16,0.22)' }}>
        {header}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)', background: '#fdfaf6' }}>{formBody}</div>
        {desktopFooter}
      </div>
    </div>
  );
}
