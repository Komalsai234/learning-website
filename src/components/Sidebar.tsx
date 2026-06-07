import { X, CalendarDays, MessageSquare, Plus, BookOpen, ClipboardList } from 'lucide-react';
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
        className={`fixed inset-0 z-[190] transition-all duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none opacity-0'}`}
        style={{ background: isOpen ? 'rgba(30,18,8,0.45)' : 'transparent', backdropFilter: isOpen ? 'blur(4px)' : 'none' }}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-[200] flex flex-col transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full'} ${isMobile ? 'w-[270px]' : 'w-[288px]'}`}
        style={{
          background: 'rgba(248,242,234,0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '6px 0 48px rgba(44,24,16,0.16)',
          borderRight: '1px solid rgba(221,208,188,0.60)',
        }}
      >
        {/* Decorative top-right blob */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #c28659 0%, transparent 70%)', transform: 'translate(40%, -40%)' }} />

        {/* Header */}
        <div className="relative flex items-start justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #c28659, #8b5a3c)', boxShadow: '0 4px 14px rgba(139,90,60,0.35)' }}>
              <BookOpen className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <div className="font-['Playfair_Display'] font-bold text-[1.15rem] leading-tight"
                style={{ background: 'linear-gradient(135deg, #1e1208, #5a3820)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Aardra's
              </div>
              <div className="font-['Playfair_Display'] font-bold text-[1.15rem] leading-tight"
                style={{ background: 'linear-gradient(135deg, #c28659, #ab6e47)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Learnings
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#7a6858] hover:bg-[#ab6e47] hover:text-white transition-all duration-200 active:scale-95 mt-0.5"
            style={{ background: 'linear-gradient(135deg, #ede4d8, #e4d8c8)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px mb-5" style={{ background: 'linear-gradient(90deg, transparent, #ddd0bc, transparent)' }} />

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {[
            { page: 'weeks', label: 'Learning Weeks', icon: CalendarDays, badge: null },
            { page: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : null },
            { page: 'quiz', label: 'Quizzes', icon: ClipboardList, badge: null },
          ].map(({ page, label, icon: Icon, badge }) => {
            const active = currentPage === page;
            return (
              <button key={page} onClick={() => onNavigate(page)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-[.88rem] transition-all duration-200 group text-left"
                style={active ? {
                  background: 'linear-gradient(135deg, #ab6e47, #8b5a3c)',
                  color: '#fff',
                  boxShadow: '0 4px 16px rgba(171,110,71,0.28)',
                } : {
                  color: '#4a3728',
                }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={active ? { background: 'rgba(255,255,255,0.20)' } : { background: 'rgba(171,110,71,0.10)' }}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1">{label}</span>
                {badge !== null && (
                  <span className="text-[.68rem] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                    style={active
                      ? { background: 'rgba(255,255,255,0.25)', color: '#fff' }
                      : { background: '#dc2626', color: '#fff' }}>
                    {badge}
                  </span>
                )}
                {active && badge === null && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-5 h-px my-4" style={{ background: 'linear-gradient(90deg, transparent, #ddd0bc, transparent)' }} />

        {/* New Week CTA */}
        <div className="px-4 pb-7">
          <button onClick={onNewWeek}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl font-semibold text-[.88rem] text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: 'linear-gradient(135deg, #c28659 0%, #ab6e47 50%, #8b5a3c 100%)',
              boxShadow: '0 4px 20px rgba(171,110,71,0.32)',
            }}>
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
