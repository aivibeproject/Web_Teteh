import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap } from 'lucide-react';
import { triggerCuteConfetti } from '../utils/confetti';
import mascotImage from '../assets/images/cute_friend_mascot_greeting_1791271917028.jpg';

interface PageInvitationProps {
  onAccept: () => void;
}

const PLAYFUL_PHRASES = [
  'Eits gak kena hehe! 😜',
  'Meleset teh wlee 🏃‍♂️💨',
  'Aa gamau ditolak ;C please',
  'Tombol ini rusak kayanya :P',
  'Pilih yang YES aja dong teh! ✨',
  'Hayoo gabisa diklik kan 🙈',
  'Tombol YES lebih empuk lho~ 🧸',
  'Aa udah kangen ngobrol hehe 🥺',
  'Pencet YES sekarang yaa! 🎉',
];

export function PageInvitation({ onAccept }: PageInvitationProps) {
  const [noAttempts, setNoAttempts] = useState(0);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [isWiggling, setIsWiggling] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const lastDodgeTime = useRef<number>(0);

  // Function to move the NO button randomly within safe screen bounds
  const moveNoButton = useCallback(() => {
    const now = Date.now();
    // Throttle slightly to keep animations pleasant and not chaotic
    if (now - lastDodgeTime.current < 160) return;
    lastDodgeTime.current = now;

    if (!noBtnRef.current) return;

    const btnRect = noBtnRef.current.getBoundingClientRect();
    const btnWidth = btnRect.width || 100;
    const btnHeight = btnRect.height || 45;

    // Viewport dimensions with safe padding
    const padding = 24;
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Target random position anywhere inside visible viewport
    const minTargetX = padding;
    const maxTargetX = screenW - btnWidth - padding;
    const minTargetY = padding + 60; // leave top space
    const maxTargetY = screenH - btnHeight - padding;

    // Generate random target within viewport bounds
    const targetX = Math.random() * (maxTargetX - minTargetX) + minTargetX;
    const targetY = Math.random() * (maxTargetY - minTargetY) + minTargetY;

    // Compute relative delta from the original layout position of button
    const initialCenterX = btnRect.left - noPosition.x;
    const initialCenterY = btnRect.top - noPosition.y;

    const deltaX = targetX - initialCenterX;
    const deltaY = targetY - initialCenterY;

    setNoPosition({ x: deltaX, y: deltaY });
    setHasMoved(true);
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 400);

    setNoAttempts((prev) => {
      const next = prev + 1;
      const phraseIndex = (next - 1) % PLAYFUL_PHRASES.length;
      setCurrentPhrase(PLAYFUL_PHRASES[phraseIndex]);
      return next;
    });
  }, [noPosition.x, noPosition.y]);

  // Track mouse proximity to dodge before cursor lands directly on NO
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!noBtnRef.current) return;
      const rect = noBtnRef.current.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

      // Proximity threshold trigger: within 65px radius
      if (dist < 65) {
        moveNoButton();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [moveNoButton]);

  const handleYesClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerCuteConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
    onAccept();
  };

  // Progressive scaling calculations for YES button
  const yesScale = 1 + Math.min(noAttempts * 0.16, 1.25);
  // NO button shrinks slightly
  const noScale = Math.max(0.65, 1 - noAttempts * 0.06);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto select-none"
    >
      {/* Decorative Warm Invitation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-xl shadow-amber-900/5 border border-amber-100/80 text-center relative overflow-visible"
      >
        {/* Subtle cute mascot picture */}
        <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 mb-6 rounded-2xl overflow-hidden shadow-md border-4 border-amber-50">
          <img
            src={mascotImage}
            alt="Mascot sahabat ramah sedang ngopi bareng"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 right-2 bg-amber-400 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-white" />
            <span>Dari Aa</span>
          </div>
        </div>

        {/* Prominent Center Invitation Message */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-cute font-bold text-stone-800 tracking-tight leading-snug sm:leading-relaxed mb-4 text-balance">
          “Tetehku aa boleh video call sama aa hehe?
          <br className="hidden sm:inline" />
          <span className="text-amber-700 block mt-2 text-lg sm:text-2xl font-semibold">
            aa mau ngobrol2 udh lama biar semangat ;C please”
          </span>
        </h1>

        <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto mb-8 font-medium">
          Santai aja teh , bukan hari ini kok nanti ada pilihan tanggal .. aa mau mastiin biar tenang
        </p>

        {/* Buttons Action Area */}
        <div className="relative min-h-[140px] flex items-center justify-center gap-5 sm:gap-8 flex-wrap pt-2 pb-6">
          {/* YES Button - Progressively grows larger */}
          <motion.div
            style={{ zIndex: 30 }}
            animate={{ scale: yesScale }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          >
            <motion.button
              onClick={handleYesClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative group rounded-full font-cute font-bold shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                noAttempts > 2
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-400/30'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 shadow-amber-400/30'
              } ${
                noAttempts > 3
                  ? 'px-9 py-4 text-xl sm:text-2xl ring-4 ring-amber-300 ring-offset-2'
                  : noAttempts > 1
                  ? 'px-7 py-3.5 text-lg sm:text-xl'
                  : 'px-6 py-3 text-base sm:text-lg'
              }`}
            >
              <Sparkles className="w-5 h-5 animate-spin-slow text-amber-200" />
              <span>
                {noAttempts === 0
                  ? 'YES ✨'
                  : noAttempts === 1
                  ? 'YES! Mau dongg ✨'
                  : noAttempts === 2
                  ? 'YES! (PILIH AKU TEH!) ✨'
                  : noAttempts === 3
                  ? 'YESSS BANGETT! 🎉'
                  : 'YES! GAK ADA PILIHAN LAIN HEHE ✨'}
              </span>
            </motion.button>
          </motion.div>

          {/* NO Button - Runaway playful dodging button */}
          <motion.div
            style={{ zIndex: 40 }}
            animate={{
              x: noPosition.x,
              y: noPosition.y,
              scale: noScale,
            }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 24,
              mass: 0.6,
            }}
            className={hasMoved ? 'fixed pointer-events-auto' : 'relative'}
          >
            {/* Playful Floating Speech Bubble when dodging */}
            <AnimatePresence>
              {currentPhrase && (
                <motion.div
                  key={noAttempts}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: -42, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-stone-800 text-amber-200 text-xs font-cute font-medium rounded-full shadow-md pointer-events-none z-50 flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{currentPhrase}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              ref={noBtnRef}
              type="button"
              onMouseEnter={moveNoButton}
              onTouchStart={moveNoButton}
              onClick={moveNoButton}
              className={`px-5 py-2.5 rounded-full font-cute font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 border border-stone-200/80 shadow-sm transition-colors cursor-pointer select-none text-sm sm:text-base ${
                isWiggling ? 'animate-wiggle' : ''
              }`}
            >
              <span>{noAttempts > 2 ? 'NO (Rusak 😅)' : 'NO'}</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
