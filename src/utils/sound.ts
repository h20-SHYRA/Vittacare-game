// Web Audio API Synthesized Sound Effects & Soft Lo-Fi Level Music for Guardiões Vittacare

interface LoFiPreset {
  name: string;
  bpm: number;
  chords: number[][]; // Jazz 7th/9th chord frequencies
  melody: number[];   // Gentle pentatonic/jazz melody notes
}

const LOFI_BIOME_PRESETS: LoFiPreset[] = [
  // 0: Levels 1-3 (Jardim Solar da Gestação) - Warm Morning Cmaj9 Lo-Fi
  {
    name: 'Lo-Fi Brisa da Manhã',
    bpm: 70,
    chords: [
      [130.81, 261.63, 329.63, 392.00, 493.88], // Cmaj7
      [110.00, 220.00, 261.63, 329.63, 392.00], // Am7
      [146.83, 293.66, 349.23, 440.00, 523.25], // Dm7
      [98.00,  246.94, 293.66, 349.23, 440.00], // G9
    ],
    melody: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88],
  },
  // 1: Levels 4-5 (Fortaleza da Pressão) - Cozy Rainy Chill-Hop Em9
  {
    name: 'Lo-Fi Calma na Tempestade',
    bpm: 74,
    chords: [
      [164.81, 246.94, 329.63, 392.00, 493.88], // Em7
      [130.81, 261.63, 329.63, 392.00, 493.88], // Cmaj7
      [110.00, 220.00, 261.63, 329.63, 392.00], // Am7
      [123.47, 246.94, 293.66, 369.99, 440.00], // Bm7
    ],
    melody: [659.25, 587.33, 493.88, 523.25, 587.33, 659.25, 493.88, 440.00],
  },
  // 2: Levels 6-8 (Metrópole Crepuscular) - Sunset Rhodes Fmaj9
  {
    name: 'Lo-Fi Horizonte Dourado',
    bpm: 72,
    chords: [
      [174.61, 261.63, 349.23, 440.00, 523.25], // Fmaj7
      [164.81, 246.94, 329.63, 392.00, 493.88], // Em7
      [146.83, 293.66, 349.23, 440.00, 523.25], // Dm7
      [130.81, 261.63, 329.63, 392.00, 493.88], // Cmaj7
    ],
    melody: [523.25, 659.25, 587.33, 523.25, 440.00, 523.25, 659.25, 783.99],
  },
  // 3: Levels 9-10 (Santuário de Cristal) - Dreamy Crystal Bell Dmaj9
  {
    name: 'Lo-Fi Santuário de Cristal',
    bpm: 68,
    chords: [
      [146.83, 293.66, 369.99, 440.00, 554.37], // Dmaj7
      [123.47, 246.94, 293.66, 369.99, 440.00], // Bm7
      [98.00,  246.94, 293.66, 369.99, 493.88], // Gmaj7
      [110.00, 220.00, 277.18, 329.63, 440.00], // A6
    ],
    melody: [554.37, 587.33, 659.25, 739.99, 659.25, 587.33, 493.88, 440.00],
  },
  // 4: Levels 11-14 (Vale Estelar) - Starlight Lullaby Ebmaj9
  {
    name: 'Lo-Fi Noite Estrelada',
    bpm: 66,
    chords: [
      [155.56, 233.08, 311.13, 392.00, 466.16], // Ebmaj7
      [130.81, 261.63, 311.13, 392.00, 466.16], // Cm7
      [174.61, 261.63, 349.23, 415.30, 523.25], // Fm7
      [116.54, 233.08, 293.66, 349.23, 466.16], // Bb7
    ],
    melody: [622.25, 587.33, 523.25, 466.16, 523.25, 587.33, 622.25, 698.46],
  },
  // 5: Levels 15-17 (Cidadela Real & Clínica Vittacare) - Golden Serenity Gmaj9
  {
    name: 'Lo-Fi Luz da Vittacare',
    bpm: 73,
    chords: [
      [98.00,  246.94, 293.66, 369.99, 493.88], // Gmaj7
      [164.81, 246.94, 329.63, 392.00, 493.88], // Em7
      [130.81, 261.63, 329.63, 392.00, 493.88], // Cmaj7
      [146.83, 293.66, 369.99, 440.00, 523.25], // D9
    ],
    melody: [587.33, 659.25, 739.99, 783.99, 739.99, 659.25, 587.33, 493.88],
  },
];

function getPresetForPhase(phaseNum: number): LoFiPreset {
  if (phaseNum <= 3) return LOFI_BIOME_PRESETS[0];
  if (phaseNum <= 5) return LOFI_BIOME_PRESETS[1];
  if (phaseNum <= 8) return LOFI_BIOME_PRESETS[2];
  if (phaseNum <= 10) return LOFI_BIOME_PRESETS[3];
  if (phaseNum <= 14) return LOFI_BIOME_PRESETS[4];
  return LOFI_BIOME_PRESETS[5];
}

class SoundController {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;
  public musicEnabled: boolean = true;

  private bgmInterval: number | null = null;
  private currentPhaseNum: number = 1;
  private stepCount: number = 0;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getTrackName(phaseNum: number): string {
    const preset = getPresetForPhase(phaseNum);
    return `${preset.name} (Nv. ${phaseNum})`;
  }

