import { useState } from 'react';
import { X, Plus, Trash2, GripVertical, CheckSquare, Circle, Type } from 'lucide-react';
import type { QuizQuestion, QuizOption, QuestionType } from '@/types';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string; questions: QuizQuestion[] }) => Promise<void>;
  initialData?: { title: string; description: string; questions: QuizQuestion[] };
}

const newOption = (): QuizOption => ({ id: crypto.randomUUID(), text: '', isCorrect: false });
const newQuestion = (type: QuestionType = 'single'): QuizQuestion => ({
  id: crypto.randomUUID(), type, question: '', required: false,
  options: type !== 'text' ? [newOption(), newOption()] : [],
  userAnswer: null,
});

const TYPE_OPTIONS: { value: QuestionType; label: string; icon: typeof Type }[] = [
  { value: 'text', label: 'Text Answer', icon: Type },
  { value: 'single', label: 'Single Choice', icon: Circle },
  { value: 'multiple', label: 'Multiple Choice', icon: CheckSquare },
];

const fieldStyle = { background: '#fff', border: '1.5px solid #ddd0bc' };
const fieldCls = 'w-full px-4 py-3 rounded-xl text-sm text-[#1e1208] placeholder-[#9a8878] field-focus';

const GREEN = '#ab6e47';
const GREEN_DARK = '#8b5a3c';
const GREEN_BG = 'rgba(171,110,71,0.08)';
const GREEN_BORDER = 'rgba(171,110,71,0.25)';

