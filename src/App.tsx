import { useState, useEffect } from 'react';
import { ProfileConfig } from './types/profile';
import { DEFAULT_PROFILE } from './utils/presets';
import { audioEngine } from './utils/audioEngine';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { DiscordProfileCard } from './components/DiscordProfileCard';
import { ClickToEnterOverlay } from './components/ClickToEnterOverlay';
import { SyncedLyricsPlayer } from './components/SyncedLyricsPlayer';
import { PasswordModal } from './components/PasswordModal';
import { PLAYLIST_TRACKS } from './utils/lyricsData';
import { 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Share2, 
  Check,
  Eye,
  Heart
} from 'lucide-react';

const STORAGE_KEY = 'phu_profile_config_v4_reyna';

export default function App() {
  const [config, setConfig] = useState<ProfileConfig>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_PROFILE,
            ...parsed,
            username: '40wf',
            displayName: 'Em dần xa đi',
            avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm4ft_l3UP4HWpzArGJaabiH2Muv648CtDVcBwMQl43Q&s',
            aboutMe: 'I am a curious learner who loves exploring new ideas and solving problems every day',
            bio: 'I am a curious learner who loves exploring new ideas and solving problems every day',
            bioLink: 'https://zyo.lol/z0j9',
            statusText: 'Đang chơi Roblox',
            avatarDecor: 'custom_decor',
            customAvatarDecorUrl: 'https://img1.picmix.com/output/stamp/normal/8/5/6/0/2770658_53858.gif',
            profileEffect: 'sakura_drift_left',
            audio: {
              ...DEFAULT_PROFILE.audio,
              title: 'I Love You So',
              artist: 'The Walters',
              type: 'youtube',
              volume: 0.6,
            },
            activity: {
              type: 'game',
              title: 'Roblox',
              subtitle: 'Đang chơi Roblox',
              details: 'Roblox · 40wf',
              image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpdxiBL2Haw7rFib6J1m5bLRJ-6qoXKlZZFKkBRAMtqw&s=10',
              elapsedSeconds: 1240,
              totalDurationSeconds: 7200,
            },
            bannerUrl: 'https://i.pinimg.com/originals/54/d7/30/54d7302c08408339574b95b9a911c51a.gif',
            accountCreatedDate: '26 thg 8, 2026',
            memberSince: '26 thg 8, 2026',
            serverMemberSince: '26 thg 8, 2026',
            backgroundEffect: 'matrix',
          };
        }
      }
    } catch {
      // Ignored
    }

    return DEFAULT_PROFILE;
  });

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [entered, setEntered] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Real Views & Likes State (Accurate, Not fake numbers)
  const [views, setViews] = useState(1);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(() => {
    try {
      return localStorage.getItem('phu_has_liked') === 'true';
    } catch {
      return false;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignored
    }
  }, [config]);

  // Load Views & Likes from Server / API
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.views === 'number') {
          setViews(data.views);
        }
        if (data && typeof data.likes === 'number') {
          setLikes(data.likes);
        }
      })
      .catch(() => {});

    // Count this visit once per session
    const viewedKey = 'phu_viewed_session';
    if (!sessionStorage.getItem(viewedKey)) {
      sessionStorage.setItem(viewedKey, 'true');
      fetch('/api/stats/view', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.views === 'number') {
            setViews(data.views);
          }
        })
        .catch(() => {
          setViews((v) => v + 1);
        });
    }
  }, []);

  // Sync from server environment DISCORD_TOKEN if provided (for Termux or custom host)
  useEffect(() => {
    fetch('/api/discord/server-profile')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasEnvToken) {
          setConfig((prev) => ({
            ...prev,
            displayName: data.displayName || prev.displayName,
            username: data.username || prev.username,
            avatarUrl: data.avatarUrl || prev.avatarUrl,
            // Keep Reyna Glowing Purple Eye decor as requested by He
            avatarDecor: 'reyna_eye',
            customAvatarDecorUrl: undefined,
            profileEffect: 'sakura_drift_left',
            bannerUrl: 'https://i.pinimg.com/originals/54/d7/30/54d7302c08408339574b95b9a911c51a.gif',
            accountCreatedDate: '15 thg 10, 2026',
            memberSince: '15 thg 10, 2026',
            serverMemberSince: '26 thg 8, 2026',
            badges: { ...prev.badges, ...data.badges },
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleLike = () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikes((l) => l + 1);
    try {
      localStorage.setItem('phu_has_liked', 'true');
    } catch {
      // Ignored
    }

    fetch('/api/stats/like', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.likes === 'number') {
          setLikes(data.likes);
        }
      })
      .catch(() => {});
  };

  const handleEnter = () => {
    setEntered(true);
    if (config.audio.enabled) {
      const activeTrack = PLAYLIST_TRACKS[currentTrackIndex % PLAYLIST_TRACKS.length];
      audioEngine.setVolume(config.audio.volume);
      audioEngine.play(activeTrack.type, config.audio.customAudioUrl, activeTrack.youtubeId);
      setIsAudioPlaying(true);
    }
  };

  const toggleSound = () => {
    if (!entered) {
      handleEnter();
      return;
    }
    const nextPlaying = !isAudioPlaying;
    setIsAudioPlaying(nextPlaying);
    if (nextPlaying) {
      const activeTrack = PLAYLIST_TRACKS[currentTrackIndex % PLAYLIST_TRACKS.length];
      audioEngine.setVolume(config.audio.volume);
      audioEngine.play(activeTrack.type, config.audio.customAudioUrl, activeTrack.youtubeId);
    } else {
      audioEngine.stop();
    }
  };

  const handleSkipTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % PLAYLIST_TRACKS.length;
    setCurrentTrackIndex(nextIdx);
    const nextTrack = PLAYLIST_TRACKS[nextIdx];
    setConfig((prev) => ({
      ...prev,
      audio: {
        ...prev.audio,
        title: nextTrack.title,
        artist: nextTrack.artist,
        type: nextTrack.type,
        customAudioUrl: undefined,
      },
    }));
    audioEngine.setVolume(config.audio.volume);
    audioEngine.play(nextTrack.type, undefined, nextTrack.youtubeId);
    setIsAudioPlaying(true);
  };

  const handlePrevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + PLAYLIST_TRACKS.length) % PLAYLIST_TRACKS.length;
    setCurrentTrackIndex(prevIdx);
    const prevTrack = PLAYLIST_TRACKS[prevIdx];
    setConfig((prev) => ({
      ...prev,
      audio: {
        ...prev.audio,
        title: prevTrack.title,
        artist: prevTrack.artist,
        type: prevTrack.type,
        customAudioUrl: undefined,
      },
    }));
    audioEngine.setVolume(config.audio.volume);
    audioEngine.play(prevTrack.type, undefined, prevTrack.youtubeId);
    setIsAudioPlaying(true);
  };

  const handleSelectTrack = (idx: number) => {
    setCurrentTrackIndex(idx);
    const track = PLAYLIST_TRACKS[idx];
    setConfig((prev) => ({
      ...prev,
      audio: {
        ...prev.audio,
        title: track.title,
        artist: track.artist,
        type: track.type,
        customAudioUrl: undefined,
      },
    }));
    audioEngine.setVolume(config.audio.volume);
    audioEngine.play(track.type, undefined, track.youtubeId);
    setIsAudioPlaying(true);
  };

  const handleCustomAudioChange = (url: string) => {
    setConfig((prev) => ({
      ...prev,
      audio: {
        ...prev.audio,
        customAudioUrl: url,
        type: 'custom_url',
      },
    }));
    audioEngine.setVolume(config.audio.volume);
    audioEngine.play('custom_url', url);
    setIsAudioPlaying(true);
  };

  const handleShare = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between items-center overflow-x-hidden bg-[#070a0e] text-white selection:bg-cyan-500 selection:text-black">
      {/* 1. Dynamic Canvas Weather Background (Glitch Matrix / Rain) */}
      <BackgroundCanvas
        effect={config.backgroundEffect}
        intensity={config.weatherIntensity}
      />

      {/* Atmospheric Glitch Cyber Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.06)_0%,rgba(0,0,0,0.85)_100%)]" />

      {/* 2. Top Minimal Bar */}
      <header className="relative z-30 w-full max-w-5xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span className="text-white font-bold tracking-tight">EM DẦN XA ĐI'S PROFILE</span>
          <span className="text-gray-600 hidden sm:inline">·</span>
          <span className="text-cyan-400 font-mono font-semibold hidden sm:inline">ROBLOX: 40wf</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Weather / Glitch Effect Cycle Button */}
          <button
            onClick={() => {
              const effects: ('matrix' | 'rain' | 'sakura' | 'snow' | 'stars' | 'none')[] = [
                'matrix',
                'rain',
                'sakura',
                'snow',
                'stars',
                'none',
              ];
              const nextIdx = (effects.indexOf(config.backgroundEffect) + 1) % effects.length;
              setConfig({ ...config, backgroundEffect: effects[nextIdx] });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 hover:bg-black/80 border border-cyan-500/20 text-xs text-cyan-300 hover:text-white backdrop-blur-md transition-all shadow"
            title={`Hiệu ứng nền: ${config.backgroundEffect}. Bấm để chuyển đổi.`}
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize hidden sm:inline">{config.backgroundEffect}</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs backdrop-blur-md transition-all shadow ${
              isAudioPlaying
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-black/50 border-white/10 text-gray-400 hover:text-white hover:bg-black/80'
            }`}
            title={isAudioPlaying ? 'Tắt tiếng' : 'Phát nhạc'}
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline">Muted</span>
              </>
            )}
          </button>

          {/* Share Profile Link */}
          <button
            onClick={handleShare}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-black/50 hover:bg-black/80 border border-white/10 text-xs text-gray-300 hover:text-white backdrop-blur-md transition-all shadow flex items-center gap-1.5"
            title="Sao chép liên kết trang web"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Đã sao chép' : 'Chia sẻ'}</span>
          </button>
        </div>
      </header>

      {/* 3. Center Profile Card */}
      <section className="relative z-20 flex-1 flex items-center justify-center p-3 sm:p-6 w-full max-w-5xl">
        <DiscordProfileCard
          config={config}
          views={views}
          likes={likes}
          hasLiked={hasLiked}
          onLike={handleLike}
        />
      </section>

      {/* 4. Bottom Synced Karaoke Lyrics & Music Player (With Volume & Track Picker) */}
      {config.audio.enabled && (
        <SyncedLyricsPlayer
          tracks={PLAYLIST_TRACKS}
          currentTrackIndex={currentTrackIndex}
          isPlaying={isAudioPlaying}
          volume={config.audio.volume}
          onTogglePlay={toggleSound}
          onSkipTrack={handleSkipTrack}
          onPrevTrack={handlePrevTrack}
          onSelectTrack={handleSelectTrack}
          onVolumeChange={(vol) => {
            setConfig((prev) => ({
              ...prev,
              audio: { ...prev.audio, volume: vol },
            }));
            audioEngine.setVolume(vol);
          }}
          onCustomAudioChange={handleCustomAudioChange}
          customAudioUrl={config.audio.customAudioUrl}
        />
      )}

      {/* 5. Bottom Footer (Clean, No customizer button) */}
      <footer className="relative z-20 w-full py-4 px-4 text-center text-xs text-gray-500">
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <span>Em dần xa đi · Official Discord Profile</span>
          <span aria-hidden="true">·</span>
          <span className="text-cyan-400/80 font-mono">Roblox: 40wf</span>
          <span aria-hidden="true">·</span>
          <span>4 Tracks Karaoke Synced</span>
        </p>
      </footer>

      {/* 6. Click-to-Enter Overlay (Atmospheric Intro Screen) */}
      {!entered && (
        <ClickToEnterOverlay
          onEnter={handleEnter}
          displayName={config.displayName}
        />
      )}
    </main>
  );
}
