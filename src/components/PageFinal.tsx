import { motion } from 'motion/react';
import { Sparkles, Calendar, Clock, Video } from 'lucide-react';
import { ScheduleData } from '../types';
import cozyScreenImage from '../assets/images/cute_video_call_cozy_1791272075203.jpg';

interface PageFinalProps {
  schedule: ScheduleData | null;
}

export function PageFinal({ schedule }: PageFinalProps) {
  const formattedDate = schedule?.formattedDate || 'Tanggal yang disepakati';
  const formattedTime = schedule?.formattedTime || 'Jam yang disepakati';

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-xl shadow-amber-900/5 border border-amber-100/90 text-center relative overflow-hidden"
      >
        {/* Decorative cozy illustration */}
        <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 mb-6 rounded-2xl overflow-hidden shadow-md border-4 border-amber-50">
          <img
            src={cozyScreenImage}
            alt="Ilustrasi santai video call dan lampu hangat"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Terkonfirmasi</span>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-800 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Sampai ketemu di video call nanti</span>
        </div>

        {/* Primary Required Final Text 1 */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl sm:text-3xl font-cute font-bold text-stone-900 tracking-tight leading-snug mb-4"
        >
          “makachii my tetehkuu nanti aa will wait for my tetehku”
        </motion.h1>

        {/* Primary Required Final Text 2 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-stone-700 text-sm sm:text-base leading-relaxed mb-6 font-medium text-balance"
        >
          “kabar2 teh aa cerita hehe... aa kesepian bener2 aa lost kontak sama semua temen aa...”
        </motion.div>

        {/* Schedule Summary Ticket */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-50 to-amber-50/40 border border-stone-200/80 text-left"
        >
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-2 mb-3">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-amber-600" />
              Jadwal Video Call Aa & Teteh
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-800 font-cute">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-stone-400 font-sans font-medium">Hari / Tanggal</div>
                <div className="text-sm sm:text-base font-bold text-stone-900">{formattedDate}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-stone-400 font-sans font-medium">Waktu Ngobrol</div>
                <div className="text-sm sm:text-base font-bold text-stone-900">{formattedTime}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Prominent Warm Sign-off */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="pt-4 border-t border-stone-100"
        >
          <p className="text-base sm:text-lg font-cute font-bold text-amber-800 flex items-center justify-center gap-2">
            <span>✨</span>
            <span>“See you on our video call”</span>
            <span>✨</span>
          </p>
          <p className="text-stone-400 text-xs mt-1 font-medium">
            Aa tunggu yaa teh, makasih banyak udah sempetin waktu hehe 🧸
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