  public startLoFiMusic(phaseNum: number) {
    const phaseChanged = this.currentPhaseNum !== phaseNum;
    this.currentPhaseNum = phaseNum;

    if (this.muted || !this.musicEnabled) {
      this.stopLoFiMusic();
      return;
    }

    if (this.bgmInterval !== null && !phaseChanged) {
      // Ensure AudioContext is resumed if user just interacted
      this.getContext();
      return;
    }

    this.stopLoFiMusic();
    const preset = getPresetForPhase(phaseNum);
    // Slightly vary tempo per level for organic variety
    const effectiveBpm = preset.bpm + ((phaseNum % 3) - 1) * 2;
    const eighthNoteMs = Math.round((60 / effectiveBpm / 2) * 1000);
    this.stepCount = 0;

    // Trigger first warm chord immediately if context is active
    this.playLoFiStep(phaseNum, 0);

    this.bgmInterval = window.setInterval(() => {
      if (this.muted || !this.musicEnabled) return;
      this.stepCount = (this.stepCount + 1) % 32;
      this.playLoFiStep(this.currentPhaseNum, this.stepCount);
    }, eighthNoteMs);
  }

  public stopLoFiMusic() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public toggleLoFiMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled && !this.muted) {
      this.startLoFiMusic(this.currentPhaseNum);
    } else {
      this.stopLoFiMusic();
    }
    return this.musicEnabled;
  }

  private playLoFiStep(phaseNum: number, step: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    const preset = getPresetForPhase(phaseNum);
    const now = ctx.currentTime;

    // Subtle pitch transposition per level within the biome (-1, 0, or +1 semitone)
    const semitoneShift = (phaseNum % 3) - 1;
    const pitchFactor = Math.pow(2, semitoneShift / 12);

    // Master low-pass filter for warm muffled lo-fi Rhodes aesthetic
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(920, now);
    filter.Q.setValueAtTime(0.7, now);
    filter.connect(ctx.destination);

    const chordIdx = Math.floor(step / 8) % preset.chords.length;
    const chord = preset.chords[chordIdx];
    const stepInBar = step % 8;

    // 1. Warm Electric Piano (Rhodes) Chord Pad on step 0 of each bar (and gentle re-strum on step 5)
    if (stepInBar === 0 || stepInBar === 5) {
      const duration = stepInBar === 0 ? 2.4 : 1.1;
      const vol = stepInBar === 0 ? 0.016 : 0.009;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        // Mix sine and triangle for warm Rhodes bell + body
        osc.type = idx === 0 ? 'sine' : 'triangle';
        // Slight analog tape detune
        const detuneCents = (idx % 2 === 0 ? 1 : -1) * 3.5;
        osc.frequency.setValueAtTime(freq * pitchFactor, now);
        osc.detune.setValueAtTime(detuneCents, now);

        const noteStart = now + idx * 0.028; // Gentle harp-like strum
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(vol, noteStart + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);

        osc.connect(gain);
        gain.connect(filter);
        osc.start(noteStart);
        osc.stop(noteStart + duration + 0.05);
      });
    }

    // 2. Soft Lo-Fi Melody Bell (Plays sparse, relaxing notes on selected steps)
    const melodyPattern = [0, 2, 3, 5, 6];
    if (melodyPattern.includes(stepInBar)) {
      const melIndex = (step + phaseNum) % preset.melody.length;
      const melFreq = preset.melody[melIndex] * pitchFactor;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(melFreq, now + 0.02);

      gain.gain.setValueAtTime(0.0001, now + 0.02);
      gain.gain.linearRampToValueAtTime(0.013, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

      osc.connect(gain);
      gain.connect(filter);
      osc.start(now + 0.02);
      osc.stop(now + 0.8);
    }

    // 3. Soft Heartbeat Sub-Kick on step 0 and 4, and whisper brush on step 2 and 6
    if (stepInBar === 0 || stepInBar === 4) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(92, now);
      kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.14);

      kickGain.gain.setValueAtTime(0.022, now);
      kickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      kickOsc.connect(kickGain);
      kickGain.connect(filter);
      kickOsc.start(now);
      kickOsc.stop(now + 0.17);
    } else if (stepInBar === 2 || stepInBar === 6) {
      // Soft high-hat / shaker pulse using high triangle through lowpass
      const hatOsc = ctx.createOscillator();
      const hatGain = ctx.createGain();
      hatOsc.type = 'triangle';
      hatOsc.frequency.setValueAtTime(1480, now);
      hatOsc.frequency.exponentialRampToValueAtTime(620, now + 0.05);

      hatGain.gain.setValueAtTime(0.005, now);
      hatGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      hatOsc.connect(hatGain);
      hatGain.connect(filter);
      hatOsc.start(now);
      hatOsc.stop(now + 0.07);
    }
  }

  public playJump() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(590, now + 0.11);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playCheckpoint() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.055);
      gain.gain.setValueAtTime(0.09, now + i * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.055 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.055);
      osc.stop(now + i * 0.055 + 0.22);
    });
  }

  public playCollect() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.14); // G5
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playNurseSkill(pitchOffset = 0) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440 + pitchOffset, 554.37 + pitchOffset, 659.25 + pitchOffset];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.08, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.22);
    });
  }

  public playWavePulse() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playDamage() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.18);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playBossHit() {
    this.playBossPurify();
  }

  public playBossPurify() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [587.33, 739.99, 880, 1174.66];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.06);
      gain.gain.setValueAtTime(0.09, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.28);
    });
  }

  public playVictoryFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 659.25, t: 0.15, d: 0.15 },
      { f: 783.99, t: 0.3, d: 0.15 },
      { f: 1046.5, t: 0.45, d: 0.45 },
    ];
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);
      gain.gain.setValueAtTime(0.11, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });
  }
}

export const soundFX = new SoundController();
