import { useRef, useEffect, useCallback, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Strikethrough } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minRows?: number;
  onCtrlEnter?: () => void;
  viewWhenBlurred?: boolean;
}

const COLORS = ['#1e1208','#dc2626','#2563eb','#059669','#d97706','#7c3aed','#db2777'];
const FONT_SIZES = [
  { label: '10', value: '1' },
  { label: '13', value: '2' },
  { label: '17', value: '3' },
  { label: '18', value: '4' },
  { label: '24', value: '5' },
  { label: '32', value: '6' },
  { label: '48', value: '7' },
];

export function RichTextEditor({ value, onChange, placeholder = 'Write something…', minRows = 4, onCtrlEnter, viewWhenBlurred = false }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleFocusIn = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setIsFocused(true);
  };

  const handleFocusOut = () => {
    blurTimer.current = setTimeout(() => setIsFocused(false), 150);
  };

  const exec = useCallback((cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
  }, []);

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html === '<br>' ? '' : html);
  };

  const isActive = (cmd: string) => {
    try { return document.queryCommandState(cmd); } catch { return false; }
  };

  const ToolBtn = ({ cmd, children, title }: { cmd: string; children: React.ReactNode; title: string }) => (
    <button type="button" title={title} onMouseDown={e => { e.preventDefault(); exec(cmd); }}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 flex-shrink-0"
      style={isActive(cmd)
        ? { background: '#ab6e47', color: '#fff' }
        : { background: 'rgba(171,110,71,0.10)', color: '#4a3728' }}>
      {children}
    </button>
  );

  const isEmpty = !value || value === '' || value === '<br>';
  const showToolbar = !viewWhenBlurred || isFocused;

  // View mode: not focused, has content → show rendered HTML
  if (viewWhenBlurred && !isFocused && !isEmpty) {
    return (
      <div
        onClick={() => {
          setIsFocused(true);
          setTimeout(() => editorRef.current?.focus(), 0);
        }}
        className="px-4 py-3 text-sm text-[#1e1208] leading-relaxed cursor-text rounded-2xl transition-colors duration-200 quiz-answer-preview"
        style={{
          minHeight: `${minRows * 1.75}rem`,
          background: '#fdfaf6',
          border: '1.5px solid #ddd0bc',
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1.5px solid ${isFocused ? 'rgba(171,110,71,0.50)' : '#ddd0bc'}`, transition: 'border-color 0.15s' }}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}>

      {/* Toolbar — visible only when focused (in viewWhenBlurred mode) or always */}
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2.5 border-b border-[#e8ddd0]"
          style={{ background: '#f5ede3' }}>

          <select
            defaultValue="4"
            onChange={e => exec('fontSize', e.target.value)}
            className="h-7 px-2 rounded-lg text-xs font-semibold text-[#4a3728] cursor-pointer field-focus"
            style={{ background: 'rgba(171,110,71,0.10)', border: '1px solid rgba(171,110,71,0.20)' }}>
            {FONT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <div className="w-px h-5 bg-[#ddd0bc] flex-shrink-0" />

          <ToolBtn cmd="bold" title="Bold (Ctrl+B)"><Bold className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn cmd="italic" title="Italic (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn cmd="underline" title="Underline (Ctrl+U)"><Underline className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn cmd="strikeThrough" title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>

          <div className="w-px h-5 bg-[#ddd0bc] flex-shrink-0" />

          <ToolBtn cmd="insertUnorderedList" title="Bullet list"><List className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn cmd="insertOrderedList" title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></ToolBtn>

          <div className="w-px h-5 bg-[#ddd0bc] flex-shrink-0" />

          <div className="flex items-center gap-1">
            {COLORS.map(c => (
              <button key={c} type="button" title={c}
                onMouseDown={e => { e.preventDefault(); exec('foreColor', c); }}
                className="w-5 h-5 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 flex-shrink-0"
                style={{ background: c }} />
            ))}
          </div>
        </div>
      )}

      {/* Editable area */}
      <div className="relative">
        {isEmpty && (
          <div className="absolute top-3 left-4 text-sm text-[#9a8878] pointer-events-none select-none leading-relaxed">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onCompositionStart={() => { isComposing.current = true; }}
          onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
          onKeyDown={e => {
            if (e.key === 'Enter' && e.ctrlKey) {
              e.preventDefault();
              onCtrlEnter?.();
            }
          }}
          className="w-full px-4 py-3 text-lg text-[#1e1208] leading-relaxed outline-none"
          style={{ minHeight: `${minRows * 1.75}rem`, background: '#fdfaf6' }}
        />
      </div>

    </div>
  );
}
