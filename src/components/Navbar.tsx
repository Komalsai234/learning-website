import { Menu, Bell, BookOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavbarProps {
  onOpenSidebar: () => void;
  unreadCount?: number;
  onGoToMessages?: () => void;
}

export function Navbar({ onOpenSidebar, unreadCount = 0, onGoToMessages }: NavbarProps) {
  const isMobile = useIsMobile();

  return (
    <nav className="sticky top-0 z-[100]" style={{
      background: 'rgba(245,237,227,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(221,208,188,0.6)',
      boxShadow: '0 2px 20px rgba(44,24,16,0.07)',
    }}>
      <div className={`flex items-center justify-between h-16 ${isMobile ? 'px-4' : 'px-6 sm:px-10 lg:px-16'}`}>

        {/* Left — menu + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#4a3728] transition-all duration-200 hover:bg-[#ab6e47] hover:text-white active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ede4d8, #e4d8c8)' }}
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #c28659, #8b5a3c)', boxShadow: '0 3px 12px rgba(139,90,60,0.35)' }}>
              <BookOpen className="w-[18px] h-[18px] text-white" strokeWidth={2} />
            </div>
            <div className="leading-none">
              <div className="font-['Playfair_Display'] font-bold text-[1.20rem] tracking-tight"
                style={{ background: 'linear-gradient(135deg, #1e1208, #5a3820)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Aardra's{' '}
                <span style={{ background: 'linear-gradient(135deg, #c28659, #ab6e47)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Learnings
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — notification bell */}
        <button
          onClick={onGoToMessages}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-[#4a3728] transition-all duration-200 hover:bg-[#ab6e47] hover:text-white active:scale-95"
          style={{ background: 'linear-gradient(135deg, #ede4d8, #e4d8c8)' }}
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow ring-2 ring-[#f5ede3]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
