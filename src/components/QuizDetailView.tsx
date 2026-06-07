import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Type, List, CheckSquare, PenLine, X, Check, MoreVertical } from 'lucide-react';
import type { Quiz, QuizQuestion } from '@/types';
import { RichTextEditor } from './RichTextEditor';

interface QuizDetailViewProps {
  quiz: Quiz;
  onClose: () => void;
  onUpdateQuiz: (quiz: Quiz) => void;
}

const typeLabel: Record<string, string> = { text: 'Text Answer', single: 'Single Choice', multiple: 'Multiple Choice' };
const typeIcon: Record<string, typeof Type> = { text: Type, single: List, multiple: CheckSquare };

const BROWN = '#ab6e47';
const BROWN_DARK = '#8b5a3c';

const isEmptyHtml = (html: string) =>
  !html || html === '' || html === '<br>' || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, '').trim() === '';

export function QuizDetailView({ quiz, onClose, onUpdateQuiz }: QuizDetailViewProps) {
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

  const [remarkOpen, setRemarkOpen] = useState<Set<string>>(new Set());
  const [remarkEditing, setRemarkEditing] = useState<Set<string>>(new Set());
  const [remarkDraft, setRemarkDraft] = useState<Record<string, string>>({});
  const [editingTextIds, setEditingTextIds] = useState<Set<string>>(new Set());
  const [textDrafts, setTextDrafts] = useState<Record<string, string>>({});

  const startEditText = (q: QuizQuestion) => {
    setTextDrafts(prev => ({ ...prev, [q.id]: typeof q.userAnswer === 'string' ? q.userAnswer : '' }));
    setEditingTextIds(prev => new Set(prev).add(q.id));
  };

  const saveText = (qId: string) => {
    const draft = textDrafts[qId] ?? '';
    setAnswer(qId, isEmptyHtml(draft) ? null : draft);
    setEditingTextIds(prev => { const n = new Set(prev); n.delete(qId); return n; });
    setTextDrafts(prev => { const n = { ...prev }; delete n[qId]; return n; });
  };

  const cancelText = (qId: string) => {
    setEditingTextIds(prev => { const n = new Set(prev); n.delete(qId); return n; });
    setTextDrafts(prev => { const n = { ...prev }; delete n[qId]; return n; });
  };

  const total = quiz.questions.length;
  const answered = quiz.questions.filter(q =>
    q.userAnswer !== null && q.userAnswer !== '' &&
    !(Array.isArray(q.userAnswer) && q.userAnswer.length === 0)
  ).length;

  const setAnswer = (qId: string, answer: string | string[] | null) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.map(q => q.id === qId ? { ...q, userAnswer: answer } : q),
    });
  };

  const setRemark = (qId: string, remark: string | null) => {
    onUpdateQuiz({
      ...quiz,
      questions: quiz.questions.map(q => q.id === qId ? { ...q, remark } : q),
    });
  };

  const saveRemark = (qId: string) => {
    const text = (remarkDraft[qId] ?? '').trim();
    setRemark(qId, text || null);
    setRemarkEditing(prev => { const n = new Set(prev); n.delete(qId); return n; });
    setRemarkDraft(prev => { const n = { ...prev }; delete n[qId]; return n; });
  };

  const toggleRemark = (q: QuizQuestion) => {
    if (remarkOpen.has(q.id)) {
      setRemarkOpen(prev => { const n = new Set(prev); n.delete(q.id); return n; });
      setRemarkEditing(prev => { const n = new Set(prev); n.delete(q.id); return n; });
      setRemarkDraft(prev => { const n = { ...prev }; delete n[q.id]; return n; });
    } else {
      setRemarkOpen(prev => new Set(prev).add(q.id));
      if (!q.remark) {
        setRemarkEditing(prev => new Set(prev).add(q.id));
        setRemarkDraft(prev => ({ ...prev, [q.id]: '' }));
      }
    }
  };

  const deleteRemark = (qId: string) => {
    setRemark(qId, null);
    setRemarkOpen(prev => { const n = new Set(prev); n.delete(qId); return n; });
    setRemarkEditing(prev => { const n = new Set(prev); n.delete(qId); return n; });
    setRemarkDraft(prev => { const n = { ...prev }; delete n[qId]; return n; });
  };

  const startEditRemark = (q: QuizQuestion) => {
    setRemarkDraft(prev => ({ ...prev, [q.id]: q.remark ?? '' }));
    setRemarkEditing(prev => new Set(prev).add(q.id));
  };

  const cancelEditRemark = (qId: string) => {
    setRemarkEditing(prev => { const n = new Set(prev); n.delete(qId); return n; });
    setRemarkDraft(prev => { const n = { ...prev }; delete n[qId]; return n; });
  };

  const toggleMulti = (q: QuizQuestion, optId: string) => {
    const current = Array.isArray(q.userAnswer) ? q.userAnswer : [];
    const next = current.includes(optId) ? current.filter(id => id !== optId) : [...current, optId];
    setAnswer(q.id, next.length > 0 ? next : null);
  };

  const clearAll = () => {
    onUpdateQuiz({ ...quiz, questions: quiz.questions.map(q => ({ ...q, userAnswer: null, remark: null })) });
  };

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
        <div className="w-full px-5 sm:px-10 lg:px-16">
          <div className="py-3 border-b border-[#e8ddd0]/60">
            <button onClick={onClose}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[#4a3728] hover:text-[#ab6e47] transition-colors duration-200">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:text-white"
                style={{ background: 'linear-gradient(135deg, #ede4d8, #e4d8c8)' }}
                onMouseEnter={e => { e.currentTarget.style.background = `linear-gradient(135deg, ${BROWN}, ${BROWN_DARK})`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #ede4d8, #e4d8c8)'; }}>
                <ChevronLeft className="w-4 h-4" />
              </span>
              Back to Quizzes
            </button>
          </div>

          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#1e1208] leading-tight">{quiz.title}</h1>
              {quiz.description && <p className="text-sm text-[#7a6858] mt-0.5">{quiz.description}</p>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-sm font-semibold px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(171,110,71,0.10)', color: BROWN_DARK, border: '1px solid rgba(171,110,71,0.22)' }}>
                {answered}/{total} answered
              </span>
              <div ref={menuRef} className="relative">
                <button onClick={() => setMenuOpen(v => !v)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:bg-[#f0e6da] active:scale-95"
                  style={{ color: '#8b5a3c', border: '1.5px solid rgba(171,110,71,0.25)' }}>
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 z-50 rounded-xl overflow-hidden"
                    style={{ background: '#fdfaf6', border: '1px solid #ddd0bc', boxShadow: '0 4px 16px rgba(44,24,16,0.12)', minWidth: '130px' }}>
                    <button
                      onClick={() => { clearAll(); setMenuOpen(false); }}
                      disabled={answered === 0}
                      className="w-full inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-150 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ color: '#e53e3e' }}>
                      <X className="w-4 h-4" /> Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="w-full px-5 sm:px-10 lg:px-16 py-10">
        {quiz.questions.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: 'rgba(253,250,246,0.70)', border: '1px solid #ddd0bc' }}>
            <div className="text-5xl mb-4">📋</div>
            <p className="text-[#7a6858]">No questions in this quiz yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-16 items-start">
            {quiz.questions.map((q, idx) => {
              const Icon = typeIcon[q.type] || Type;
              const isAnswered = q.userAnswer !== null && q.userAnswer !== '' &&
                !(Array.isArray(q.userAnswer) && q.userAnswer.length === 0);
              const hasRemark = !!q.remark;
              const isRemarkOpen = remarkOpen.has(q.id);

              return (
                <div key={q.id}
                  className={`rounded-2xl overflow-hidden transition-all duration-200 relative ${q.type === 'text' ? 'lg:col-span-2' : ''}`}
                  style={{
                    background: '#fdfaf6',
                    border: isAnswered ? '1.5px solid rgba(171,110,71,0.30)' : '1px solid #ddd0bc',
                    boxShadow: isAnswered
                      ? '0 2px 12px rgba(171,110,71,0.10)'
                      : '0 2px 10px rgba(44,24,16,0.06)',
                  }}>

                  {/* Very Small Red Dot */}
                  {isAnswered && (
                    <button
                      onClick={() => toggleRemark(q)}
                      title={hasRemark ? "Edit Remark" : "Add Remark"}
                      className="absolute top-4 right-4 w-[10px] h-[10px] rounded-full z-10 transition-all hover:scale-150 active:scale-100"
                      style={{
                        background: hasRemark ? '#ef4444' : 'transparent',
                        boxShadow: hasRemark ? '0 0 0 3px rgba(239, 68, 68, 0.25)' : 'none',
                      }}
                    />
                  )}

                  {/* Question header */}
                  <div className="px-6 py-4 border-b border-[#e8ddd0] flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                      style={{ background: `linear-gradient(135deg, ${BROWN}, ${BROWN_DARK})` }}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-[18px] font-semibold text-[#1e1208] leading-snug">
                        {q.question}
                        {q.required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#9a8878] mt-1">
                        <Icon className="w-3 h-3" /> {typeLabel[q.type]}
                      </span>
                    </div>
                  </div>

                  {/* Answer Area */}
                  <div className="px-6 py-5">
                    {q.type === 'text' && (
                      editingTextIds.has(q.id) ? (
                        <>
                          <RichTextEditor
                            value={textDrafts[q.id] ?? ''}
                            onChange={html => setTextDrafts(prev => ({ ...prev, [q.id]: html }))}
                            placeholder="Type your answer here…"
                            minRows={6}
                          />
                          <div className="flex justify-end gap-2 mt-3">
                            <button onClick={() => cancelText(q.id)}
                              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#4a3728] transition-all duration-200 hover:bg-[#ddd0bc]"
                              style={{ border: '1.5px solid #ddd0bc', background: 'transparent' }}>
                              Cancel
                            </button>
                            <button onClick={() => saveText(q.id)}
                              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                              style={{ background: `linear-gradient(135deg, ${BROWN}, ${BROWN_DARK})`, boxShadow: '0 2px 10px rgba(171,110,71,0.30)' }}>
                              <Check className="w-4 h-4" /> Save Answer
                            </button>
                          </div>
                        </>
                      ) : isAnswered ? (
                        <div
                          onClick={() => startEditText(q)}
                          className="px-4 py-3 text-sm text-[#1e1208] leading-relaxed rounded-2xl cursor-text transition-colors duration-200 hover:border-[rgba(171,110,71,0.45)] quiz-answer-preview"
                          style={{ minHeight: '10.5rem', background: '#fdfaf6', border: '1.5px solid #ddd0bc' }}
                          dangerouslySetInnerHTML={{ __html: typeof q.userAnswer === 'string' ? q.userAnswer : '' }}
                        />
                      ) : (
                        <button
                          onClick={() => startEditText(q)}
                          className="w-full flex items-center gap-2 px-4 py-4 rounded-2xl text-sm text-[#9a8878] transition-all duration-200 hover:border-[rgba(171,110,71,0.35)] hover:text-[#ab6e47]"
                          style={{ border: '1.5px dashed #ddd0bc', background: 'rgba(245,237,227,0.60)' }}>
                          <Type className="w-4 h-4 flex-shrink-0" />
                          <span>Click to write your answer…</span>
                        </button>
                      )
                    )}

                    {q.type === 'single' && (
                      <div className="space-y-2.5">
                        {q.options.map(opt => {
                          const selected = q.userAnswer === opt.id;
                          return (
                            <label key={opt.id} className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200"
                              style={{
                                background: selected ? 'rgba(171,110,71,0.08)' : 'rgba(245,237,227,0.60)',
                                border: selected ? '1.5px solid rgba(171,110,71,0.35)' : '1px solid #e8ddd0',
                              }}>
                              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                                style={{ borderColor: selected ? BROWN : '#ddd0bc', background: selected ? BROWN : 'transparent' }}>
                                {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                              <input type="radio" className="sr-only" checked={selected} onChange={() => setAnswer(q.id, opt.id)} />
                              <span className="text-sm font-medium text-[#2c1810]">{opt.text}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {q.type === 'multiple' && (
                      <div className="space-y-2.5">
                        {q.options.map(opt => {
                          const checked = Array.isArray(q.userAnswer) && q.userAnswer.includes(opt.id);
                          return (
                            <label key={opt.id} className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200"
                              style={{
                                background: checked ? 'rgba(171,110,71,0.08)' : 'rgba(245,237,227,0.60)',
                                border: checked ? '1.5px solid rgba(171,110,71,0.35)' : '1px solid #e8ddd0',
                              }}>
                              <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200"
                                style={{ borderColor: checked ? BROWN : '#ddd0bc', background: checked ? BROWN : 'transparent' }}>
                                {checked && <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </div>
                              <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleMulti(q, opt.id)} />
                              <span className="text-sm font-medium text-[#2c1810]">{opt.text}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Remark Section - Edit icon removed from saved view */}
                    {isAnswered && isRemarkOpen && (
                      <div className="mt-4">
                        {hasRemark && !remarkEditing.has(q.id) && (
                          <div className="rounded-xl px-4 py-3 flex items-start gap-2.5"
                            style={{ background: 'rgba(171,110,71,0.07)', border: '1px solid rgba(171,110,71,0.18)' }}>
                            <PenLine className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: BROWN }} />
                            <p className="text-sm text-[#4a3728] leading-relaxed flex-1">{q.remark}</p>
                            <button 
                              onClick={() => deleteRemark(q.id)}
                              title="Remove Remark"
                              className="text-[#9a8878] hover:text-red-600 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {(!hasRemark || remarkEditing.has(q.id)) && (
                          <div className="rounded-xl overflow-hidden"
                            style={{ border: '1.5px solid rgba(171,110,71,0.28)', background: 'rgba(171,110,71,0.04)' }}>
                            <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'rgba(171,110,71,0.18)' }}>
                              <PenLine className="w-3.5 h-3.5" style={{ color: BROWN }} />
                              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BROWN }}>Remark</span>
                            </div>
                            <textarea
                              autoFocus
                              rows={3}
                              placeholder="Write your remark here…"
                              value={remarkDraft[q.id] ?? ''}
                              onChange={e => setRemarkDraft(prev => ({ ...prev, [q.id]: e.target.value }))}
                              className="w-full px-4 py-3 text-sm text-[#1e1208] resize-none outline-none leading-relaxed"
                              style={{ background: 'transparent' }}
                            />
                            <div className="flex justify-end gap-2 px-4 py-2.5 border-t" style={{ borderColor: 'rgba(171,110,71,0.18)' }}>
                              <button onClick={() => hasRemark ? cancelEditRemark(q.id) : toggleRemark(q)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#7a6858] hover:bg-[#ddd0bc] transition-all">
                                Cancel
                              </button>
                              <button onClick={() => saveRemark(q.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                                style={{ background: `linear-gradient(135deg, ${BROWN}, ${BROWN_DARK})` }}>
                                <Check className="w-3 h-3" /> Save Remark
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}