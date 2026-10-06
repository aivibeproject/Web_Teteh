import { Sparkles, Coffee, Video, Star, Smile, Moon } from 'lucide-react';

export function FloatingDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Soft gradient background glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-amber-100/40 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/35 blur-3xl" />
      <div className="absolute top-[40%] right-[15%] w-[350px] h-[350px] rounded-full bg-rose-100/30 blur-3xl" />

      {/* Floating cute elements with gentle animations */}
      <div className="absolute top-12 left-[8%] animate-float-gentle text-amber-400/60 hidden sm:block">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="absolute top-28 right-[10%] animate-float-reverse text-amber-500/50 hidden sm:block">
        <Star className="w-6 h-6" />
      </div>

      <div className="absolute bottom-24 left-[12%] animate-float-reverse text-stone-400/40 hidden md:block">
        <Coffee className="w-7 h-7" />
      </div>

      <div className="absolute bottom-32 right-[14%] animate-float-gentle text-sky-400/50 hidden md:block">
        <Video className="w-6 h-6" />
      </div>

      <div className="absolute top-[48%] left-[5%] animate-sparkle text-emerald-400/50 hidden lg:block">
        <Smile className="w-6 h-6" />
      </div>

      <div className="absolute top-[20%] right-[25%] animate-sparkle text-indigo-300/40 hidden lg:block">
        <Moon className="w-5 h-5" />
      </div>
    </div>
  );
}
