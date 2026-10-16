import React, { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, RotateCcw, X, ShieldCheck, Check, ExternalLink, Music, Gamepad2, Volume2 } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';
import { DiscordFriend, ProfileConfig } from '../types/profile';

interface BestFriendDuoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userConfig: ProfileConfig;
  friend?: DiscordFriend | null;
  onUpdateFriendAvatar?: (newUrl: string) => void;
}

export function BestFriendDuoModal({
  isOpen,
  onClose,
  userConfig,
  friend,
  onUpdateFriendAvatar,
}: BestFriendDuoModalProps) {
  // Animation state for heart forming
  const [animStage, setAnimStage] = useState<'initial' | 'drawing' | 'filled'>('initial');
  const [heartCount, setHeartCount] = useState<number>(999);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState<boolean>(false);
  const [customAvatarInput, setCustomAvatarInput] = useState<string>('');

  const animTimerRef = useRef<NodeJS.Timeout[]>([]);

  // Keifer information fallback
  const friendName = friend?.name || 'keifer';
  const friendUsername = friend?.username || 'keifer';
  const friendAvatar = friend?.avatarUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJTd3LUJy5lnFqo3RuEhh27KC1Sa8IFWjTJ_ItiyUGEg&s=10';

  const userAvatar = userConfig.avatarUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm4ft_l3UP4HWpzArGJaabiH2Muv648CtDVcBwMQl43Q&s';
  const userDisplayName = userConfig.displayName || '40wf';
  const userName = userConfig.username || '40wf';

  // Trigger heart drawing animation
  const triggerHeartAnimation = () => {
    // Clear any pending timers
    animTimerRef.current.forEach(clearTimeout);
    animTimerRef.current = [];

    setAnimStage('initial');
    soundFX.playClickSound();

    // Small delay to reset path
    const t1 = setTimeout(() => {
      setAnimStage('drawing');
      soundFX.playHeartSound(1);

      // Halfway sound
      const t2 = setTimeout(() => {
        soundFX.playHeartSound(2);
      }, 900);

      // Finished drawing, transition to filled & heartbeat
      const t3 = setTimeout(() => {
        setAnimStage('filled');
        soundFX.playHeartSound(4);
        spawnBurstHearts();
      }, 1800);

      animTimerRef.current.push(t2, t3);
    }, 60);

    animTimerRef.current.push(t1);
  };

  useEffect(() => {
    if (isOpen) {
      triggerHeartAnimation();
    } else {
      setAnimStage('initial');
      animTimerRef.current.forEach(clearTimeout);
      animTimerRef.current = [];
    }
    return () => {
      animTimerRef.current.forEach(clearTimeout);
    };
  }, [isOpen]);

  // Burst mini hearts
  const spawnBurstHearts = () => {
    const newHearts = Array.from({ length: 12 }).map((_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() * 40 - 20),
      y: 50 + (Math.random() * 30 - 15),
      size: Math.floor(Math.random() * 14) + 14,
    }));
    setFloatingHearts((prev) => [...prev, ...newHearts]);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 2000);
  };

  const handleSendLove = () => {
    setHeartCount((c) => c + 1);
    soundFX.playHeartSound(Math.min((heartCount % 10) + 1, 8));
    spawnBurstHearts();
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      soundFX.playClickSound();
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Ignored
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-rose-600/15 via-purple-600/20 to-cyan-500/15 blur-[120px] animate-pulse" />
      </div>

      {/* Main Showcase Card */}
      <div
        className="relative w-full max-w-lg bg-[#111214]/95 border border-pink-500/30 rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(236,72,153,0.25)] p-5 sm:p-7 flex flex-col items-center overflow-hidden"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px 2px rgba(244, 63, 94, 0.25)',
        }}
      >
        {/* Subtle scanline / glow effect at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 shadow-[0_0_12px_rgba(236,72,153,0.8)]" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundFX.playClickSound();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20"
          title="Đóng cửa sổ"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Tag */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold tracking-wide uppercase mb-3 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Tri Kỷ Chí Cốt • Best Friends Forever</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-cyan-300 tracking-tight text-center mb-1">
          {userDisplayName} &amp; {friendName}
        </h3>
        <p className="text-xs text-amber-300/90 text-center mb-6 font-medium flex items-center justify-center gap-1">
          <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Hai đứa hợp nhau nhất là cùng chơi Roblox ⚔️🔥</span>
        </p>

        {/* THE DUO STAGE: 40wf  ❤️  keifer */}
        <div className="relative w-full py-4 px-2 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 my-2">
          {/* Left Avatar: 40wf */}
          <div className="flex flex-col items-center flex-1 z-10 group/user">
            <div className="relative">
              {/* Outer Neon Glow */}
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 opacity-75 blur-sm group-hover/user:opacity-100 transition-opacity animate-pulse" />

              {/* Avatar Frame */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-cyan-400/80 bg-black/80 shadow-lg">
                <img
                  src={userAvatar}
                  alt={userDisplayName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/user:scale-110"
                />
              </div>

              {/* Online/Active badge */}
              <div className="absolute bottom-0 right-1 w-5 h-5 rounded-full bg-[#f23f43] border-2 border-[#111214] flex items-center justify-center shadow-md">
                <div className="w-2 h-0.5 bg-white rounded-full" />
              </div>
            </div>

            {/* Name under avatar: 40wf */}
            <div className="mt-3 text-center">
              <span className="block text-base sm:text-lg font-black tracking-wide text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                40wf
              </span>
              <span className="inline-block text-[11px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 mt-0.5">
                @{userName}
              </span>
            </div>
          </div>

          {/* MIDDLE: THE FORMING ANIMATED HEART */}
          <div className="relative flex flex-col items-center justify-center shrink-0 w-28 sm:w-36 z-20">
            {/* Connecting electric bridge behind heart */}
            <div className="absolute w-full h-[2px] top-1/2 -translate-y-1/2 -z-10 bg-gradient-to-r from-cyan-500/60 via-pink-500 to-purple-500/60 blur-[1px] animate-pulse" />

            {/* Floating Mini Hearts particles */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {floatingHearts.map((h) => (
                <div
                  key={h.id}
                  className="absolute text-pink-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-ping"
                  style={{
                    left: `${h.x}%`,
                    top: `${h.y}%`,
                    fontSize: `${h.size}px`,
                    animationDuration: '1.4s',
                  }}
                >
                  ❤️
                </div>
              ))}
            </div>

            {/* SVG Heart Canvas */}
            <div
              className={`relative cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 ${
                animStage === 'filled' ? 'animate-[bounce_2s_infinite]' : ''
              }`}
              onClick={handleSendLove}
              title="Nhấn để thả tim đôi!"
            >
              <svg
                viewBox="0 0 100 100"
                className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_18px_rgba(244,63,94,0.85)] overflow-visible"
              >
                <defs>
                  {/* Linear gradient for stroke */}
                  <linearGradient id="heartStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>

                  {/* Radial gradient for glowing body */}
                  <radialGradient id="heartFill" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="60%" stopColor="#e11d48" />
                    <stop offset="100%" stopColor="#9f1239" />
                  </radialGradient>
                </defs>

                {/* The Animated Drawing Path */}
                <path
                  d="M 50,30 C 50,12 25,10 18,28 C 8,50 50,85 50,85 C 50,85 92,50 82,28 C 75,10 50,12 50,30 Z"
                  pathLength="100"
                  stroke="url(#heartStroke)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="url(#heartFill)"
                  style={{
                    strokeDasharray: 100,
                    strokeDashoffset: animStage === 'initial' ? 100 : 0,
                    transition:
                      animStage === 'drawing'
                        ? 'stroke-dashoffset 1.8s cubic-bezier(0.25, 1, 0.5, 1), fill-opacity 0.6s ease-in 1.4s'
                        : animStage === 'filled'
                        ? 'stroke-dashoffset 0s, fill-opacity 0.4s ease-in'
                        : 'none',
                    fillOpacity: animStage === 'filled' ? 1 : animStage === 'drawing' ? 0.75 : 0,
                  }}
                />

                {/* Inner heart sparkle when filled */}
                {animStage === 'filled' && (
                  <circle
                    cx="36"
                    cy="28"
                    r="3.5"
                    fill="#ffffff"
                    opacity="0.8"
                    className="animate-pulse"
                  />
                )}
              </svg>

              {/* Status text below the heart: "Đang vẽ..." or "Gắn kết vĩnh cửu" */}
              <div className="text-center mt-1">
                {animStage === 'drawing' ? (
                  <span className="text-[10px] font-mono text-pink-300 font-bold animate-pulse">
                    Đang vẽ trái tim...
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-rose-300/90 tracking-wider uppercase flex items-center justify-center gap-1">
                    <span>❤️</span>
                    <span>Best Duo</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Avatar: keifer */}
          <div className="flex flex-col items-center flex-1 z-10 group/friend">
            <div className="relative">
              {/* Outer Neon Glow */}
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 opacity-75 blur-sm group-hover/friend:opacity-100 transition-opacity animate-pulse" />

              {/* Avatar Frame */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-pink-400/80 bg-black/80 shadow-lg">
                <img
                  src={friendAvatar}
                  alt={friendName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/friend:scale-110"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Status Indicator */}
              <div className="absolute bottom-0 right-1 w-5 h-5 rounded-full bg-[#23a55a] border-2 border-[#111214] flex items-center justify-center shadow-md">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            {/* Name under avatar: keifer */}
            <div className="mt-3 text-center">
              <span className="block text-base sm:text-lg font-black tracking-wide text-pink-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                keifer
              </span>
              <span className="inline-block text-[11px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 mt-0.5">
                @{friendUsername}
              </span>
            </div>
          </div>
        </div>

        {/* Duo Relationship Details Card */}
        <div className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 mt-3 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span className="flex items-center gap-1.5 text-gray-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Tình bạn:
            </span>
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
              👑 Cặp bài trùng số 1
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-300">
            <span className="text-gray-400">Điểm hợp nhau nhất:</span>
            <span className="font-mono text-amber-300 font-bold flex items-center gap-1">
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" /> Cùng chơi Roblox ⚔️
            </span>
          </div>

          <div className="text-[11px] text-gray-300 bg-white/5 p-2 rounded-lg italic text-center border border-white/5 leading-relaxed">
            &ldquo;Hai đứa hợp nhau nhất là chơi Roblox cùng nhau — Blox Fruits, Blade Ball, thức đêm cày rank không biết mệt!&rdquo;
          </div>
        </div>

        {/* Change avatar for Keifer option if user wants to customize */}
        {isEditingAvatar ? (
          <div className="w-full mb-4 p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-2 animate-fadeIn">
            <label className="text-xs text-purple-300 font-medium block">
              Dán URL ảnh đại diện mới cho keifer:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://..."
                value={customAvatarInput}
                onChange={(e) => setCustomAvatarInput(e.target.value)}
                className="flex-1 bg-black/60 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={() => {
                  if (customAvatarInput.trim() && onUpdateFriendAvatar) {
                    onUpdateFriendAvatar(customAvatarInput.trim());
                    soundFX.playHeartSound(2);
                  }
                  setIsEditingAvatar(false);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Lưu
              </button>
              <button
                onClick={() => setIsEditingAvatar(false)}
                className="px-2 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-xs cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : null}

        {/* Interactive Action Buttons */}
        <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-1 border-t border-white/10">
          {/* Replay Heart Drawing Button */}
          <button
            onClick={triggerHeartAnimation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 hover:text-white text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm"
            title="Xem lại hiệu ứng nét vẽ hình thành trái tim"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Vẽ lại trái tim</span>
          </button>

          {/* Send Duo Heart */}
          <button
            onClick={handleSendLove}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
          >
            <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span>Thả tim ({heartCount})</span>
          </button>

          {/* Edit Keifer Avatar */}
          {onUpdateFriendAvatar && !isEditingAvatar && (
            <button
              onClick={() => {
                setCustomAvatarInput(friendAvatar);
                setIsEditingAvatar(true);
                soundFX.playClickSound();
              }}
              className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 text-xs transition-all cursor-pointer"
              title="Đổi ảnh avatar cho keifer"
            >
              Đổi avt keifer
            </button>
          )}

          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs transition-all cursor-pointer"
            title="Sao chép liên kết hồ sơ"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Đã chép!</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Chia sẻ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
