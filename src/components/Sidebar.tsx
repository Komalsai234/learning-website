import { X, CalendarDays, MessageSquare, Plus, BookOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onNewWeek: () => void;
  unreadCount: number;
}

export function Sidebar({ isOpen, onClose, currentPage, onNavigate, onNewWeek, unreadCount }: SidebarProps) {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[190] transition-all duration-300 ${
          isOpen ? 'bg-black/50 backdrop-blur-[3px] pointer-events-auto' : 'bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-[200] flex flex-col transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isMobile ? 'w-[270px]' : 'w-[300px]'}`}
        style={{
          background: 'rgba(244, 237, 228, 0.98)',
          backdropFilter: 'blur(16px)',
          boxShadow: '4px 0 40px rgba(44,24,16,0.14)',
          borderRight: '1px solid rgba(217,207,193,0.6)',
        }}
      >
        {/* Decorative blob */}
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #c28659 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #c28659, #8b5a3c)' }}
            >
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-['Playfair_Display'] font-bold text-[.95rem] text-[#2c1810] leading-tight">
                Aardra's
              </div>
              <div className="font-['Playfair_Display'] font-bold text-[.95rem] text-[#ab6e47] leading-tight">
                Learnings
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-[#5c4a3a] hover:text-white transition-all duration-200 shadow-sm"
            style={{ background: 'linear-gradient(135deg, #ece4da, #e0d4c8)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #ab6e47, #8b5a3c)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #ece4da, #e0d4c8)'; e.currentTarget.style.color = '#5c4a3a'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#d9cfc1] to-transparent mb-4" />

        {/* Nav label */}
        <div className="px-5 mb-2">
          <span className="text-[.68rem] font-bold uppercase tracking-[.12em] text-[#b09a8a]">Navigation</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          <button
            onClick={() => onNavigate('weeks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[.9rem] transition-all duration-200 group ${
              currentPage === 'weeks'
                ? 'text-white shadow-md'
                : 'text-[#5c4a3a] hover:text-[#2c1810]'
            }`}
            style={
              currentPage === 'weeks'
                ? { background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 4px 14px rgba(171,110,71,0.3)' }
                : {}
            }
            onMouseEnter={e => { if (currentPage !== 'weeks') e.currentTarget.style.background = 'rgba(236,228,218,0.8)'; }}
            onMouseLeave={e => { if (currentPage !== 'weeks') e.currentTarget.style.background = ''; }}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              currentPage === 'weeks' ? 'bg-white/20' : 'bg-[#e5dccf] group-hover:bg-[#d9cfc1]'
            }`}>
              <CalendarDays className="w-4 h-4" />
            </div>
            <span>Learning Weeks</span>
            {currentPage === 'weeks' && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
            )}
          </button>

          <button
            onClick={() => onNavigate('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[.9rem] transition-all duration-200 group ${
              currentPage === 'messages'
                ? 'text-white shadow-md'
                : 'text-[#5c4a3a] hover:text-[#2c1810]'
            }`}
            style={
              currentPage === 'messages'
                ? { background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)', boxShadow: '0 4px 14px rgba(171,110,71,0.3)' }
                : {}
            }
            onMouseEnter={e => { if (currentPage !== 'messages') e.currentTarget.style.background = 'rgba(236,228,218,0.8)'; }}
            onMouseLeave={e => { if (currentPage !== 'messages') e.currentTarget.style.background = ''; }}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              currentPage === 'messages' ? 'bg-white/20' : 'bg-[#e5dccf] group-hover:bg-[#d9cfc1]'
            }`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className={`ml-auto text-[.7rem] font-bold px-2 py-0.5 rounded-full ${
                currentPage === 'messages' ? 'bg-white/25 text-white' : 'bg-red-500 text-white'
              }`}>
                {unreadCount}
              </span>
            )}
            {currentPage === 'messages' && unreadCount === 0 && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
            )}
          </button>
        </nav>

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#d9cfc1] to-transparent mb-4" />

        {/* Bottom CTA */}
        <div className="px-4 pb-6">
          <button
            onClick={onNewWeek}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl font-semibold text-[.92rem] text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: 'linear-gradient(135deg, #c28659 0%, #ab6e47 50%, #8b5a3c 100%)',
              boxShadow: '0 4px 18px rgba(171,110,71,0.35)',
            }}
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            New Learning Week
          </button>
        </div>
      </aside>
    </>
  );
}