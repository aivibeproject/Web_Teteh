import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Disc } from 'lucide-react';
import { lofiEngine } from '../utils/lofiAudio';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YOUTUBE_VIDEO_ID = 'BksBNbTIoPE'; // Jung Kook - Still With You
const SONG_NAME = 'Jung Kook - Still With You';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize YouTube IFrame Player with bulletproof automatic play
  useEffect(() => {
    let playerInstance: any = null;

    const playViaIframeMessage = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
            '*'
          );
        }
      } catch {}
    };

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      try {
        playerInstance = new window.YT.Player('youtube-music-player', {
          height: '1',
          width: '1',
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              playerRef.current = event.target;
              try {
                event.target.playVideo();
                setIsPlaying(true);
              } catch (e) {
                console.log('Autoplay deferred:', e);
              }
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                // Loop song
                event.target.playVideo();
              }
            },
            onError: (err: any) => {
              console.warn('YouTube playback fallback:', err);
              lofiEngine.start();
              setIsPlaying(true);
            },
          },
        });
      } catch (err) {
        console.error('Failed to init YouTube player:', err);
        lofiEngine.start();
        setIsPlaying(true);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.getElementById('yt-iframe-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    // Attempt direct play immediately via message
    playViaIframeMessage();

    // Browser autoplay policy: automatically un-pause on the very first user interaction anywhere
    const handleFirstGesture = () => {
      playViaIframeMessage();
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.playVideo();
          setIsPlaying(true);
        } catch {
          lofiEngine.resume();
        }
      } else {
        lofiEngine.resume();
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      if (playerInstance && playerInstance.destroy) {
        try {
          playerInstance.destroy();
        } catch {}
      }
    };
  }, []);

  const handleToggle = () => {
    if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
      try {
        const state = playerRef.current.getPlayerState();
        if (state === 1) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          playerRef.current.playVideo();
          setIsPlaying(true);
        }
        return;
      } catch {}
    }

    // Toggle via iframe postMessage as secondary method
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isPlaying ? 'pauseVideo' : 'playVideo';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
      setIsPlaying(!isPlaying);
      return;
    }

    // Fallback to procedural synth
    const state = lofiEngine.toggle();
    setIsPlaying(state);
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current && typeof playerRef.current.isMuted === 'function') {
      try {
        if (playerRef.current.isMuted()) {
          playerRef.current.unMute();
          setIsMuted(false);
        } else {
          playerRef.current.mute();
          setIsMuted(true);
        }
        return;
      } catch {}
    }

    // PostMessage mute toggle
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isMuted ? 'unMute' : 'mute';
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: command, args: '' }),
        '*'
      );
      setIsMuted(!isMuted);
      return;
    }

    // Fallback
    if (isMuted) {
      lofiEngine.setVolume(0.35);
      setIsMuted(false);
    } else {
      lofiEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <>
      {/* Hidden YouTube Iframe Audio Player */}
      <div
        className="fixed bottom-0 right-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden z-[-1]"
        aria-hidden="true"
      >
        <iframe
          ref={iframeRef}
          id="youtube-music-player"
          src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&enablejsapi=1&playsinline=1&controls=0`}
          allow="autoplay; encrypted-media"
          title="Background Music"
          className="w-1 h-1 border-0"
        />
      </div>

      {/* Floating Music Controls Widget */}
      <div className="fixed top-4 right-4 z-40 select-none">
        <div className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-full bg-white/95 backdrop-blur-md border border-amber-200/80 shadow-md shadow-amber-900/5 hover:shadow-lg transition-all">
          {/* Main Play/Pause Button */}
          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-cute font-bold transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-400 text-stone-900 shadow-sm'
                : 'bg-amber-50 text-stone-600 hover:bg-amber-100 hover:text-stone-900'
            }`}
            title={isPlaying ? 'Jeda Musik' : `Putar ${SONG_NAME}`}
          >
            {isPlaying ? (
              <Disc className="w-4 h-4 animate-spin-slow text-stone-900" />
            ) : (
              <Music className="w-3.5 h-3.5 text-amber-600" />
            )}

            <span className="hidden sm:inline">
              {isPlaying ? `${SONG_NAME} 🎶` : 'Play Music 🎵'}
            </span>

            {/* Animated Equalizer Sound Bars */}
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3.5 px-0.5">
                <span className="w-0.5 bg-stone-900 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 bg-stone-900 rounded-full animate-bounce h-3.5" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 bg-stone-900 rounded-full animate-bounce h-2.5" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </button>

          {/* Mute/Unmute Toggle */}
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
    </>
  );
}
