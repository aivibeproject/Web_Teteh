import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import {
  formatIndonesianDate,
  formatIndonesianTime,
  getTodayString,
  getRelativeDateString,
  getNextWeekendString,
} from '../utils/date';
import { ScheduleData } from '../types';
import plannerImage from '../assets/images/cute_calendar_clock_planner_1791271930196.jpg';

interface PageScheduleProps {
  onConfirm: (schedule: ScheduleData) => Promise<void>;
}

export function PageSchedule({ onConfirm }: PageScheduleProps) {
  // Initial state: empty so user actively chooses or clicks a preset
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  const todayStr = getTodayString();
  const tomorrowStr = getRelativeDateString(1);
  const lusaStr = getRelativeDateString(2);
  const weekendStr = getNextWeekendString();

  const isComplete = Boolean(selectedDate && selectedTime);

  const formattedDate = formatIndonesianDate(selectedDate);
  const formattedTime = formatIndonesianTime(selectedTime);

  const handlePresetDate = (d: string) => {
    setSelectedDate(d);
    setShowError(false);
  };

  const handleSubmit = async () => {
    if (!isComplete) {
      setShowError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        date: selectedDate,
        time: selectedTime,
        formattedDate,
        formattedTime,
      });
    } catch (err) {
      console.error('Failed to submit schedule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto select-none">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-xl shadow-amber-900/5 border border-amber-100/90 text-left relative"
      >
        {/* Header with cozy planner illustration */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-md border-3 border-amber-100 shrink-0">
            <img
              src={plannerImage}
              alt="Planner kalender estetik dan secangkir teh hangat"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Step 2 — Atur Waktu Nyantai</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-cute font-bold text-stone-900 tracking-tight">
              “When estimation?”
            </h2>
            <p className="text-amber-800/90 text-sm sm:text-base font-medium mt-1 leading-relaxed">
              “pastikan udh beres semusa, ini biar aa tenang hehe, dan puas happy lama kita hehe”
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="space-y-6 pt-2">
          {/* 1. Date Selection Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-100/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-cute font-bold text-stone-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Pilih Hari & Tanggal</span>
              </label>
              {selectedDate && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terpilih
                </span>
              )}
            </div>

            {/* Quick date presets */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => handlePresetDate(todayStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedDate === todayStr
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-white text-stone-700 border border-amber-200/70 hover:bg-amber-100/50'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => handlePresetDate(tomorrowStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedDate === tomorrowStr
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-white text-stone-700 border border-amber-200/70 hover:bg-amber-100/50'
                }`}
              >
                Besok
              </button>
              <button
                type="button"
                onClick={() => handlePresetDate(lusaStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedDate === lusaStr
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-white text-stone-700 border border-amber-200/70 hover:bg-amber-100/50'
                }`}
              >
                Lusa
              </button>
              <button
                type="button"
                onClick={() => handlePresetDate(weekendStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedDate === weekendStr
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-white text-stone-700 border border-amber-200/70 hover:bg-amber-100/50'
                }`}
              >
                Weekend Ini
              </button>
            </div>

            {/* Native Date Picker */}
            <div className="relative">
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setShowError(false);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* 2. Time Selection Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-100/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-cute font-bold text-stone-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pilih Jam / Waktu</span>
              </label>
              {selectedTime && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terpilih
                </span>
              )}
            </div>

            {/* Native Time Picker */}
            <div className="relative">
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  setShowError(false);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* 3. Clearly Formatted Schedule Display */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-100/60 via-orange-50/60 to-emerald-50/60 border border-amber-200/80 shadow-inner">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Jadwal yang kamu pilih:
            </p>
            <div className="space-y-1.5 font-cute">
              <div className="text-base sm:text-lg font-bold text-stone-800 flex items-center gap-2">
                <span className="text-xl">📅</span>
                <span>Date:</span>
                <span className={formattedDate ? 'text-amber-800' : 'text-stone-400 font-normal italic'}>
                  {formattedDate || '[Belum dipilih]'}
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-stone-800 flex items-center gap-2">
                <span className="text-xl">⏰</span>
                <span>Time:</span>
                <span className={formattedTime ? 'text-emerald-800' : 'text-stone-400 font-normal italic'}>
                  {formattedTime || '[Belum dipilih]'}
                </span>
              </div>
            </div>
          </div>

          {/* Validation Error Message */}
          {showError && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-xs sm:text-sm font-medium rounded-xl border border-rose-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>Tetehku pilih tanggal dan jamnya dulu yaa sebelum klik Confirm hehe ✨</span>
            </motion.div>
          )}

          {/* Confirm Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-2xl font-cute font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                isComplete
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-stone-950 shadow-amber-400/25 active:scale-[0.99]'
                  : 'bg-stone-200 text-stone-400 border border-stone-300 shadow-none cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menyimpan jadwal kita... ✨</span>
                </>
              ) : (
                <>
                  <span>Confirm</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
            {!isComplete && (
              <p className="text-center text-stone-400 text-xs mt-2 font-medium">
                *Tombol Confirm akan aktif setelah tanggal dan jam dipilih
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
