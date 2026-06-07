import { Sunrise, Sun, Moon } from 'lucide-react';

export function Greeting() {
  const now = new Date();
  const h = now.getHours();

  const greeting =
    h < 12 ? { text: 'Good Morning', icon: 'sunrise' } :
    h < 17 ? { text: 'Good Afternoon', icon: 'sun' } :
              { text: 'Good Evening', icon: 'moon' };

  const iconColor = h < 12 ? '#f59e0b' : h < 17 ? '#f97316' : '#818cf8';

  return (
    <div className="flex flex-col items-center justify-center mb-12 animate-fadeInUp text-center">
      <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#1e1208] flex flex-wrap items-center justify-center gap-3 leading-tight">
        {greeting.icon === 'sunrise' && <Sunrise className="w-9 h-9 flex-shrink-0" style={{ color: iconColor }} strokeWidth={1.5} />}
        {greeting.icon === 'sun' && <Sun className="w-9 h-9 flex-shrink-0" style={{ color: iconColor }} strokeWidth={1.5} />}
        {greeting.icon === 'moon' && <Moon className="w-9 h-9 flex-shrink-0" style={{ color: iconColor }} strokeWidth={1.5} />}
        <span>{greeting.text},</span>
        <span style={{ background: 'linear-gradient(135deg, #ab6e47, #c28659)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Aardra Akka!
        </span>
      </h2>
    </div>
  );
}
