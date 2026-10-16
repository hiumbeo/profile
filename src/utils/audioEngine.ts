// Pure High-Fidelity Audio Engine for Phú's Profile
// Supports Real YouTube Playback (no buzzing synths) and HTML5 Audio (uploaded files / MP3 links)

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: {
          height?: string | number;
          width?: string | number;
          videoId?: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState?: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YTPlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

export type MusicSourceType =
  | 'youtube'
  | 'custom_url'
  | 'uploaded_audio'
  | 'synth_lofi'
  | 'synth_ambient'
  | 'synth_cyber';

class AudioEngine {
  private isPlaying = false;
  private currentVolume = 0.6;
  private customAudioEl: HTMLAudioElement | null = null;
  private ytPlayer: YTPlayerInstance | null = null;
  private ytReady = false;
  private pendingVideoId: string | null = null;
  private timeListeners: Set<(seconds: number) => void> = new Set();
  private currentTime = 0;
  private timerInterval: number | null = null;
  private activeSource: 'youtube' | 'html5' | 'none' = 'none';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initYouTube();
    }
  }

  private initYouTube() {
    if (typeof window === 'undefined') return;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      let hostEl = document.getElementById('yt-player-host');
      if (!hostEl) {
        hostEl = document.createElement('div');
        hostEl.id = 'yt-player-host';
        hostEl.style.position = 'fixed';
        hostEl.style.bottom = '0px';
        hostEl.style.right = '0px';
        hostEl.style.width = '240px';
        hostEl.style.height = '135px';
        hostEl.style.opacity = '0.001';
        hostEl.style.pointerEvents = 'none';
        hostEl.style.zIndex = '-100';
        document.body.appendChild(hostEl);
      }

      try {
        this.ytPlayer = new window.YT.Player('yt-player-host', {
          height: '135',
          width: '240',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              this.ytReady = true;
              event.target.setVolume(Math.round(this.currentVolume * 100));
              if (this.pendingVideoId) {
                const vid = this.pendingVideoId;
                this.pendingVideoId = null;
                this.playYouTube(vid);
              }
            },
            onStateChange: (event) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                this.isPlaying = true;
                this.startTimeTracker();
              } else if (event.data === 2 || event.data === 0) {
                if (this.activeSource === 'youtube') {
                  this.isPlaying = false;
                }
              }
            },
            onError: () => {
              // Do nothing - no buzzing sounds!
            },
          },
        });
      } catch {
        // Ignored
      }
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const existingCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (existingCallback) existingCallback();
        setupPlayer();
      };
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.customAudioEl) {
      this.customAudioEl.volume = this.currentVolume;
    }
    if (this.ytPlayer && this.ytReady) {
      try {
        this.ytPlayer.setVolume(Math.round(this.currentVolume * 100));
      } catch {
        // Ignored
      }
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getCurrentTime(): number {
    if (this.activeSource === 'youtube' && this.ytPlayer && this.ytReady) {
      try {
        return this.ytPlayer.getCurrentTime() || 0;
      } catch {
        return this.currentTime;
      }
    }
    if (this.customAudioEl && !isNaN(this.customAudioEl.currentTime)) {
      return this.customAudioEl.currentTime;
    }
    return this.currentTime;
  }

  public onTimeUpdate(callback: (seconds: number) => void): () => void {
    this.timeListeners.add(callback);
    return () => {
      this.timeListeners.delete(callback);
    };
  }

  private notifyTime(seconds: number) {
    this.currentTime = seconds;
    this.timeListeners.forEach((cb) => cb(seconds));
  }

  private startTimeTracker() {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = window.setInterval(() => {
      if (this.activeSource === 'youtube' && this.ytPlayer && this.ytReady) {
        try {
          const time = this.ytPlayer.getCurrentTime();
          if (typeof time === 'number' && !isNaN(time)) {
            this.notifyTime(time);
          }
        } catch {
          // Ignored
        }
      }
    }, 150);
  }

  private stopTimeTracker() {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public playYouTube(videoId: string) {
    this.stopCustomAudio();
    this.activeSource = 'youtube';

    if (!this.ytReady || !this.ytPlayer) {
      this.pendingVideoId = videoId;
      this.isPlaying = true;
      return;
    }

    try {
      this.ytPlayer.setVolume(Math.round(this.currentVolume * 100));
      this.ytPlayer.loadVideoById(videoId);
      this.ytPlayer.playVideo();
      this.isPlaying = true;
      this.startTimeTracker();
    } catch {
      // Ignored
    }
  }

  public playAudioUrl(url: string, loop: boolean = true) {
    this.stopYouTube();
    this.stopCustomAudio();
    this.activeSource = 'html5';

    try {
      const audio = new Audio();
      audio.src = url;
      audio.loop = loop;
      audio.volume = this.currentVolume;

      audio.addEventListener('timeupdate', () => {
        this.notifyTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        if (!loop) {
          this.isPlaying = false;
        }
      });

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
          })
          .catch(() => {
            this.isPlaying = false;
          });
      }

      this.customAudioEl = audio;
      this.isPlaying = true;
    } catch {
      this.isPlaying = false;
    }
  }

  public play(
    type: MusicSourceType,
    customUrl?: string,
    youtubeId?: string,
    loop: boolean = true
  ) {
    // 1. If custom uploaded/pasted audio URL is provided
    if (customUrl && customUrl.trim()) {
      this.playAudioUrl(customUrl.trim(), loop);
      return;
    }

    // 2. If YouTube video ID is provided
    if (youtubeId && youtubeId.trim()) {
      this.playYouTube(youtubeId.trim());
      return;
    }

    // 3. Fallback map for known YouTube IDs
    const YT_MAP: Record<string, string> = {
      synth_lofi: 'NwFVSclD_uc',
      synth_ambient: 'nyFi7rAYw-4',
      synth_cyber: 'cHHLHGNpCSA',
      track_1: 'NwFVSclD_uc',
      track_2: 'Oextk-If8HQ',
      track_3: 'xpfQf3zWQvA',
      track_4: 'cHHLHGNpCSA',
      track_5: 'nyFi7rAYw-4',
      track_6: 'o3EAy282el0',
      track_7: 'G29TQeRXMWs',
      track_8: 'bhlMOw-RGZo',
      track_9: 'mnBAZ-VkuEg',
    };

    const targetYtId = YT_MAP[type] || 'NwFVSclD_uc';
    this.playYouTube(targetYtId);
  }

  private stopYouTube() {
    if (this.ytPlayer && this.ytReady) {
      try {
        this.ytPlayer.pauseVideo();
      } catch {
        // Ignored
      }
    }
    this.stopTimeTracker();
  }

  private stopCustomAudio() {
    if (this.customAudioEl) {
      try {
        this.customAudioEl.pause();
        this.customAudioEl.currentTime = 0;
        this.customAudioEl.src = '';
      } catch {
        // Ignored
      }
      this.customAudioEl = null;
    }
  }

  public stop() {
    this.isPlaying = false;
    this.stopYouTube();
    this.stopCustomAudio();
  }

  public pause() {
    this.isPlaying = false;
    if (this.activeSource === 'youtube' && this.ytPlayer && this.ytReady) {
      try {
        this.ytPlayer.pauseVideo();
      } catch {
        // Ignored
      }
    }
    if (this.customAudioEl) {
      try {
        this.customAudioEl.pause();
      } catch {
        // Ignored
      }
    }
    this.stopTimeTracker();
  }

  public resume() {
    this.isPlaying = true;
    if (this.activeSource === 'youtube' && this.ytPlayer && this.ytReady) {
      try {
        this.ytPlayer.playVideo();
        this.startTimeTracker();
      } catch {
        // Ignored
      }
    }
    if (this.customAudioEl) {
      try {
        this.customAudioEl.play();
      } catch {
        // Ignored
      }
    }
  }

  public toggle(
    type?: MusicSourceType,
    customUrl?: string,
    youtubeId?: string
  ) {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      if (this.activeSource !== 'none') {
        this.resume();
        return true;
      }
      this.play(type || 'youtube', customUrl, youtubeId);
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getActiveSource(): 'youtube' | 'html5' | 'none' {
    return this.activeSource;
  }
}

export const audioEngine = new AudioEngine();
