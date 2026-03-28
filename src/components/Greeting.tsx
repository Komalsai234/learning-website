export function Greeting() {
  const h = new Date().getHours();
  const text =
    h < 12
      ? 'Good Morning, Aardra Akka'
      : h < 17
      ? 'Good Afternoon, Aardra Akka'
      : 'Good Evening, Aardra Akka';

  return (
    <div className="flex flex-col items-center justify-center mb-10 animate-fadeInUp">
      <h2 className="font-['Playfair_Display'] text-[2rem] font-extrabold mt-[10px] bg-gradient-to-r from-[#ab6e47] to-[#c28659] bg-clip-text text-transparent">
        {text}
      </h2>
    </div>
  );
}