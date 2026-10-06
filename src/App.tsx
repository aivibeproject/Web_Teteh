/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PageInvitation } from './components/PageInvitation';
import { PageSchedule } from './components/PageSchedule';
import { PageFinal } from './components/PageFinal';
import { FloatingDecorations } from './components/FloatingDecorations';
import { AdminModal } from './components/AdminModal';
import { MusicPlayer } from './components/MusicPlayer';
import { ScheduleData } from './types';

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Check URL query parameters for ?admin=aa_rahasia on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'aa_rahasia' || params.get('admin') === 'true') {
      setIsAdminOpen(true);
    }

    // Keyboard shortcut for Aa: Ctrl + Shift + A to open hidden admin
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAcceptInvitation = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmSchedule = async (selectedSchedule: ScheduleData) => {
    setSchedule(selectedSchedule);

    // Secretly save response to backend (which forwards to Google Sheets)
    try {
      const nowStr = new Date()
        .toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' })
        .replace('T', ' ')
        .slice(0, 16);

      const localRecord = {
        id: Date.now().toString(36),
        timestamp: nowStr,
        answer: 'YES',
        selectedDate: selectedSchedule.date,
        selectedTime: selectedSchedule.time,
        formattedDate: selectedSchedule.formattedDate,
        formattedTime: selectedSchedule.formattedTime,
        savedToGoogleSheet: false,
      };

      try {
        const stored = JSON.parse(localStorage.getItem('invitation_records') || '[]');
        stored.unshift(localRecord);
        localStorage.setItem('invitation_records', JSON.stringify(stored));
      } catch {}

      await fetch('/api/save-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: 'YES',
          selectedDate: selectedSchedule.date,
          selectedTime: selectedSchedule.time,
          formattedDate: selectedSchedule.formattedDate,
          formattedTime: selectedSchedule.formattedTime,
          timestamp: nowStr,
        }),
      });
    } catch (err) {
      console.warn('Network error when recording response (handled silently):', err);
    }

    // Transition smoothly to Page 3
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-stone-800 flex flex-col justify-between relative overflow-x-hidden">
      {/* Ambient cute floating background decorations */}
      <FloatingDecorations />

      {/* Cute Lo-Fi Music Player Widget */}
      <MusicPlayer />

      {/* Subtle top indicator bar */}
      <header className="relative z-10 w-full pt-6 pb-2 px-4 max-w-lg mx-auto flex items-center justify-center">
        {/* Step progress pills */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              step >= 1 ? 'bg-amber-400 text-stone-900 font-bold shadow-sm' : 'bg-stone-200 text-stone-500'
            }`}
          >
            1
          </span>
          <span className="w-3 h-0.5 bg-stone-200" />
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              step >= 2 ? 'bg-amber-400 text-stone-900 font-bold shadow-sm' : 'bg-stone-200 text-stone-500'
            }`}
          >
            2
          </span>
          <span className="w-3 h-0.5 bg-stone-200" />
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
              step >= 3 ? 'bg-emerald-500 text-white font-bold shadow-sm' : 'bg-stone-200 text-stone-500'
            }`}
          >
            3
          </span>
        </div>
      </header>

      {/* Main Pages with Smooth Page Transitions */}
      <main className="relative z-10 flex-1 flex flex-col justify-center py-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <PageInvitation onAccept={handleAcceptInvitation} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <PageSchedule onConfirm={handleConfirmSchedule} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <PageFinal schedule={schedule} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Hidden Admin Modal for Aa (Google Sheets Sync & Logs) */}
      <AdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}
