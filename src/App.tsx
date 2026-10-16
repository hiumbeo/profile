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
import { AtmosphereSwitcher } from './components/AtmosphereSwitcher';
import { DuoKeiferTab } from './components/DuoKeiferTab';
import { BestFriendDuoModal } from './components/BestFriendDuoModal';
import { DEFAULT_FRIENDS } from './utils/defaultFriends';
import { DiscordFriend } from './types/profile';
import { soundFX } from './utils/soundEffects';
import { 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Share2, 
  Check,
  Eye,
  Heart,
  Users,
  Columns2,
  Gamepad2
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

  // Persistent visitor ID for authentic view & like metrics
  const [visitorId] = useState(() => {
    try {
      let vid = localStorage.getItem('phu_visitor_uuid');
      if (!vid) {
        vid = 'vis_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
        localStorage.setItem('phu_visitor_uuid', vid);
      }
      return vid;
    } catch {
      return 'vis_' + Date.now();
    }
  });

  // Real Views, Likes, and Live Online State
  const [views, setViews] = useState(1);
  const [likes, setLikes] = useState(0);
  const [onlineCount, setOnlineCount] = useState(1);
  const [hasLiked, setHasLiked] = useState(() => {
    try {
      return localStorage.getItem('phu_has_liked') === 'true';
    } catch {
      return false;
    }
  });

  // Best Friends State (Persisted in localStorage)
  const FRIENDS_STORAGE_KEY = 'phu_best_friends_v2_keifer';
  const [friends, setFriends] = useState<DiscordFriend[]>(() => {
    try {
      const saved = localStorage.getItem(FRIENDS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure keifer is in list
          const hasKeifer = parsed.some(
            (f: DiscordFriend) => f.username === 'keifer' || f.name.toLowerCase() === 'keifer'
          );
          if (!hasKeifer) {
            return [DEFAULT_FRIENDS[0], ...parsed];
          }
          return parsed;
        }
      }
    } catch {
      // Ignored
    }
    return DEFAULT_FRIENDS;
  });

  // Active Tab: 'profile' (main card), 'duo' (Duo Roblox với keifer), or 'both' (side-by-side)
  const [activeTab, setActiveTab] = useState<'profile' | 'duo' | 'both'>('profile');

  // Keifer Avatar State (Auto-saved user requested avatar)
  const DEFAULT_KEIFER_AVATAR = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJTd3LUJy5lnFqo3RuEhh27KC1Sa8IFWjTJ_ItiyUGEg&s=10';
  const [keiferAvatarUrl, setKeiferAvatarUrl] = useState<string>(() => {
    try {
      // Auto save to localStorage permanently
      localStorage.setItem('keifer_avatar_url_v3_saved', DEFAULT_KEIFER_AVATAR);
      return DEFAULT_KEIFER_AVATAR;
    } catch {
      return DEFAULT_KEIFER_AVATAR;
    }
  });

  const handleUpdateKeiferAvatar = (url: string) => {
    setKeiferAvatarUrl(url);
    try {
      localStorage.setItem('keifer_avatar_url_v3_saved', url);
    } catch {}
  };

  // Best Friend Duo Modal (40wf ❤️ keifer)
  const [isDuoModalOpen, setIsDuoModalOpen] = useState<boolean>(false);
  const [selectedDuoFriend, setSelectedDuoFriend] = useState<DiscordFriend | null>(null);

  const handleOpenDuoModal = (friend?: DiscordFriend) => {
    const targetFriend =
      friend ||
      friends.find((f) => f.username === 'keifer' || f.name.toLowerCase() === 'keifer') ||
      friends[0];
    setSelectedDuoFriend(targetFriend);
    setIsDuoModalOpen(true);
  };

  const handleUpdateDuoFriendAvatar = (newUrl: string) => {
    setFriends((prev) => {
      const updated = prev.map((f) => {
        if (f.id === selectedDuoFriend?.id || f.username === 'keifer') {
          return { ...f, avatarUrl: newUrl };
        }
        return f;
      });
      try {
        localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (selectedDuoFriend) {
      setSelectedDuoFriend({ ...selectedDuoFriend, avatarUrl: newUrl });
    }
  };

  const handleAddFriend = (newFriend: DiscordFriend) => {
    setFriends((prev) => {
      const updated = [newFriend, ...prev];
      try {
        localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRemoveFriend = (id: string) => {
    setFriends((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      try {
        localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleResetFriends = () => {
    setFriends(DEFAULT_FRIENDS);
    try {
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(DEFAULT_FRIENDS));
    } catch {}
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignored
    }
  }, [config]);

  // Real View Counting (counts once per session per visitor) & Live Polling
  useEffect(() => {
    // 1. Register view on initial visit
    const viewedSessionKey = 'phu_viewed_session_' + visitorId;
    if (!sessionStorage.getItem(viewedSessionKey)) {
      sessionStorage.setItem(viewedSessionKey, 'true');
      fetch('/api/stats/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.views === 'number') setViews(data.views);
          if (data && typeof data.likes === 'number') setLikes(data.likes);
          if (data && typeof data.onlineCount === 'number') setOnlineCount(data.onlineCount);
        })
        .catch(() => {});
    }

    // 2. Poll every 3.5s for live real-time updates across multiple tabs / devices
    const pollStats = () => {
      fetch(`/api/stats?visitorId=${encodeURIComponent(visitorId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.views === 'number') {
            setViews(data.views);
          }
          if (data && typeof data.likes === 'number') {
            setLikes(data.likes);
          }
          if (data && typeof data.onlineCount === 'number') {
            setOnlineCount(data.onlineCount);
          }
        })
        .catch(() => {});
    };

    pollStats();
    const interval = setInterval(pollStats, 3500);
    return () => clearInterval(interval);
  }, [visitorId]);

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

  // Multi-tap Real Heart Sending
  const handleLike = (count: number = 1) => {
    setHasLiked(true);
    setLikes((l) => l + count);
    try {
      localStorage.setItem('phu_has_liked', 'true');
    } catch {
      // Ignored
    }

    fetch('/api/stats/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId, count }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.likes === 'number') {
          setLikes(data.likes);
        }
        if (data && typeof data.onlineCount === 'number') {
          setOnlineCount(data.onlineCount);
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

      {/* Main Profile & Best Friends View */}
      <div className={`relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 pb-28 md:pb-32 overflow-y-auto transition-all duration-700 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        
        {/* Navigation Tab Bar: Hồ Sơ | Bạn Thân (Tab Bên Phải) */}
        <div className="w-full flex items-center justify-center gap-2 mb-4 pt-3 z-30">
          <div className="flex items-center p-1 rounded-2xl bg-[#111214]/85 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.7)]">
            <button
              onClick={() => {
                soundFX.playClickSound();
                setActiveTab('profile');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>👤 Hồ Sơ</span>
            </button>

            <button
              onClick={() => {
                soundFX.playClickSound();
                setActiveTab('duo');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'duo'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-pink-400" />
              <span>Duo keifer (Tab Phải)</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-pink-500/30 text-pink-200 font-bold border border-pink-500/40">
                👑 Best Fen
              </span>
            </button>

            <button
              onClick={() => {
                soundFX.playClickSound();
                setActiveTab('both');
              }}
              className={`hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                activeTab === 'both'
                  ? 'bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-white shadow-md border border-white/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="Xem cả 2 tab song song hai bên"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Song Song</span>
            </button>

            {/* 40wf ❤️ keifer Duo Quick Trigger */}
            <button
              onClick={() => {
                soundFX.playClickSound();
                handleOpenDuoModal();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 hover:from-pink-500/35 hover:to-cyan-500/35 text-pink-300 hover:text-white border border-pink-500/40 transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.25)]"
              title="Nhấn để xem avatar 40wf và keifer và hiệu ứng nét vẽ trái tim ở giữa!"
            >
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-current animate-pulse" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-300 to-purple-300">
                40wf ❤️ keifer
              </span>
            </button>
          </div>
        </div>

        {/* Content Area: Main Profile Card and/or Right Duo keifer Tab */}
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 my-auto pt-1 pb-8">
          {/* Left: Discord Profile Card */}
          {(activeTab === 'profile' || activeTab === 'both') && (
            <div className="w-full max-w-xl shrink-0 animate-in fade-in zoom-in-95 duration-300">
              <DiscordProfileCard
                config={config}
                views={views}
                likes={likes}
                onlineCount={onlineCount}
                hasLiked={hasLiked}
                isAudioPlaying={isAudioPlaying}
                onLike={handleLike}
                friendsCount={1}
                onOpenFriendsTab={() => {
                  setActiveTab('duo');
                }}
                onOpenDuoModal={() => handleOpenDuoModal()}
              />
            </div>
          )}

          {/* Right: Duo keifer Tab */}
          {(activeTab === 'duo' || activeTab === 'both') && (
            <div className="w-full max-w-xl lg:max-w-md shrink-0 animate-in fade-in slide-in-from-right-4 duration-300">
              <DuoKeiferTab
                userConfig={config}
                keiferAvatarUrl={keiferAvatarUrl}
                onUpdateKeiferAvatar={handleUpdateKeiferAvatar}
                onClose={activeTab === 'both' ? () => setActiveTab('profile') : undefined}
              />
            </div>
          )}
        </div>

        {/* Floating Right Dock Button: Quick Jump to Duo keifer Tab */}
        <div className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40">
          <button
            onClick={() => {
              soundFX.playClickSound();
              setActiveTab((prev) => (prev === 'duo' ? 'profile' : 'duo'));
            }}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all cursor-pointer ${
              activeTab === 'duo' || activeTab === 'both'
                ? 'bg-pink-900/90 border-pink-400/60 text-white shadow-[0_0_25px_rgba(244,63,94,0.5)]'
                : 'bg-[#111214]/85 hover:bg-[#18191c] border-white/10 hover:border-pink-500/40 text-gray-300 hover:text-white'
            }`}
            title="Tab Duo Roblox với keifer (Click để chuyển đổi)"
          >
            <div className="relative">
              <Gamepad2 className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            </div>
            <span className="text-xs font-medium font-mono hidden md:inline">
              Duo keifer 🎮
            </span>
          </button>
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

        {/* Atmosphere & Sound FX Switcher */}
        <AtmosphereSwitcher
          currentEffect={config.backgroundEffect}
          onChangeEffect={(eff) => setConfig((prev) => ({ ...prev, backgroundEffect: eff }))}
          weatherIntensity={config.weatherIntensity}
          onChangeIntensity={(val) => setConfig((prev) => ({ ...prev, weatherIntensity: val }))}
        />
      </div>

      {/* Best Friend Duo Showcase Modal: 40wf ❤️ keifer */}
      <BestFriendDuoModal
        isOpen={isDuoModalOpen}
        onClose={() => setIsDuoModalOpen(false)}
        userConfig={config}
        friend={selectedDuoFriend}
        onUpdateFriendAvatar={handleUpdateDuoFriendAvatar}
      />
    </main>
  );
}
