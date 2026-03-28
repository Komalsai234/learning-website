import { Menu, Bell } from 'lucide-react';

interface NavbarProps {
  onOpenSidebar: () => void;
  unreadCount?: number;
  onGoToMessages?: () => void;
}

export function Navbar({ onOpenSidebar, unreadCount = 0, onGoToMessages }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-[100] bg-[#f4ede4]/96 backdrop-blur-[14px] border-b border-[#d9cfc1] shadow-[0_1px_16px_rgba(44,24,16,.06)]">
      <div className="max-w-[1100px] mx-auto px-6 h-[58px] flex items-center justify-between">
        <div className="flex items-center gap-[14px]">
          <button
            onClick={onOpenSidebar}
            className="inline-flex items-center justify-center w-[36px] h-[36px] rounded-xl border-none bg-[#ece4da] text-[#5c4a3a] cursor-pointer flex-shrink-0 transition-all duration-200 hover:bg-[#ab6e47] hover:text-white"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>
          <span className="font-['Playfair_Display'] font-bold text-[1.05rem] text-[#2c1810]">
            Aardra's Learnings
          </span>
        </div>

        <button
          onClick={onGoToMessages}
          className="relative inline-flex items-center justify-center w-[38px] h-[38px] rounded-xl bg-[#ece4da] hover:bg-[#ab6e47] text-[#5c4a3a] hover:text-white transition-all duration-200"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-xl flex items-center justify-center px-1 shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}