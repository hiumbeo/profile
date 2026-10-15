class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentVolume = 0.5;
  private currentType: 'synth_lofi' | 'synth_ambient' | 'synth_cyber' | 'custom_url' | 'uploaded_audio' = 'synth_lofi';
  private rainNode: AudioNode | null = null;
  private musicInterval: number | null = null;
  private masterGain: GainNode | null = null;
  private customAudioEl: HTMLAudioElement | null = null;
  private customUrl: string | undefined = undefined;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
    }
    if (this.customAudioEl) {
      this.customAudioEl.volume = this.currentVolume;
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public play(
    type: 'synth_lofi' | 'synth_ambient' | 'synth_cyber' | 'custom_url' | 'uploaded_audio',
    customUrl?: string,
    loop: boolean = true
  ) {
    this.init();
    this.stop();
    this.currentType = type;
    this.customUrl = customUrl;

    if (customUrl) {
      try {
        this.customAudioEl = new Audio(customUrl);
        this.customAudioEl.loop = loop;
        this.customAudioEl.volume = this.currentVolume;
        this.customAudioEl.play().catch(() => {
          // If custom URL fails (e.g. CORS or 404), fallback to procedural synth
          const fallbackType = (type === 'synth_ambient' || type === 'synth_cyber' || type === 'synth_lofi') 
            ? type 
            : 'synth_lofi';
          this.playProcedural(fallbackType);
        });
        this.isPlaying = true;
        return;
      } catch {
        const fallbackType = (type === 'synth_ambient' || type === 'synth_cyber' || type === 'synth_lofi') 
          ? type 
          : 'synth_lofi';
        this.playProcedural(fallbackType);
        return;
      }
    }

    if (type === 'custom_url' || type === 'uploaded_audio') {
      this.playProcedural('synth_lofi');
      return;
    }

    this.playProcedural(type);
  }

  private playProcedural(type: 'synth_lofi' | 'synth_ambient' | 'synth_cyber') {
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = true;

    // Start rain / ambient atmosphere
    this.startRainAtmosphere();

    // Start musical progression according to type
    if (type === 'synth_lofi') {
      this.startLofiChords();
    } else if (type === 'synth_ambient') {
      this.startAmbientDrone();
    } else if (type === 'synth_cyber') {
      this.startCyberSynth();
    }
  }

  private startRainAtmosphere() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      
      // Pink noise algorithm for soothing natural rain sound
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.04; // Gentle rain volume
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter rain to sound like outside a cozy window
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(200, this.ctx.currentTime);

      const rainGain = this.ctx.createGain();
      rainGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(highpass);
      highpass.connect(rainGain);
      rainGain.connect(this.masterGain);

      whiteNoise.start();
      this.rainNode = whiteNoise;
    } catch {
      // Ignored
    }
  }

  private startLofiChords() {
    if (!this.ctx || !this.masterGain) return;
    // Nostalgic lofi chord progression: Fmaj7 -> Em7 -> Dm7 -> Cmaj7
    const chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [164.81, 196.00, 246.94, 293.66], // Em7 (E3, G3, B3, D4)
      [146.83, 174.61, 220.00, 261.63], // Dm7 (D3, F3, A3, C4)
      [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
    ];

    let chordIdx = 0;
    const playNextChord = () => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      const now = this.ctx.currentTime;
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        // Slight tape wobble / chorus
        lfo.frequency.setValueAtTime(1.5 + i * 0.2, now);
        lfoGain.gain.setValueAtTime(1.2, now);
        lfo.connect(osc.frequency);
        lfo.start(now);

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Warm lofi envelope
        const stagger = i * 0.06;
        noteGain.gain.setValueAtTime(0, now + stagger);
        noteGain.gain.linearRampToValueAtTime(0.045, now + stagger + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + stagger + 3.8);

        osc.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now + stagger);
        osc.stop(now + stagger + 4.0);
        lfo.stop(now + stagger + 4.0);
      });
    };

    playNextChord();
    this.musicInterval = window.setInterval(playNextChord, 4200);
  }

  private startAmbientDrone() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const freqs = [110, 164.81, 220, 329.63]; // A major 9th ambient pad
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.015 / (idx + 1), now);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
    });
  }

  private startCyberSynth() {
    if (!this.ctx || !this.masterGain) return;
    // Cyberpunk pulsing bassline and synth arp
    const baseFreqs = [55, 65.41, 73.42, 82.41]; // A1, C2, D2, E2
    let step = 0;
    const playCyberBeat = () => {
      if (!this.ctx || !this.isPlaying || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const freq = baseFreqs[Math.floor(step / 4) % baseFreqs.length];
      const oct = (step % 4) === 0 ? 1 : 2;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq * oct, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.3);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.4);
      step++;
    };

    playCyberBeat();
    this.musicInterval = window.setInterval(playCyberBeat, 350);
  }

  public stop() {
    this.isPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.rainNode) {
      try {
        (this.rainNode as AudioBufferSourceNode).stop();
      } catch {
        // Ignored
      }
      this.rainNode = null;
    }
    if (this.customAudioEl) {
      try {
        this.customAudioEl.pause();
        this.customAudioEl.currentTime = 0;
      } catch {
        // Ignored
      }
      this.customAudioEl = null;
    }
  }

  public toggle(type?: 'synth_lofi' | 'synth_ambient' | 'synth_cyber' | 'custom_url', customUrl?: string) {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play(type || this.currentType, customUrl || this.customUrl);
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new AudioEngine();