export function CreateQuizModal({ isOpen, onClose, onSave, initialData }: CreateQuizModalProps) {
  const isEditing = !!initialData;
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialData?.questions ?? [newQuestion()]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setTitle(initialData?.title ?? '');
    setDescription(initialData?.description ?? '');
    setQuestions(initialData?.questions ?? [newQuestion()]);
    setSaving(false);
  };
  const handleClose = () => { reset(); onClose(); };

  const addQuestion = () => setQuestions(prev => [...prev, newQuestion()]);
  const removeQuestion = (qId: string) => setQuestions(prev => prev.filter(q => q.id !== qId));
  const updateQuestion = (qId: string, patch: Partial<QuizQuestion>) =>
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...patch } : q));
  const changeType = (qId: string, type: QuestionType) =>
    setQuestions(prev => prev.map(q => q.id === qId ? {
      ...q, type, userAnswer: null,
      options: type !== 'text' ? (q.options.length >= 2 ? q.options : [newOption(), newOption()]) : [],
    } : q));

  const addOption = (qId: string) =>
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: [...q.options, newOption()] } : q));
  const removeOption = (qId: string, optId: string) =>
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, options: q.options.filter(o => o.id !== optId) } : q));
  const updateOption = (qId: string, optId: string, patch: Partial<QuizOption>) =>
    setQuestions(prev => prev.map(q => q.id === qId
      ? { ...q, options: q.options.map(o => o.id === optId ? { ...o, ...patch } : o) }
      : q));
  const toggleCorrect = (qId: string, optId: string, type: QuestionType) =>
    setQuestions(prev => prev.map(q => q.id === qId ? {
      ...q, options: q.options.map(o => ({
        ...o,
        isCorrect: type === 'single'
          ? o.id === optId ? !o.isCorrect : false
          : o.id === optId ? !o.isCorrect : o.isCorrect,
      })),
    } : q));

  const handleSave = async () => {
    if (!title.trim()) { alert('Please enter a quiz title'); return; }
    if (questions.some(q => !q.question.trim())) { alert('Please fill in all question texts'); return; }
    if (questions.some(q => q.type !== 'text' && q.options.some(o => !o.text.trim()))) {
      alert('Please fill in all option texts'); return;
    }
    setSaving(true);
    await onSave({ title: title.trim(), description: description.trim(), questions });
    reset(); onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden animate-scaleIn"
        style={{ boxShadow: '0 24px 60px rgba(44,24,16,0.22)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}>
          <div>
            <h2 className="font-['Playfair_Display'] text-lg font-bold text-white">{isEditing ? 'Edit Quiz' : 'Create New Quiz'}</h2>
            <p className="text-xs text-white/65 mt-0.5">{isEditing ? 'Update questions or add new ones' : ''}</p>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ background: '#fdfaf6' }}>

          {/* Quiz info */}
          <div className="space-y-4 p-5 rounded-2xl" style={{ background: '#f5ede3', border: '1px solid #e8ddd0' }}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7a6858] mb-2">Quiz Title <span className="text-red-500">*</span></label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Week 1 — React Fundamentals Quiz"
                className={fieldCls} style={fieldStyle} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7a6858] mb-2">Description <span className="text-[#9a8878] font-normal normal-case">(optional)</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of this quiz…" rows={2}
                className={`${fieldCls} resize-none`} style={fieldStyle} />
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="rounded-2xl overflow-hidden"
                style={{ background: '#fff', border: '1px solid #ddd0bc', boxShadow: '0 2px 8px rgba(44,24,16,0.05)' }}>

                {/* Question header bar */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-[#e8ddd0]"
                  style={{ background: `rgba(61,139,106,0.04)` }}>
                  <GripVertical className="w-4 h-4 text-[#9a8878] flex-shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider flex-1" style={{ color: GREEN }}>Question {idx + 1}</span>

                  {/* Type selector */}
                  <div className="flex gap-1">
                    {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <button key={value} onClick={() => changeType(q.id, value)}
                        title={label}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                        style={q.type === value
                          ? { background: GREEN, color: '#fff' }
                          : { background: GREEN_BG, color: GREEN }}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ))}
                  </div>

                  <button onClick={() => removeQuestion(q.id)} disabled={questions.length === 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9a8878] hover:text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Question text */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7a6858] mb-2">Question Text <span className="text-red-500">*</span></label>
                    <textarea value={q.question} onChange={e => updateQuestion(q.id, { question: e.target.value })}
                      placeholder="Enter your question…" rows={2}
                      className="w-full px-4 py-3 rounded-xl text-sm text-[#1e1208] resize-none field-focus"
                      style={{ background: '#f5ede3', border: '1.5px solid #ddd0bc' }} />
                  </div>

                  {/* Options for single/multiple */}
                  {q.type !== 'text' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#7a6858]">Options</label>
                        <span className="text-[11px] text-[#9a8878]">
                          {q.type === 'single' ? 'Mark the correct answer' : 'Mark all correct answers'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            {/* Correct toggle */}
                            <button onClick={() => toggleCorrect(q.id, opt.id, q.type)}
                              title="Mark as correct"
                              className="w-5 h-5 flex-shrink-0 transition-all duration-200"
                              style={q.type === 'single'
                                ? {
                                    borderRadius: '50%',
                                    border: `2px solid ${opt.isCorrect ? '#059669' : '#ddd0bc'}`,
                                    background: opt.isCorrect ? '#059669' : 'transparent',
                                  }
                                : {
                                    borderRadius: '4px',
                                    border: `2px solid ${opt.isCorrect ? '#059669' : '#ddd0bc'}`,
                                    background: opt.isCorrect ? '#059669' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                              {opt.isCorrect && <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </button>

                            <span className="text-xs font-semibold text-[#9a8878] w-5 flex-shrink-0">{String.fromCharCode(65 + oi)}.</span>
                            <input value={opt.text} onChange={e => updateOption(q.id, opt.id, { text: e.target.value })}
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              className="flex-1 px-3 py-2 rounded-lg text-sm field-focus"
                              style={{ background: '#f5ede3', border: '1px solid #ddd0bc' }} />
                            <button onClick={() => removeOption(q.id, opt.id)} disabled={q.options.length <= 2}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9a8878] hover:text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => addOption(q.id)}
                        className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                        style={{ color: GREEN, background: GREEN_BG, border: `1px dashed ${GREEN_BORDER}` }}>
                        <Plus className="w-3.5 h-3.5" /> Add Option
                      </button>
                    </div>
                  )}

                  {/* Required toggle */}
                  <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={q.required}
                        onChange={e => updateQuestion(q.id, { required: e.target.checked })} />
                      <div className="w-9 h-5 rounded-full transition-all duration-200"
                        style={{ background: q.required ? GREEN : '#ddd0bc' }}>
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm mt-0.5 transition-all duration-200"
                          style={{ marginLeft: q.required ? '18px' : '2px' }} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#7a6858]">Required</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Add question */}
          <button onClick={addQuestion}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2"
            style={{ color: GREEN, border: `2px dashed ${GREEN_BORDER}`, background: GREEN_BG }}>
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 flex-shrink-0"
          style={{ background: '#f5ede3', borderTop: '1px solid #ddd0bc' }}>
          <button onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#4a3728] hover:bg-[#ddd0bc] transition-all duration-200"
            style={{ border: '1.5px solid #ddd0bc', background: 'transparent' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`, boxShadow: '0 2px 10px rgba(61,139,106,0.28)' }}>
            {saving
              ? (isEditing ? 'Saving…' : 'Creating…')
              : (isEditing ? `Save Changes (${questions.length} question${questions.length > 1 ? 's' : ''})` : `Create Quiz (${questions.length} question${questions.length > 1 ? 's' : ''})`)}
          </button>
        </div>
      </div>
    </div>
  );
}
