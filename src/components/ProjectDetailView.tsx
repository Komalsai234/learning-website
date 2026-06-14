import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft } from 'lucide-react';
import type { Project } from '@/types';
import type { Components } from 'react-markdown';

interface ProjectDetailViewProps {
  project: Project;
  onClose: () => void;
}

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.4rem', fontWeight: 800, color: '#1e1208', margin: '0 0 1.25rem', lineHeight: 1.2, borderBottom: '2px solid #e8ddd0', paddingBottom: '0.75rem' }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.65rem', fontWeight: 700, color: '#2c1a10', margin: '2.5rem 0 0.85rem', lineHeight: 1.3, paddingLeft: '0.9rem', borderLeft: '4px solid #ab6e47' }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3a2418', margin: '2rem 0 0.6rem', lineHeight: 1.4 }}>{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#4a3728', margin: '1.5rem 0 0.5rem' }}>{children}</h4>
  ),
  p: ({ children }) => (
    <p style={{ margin: '0 0 1.1rem', color: '#2c1a10', lineHeight: 1.85, fontSize: '1rem' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: '0 0 1.1rem', paddingLeft: '1.6rem', listStyle: 'disc', color: '#2c1a10' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '0 0 1.1rem', paddingLeft: '1.6rem', listStyle: 'decimal', color: '#2c1a10' }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '0.4rem', lineHeight: 1.75 }}>{children}</li>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: '#ab6e47', textDecoration: 'underline', textUnderlineOffset: '3px', fontWeight: 600 }}>{children}</a>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 700, color: '#1e1208' }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ fontStyle: 'italic', color: '#4a3728' }}>{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft: '4px solid #ab6e47', margin: '1.5rem 0', padding: '0.75rem 1.5rem', background: 'rgba(171,110,71,0.07)', borderRadius: '0 12px 12px 0', color: '#5a3820', fontStyle: 'italic' }}>{children}</blockquote>
  ),
  hr: () => (
    <hr style={{ border: 'none', borderTop: '1.5px solid #e8ddd0', margin: '2.5rem 0' }} />
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.startsWith('language-');
    const lang = className?.replace('language-', '') ?? '';
    if (isBlock) {
      return (
        <div style={{ margin: '1.5rem 0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
          {lang && (
            <div style={{ background: '#2a1a0e', padding: '0.45rem 1.2rem', fontSize: '0.72rem', fontWeight: 700, color: '#c28659', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {lang}
            </div>
          )}
          <pre style={{ background: '#1a0f07', margin: 0, padding: '1.25rem 1.5rem', overflowX: 'auto' }}>
            <code style={{ color: '#f0e0cc', fontSize: '0.9rem', fontFamily: "'Courier New', 'Consolas', monospace", lineHeight: 1.7 }} {...props}>{children}</code>
          </pre>
        </div>
      );
    }
    return (
      <code style={{ background: 'rgba(171,110,71,0.12)', color: '#8b5a3c', padding: '0.2em 0.45em', borderRadius: '6px', fontSize: '0.875em', fontFamily: "'Courier New', monospace", fontWeight: 600 }} {...props}>{children}</code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '1.5rem 0', borderRadius: '12px', border: '1px solid #ddd0bc', boxShadow: '0 2px 8px rgba(44,24,16,0.06)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: 'linear-gradient(135deg, rgba(171,110,71,0.14), rgba(139,90,60,0.10))' }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th style={{ padding: '0.75rem 1.1rem', textAlign: 'left', fontWeight: 700, color: '#4a3728', borderBottom: '1.5px solid #ddd0bc', whiteSpace: 'nowrap' }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ padding: '0.65rem 1.1rem', color: '#2c1a10', borderBottom: '1px solid #ece5d8', verticalAlign: 'top' }}>{children}</td>
  ),
  img: ({ src, alt }) => (
    <img src={src} alt={alt} style={{ maxWidth: '100%', borderRadius: '14px', margin: '1.5rem 0', boxShadow: '0 4px 20px rgba(44,24,16,0.12)' }} />
  ),
};

export function ProjectDetailView({ project, onClose }: ProjectDetailViewProps) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #f5ede3 0%, #ede4d5 100%)' }}>
      {/* Full-width sticky top bar */}
      <div className="sticky top-0 z-50 border-b border-[#e8ddd0]"
        style={{ background: 'rgba(253,250,246,0.96)', backdropFilter: 'blur(14px)' }}>
        <div className="w-full px-6 sm:px-10 lg:px-16 h-16 flex items-center gap-5">
          <button onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:-translate-x-0.5 flex-shrink-0"
            style={{ color: '#8b5a3c', background: 'rgba(171,110,71,0.10)', border: '1.5px solid rgba(171,110,71,0.22)' }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-['Playfair_Display'] text-xl font-bold text-[#1e1208] truncate">{project.name}</h1>
        </div>
      </div>

      {/* Full-width content */}
      <div className="w-full px-6 sm:px-10 lg:px-16 py-10 pb-28">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: '#fdfaf6', border: '1px solid #ddd0bc', boxShadow: '0 8px 40px rgba(44,24,16,0.10)' }}
        >
          <div className="px-8 sm:px-14 lg:px-20 py-12">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {project.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
