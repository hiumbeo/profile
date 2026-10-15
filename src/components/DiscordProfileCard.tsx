import { useState } from 'react';
import { ProfileConfig, StatusType } from '../types/profile';
import { AvatarDecoration } from './AvatarDecoration';
import { DiscordBadges } from './DiscordBadges';
import { ActivityPlayer } from './ActivityPlayer';
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
  views = 1284, 
  likes = 342, 
  hasLiked = false, 
  onLike 
}: DiscordProfileCardProps) {
  const [copied, setCopied] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [dummyMsg, setDummyMsg] = useState('');
  const [heartBurst, setHeartBurst] = useState(false);

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

  // Render markdown-like simple formatting in Bio
  const renderBio = (bio: string) => {
    const lines = bio.split('\n');
    let inCodeBlock = false;
    const codeBlockLines: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${idx}`} className="bg-[#1e1f22] p-2.5 rounded text-xs font-mono text-cyan-200 overflow-x-auto my-1.5 border border-cyan-500/20">
              <code>{codeBlockLines.join('\n')}</code>
            </pre>
          );
          codeBlockLines.length = 0;
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Quote block
      if (line.startsWith('>')) {
        elements.push(
          <div key={idx} className="border-l-2 border-cyan-400 pl-2 my-1 text-gray-300 italic text-xs">
            {line.replace(/^>\s*/, '')}
          </div>
        );
        return;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={idx} className="h-1.5" />);
        return;
      }

      // Regular line with bold and links
      elements.push(
        <p key={idx} className="text-xs text-gray-300 leading-relaxed">
          {line}
        </p>
      );
    });

    if (inCodeBlock && codeBlockLines.length > 0) {
      elements.push(
        <pre key="code-end" className="bg-[#1e1f22] p-2 rounded text-xs font-mono text-cyan-200 overflow-x-auto my-1 border border-cyan-500/20">
          <code>{codeBlockLines.join('\n')}</code>
        </pre>
      );
    }

    return elements;
  };

  return (
    <div className="relative w-full max-w-[420px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-cyan-500/30 transition-all duration-300 bg-[#111214]/95 backdrop-blur-xl group">
      {/* Subtle cyber glitch scanning line overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 opacity-20 bg-[linear-gradient(rgba(0,240,255,0)_50%,rgba(0,240,255,0.25)_50%)] bg-[length:100%_4px]" />

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
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>GLITCH · ACTIVE</span>
        </div>

        {/* Top Right: Views Counter & Like Button (Replaces Customizer) */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {/* View Counter */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-cyan-500/30 text-xs text-cyan-300 font-mono shadow-md"
            title="Tổng số lượt xem trang hồ sơ"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>{views.toLocaleString()}</span>
          </div>

          {/* Interactive Like Button */}
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-md border transition-all text-xs font-mono shadow-md cursor-pointer select-none ${
              hasLiked
                ? 'bg-rose-950/90 border-rose-500 text-rose-300 scale-105 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-black/70 hover:bg-black/90 border-rose-500/30 hover:border-rose-500 text-rose-400 hover:scale-105'
            } ${heartBurst ? 'scale-125' : ''}`}
            title="Bấm để thả tim hồ sơ này!"
          >
            <Heart 
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                hasLiked ? 'fill-rose-500 text-rose-500' : 'text-rose-400'
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
            <div className="w-24 h-24 rounded-full bg-[#111214] p-1.5 relative shadow-xl border border-cyan-500/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-black/40">
                <img
                  src={config.avatarUrl}
                  alt={config.displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://api.dicebear.com/9.x/avataaars/svg?seed=tyLNTV1706';
                  }}
                />
              </div>

              {/* Status Indicator */}
              <div 
                className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#111214] flex items-center justify-center ${getStatusColor(config.status)}`}
                title={`Status: ${config.status}`}
              >
                {config.status === 'idle' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111214] -ml-1 -mt-1" />
                )}
                {config.status === 'dnd' && (
                  <div className="w-2.5 h-0.5 bg-[#111214] rounded-full" />
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

        {/* 3. USER INFO */}
        <div className="bg-[#232428]/60 p-4 rounded-xl border border-white/5 space-y-3.5 mb-4 shadow-inner">
          {/* Display Name & Username */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 
                className="text-xl font-bold text-white tracking-tight"
                style={{
                  color: config.accentColor || '#00f0ff',
                  textShadow: '0 0 14px rgba(0,240,255,0.4)',
                }}
              >
                {config.displayName}
              </h2>
              {config.pronouns && (
                <span className="text-[11px] font-medium text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-500/20">
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
                className="text-gray-500 hover:text-cyan-400 p-0.5 transition-colors"
                title="Sao chép username"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            {/* Custom Status */}
            {config.statusText && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-gray-200 bg-black/35 py-1.5 px-2.5 rounded-lg border border-cyan-500/10">
                {config.statusEmoji && <span className="text-sm">{config.statusEmoji}</span>}
                <span className="truncate">{config.statusText}</span>
              </div>
            )}
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* About Me */}
          {config.bio && (
            <div>
              <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5">
                About Me
              </h3>
              <div className="space-y-1">
                {renderBio(config.bio)}
              </div>
            </div>
          )}

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
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-[#1e1f22] border border-white/5 text-gray-200"
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

          {/* Connected Accounts (Strictly Roblox: tyLNTV1706) */}
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Connected Account
            </h3>
            <a
              href="https://www.roblox.com/search/users?keyword=tyLNTV1706"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#111214]/80 hover:bg-[#111214] border border-cyan-500/20 hover:border-red-500/50 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#ff2d55]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.33 0 0 18.67l18.67 5.33L24 5.33 5.33 0ZM14.3 12.87l-3.17-.9 1-3.17 3.17.9-1 3.17Z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">
                    Roblox Account
                  </p>
                  <p className="text-xs text-white truncate font-semibold mt-1 flex items-center gap-1">
                    <span>tyLNTV1706</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1 rounded">Verified</span>
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors shrink-0" />
            </a>
          </div>

          {/* Quick Message Simulation Box */}
          <div className="pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!dummyMsg.trim()) return;
                setMsgSent(true);
                setDummyMsg('');
                setTimeout(() => setMsgSent(false), 2500);
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={dummyMsg}
                onChange={(e) => setDummyMsg(e.target.value)}
                placeholder={`Nhắn tin cho @${config.displayName}`}
                className="w-full bg-[#111214] text-xs text-white placeholder-gray-500 rounded-lg py-2.5 pl-3 pr-10 border border-cyan-500/20 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="absolute right-2 text-gray-400 hover:text-cyan-400 p-1 transition-colors"
                title="Gửi tin nhắn"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            {msgSent && (
              <p className="text-[11px] text-emerald-400 text-center mt-1.5 animate-fadeIn">
                Đã gửi lời nhắn tới @{config.username}!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
