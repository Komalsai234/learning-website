import { Menu, Bell, BookOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavbarProps {
  onOpenSidebar: () => void;
  unreadCount?: number;
  onGoToMessages?: () => void;
}

export function Navbar({ onOpenSidebar, unreadCount = 0, onGoToMessages }: NavbarProps) {
  const isMobile = useIsMobile();

  const btnBase: React.CSSProperties = { background: 'linear-gradient(135deg, #ece4da, #e0d4c8)', color: '#5c4a3a' };
  const btnHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'linear-gradient(135deg, #ab6e47, #8b5a3c)';
    e.currentTarget.style.color = '#ffffff';
  };
  const btnLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'linear-gradient(135deg, #ece4da, #e0d4c8)';
    e.currentTarget.style.color = '#5c4a3a';
  };

  return (
    <nav
      className="sticky top-0 z-[100] border-b border-[#d9cfc1]/60"
      style={{
        background: 'rgba(244, 237, 228, 0.96)',
        backdropFilter: 'blur(14px)',
        boxShadow: '0 1px 16px rgba(44,24,16,0.06)',
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ab6e47]/50 to-transparent" />

      <div
        className={`w-full h-[62px] flex items-center justify-between ${
          isMobile ? 'px-4' : 'px-6 sm:px-10 lg:px-16'
        }`}
      >
        {/* Left — menu + branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 flex-shrink-0"
            style={btnBase}
            onMouseEnter={btnHover}
            onMouseLeave={btnLeave}
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>

          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #c28659, #8b5a3c)' }}
            >
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-['Playfair_Display'] font-bold text-[1.05rem] text-[#2c1810] tracking-tight">
                Aardra's <span className="text-[#ab6e47]">Learnings</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right — bell */}
        <button
          onClick={onGoToMessages}
          className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
          style={btnBase}
          onMouseEnter={btnHover}
          onMouseLeave={btnLeave}
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm ring-2 ring-[#f4ede4]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}