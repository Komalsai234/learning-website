import { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; content: string }) => Promise<void>;
}

export function AddProjectModal({ isOpen, onClose, onSave }: AddProjectModalProps) {
  const [name, setName] = useState('');
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setContent(ev.target?.result as string ?? '');
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!name.trim() || !content) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), content });
      setName(''); setFileName(''); setContent('');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName(''); setFileName(''); setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: '#fdfaf6', boxShadow: '0 32px 80px rgba(44,24,16,0.28)', border: '1px solid #ddd0bc' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-7 py-5 flex items-center justify-between border-b border-[#e8ddd0]">
          <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#1e1208]">New Project</h2>
          <button onClick={handleClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#7a6858] hover:bg-[#ab6e47] hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#8b5a3c]">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Todo App with React"
              className="w-full px-4 py-3 rounded-xl text-sm text-[#1e1208] outline-none transition-all"
              style={{ background: 'rgba(171,110,71,0.06)', border: '1.5px solid rgba(171,110,71,0.20)' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#ab6e47')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(171,110,71,0.20)')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#8b5a3c]">Markdown File</label>
            <div
              className="flex flex-col items-center justify-center gap-3 py-8 rounded-xl cursor-pointer transition-all"
              style={{ background: 'rgba(171,110,71,0.06)', border: '1.5px dashed rgba(171,110,71,0.35)' }}
              onClick={() => fileRef.current?.click()}
            >
              {fileName ? (
                <>
                  <FileText className="w-8 h-8 text-[#ab6e47]" />
                  <span className="text-sm font-semibold text-[#4a3728]">{fileName}</span>
                  <span className="text-xs text-[#9a8878]">Click to change file</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-[#ab6e47]" />
                  <span className="text-sm font-semibold text-[#4a3728]">Upload .md file</span>
                  <span className="text-xs text-[#9a8878]">Click to browse</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".md,text/markdown" className="hidden" onChange={handleFile} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-[#e8ddd0] flex gap-3">
          <button onClick={handleClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#7a6858] transition-all hover:bg-[#f0e6da]"
            style={{ border: '1.5px solid #ddd0bc' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !content || saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 2px 10px rgba(171,110,71,0.25)' }}>
            {saving ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
