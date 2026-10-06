/**
 * Self-contained procedural Cute Lo-Fi Music Synthesizer using Web Audio API.
 * Zero external audio files required, completely resilient and hermetic.
 * Warm Rhodes-like electric piano chords, mellow music-box sparkles, and soft lo-fi beats.
 */

class CuteLofiEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: number | null = null;
  private masterGain: GainNode | null = null;
  private step = 0;
  private currentVolume = 0.35;

  // Chord notes in Hz (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
  private chords = [
    // Fmaj7: F3, A3, C4, E4
    [174.61, 220.0, 261.63, 329.63],
    // Em7: E3, G3, B3, D4
    [164.81, 196.0, 246.94, 293.66],
    // Dm7: D3, F3, A3, C4
    [146.83, 174.61, 220.0, 261.63],
    // Cmaj7: C3, E3, G3, B3
    [130.81, 164.81, 196.0, 246.94],
  ];

  // Sweet pentatonic sparkle notes (Kalimba/music-box arpeggio)
  private sparkles = [
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
    880.0,  // A5
    1046.5, // C6
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a soft mellow Rhodes/electric piano chord
  private playChord(chordIndex: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    const chord = this.chords[chordIndex % this.chords.length];

    chord.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const oscSub = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Mellow Lofi Tape Filter
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750 + i * 80, time);
      filter.Q.setValueAtTime(1.2, time);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      // Subtle warm detune
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(freq * 0.998, time);

      // Warm ADSR envelope
      noteGain.gain.setValueAtTime(0.0001, time);
      noteGain.gain.linearRampToValueAtTime(0.09, time + 0.06);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + 3.8);

      osc.connect(filter);
      oscSub.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(time);
      oscSub.start(time);
      osc.stop(time + 4.0);
      oscSub.stop(time + 4.0);
    });
  }

  // Play a gentle music box / kalimba sparkle
  private playSparkle(freq: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.04, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 1.3);
  }

  // Play a soft muffled lofi kick
  private playSoftKick(time: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.18);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  // Play a soft gentle snare/brush
  private playSoftSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;

    // Buffer of noise
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.035, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
  }

  public start() {
    if (this.isPlaying) {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    this.initContext();
    this.isPlaying = true;
    this.step = 0;

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Tempo: ~75 BPM (one beat every 800ms)
    const stepDuration = 800; // ms per beat

    const loop = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Chord changes every 4 beats
      const beat = this.step % 16;
      if (beat % 4 === 0) {
        const chordIdx = Math.floor(beat / 4);
        this.playChord(chordIdx, now);
      }

      // Soft beat rhythm
      if (beat === 0 || beat === 8) {
        this.playSoftKick(now);
      } else if (beat === 4 || beat === 12) {
        this.playSoftSnare(now);
      }

      // Occasional sweet melody sparkle
      if (Math.random() > 0.4) {
        const sparkleNote = this.sparkles[Math.floor(Math.random() * this.sparkles.length)];
        this.playSparkle(sparkleNote, now + Math.random() * 0.3);
      }

      this.step++;
      this.timerId = window.setTimeout(loop, stepDuration);
    };

    loop();
  }

  public resume() {
    if (!this.ctx) {
      this.start();
    } else {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (!this.isPlaying) {
        this.start();
      }
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }
}

export const lofiEngine = new CuteLofiEngine();
