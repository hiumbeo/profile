import { useState, useEffect, useRef } from 'react';
import { ProfileConfig, StatusType } from '../types/profile';
import { AvatarDecoration } from './AvatarDecoration';
import { DiscordBadges } from './DiscordBadges';
import { ActivityPlayer } from './ActivityPlayer';
import { RainEffect } from './RainEffect';
import { AudioVisualizerBar } from './AudioVisualizerBar';
import { soundFX } from '../utils/soundEffects';
import { 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Eye,
  Heart,
  Users
} from 'lucide-react';

interface FloatingHeartItem {
  id: number;
  x: number;
  y: number;
  drift: number;
  rot: number;
  color: string;
  emoji: string;
}

interface DiscordProfileCardProps {
  config: ProfileConfig;
  views?: number;
  likes?: number;
  onlineCount?: number;
  hasLiked?: boolean;
  isAudioPlaying?: boolean;
  onLike?: (count?: number) => void;
  friendsCount?: number;
  onOpenFriendsTab?: () => void;
  onOpenDuoModal?: () => void;
}

export function DiscordProfileCard({ 
  config, 
  views = 1, 
  likes = 0, 
  onlineCount = 1,
  hasLiked = false,
  isAudioPlaying = false,
  onLike,
  friendsCount = 4,
  onOpenFriendsTab,
  onOpenDuoModal
}: DiscordProfileCardProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);
  const [combo, setCombo] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeartItem[]>([]);
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [displayedTitle, setDisplayedTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const phrases = ['My bio | Em dần xa đi', '@40wf • Discord Profile'];

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      if (isDeleting) {
        setDisplayedTitle(fullText.substring(0, displayedTitle.length - 1));
        setTypingSpeed(30);
      } else {
        setDisplayedTitle(fullText.substring(0, displayedTitle.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && displayedTitle === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && displayedTitle === '') {
        setIsDeleting(false);
        setLoopNum((prev) => prev + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayedTitle, isDeleting, loopNum, phrases, typingSpeed]);

  const handleCopyUsername = () => {
    soundFX.playCopySound();
    navigator.clipboard.writeText(`@${config.username}`);
    setCopied(true);
    setShowToast(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setShowToast(false), 2600);
  };

  const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const newCombo = combo + 1;
    setCombo(newCombo);
    setHeartBurst(true);

    // Play synthesized pitch-shifting sound
    soundFX.playHeartSound(newCombo);

    // Spawn floating particle from click position
    const rect = e.currentTarget.getBoundingClientRect();
    const cardRect = e.currentTarget.closest('.group')?.getBoundingClientRect();
    const clickX = cardRect ? rect.left - cardRect.left + rect.width / 2 : rect.width / 2;
    const clickY = cardRect ? rect.top - cardRect.top : 20;

    const colors = ['#c084fc', '#f43f5e', '#ec4899', '#38bdf8', '#ffffff'];
    const emojis = ['💜', '💖', '🤍', '✨', '⚡'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const heartItem: FloatingHeartItem = {
      id: Date.now() + Math.random(),
      x: clickX + (Math.random() * 24 - 12),
      y: clickY,
      drift: (Math.random() - 0.5) * 60,
      rot: (Math.random() - 0.5) * 45,
      color: randomColor,
      emoji: randomEmoji,
    };

    setFloatingHearts((prev) => [...prev.slice(-15), heartItem]);

    // Clear after 1.2s
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((item) => item.id !== heartItem.id));
    }, 1200);

    // Reset burst effect
    setTimeout(() => setHeartBurst(false), 300);

    // Debounce combo reset
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 1800);

    // Call real like handler
    if (onLike) {
      onLike(1);
    }
  };

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'online':
        return 'bg-[#23a55a]';
      case 'idle':
        return 'bg-[#f0b232]';
      case 'dnd':
        return 'bg-[#f23f43]';
      case 'streaming':
        return 'bg-[#593695]';
      case 'offline':
      default:
        return 'bg-[#80848e]';
    }
  };

  return (
    <div className="relative w-full max-w-[420px] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] border border-white/10 transition-all duration-300 bg-[#050505]/85 backdrop-blur-xl group">
      {/* Subtle cyber glitch scanning line overlay & Mood Overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.03] bg-[linear-gradient(rgba(0,240,255,0)_50%,rgba(0,240,255,0.25)_50%)] bg-[length:100%_4px]" />
      <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
      
      {/* Floating Particles Layer */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute animate-float-up-fade text-lg select-none pointer-events-none drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]"
            style={{
              left: `${heart.x}px`,
              top: `${heart.y}px`,
              // @ts-expect-error custom css variables for keyframe animation
              '--tw-drift': `${heart.drift}px`,
              '--tw-rot': `${heart.rot}deg`,
            }}
          >
            {heart.emoji}
          </div>
        ))}
      </div>

      {/* Copy Username Discord Toast */}
      {showToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111214]/95 border border-purple-500/40 text-xs font-mono text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Đã copy @{config.username} vào clipboard!</span>
        </div>
      )}

      {/* New Profile Effect */}
      <RainEffect />

      {/* 1. TOP BANNER */}
      <div 
        className="h-32 sm:h-36 w-full relative overflow-hidden transition-all duration-500"
        style={{
          background: `url(${config.bannerUrl || 'https://i.pinimg.com/originals/54/d7/30/54d7302c08408339574b95b9a911c51a.gif'}) center/cover no-repeat`,
        }}
      >
        {/* Banner Glitch Scanlines & Cyan Vibe */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-transparent to-cyan-950/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-25" />

        {/* Top Left: Live Online Status */}
        <div 
          className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-gray-200 tracking-wider shadow-md"
          title={`${onlineCount} người đang trực tiếp xem hồ sơ`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>{onlineCount} ONLINE</span>
        </div>

        {/* Top Right: Real Views & Multi-Tap Likes with Floating Hearts */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
          {/* Real View Counter */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-xs text-gray-300 font-mono shadow-md"
            title="Lượt xem thực tế từ người dùng"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-white">{views.toLocaleString()}</span>
          </div>

          {/* Interactive Multi-Tap Like Button */}
          <div className="relative">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border transition-all text-xs font-mono shadow-md cursor-pointer select-none active:scale-95 ${
                hasLiked
                  ? 'bg-purple-950/70 border-purple-500/50 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-black/75 hover:bg-black/90 border-white/10 hover:border-purple-400/40 text-gray-300 hover:text-white'
              } ${heartBurst ? 'scale-110' : ''}`}
              title="Bấm để thả tim (Có thể bấm nhiều lần)!"
            >
              <Heart 
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  hasLiked ? 'fill-purple-400 text-purple-400' : 'text-gray-300 hover:text-purple-300'
                } ${heartBurst ? 'scale-125' : ''}`} 
              />
              <span className="font-semibold text-white">{likes.toLocaleString()}</span>
            </button>

            {/* Combo Streak Badge */}
            {combo > 1 && (
              <span className="absolute -bottom-4 right-0 px-1.5 py-0.2 rounded-full bg-purple-600 border border-purple-300 text-[9px] font-bold font-mono text-white tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-bounce select-none pointer-events-none">
                {combo >= 20 ? '👑' : combo >= 10 ? '⚡' : '🔥'} x{combo}
              </span>
            )}
          </div>
        </div>

        {/* Audio Visualizer Bar at the bottom edge of banner */}
        <div className="absolute bottom-2 right-3 z-20">
          <AudioVisualizerBar isPlaying={isAudioPlaying} color="#c084fc" barCount={14} />
        </div>
      </div>

      {/* 2. AVATAR & BADGES ROW */}
      <div className="px-5 relative">
        <div className="flex items-end justify-between -mt-14 mb-3">
          {/* Avatar Container with Reyna Glowing Purple Eye Decoration */}
          <div className="relative group/avatar">
            {/* Subtle purple radial glow under avatar */}
            <div className="absolute inset-0 rounded-full bg-purple-600/30 blur-md pointer-events-none animate-pulse" />

            <div className="w-24 h-24 rounded-full bg-[#050505] p-1.5 relative shadow-xl border border-white/10">
              <div className="w-full h-full rounded-full overflow-hidden bg-black/40">
                <img
                  src={config.avatarUrl}
                  alt={config.displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm4ft_l3UP4HWpzArGJaabiH2Muv648CtDVcBwMQl43Q&s';
                  }}
                />
              </div>

              {/* Status Indicator */}
              <div 
                className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#050505] flex items-center justify-center ${getStatusColor(config.status)} z-30`}
                title={`Status: ${config.status}`}
              >
                {config.status === 'idle' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#050505] -ml-1 -mt-1" />
                )}
                {config.status === 'dnd' && (
                  <div className="w-2.5 h-0.5 bg-[#050505] rounded-full" />
                )}
                {config.status === 'streaming' && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </div>
            </div>

            {/* Avatar Decoration Component (Reyna's Purple Eye) */}
            <AvatarDecoration 
              decor={config.avatarDecor} 
              customDecorUrl={config.customAvatarDecorUrl} 
            />
          </div>

          {/* Badges Bar on the right */}
          <div className="mb-2">
            <DiscordBadges badges={config.badges} />
          </div>
        </div>

        {/* Duo Roblox: 40wf ❤️ keifer */}
        <button
          onClick={() => {
            soundFX.playClickSound();
            if (onOpenFriendsTab) onOpenFriendsTab();
            else if (onOpenDuoModal) onOpenDuoModal();
          }}
          className="flex items-center justify-between w-full mb-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-pink-950/40 via-[#18191c] to-cyan-950/40 hover:from-pink-900/50 hover:to-cyan-900/50 border border-pink-500/35 hover:border-pink-500/70 text-xs text-gray-200 transition-all cursor-pointer group/duo shadow-[0_2px_15px_rgba(244,63,94,0.18)]"
          title="Nhấn để mở Tab Duo Roblox cùng keifer!"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex items-center -space-x-2 shrink-0">
              <div className="w-7 h-7 rounded-full border border-cyan-400 overflow-hidden bg-black/60 shadow-sm">
                <img src={config.avatarUrl} alt="40wf" className="w-full h-full object-cover" />
              </div>
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-[10px] z-10 text-white shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse">
                ❤️
              </div>
              <div className="w-7 h-7 rounded-full border border-pink-400 overflow-hidden bg-black/60 shadow-sm">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJTd3LUJy5lnFqo3RuEhh27KC1Sa8IFWjTJ_ItiyUGEg&s=10"
                  alt="keifer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/keifer_avatar.jpg';
                  }}
                />
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-300 to-purple-300">
                  40wf &amp; keifer
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/25 text-pink-300 border border-pink-500/40 font-semibold flex items-center gap-0.5">
                  🥋 JJS &amp; Roblox Duo
                </span>
              </div>
              <span className="text-[11px] text-gray-400 block font-sans">
                Best Fen • Cặp bài trùng Jujutsu Shenanigans ⚡
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-pink-400 font-bold flex items-center gap-1 group-hover/duo:translate-x-1 transition-transform shrink-0">
            Tab Duo →
          </span>
        </button>

        {/* 3. USER INFO */}
        <div className="bg-[#232428]/60 p-4 rounded-xl border border-white/5 space-y-3.5 mb-4 shadow-inner">
          {/* Display Name & Username */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {displayedTitle}
                <span className="animate-blink">|</span>
              </h2>
              {config.pronouns && (
                <span className="text-[11px] font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                  {config.pronouns}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span 
                onClick={handleCopyUsername}
                className="text-xs text-gray-400 hover:text-white font-mono cursor-pointer transition-colors"
                title="Click để sao chép username"
              >
                @{config.username}
              </span>
              <button
                onClick={handleCopyUsername}
                className="text-gray-500 hover:text-white p-0.5 transition-colors cursor-pointer"
                title="Sao chép username"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {/* Custom Status */}
            {config.statusText && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-gray-300 bg-white/5 py-1.5 px-2.5 rounded-lg border border-white/10">
                {config.statusEmoji && <span className="text-sm">{config.statusEmoji}</span>}
                <span className="truncate">{config.statusText}</span>
              </div>
            )}
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* About Me */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              My bio | Em dần xa đi
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-sans bg-white/5 p-2.5 rounded-lg border border-white/10">
              {config.aboutMe || config.bio || 'I am a curious learner who loves exploring new ideas and solving problems every day'}
            </p>

            {/* Bio Link: https://zyo.lol/z0j9 */}
            {(config.bioLink || 'https://zyo.lol/z0j9') && (
              <div className="pt-1">
                <a
                  href={config.bioLink || 'https://zyo.lol/z0j9'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 hover:border-cyan-400 transition-all group/bio"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    <span className="text-xs font-mono text-cyan-300 truncate">
                      {config.bioLink || 'https://zyo.lol/z0j9'}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover/bio:text-white group-hover/bio:translate-x-0.5 transition-all shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Member Since Dates */}
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Thời gian hoạt động (Member Since)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div className="flex items-center gap-2 bg-[#111214]/60 p-2 rounded-lg border border-white/5">
                <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400">Ngày tạo Discord</p>
                  <p className="font-semibold text-white truncate">{config.accountCreatedDate || '15 thg 10, 2026'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#111214]/60 p-2 rounded-lg border border-white/5">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400">Ngày gia nhập SV</p>
                  <p className="font-semibold text-white truncate">{config.serverMemberSince || '15 thg 10, 2026'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Roles */}
          {config.roles.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Roles ({config.roles.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {config.roles.map((role) => (
                  <span
                    key={role.id}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-[#111214] border border-white/5 text-gray-200"
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    <span>{role.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spotify or Game Activity */}
          <ActivityPlayer activity={config.activity} />
        </div>
      </div>
    </div>
  );
}
