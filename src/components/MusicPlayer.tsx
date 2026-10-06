import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Disc } from 'lucide-react';
import { lofiEngine } from '../utils/lofiAudio';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  // Automatic playback on mount and unblocking on first user interaction
  useEffect(() => {
    // Attempt automatic playback immediately
    try {
      lofiEngine.start();
      setIsPlaying(true);
    } catch (e) {
      console.log('Autoplay pending user gesture:', e);
    }

    // Modern browsers require a user gesture to un-suspend AudioContext
    const handleUserInteraction = () => {
      lofiEngine.resume();
      setIsPlaying(true);
    };

    window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Toggle playback manually if user wishes to pause
  const handleToggle = () => {
    const nextState = lofiEngine.toggle();
    setIsPlaying(nextState);
    if (nextState && isMuted) {
      lofiEngine.setVolume(0.35);
      setIsMuted(false);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) {
      lofiEngine.setVolume(0.35);
      setIsMuted(false);
    } else {
      lofiEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40 select-none">
      <div className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-amber-200/80 shadow-md shadow-amber-900/5 hover:shadow-lg transition-all">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-cute font-bold transition-all cursor-pointer ${
            isPlaying
              ? 'bg-amber-400 text-stone-900 shadow-sm'
              : 'bg-amber-50 text-stone-600 hover:bg-amber-100 hover:text-stone-900'
          }`}
          title={isPlaying ? 'Jeda Musik Lofi' : 'Putar Musik Lofi'}
        >
          {isPlaying ? (
            <Disc className="w-4 h-4 animate-spin-slow text-stone-900" />
          ) : (
            <Music className="w-3.5 h-3.5 text-amber-600" />
          )}

          <span className="hidden sm:inline">
            {isPlaying ? 'Lofi Playing ☕' : 'Lofi Paused 🎵'}
          </span>

          {/* Animated EQ sound bars when playing */}
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3.5 px-0.5">
              <span className="w-0.5 bg-stone-900 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
              <span className="w-0.5 bg-stone-900 rounded-full animate-bounce h-3.5" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 bg-stone-900 rounded-full animate-bounce h-2.5" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </button>

        {/* Mute button */}
        <button
          type="button"
          onClick={handleMuteToggle}
          className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 hover:bg-amber-100/70 transition-colors cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-stone-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-amber-700" />
          )}
        </button>
      </div>
    </div>
  );
}
