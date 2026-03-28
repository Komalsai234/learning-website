import { X, CalendarDays, MessageSquare, Plus } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onNewWeek: () => void;
  unreadCount: number;
}

export function Sidebar({ isOpen, onClose, currentPage, onNavigate, onNewWeek, unreadCount }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[190] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-[#faf7f2] border-r border-[#d9cfc1] z-[200] flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-[18px] border-b border-[#e5dccf]">
          <div className="flex items-center gap-[9px]">
            <span className="text-[1.3rem]">🎓</span>
            <span className="font-['Playfair_Display'] font-bold text-[.97rem] text-[#2c1810]">
              Aardra's Learnings
            </span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-xl border-none bg-[#ece4da] text-[#5c4a3a] cursor-pointer transition-all duration-200 hover:bg-[#ab6e47] hover:text-white"
          >
            <X className="w-[13px] h-[13px]" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-[10px]">
          <button
            onClick={() => onNavigate('weeks')}
            className={`w-full inline-flex items-center gap-[11px] px-[13px] py-[11px] rounded-xl border-none font-['DM_Sans'] font-medium text-[.9rem] cursor-pointer text-left transition-all duration-200 mb-[6px] ${
              currentPage === 'weeks'
                ? 'bg-gradient-to-r from-[#ab6e47] to-[#8b5a3c] text-white'
                : 'bg-transparent text-[#5c4a3a] hover:bg-[#ece4da] hover:text-[#2c1810]'
            }`}
          >
            <CalendarDays className="w-4 h-4 flex-shrink-0" />
            Learning Weeks
          </button>

          <button
            onClick={() => onNavigate('messages')}
            className={`w-full inline-flex items-center gap-[11px] px-[13px] py-[11px] rounded-xl border-none font-['DM_Sans'] font-medium text-[.9rem] cursor-pointer text-left transition-all duration-200 mb-[6px] ${
              currentPage === 'messages'
                ? 'bg-gradient-to-r from-[#ab6e47] to-[#8b5a3c] text-white'
                : 'bg-transparent text-[#5c4a3a] hover:bg-[#ece4da] hover:text-[#2c1810]'
            }`}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            Messages
            {unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[.67rem] font-bold px-[7px] py-[2px] rounded-xl">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>

        <div className="p-[10px] border-t border-[#e5dccf]">
          <button
            onClick={onNewWeek}
            className="w-full inline-flex items-center justify-center gap-2 px-[14px] py-[11px] rounded-xl border-none bg-gradient-to-r from-[#ab6e47] to-[#8b5a3c] text-white font-['DM_Sans'] font-semibold text-[.9rem] cursor-pointer transition-all duration-200 shadow-[0_3px_14px_rgba(171,110,71,.3)] hover:shadow-[0_5px_20px_rgba(171,110,71,.45)] hover:-translate-y-[1px]"
          >
            <Plus className="w-4 h-4" />
            New Week
          </button>
        </div>
      </aside>
    </>
  );
}