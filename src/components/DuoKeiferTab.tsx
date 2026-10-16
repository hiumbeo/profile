import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Sparkles, 
  RotateCcw, 
  Gamepad2, 
  ShieldCheck, 
  Trophy, 
  ExternalLink, 
  Flame, 
  Clock, 
  Edit3, 
  Check, 
  Copy,
  Swords,
  Zap
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';
import { ProfileConfig } from '../types/profile';

interface DuoKeiferTabProps {
  userConfig: ProfileConfig;
  keiferAvatarUrl: string;
  onUpdateKeiferAvatar: (url: string) => void;
  onClose?: () => void;
}

export function DuoKeiferTab({
  userConfig,
  keiferAvatarUrl,
  onUpdateKeiferAvatar,
  onClose
}: DuoKeiferTabProps) {
  // Animation state for the heart forming
  const [animStage, setAnimStage] = useState<'initial' | 'drawing' | 'filled'>('initial');
  const [heartCount, setHeartCount] = useState<number>(1314);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [isEditingAvatar, setIsEditingAvatar] = useState<boolean>(false);
  const [avatarInput, setAvatarInput] = useState<string>(keiferAvatarUrl);
  const [copiedRoblox, setCopiedRoblox] = useState<string | null>(null);

  const animTimerRef = useRef<NodeJS.Timeout[]>([]);

  // The exact avatar from the screenshot
  const userAvatar = userConfig.avatarUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm4ft_l3UP4HWpzArGJaabiH2Muv648CtDVcBwMQl43Q&s';
  const userDisplayName = userConfig.displayName || 'Em dần xa đi';
  const userName = userConfig.username || '40wf';

  // Trigger heart drawing animation
  const triggerHeartAnimation = () => {
    animTimerRef.current.forEach(clearTimeout);
    animTimerRef.current = [];

    setAnimStage('initial');
    soundFX.playClickSound();

    const t1 = setTimeout(() => {
      setAnimStage('drawing');
      soundFX.playHeartSound(1);

      const t2 = setTimeout(() => {
        soundFX.playHeartSound(2);
      }, 900);

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
    triggerHeartAnimation();
    return () => {
      animTimerRef.current.forEach(clearTimeout);
    };
  }, []);

  const spawnBurstHearts = () => {
    const newHearts = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      x: 50 + (Math.random() * 40 - 20),
      y: 50 + (Math.random() * 30 - 15),
      size: Math.floor(Math.random() * 16) + 14,
    }));
    setFloatingHearts((prev) => [...prev, ...newHearts]);

    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 2200);
  };

  const handleSendLove = () => {
    setHeartCount((c) => c + 1);
    soundFX.playHeartSound(Math.min((heartCount % 10) + 1, 8));
    spawnBurstHearts();
  };

  const handleCopyRoblox = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedRoblox(id);
      soundFX.playClickSound();
      setTimeout(() => setCopiedRoblox(null), 2000);
    } catch {}
  };

  return (
    <div className="w-full max-w-xl lg:max-w-md bg-[#111214]/90 backdrop-blur-2xl border border-pink-500/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col transition-all duration-300 relative group/card">
      {/* Top Cyber Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 shadow-[0_0_12px_rgba(236,72,153,0.8)]" />

      {/* Top Banner Header */}
      <div className="relative p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-pink-950/40 via-[#111214] to-cyan-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]">
              <Gamepad2 className="w-5 h-5 text-pink-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                  <span>Duo Roblox</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                    40wf &amp; keifer
                  </span>
                </h3>
              </div>
              <p className="text-xs text-gray-300 font-sans flex items-center gap-1 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Hợp nhau nhất là cày Jujutsu Shenanigans (JJS) ⚔️</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-[11px] font-semibold tracking-wide flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Best Fen</span>
            </span>
          </div>
        </div>
      </div>

      {/* SCROLLABLE DUO CONTENT */}
      <div className="p-4 sm:p-5 space-y-4 max-h-[640px] overflow-y-auto custom-scrollbar">
        {/* THE MAIN DUO SHOWCASE: 40wf  ❤️  keifer */}
        <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#18191c]/90 to-black/80 border border-white/10 shadow-[0_0_30px_rgba(244,63,94,0.15)] flex flex-col items-center">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl flex items-center justify-center">
            <div className="w-[280px] h-[280px] rounded-full bg-pink-600/15 blur-[60px]" />
          </div>

          <div className="w-full flex items-center justify-between gap-2 sm:gap-4 relative z-10">
            {/* LEFT AVATAR: 40wf */}
            <div className="flex flex-col items-center flex-1">
              <div className="relative group/user">
                {/* Neon Aura */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 opacity-75 blur-xs group-hover/user:opacity-100 transition-opacity animate-pulse" />

                {/* Avatar */}
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-cyan-400/90 bg-black/80 shadow-md">
                  <img
                    src={userAvatar}
                    alt="40wf"
                    className="w-full h-full object-cover group-hover/user:scale-105 transition-transform"
                  />
                </div>

                {/* Online Badge */}
                <div className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-[#f23f43] border-2 border-[#111214] flex items-center justify-center shadow-md">
                  <div className="w-2 h-0.5 bg-white rounded-full" />
                </div>
              </div>

              {/* Names below 40wf */}
              <div className="mt-2.5 text-center">
                <span className="block text-sm sm:text-base font-black tracking-wide text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                  40wf
                </span>
                <span className="inline-block text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 mt-0.5">
                  @{userName}
                </span>
              </div>
            </div>

            {/* MIDDLE: THE GRADUAL FORMING HEART */}
            <div className="relative flex flex-col items-center justify-center shrink-0 w-24 sm:w-28 z-20">
              {/* Electric connecting laser */}
              <div className="absolute w-full h-[2px] top-1/2 -translate-y-1/2 -z-10 bg-gradient-to-r from-cyan-400/50 via-pink-500 to-purple-500/50 blur-[1px] animate-pulse" />

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
                className={`relative cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-90 ${
                  animStage === 'filled' ? 'animate-[bounce_2.5s_infinite]' : ''
                }`}
                onClick={handleSendLove}
                title="Nhấn để thả tim cho Duo Roblox!"
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-18 h-18 sm:w-20 sm:h-20 drop-shadow-[0_0_16px_rgba(244,63,94,0.85)] overflow-visible"
                >
                  <defs>
                    <linearGradient id="duoHeartStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="50%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>

                    <radialGradient id="duoHeartFill" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#fb7185" />
                      <stop offset="60%" stopColor="#e11d48" />
                      <stop offset="100%" stopColor="#9f1239" />
                    </radialGradient>
                  </defs>

                  {/* SVG Animated Path forming the heart */}
                  <path
                    d="M 50,30 C 50,12 25,10 18,28 C 8,50 50,85 50,85 C 50,85 92,50 82,28 C 75,10 50,12 50,30 Z"
                    pathLength="100"
                    stroke="url(#duoHeartStroke)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="url(#duoHeartFill)"
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

                  {animStage === 'filled' && (
                    <circle cx="36" cy="28" r="3" fill="#ffffff" opacity="0.8" className="animate-pulse" />
                  )}
                </svg>

                <div className="text-center mt-0.5">
                  {animStage === 'drawing' ? (
                    <span className="text-[10px] font-mono text-pink-300 font-bold animate-pulse">
                      Đang vẽ...
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-300/90 tracking-wider uppercase flex items-center justify-center gap-1">
                      <span>❤️</span>
                      <span>Duo Blox</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT AVATAR: keifer */}
            <div className="flex flex-col items-center flex-1">
              <div className="relative group/friend">
                {/* Neon Aura */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-pink-400 to-rose-600 opacity-75 blur-xs group-hover/friend:opacity-100 transition-opacity animate-pulse" />

                {/* Avatar */}
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-pink-400/90 bg-black/80 shadow-md">
                  <img
                    src={keiferAvatarUrl}
                    alt="keifer"
                    className="w-full h-full object-cover group-hover/friend:scale-105 transition-transform"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/keifer_avatar.jpg';
                    }}
                  />
                </div>

                {/* Online Badge */}
                <div className="absolute bottom-0 right-0 w-4.5 h-4.5 rounded-full bg-[#23a55a] border-2 border-[#111214] flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>

              {/* Names below keifer */}
              <div className="mt-2.5 text-center">
                <span className="block text-sm sm:text-base font-black tracking-wide text-pink-300 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                  keifer
                </span>
                <span className="inline-block text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 mt-0.5">
                  @keifer
                </span>
              </div>
            </div>
          </div>

          {/* Quick Trigger Buttons */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 w-full justify-center">
            <button
              onClick={triggerHeartAnimation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Vẽ lại nét trái tim"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vẽ lại</span>
            </button>

            <button
              onClick={handleSendLove}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            >
              <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>Thả tim ({heartCount})</span>
            </button>

            <button
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 text-xs transition-all cursor-pointer flex items-center gap-1"
              title="Chỉnh sửa ảnh đại diện của keifer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Đổi avt</span>
            </button>
          </div>

          {/* Avatar edit drawer */}
          {isEditingAvatar && (
            <div className="w-full mt-3 p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-2 animate-fadeIn">
              <label className="text-[11px] text-purple-300 font-medium block">
                Dán URL ảnh đại diện mới cho keifer:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://..."
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={() => {
                    if (avatarInput.trim()) {
                      onUpdateKeiferAvatar(avatarInput.trim());
                      soundFX.playHeartSound(2);
                    }
                    setIsEditingAvatar(false);
                  }}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Lưu
                </button>
                <button
                  onClick={() => setIsEditingAvatar(false)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-xs cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🎮 ĐIỂM HỢP NHAU NHẤT: CHƠI ROBLOX ⚔️ */}
        <div className="p-4 rounded-2xl bg-[#18191c]/80 border border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.1)] space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Điểm hợp nhau nhất</span>
                <span className="text-amber-400 text-xs font-semibold px-2 py-0.2 rounded bg-amber-500/20 border border-amber-500/30">
                  Cùng chơi Roblox
                </span>
              </h4>
              <p className="text-[11px] text-gray-400">
                Hai đứa cày game thâu đêm suốt sáng, không bao giờ bỏ rơi nhau
              </p>
            </div>
          </div>

          {/* Roblox Usernames & Duo Sync */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* 40wf Roblox */}
            <div 
              onClick={() => handleCopyRoblox('tyLNTV1706', '40wf')}
              className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/40 transition-colors cursor-pointer group/rblx"
            >
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                Roblox 40wf
              </span>
              <span className="text-xs font-mono font-bold text-white flex items-center justify-between mt-0.5">
                <span>tyLNTV1706</span>
                {copiedRoblox === '40wf' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-500 group-hover/rblx:text-white" />
                )}
              </span>
            </div>

            {/* keifer Roblox: hwrobloc */}
            <div 
              onClick={() => handleCopyRoblox('hwrobloc', 'keifer')}
              className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-pink-500/40 transition-colors cursor-pointer group/rblx2"
            >
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">
                Roblox keifer
              </span>
              <span className="text-xs font-mono font-bold text-white flex items-center justify-between mt-0.5">
                <span>hwrobloc</span>
                {copiedRoblox === 'keifer' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-500 group-hover/rblx2:text-white" />
                )}
              </span>
            </div>
          </div>

          {/* Favorite Roblox Games List */}
          <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-2">
            <span className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-pink-400" />
              Tựa game hợp nhau nhất:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-pink-500/25 border border-pink-500/50 text-xs text-pink-200 font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                🥋 Jujutsu Shenanigans (JJS) ⭐
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs text-cyan-300 font-medium">
                ⚔️ Blox Fruits (Sea 3)
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs text-purple-300 font-medium">
                🗡️ Blade Ball
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs text-emerald-300 font-medium">
                🛏️ Bedwars Duo
              </span>
            </div>
          </div>
        </div>

        {/* DUO ACHIEVEMENTS / STATS */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center justify-center">
            <Trophy className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] text-gray-400">Độ hợp ý</span>
            <span className="text-sm font-black text-amber-300 font-mono">100%</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center justify-center">
            <Clock className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] text-gray-400">Giờ cày Roblox</span>
            <span className="text-sm font-black text-cyan-300 font-mono">1,820+ h</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center flex flex-col items-center justify-center">
            <Zap className="w-4 h-4 text-pink-400 mb-1" />
            <span className="text-[10px] text-gray-400">Chuỗi thắng</span>
            <span className="text-sm font-black text-pink-300 font-mono">35 Trận</span>
          </div>
        </div>

        {/* Bond Quote */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/30 via-black/40 to-pink-950/30 border border-purple-500/20 text-center">
          <p className="text-xs text-gray-300 italic leading-relaxed">
            &ldquo;Hợp nhau nhất là cày Jujutsu Shenanigans (JJS) &amp; Roblox — 40wf và keifer là cặp bài trùng gánh lobby không đối thủ!&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
