import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import type { Task, Resource } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export function AddTaskModal({ isOpen, onClose, onSave }: AddTaskModalProps) {
  const isMobile = useIsMobile();
  const [date, setDate] = useState('');
  const [studyTime, setStudyTime] = useState('');
  const [description, setDescription] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [hasMeet, setHasMeet] = useState(false);
  const [meetLink, setMeetLink] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(''); setStudyTime(''); setDescription('');
      setResources([]); setIsHoliday(false); setHasMeet(false); setMeetLink('');
    }
  }, [isOpen]);

  // Lock body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isMobile]);

  if (!isOpen) return null;

  const addResource = () => setResources(prev => [...prev, { url: '', label: '' }]);
  const updateResource = (i: number, field: keyof Resource, value: string) =>
    setResources(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  const removeResource = (i: number) =>
    setResources(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!date) { alert('Please select a date'); return; }
    if (!isHoliday) {
      if (!studyTime) { alert('Please select study duration'); return; }
      if (!description) { alert('Please enter task description'); return; }
    }

    let finalMeetLink = meetLink.trim();
    if (finalMeetLink) {
      if (!/^https?:\/\//i.test(finalMeetLink)) finalMeetLink = 'https://' + finalMeetLink;
      try { new URL(finalMeetLink); } catch { alert('Please enter a valid Meet link URL'); return; }
    }

    const validResources = resources
      .filter(r => r.url.trim())
      .map(r => {
        let url = r.url.trim();
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        return { ...r, url };
      });
    for (const r of validResources) {
      try { new URL(r.url); } catch { alert(`Invalid URL: ${r.url}`); return; }
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const newTask: Task = {
      date, day: dayNames[new Date(date).getDay()], studyTime, task: description,
      isHoliday, hasMeet,
      meetLink: hasMeet && finalMeetLink ? finalMeetLink : undefined,
      resources: validResources.map(r => ({ url: r.url, label: r.label.trim() || 'Resource' })),
      status: isHoliday ? 'holiday' : 'todo',
    };
    onSave(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {isMobile ? (
        // ── Mobile: bottom sheet ──────────────────────────────────
        <div className="absolute bottom-0 left-0 right-0 bg-[#faf7f2] rounded-t-3xl shadow-2xl flex flex-col animate-[slideUp_0.35s_cubic-bezier(0.4,0,0.2,1)]"
          style={{ maxHeight: '92dvh' }}>

          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-[#d9cfc1]" />
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-[#ab6e47] to-[#9b6b4f] mx-3 rounded-2xl px-5 py-3.5 flex items-center justify-between flex-shrink-0 mb-1">
            <h2 className="text-lg font-bold text-white">Add New Task</h2>
            <button onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 text-white hover:bg-white/20 rounded-xl transition-all duration-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 overscroll-contain">
            <div>
              <label className="text-sm font-semibold text-[#2c1810] mb-1.5 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:outline-none bg-white text-[#2c1810] text-base" />
            </div>

            {!isHoliday && (
              <>
                <div>
                  <label className="text-sm font-semibold text-[#2c1810] mb-1.5 block">Study Duration</label>
                  <select value={studyTime} onChange={e => setStudyTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:outline-none bg-white text-[#2c1810] text-base">
                    <option value="">Select study duration</option>
                    <option value="20">20 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="50">50 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1 hour 30 minutes</option>
                    <option value="120">2 hours</option>
                    <option value="150">2 hours 30 minutes</option>
                    <option value="180">3 hours</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#2c1810] mb-1.5 block">Task Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what you will be learning or working on"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:outline-none bg-white text-[#2c1810] resize-none text-base" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#2c1810] mb-1.5 block">
                    Resources <span className="text-[#8c7a6a] font-normal">(optional)</span>
                  </label>
                  <div className="space-y-2">
                    {resources.map((r, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input type="text" placeholder="URL" value={r.url}
                          onChange={e => updateResource(i, 'url', e.target.value)}
                          className="flex-[1.5] px-3 py-2.5 border border-[#d9cfc1] rounded-xl text-sm focus:border-purple-400 focus:outline-none bg-white text-[#2c1810]" />
                        <input type="text" placeholder="Label" value={r.label}
                          onChange={e => updateResource(i, 'label', e.target.value)}
                          className="flex-1 px-3 py-2.5 border border-[#d9cfc1] rounded-xl text-sm focus:outline-none bg-white text-[#2c1810]" />
                        <button onClick={() => removeResource(i)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addResource}
                    className="inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-xl border border-dashed border-purple-400 text-purple-600 bg-purple-50/50 text-sm font-semibold transition-all duration-200">
                    <Plus className="w-3.5 h-3.5" /> Add Resource Link
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="at-hasmeet-m" checked={hasMeet} onChange={e => setHasMeet(e.target.checked)}
                    className="w-5 h-5 accent-[#ab6e47] cursor-pointer" />
                  <label htmlFor="at-hasmeet-m" className="text-sm font-medium text-[#2c1810] cursor-pointer">Has Google Meet</label>
                </div>
                {hasMeet && (
                  <div className="ml-8">
                    <label className="text-sm font-semibold text-[#2c1810] mb-1.5 block">
                      Meet Link <span className="text-[#8c7a6a] font-normal">(optional)</span>
                    </label>
                    <input type="text" value={meetLink} onChange={e => setMeetLink(e.target.value)}
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none bg-white text-[#2c1810] text-base" />
                  </div>
                )}
              </>
            )}

            <div className="flex items-center gap-3 pb-2">
              <input type="checkbox" id="at-holiday-m" checked={isHoliday} onChange={e => setIsHoliday(e.target.checked)}
                className="w-5 h-5 accent-[#ab6e47] cursor-pointer" />
              <label htmlFor="at-holiday-m" className="text-sm font-medium text-[#2c1810] cursor-pointer">Mark this day as a holiday</label>
            </div>
          </div>

          {/* Footer — always visible */}
          <div className="px-4 py-4 bg-[#ece4da] border-t border-[#d9cfc1] flex gap-3 flex-shrink-0">
            <button onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 border-2 border-[#d9cfc1] text-[#5c4a3a] hover:bg-[#d9cfc1] font-semibold rounded-xl transition-all duration-200 bg-transparent text-sm">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-[#ab6e47] hover:bg-[#8b5a3c] text-white font-semibold rounded-xl transition-all duration-200 shadow-sm text-sm">
              <Save className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>

      ) : (
        // ── Desktop: centered dialog ──────────────────────────────
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="bg-[#faf7f2] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-[slideInDown_0.4s_cubic-bezier(0.4,0,0.2,1)]">
            <div className="bg-gradient-to-r from-[#ab6e47] to-[#9b6b4f] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add New Task</h2>
              <button onClick={onClose}
                className="inline-flex items-center justify-center w-9 h-9 text-white hover:bg-white/20 rounded-xl transition-all duration-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div>
                <label className="text-sm font-semibold text-[#2c1810] mb-2 block">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:outline-none bg-white text-[#2c1810]" />
              </div>

              {!isHoliday && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-[#2c1810] mb-2 block">Study Duration</label>
                    <select value={studyTime} onChange={e => setStudyTime(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:outline-none bg-white text-[#2c1810]">
                      <option value="">Select study duration</option>
                      <option value="20">20 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="50">50 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1 hour 30 minutes</option>
                      <option value="120">2 hours</option>
                      <option value="150">2 hours 30 minutes</option>
                      <option value="180">3 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#2c1810] mb-2 block">Task Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Describe what you will be learning or working on during this session"
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-[#d9cfc1] rounded-xl focus:border-[#ab6e47] focus:outline-none bg-white text-[#2c1810] resize-none" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-[#2c1810] mb-2 block">
                      Resources <span className="text-[#8c7a6a] font-normal">(optional)</span>
                    </label>
                    <div className="space-y-2">
                      {resources.map((r, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input type="text" placeholder="https://example.com/resource" value={r.url}
                            onChange={e => updateResource(i, 'url', e.target.value)}
                            className="flex-[1.5] px-3 py-2 border border-[#d9cfc1] rounded-xl text-sm focus:border-purple-400 focus:outline-none bg-white text-[#2c1810]" />
                          <input type="text" placeholder="Label" value={r.label}
                            onChange={e => updateResource(i, 'label', e.target.value)}
                            className="flex-1 px-3 py-2 border border-[#d9cfc1] rounded-xl text-sm focus:outline-none bg-white text-[#2c1810]" />
                          <button onClick={() => removeResource(i)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={addResource}
                      className="inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-xl border border-dashed border-purple-400 text-purple-600 bg-purple-50/50 hover:bg-purple-100/50 text-sm font-semibold transition-all duration-200">
                      <Plus className="w-3.5 h-3.5" /> Add Resource Link
                    </button>
                    <p className="text-xs text-[#8c7a6a] mt-1.5">Add links to docs, tutorials, videos, etc.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="at-hasmeet" checked={hasMeet} onChange={e => setHasMeet(e.target.checked)}
                      className="w-4 h-4 accent-[#ab6e47] cursor-pointer" />
                    <label htmlFor="at-hasmeet" className="text-sm font-medium text-[#2c1810] cursor-pointer">Has Google Meet</label>
                  </div>
                  {hasMeet && (
                    <div className="ml-7">
                      <label className="text-sm font-semibold text-[#2c1810] mb-2 block">
                        Meet Link <span className="text-[#8c7a6a] font-normal">(optional)</span>
                      </label>
                      <input type="text" value={meetLink} onChange={e => setMeetLink(e.target.value)}
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none bg-white text-[#2c1810]" />
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-3">
                <input type="checkbox" id="at-holiday" checked={isHoliday} onChange={e => setIsHoliday(e.target.checked)}
                  className="w-4 h-4 accent-[#ab6e47] cursor-pointer" />
                <label htmlFor="at-holiday" className="text-sm font-medium text-[#2c1810] cursor-pointer">Mark this day as a holiday</label>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#ece4da] border-t border-[#d9cfc1] flex justify-end gap-3">
              <button onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2 border-2 border-[#d9cfc1] text-[#5c4a3a] hover:bg-[#d9cfc1] font-semibold rounded-xl transition-all duration-200 bg-transparent">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#ab6e47] hover:bg-[#8b5a3c] text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
                <Save className="w-4 h-4" /> Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}