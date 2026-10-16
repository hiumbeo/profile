import { useState, useEffect } from 'react';
import { ProfileConfig, StatusType } from '../types/profile';
import { AvatarDecoration } from './AvatarDecoration';
import { DiscordBadges } from './DiscordBadges';
import { ActivityPlayer } from './ActivityPlayer';
import { RainEffect } from './RainEffect';
import { 
  Calendar, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Music,
  Eye,
  Heart
} from 'lucide-react';

interface DiscordProfileCardProps {
  config: ProfileConfig;
  views?: number;
  likes?: number;
  hasLiked?: boolean;
  onLike?: () => void;
}

export function DiscordProfileCard({ 
  config, 
  views = 1, 
  likes = 0, 
  hasLiked = false, 
  onLike 
}: DiscordProfileCardProps) {
  const [copied, setCopied] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [dummyMsg, setDummyMsg] = useState('');
  const [heartBurst, setHeartBurst] = useState(false);

  const [displayedTitle, setDisplayedTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const phrases = ['My bio | Em dần xa đi', 'glight'];

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
    navigator.clipboard.writeText(`@${config.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLikeClick = () => {
    if (onLike) {
      setHeartBurst(true);
      onLike();
      setTimeout(() => setHeartBurst(false), 800);
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
    <div className="relative w-full max-w-[420px] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] border border-white/5 transition-all duration-300 bg-[#050505]/80 backdrop-blur-md group">
      {/* Subtle cyber glitch scanning line overlay & Mood Overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 opacity-[0.03] bg-[linear-gradient(rgba(0,240,255,0)_50%,rgba(0,240,255,0.25)_50%)] bg-[length:100%_4px]" />
      <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)]" />
      
      {/* New Profile Effect */}
      <RainEffect />

      {/* 1. TOP BANNER (Fixed exact gif URL with cyber glitch decor) */}
      <div 
        className="h-32 sm:h-36 w-full relative overflow-hidden transition-all duration-500"
        style={{
          background: `url(${config.bannerUrl || 'https://i.pinimg.com/originals/54/d7/30/54d7302c08408339574b95b9a911c51a.gif'}) center/cover no-repeat`,
        }}
      >
        {/* Banner Glitch Scanlines & Cyan Vibe */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111214] via-transparent to-cyan-950/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-25" />

        {/* Top Left Glitch Tag */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-gray-300 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span>STATUS · ACTIVE</span>
        </div>

        {/* Top Right: Views Counter & Like Button (Replaces Customizer) */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {/* View Counter */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs text-gray-300 font-mono shadow-md"
            title="Tổng số lượt xem trang hồ sơ"
          >
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            <span>{views.toLocaleString()}</span>
          </div>

          {/* Interactive Like Button */}
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border transition-all text-xs font-mono shadow-md cursor-pointer select-none ${
              hasLiked
                ? 'bg-white/20 border-white/50 text-white scale-105 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                : 'bg-black/70 hover:bg-black/90 border-white/10 hover:border-white/30 text-gray-400 hover:text-white hover:scale-105'
            } ${heartBurst ? 'scale-125' : ''}`}
            title="Bấm để thả tim hồ sơ này!"
          >
            <Heart 
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                hasLiked ? 'fill-white text-white' : 'text-gray-400'
              } ${heartBurst ? 'animate-ping' : ''}`} 
            />
            <span>{likes.toLocaleString()}</span>
          </button>
        </div>
      </div>

      {/* 2. AVATAR & BADGES ROW */}
      <div className="px-5 relative">
        <div className="flex items-end justify-between -mt-14 mb-3">
          {/* Avatar Container with Decoration & Status */}
          <div className="relative group/avatar">
            <div className="w-24 h-24 rounded-full bg-[#050505] p-1.5 relative shadow-xl border border-white/5">
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
                className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#050505] flex items-center justify-center ${getStatusColor(config.status)}`}
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

            {/* Avatar Decoration Component */}
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

        {/* 1 Friend in Common */}
        <div className="flex items-center gap-2 mb-3 px-1 text-xs text-gray-400">
           <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-[10px]">?</div>
           <span>1 Bạn Chung</span>
        </div>

        {/* 3. USER INFO */}
        <div className="bg-[#232428]/60 p-4 rounded-xl border border-white/5 space-y-3.5 mb-4 shadow-inner">
          {/* Display Name & Username */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 
                className="text-xl font-bold text-white tracking-tight"
                style={{
                  color: '#ffffff',
                }}
              >
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
              <span className="text-xs text-gray-400 font-mono select-all">
                @{config.username}
              </span>
              <button
                onClick={handleCopyUsername}
                className="text-gray-500 hover:text-white p-0.5 transition-colors"
                title="Sao chép username"
              >
                {copied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
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

          {/* Member Since Dates (Displaying 2026 as requested) */}
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
