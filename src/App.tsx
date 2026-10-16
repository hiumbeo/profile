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

const STORAGE_KEY = 'phu_profile_config_v12_enter_screen';

export default function App() {
  const [config, setConfig] = useState<ProfileConfig>(() => {
    try {
      if (typeof window !== 'undefined') {
        // Purge old cached storage containing previous names or old versions
        localStorage.removeItem('phu_profile_config_v9_rain_thunder');
        localStorage.removeItem('phu_profile_config_v7_reyna_leer');
        localStorage.removeItem('phu_profile_config_v4_reyna');
        localStorage.removeItem('phu_profile_config_v3');
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const decorUrl = (!parsed.customAvatarDecorUrl || parsed.customAvatarDecorUrl.includes('picmix') || parsed.customAvatarDecorUrl.includes('cat'))
            ? '/decorations/reyna_leer.gif'
            : parsed.customAvatarDecorUrl;
          return {
            ...DEFAULT_PROFILE,
            ...parsed,
            username: '40wf',
            displayName: 'Em dần xa đi',
            avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm4ft_l3UP4HWpzArGJaabiH2Muv648CtDVcBwMQl43Q&s',
            aboutMe: parsed.aboutMe || 'I am a curious learner who loves exploring new ideas and solving problems every day',
            bio: parsed.bio || 'I am a curious learner who loves exploring new ideas and solving problems every day',
            bioLink: parsed.bioLink || 'https://zyo.lol/z0j9',
            statusText: parsed.statusText || 'Đang chơi Roblox',
            avatarDecor: parsed.avatarDecor === 'none' ? 'none' : 'reyna_eye',
            customAvatarDecorUrl: decorUrl,
            profileEffect: 'sakura_drift_left',
            audio: {
              ...DEFAULT_PROFILE.audio,
              ...(parsed.audio || {}),
            },
            activity: {
              type: 'game',
              title: 'Roblox',
              subtitle: 'Đang chơi Roblox',
              details: 'Roblox · 40wf',
              image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpdxiBL2Haw7rFib6J1m5bLRJ-6qoXKlZZFKkBRAMtqw&s=10',
              elapsedSeconds: 1240,
              totalDurationSeconds: 7200,
              ...(parsed.activity || {}),
            },
            bannerUrl: parsed.bannerUrl || 'https://i.pinimg.com/originals/54/d7/30/54d7302c08408339574b95b9a911c51a.gif',
            accountCreatedDate: '26 thg 8, 2026',
            memberSince: '26 thg 8, 2026',
            serverMemberSince: '26 thg 8, 2026',
            backgroundEffect: 'rain',
            weatherIntensity: 8,
          };
        }
      }
    } catch {
      // Ignored
    }

    return {
      ...DEFAULT_PROFILE,
      displayName: 'Em dần xa đi',
      username: '40wf',
      avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm4ft_l3UP4HWpzArGJaabiH2Muv648CtDVcBwMQl43Q&s',
      avatarDecor: 'reyna_eye',
      customAvatarDecorUrl: '/decorations/reyna_leer.gif',
      backgroundEffect: 'rain',
      weatherIntensity: 8,
    };
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

      {/* Click To Enter Screen */}
      {!entered && (
        <ClickToEnterOverlay
          onEnter={handleEnter}
          displayName={config.displayName}
          username={config.username}
          avatarUrl={config.avatarUrl}
          avatarDecor={config.avatarDecor}
          customAvatarDecorUrl={config.customAvatarDecorUrl}
        />
      )}

      {/* Main Profile View */}
      <div className={`relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 pb-28 md:pb-32 overflow-y-auto transition-all duration-700 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="w-full max-w-xl flex flex-col items-center justify-center my-auto pt-4 pb-8">
          <DiscordProfileCard
            config={config}
            views={views}
            likes={likes}
            hasLiked={hasLiked}
            onLike={handleLike}
          />
        </div>

        {/* Bottom Synced Karaoke Lyrics & Music Player */}
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
      </div>

    </main>
  );
}
