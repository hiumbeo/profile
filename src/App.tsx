import { useState, useEffect } from 'react';
import { ProfileConfig } from './types/profile';
import { DEFAULT_PROFILE } from './utils/presets';
import { audioEngine } from './utils/audioEngine';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { DiscordProfileCard } from './components/DiscordProfileCard';
import { ClickToEnterOverlay } from './components/ClickToEnterOverlay';
import { SyncedLyricsPlayer } from './components/SyncedLyricsPlayer';
import { AvatarDecoration } from './components/AvatarDecoration';
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
            backgroundEffect: 'rain',
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
    <main className="relative min-h-screen w-full overflow-hidden bg-[#000000] text-gray-300 selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Background */}
      <BackgroundCanvas
        effect={config.backgroundEffect}
        intensity={config.weatherIntensity}
      />

      {/* Swipeable Container */}
      <div className="flex w-[200vw] h-screen transition-transform duration-700 ease-in-out" id="swipe-container">
        {/* Page 1: Intro (Avatar + Decor) */}
        <section className="w-screen h-screen flex flex-col items-center justify-center p-6">
          <div className="relative group/avatar cursor-grab active:cursor-grabbing">
             <div className="w-40 h-40 rounded-full bg-[#050505] p-2 relative shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/10">
                <div className="w-full h-full rounded-full overflow-hidden bg-black/40">
                  <img src={config.avatarUrl} alt={config.displayName} className="w-full h-full object-cover" />
                </div>
             </div>
             <AvatarDecoration decor={config.avatarDecor} customDecorUrl={config.customAvatarDecorUrl} />
          </div>
          <p className="mt-8 text-white text-xl animate-pulse">Kéo để xem profile</p>
        </section>

        {/* Page 2: Full Profile */}
        <section className="w-screen h-screen flex items-center justify-center p-3">
          <DiscordProfileCard
            config={config}
            views={views}
            likes={likes}
            hasLiked={hasLiked}
            onLike={handleLike}
          />
        </section>
      </div>

      {/* Swipe Listeners */}
      <div 
        className="fixed inset-0 w-full h-full z-50 touch-pan-x"
        onTouchStart={(e) => {
          (window as any).startX = e.touches[0].pageX;
        }}
        onTouchEnd={(e) => {
          const container = document.getElementById('swipe-container');
          if (!container) return;
          const diff = (window as any).startX - e.changedTouches[0].pageX;
          if (diff > 50) container.style.transform = 'translateX(-100vw)';
          else if (diff < -50) container.style.transform = 'translateX(0)';
        }}
      />
    </main>
  );
}
