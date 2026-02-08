import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onAddWeek: () => void;
}

export function Navbar({ onAddWeek }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-[#f4ede4]/95 backdrop-blur-sm border-b border-[#d9cfc1] shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-lg text-[#2c1810]">
              Aardra's Learnings
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={onAddWeek}
              className="bg-[#ab6e47] hover:bg-[#8b5a3c] text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Week
            </Button>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e5dccf] rounded-full border border-[#d9cfc1]">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse-dot" />
              <span className="text-sm font-semibold text-[#5c4a3a]">Live</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
