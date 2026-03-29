import { Sunrise, Sun } from 'lucide-react';

export function Greeting() {
  const h = new Date().getHours();

  const greeting =
    h < 12
      ? { text: 'Good Morning, Aardra Akka', type: 'sunrise' }
      : h < 17
      ? { text: 'Good Afternoon, Aardra Akka', type: 'sun' }
      : { text: 'Good Evening, Aardra Akka', type: 'moon' };

  return (
    <div className="flex flex-col items-center justify-center mb-10 animate-fadeInUp">
      <h2 className="font-['Playfair_Display'] text-[2rem] font-extrabold mt-[10px] flex items-center gap-3">
        {greeting.type === 'sunrise' && (
          <Sunrise className="w-8 h-8 flex-shrink-0" style={{ color: '#f59e0b' }} strokeWidth={1.5} />
        )}
        {greeting.type === 'sun' && (
          <Sun className="w-8 h-8 flex-shrink-0" style={{ color: '#f97316' }} strokeWidth={1.5} />
        )}
        {greeting.type === 'moon' && (
          <span className="text-[1.8rem] leading-none">🌙</span>
        )}
        <span className="bg-gradient-to-r from-[#ab6e47] to-[#c28659] bg-clip-text text-transparent">
          {greeting.text}
        </span>
      </h2>
    </div>
  );
}