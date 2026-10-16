import React, { useState } from 'react';
import { DiscordFriend, StatusType, AvatarDecorType } from '../types/profile';
import { AvatarDecoration } from './AvatarDecoration';
import { soundFX } from '../utils/soundEffects';
import { 
  Users, 
  Sparkles, 
  Copy, 
  Check, 
  Gamepad2, 
  Music, 
  Plus, 
  Trash2, 
  ExternalLink,
  Heart,
  X,
  MessageCircle,
  Radio
} from 'lucide-react';

interface BestFriendsTabProps {
  friends: DiscordFriend[];
  onAddFriend: (friend: DiscordFriend) => void;
  onRemoveFriend: (id: string) => void;
  onResetFriends: () => void;
  onClose?: () => void;
  onOpenDuoModal?: (friend?: DiscordFriend) => void;
}

interface WaveParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export function BestFriendsTab({
  friends,
  onAddFriend,
  onRemoveFriend,
  onResetFriends,
  onClose,
  onOpenDuoModal
}: BestFriendsTabProps) {
  const [filter, setFilter] = useState<'all' | 'online' | 'gaming'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [waveParticles, setWaveParticles] = useState<WaveParticle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Friend Form State
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [newRelationship, setNewRelationship] = useState('💖 Bestie');
  const [newStatus, setNewStatus] = useState<StatusType>('online');
  const [newCustomStatus, setNewCustomStatus] = useState('');
  const [newActivityType, setNewActivityType] = useState<'game' | 'spotify' | 'none'>('game');
  const [newActivityName, setNewActivityName] = useState('');
  const [newDecor, setNewDecor] = useState<AvatarDecorType>('reyna_eye');

  const filteredFriends = friends.filter((f) => {
    if (filter === 'online') return f.status !== 'offline';
    if (filter === 'gaming') return f.activity?.type === 'game';
    return true;
  });

  const onlineCount = friends.filter((f) => f.status !== 'offline').length;

  const handleCopy = (friend: DiscordFriend, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playCopySound();
    navigator.clipboard.writeText(`@${friend.username}`);
    setCopiedId(friend.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWave = (friend: DiscordFriend, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClickSound();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const emojis = ['👋', '💜', '✨', '⚡', '💖'];
    const chosen = emojis[Math.floor(Math.random() * emojis.length)];

    const newP: WaveParticle = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY - 20,
      emoji: chosen,
    };

    setWaveParticles((prev) => [...prev, newP]);
    setTimeout(() => {
      setWaveParticles((prev) => prev.filter((p) => p.id !== newP.id));
    }, 1200);
  };

  const handleSubmitNewFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim()) return;

    const newFriend: DiscordFriend = {
      id: 'friend_' + Date.now(),
      name: newName.trim(),
      username: newUsername.trim().replace(/^@/, ''),
      avatarUrl: newAvatarUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: newStatus,
      relationship: newRelationship.trim(),
      customStatus: newCustomStatus.trim(),
      avatarDecor: newDecor,
      activity: newActivityType !== 'none' && newActivityName.trim() ? {
        type: newActivityType,
        name: newActivityName.trim(),
        details: newActivityType === 'game' ? 'Đang chơi cùng bạn bè' : 'Đang phát nhạc',
      } : undefined,
    };

    onAddFriend(newFriend);
    soundFX.playHeartSound(1);
    setIsModalOpen(false);

    // Reset form
    setNewName('');
    setNewUsername('');
    setNewAvatarUrl('');
    setNewCustomStatus('');
    setNewActivityName('');
  };

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'online': return 'bg-[#23a55a]';
      case 'idle': return 'bg-[#f0b232]';
      case 'dnd': return 'bg-[#f23f43]';
      case 'streaming': return 'bg-[#593695]';
      case 'offline': default: return 'bg-[#80848e]';
    }
  };

  return (
    <div className="w-full max-w-xl lg:max-w-md bg-[#111214]/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col transition-all duration-300 relative group/card">
      {/* Floating Wave Emojis */}
      <div className="fixed inset-0 pointer-events-none z-[999]">
        {waveParticles.map((p) => (
          <div
            key={p.id}
            className="absolute text-2xl font-bold animate-bounce select-none pointer-events-none drop-shadow-md"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              animation: 'floatUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Top Banner / Cyber Header */}
      <div className="relative p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-purple-950/40 via-[#111214] to-cyan-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  Bạn Thân
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {friends.length}
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                {onlineCount} trực tuyến • Best Friends Squad ⚡
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundFX.playClickSound();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 active:scale-95 text-xs font-semibold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
              title="Thêm bạn thân mới"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Đóng tab"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mt-3.5 pt-2 border-t border-white/5">
          <button
            onClick={() => {
              soundFX.playClickSound();
              setFilter('all');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-purple-500/25 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            Tất cả ({friends.length})
          </button>
          <button
            onClick={() => {
              soundFX.playClickSound();
              setFilter('online');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'online'
                ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Trực tuyến ({onlineCount})
          </button>
          <button
            onClick={() => {
              soundFX.playClickSound();
              setFilter('gaming');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'gaming'
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <Gamepad2 className="w-3 h-3 text-cyan-400" />
            Đang chơi game
          </button>
        </div>
      </div>

      {/* Friends List Container */}
      <div className="p-3 sm:p-4 space-y-2.5 max-h-[580px] overflow-y-auto custom-scrollbar">
        {/* Featured Duo Spotlight Card: 40wf ❤️ keifer */}
        <div
          onClick={() => {
            soundFX.playClickSound();
            if (onOpenDuoModal) {
              const keiferFriend =
                friends.find((f) => f.username === 'keifer' || f.name.toLowerCase() === 'keifer') ||
                friends[0];
              onOpenDuoModal(keiferFriend);
            }
          }}
          className="relative p-3.5 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-[#18191c] border border-pink-500/40 hover:border-pink-500/80 transition-all duration-300 cursor-pointer shadow-[0_4px_25px_rgba(244,63,94,0.18)] hover:shadow-[0_4px_35px_rgba(244,63,94,0.3)] group/duoCard"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* 2 Avatars with animated heart in between */}
              <div className="flex items-center -space-x-2 shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-cyan-400 overflow-hidden bg-black/60 shadow-md">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm4ft_l3UP4HWpzArGJaabiH2Muv648CtDVcBwMQl43Q&s"
                    alt="40wf"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-xs z-10 text-white shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse">
                  ❤️
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-pink-400 overflow-hidden bg-black/60 shadow-md">
                  <img
                    src={
                      friends.find((f) => f.username === 'keifer')?.avatarUrl ||
                      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80'
                    }
                    alt="keifer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-300 to-purple-200">
                    40wf &amp; keifer
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/25 text-pink-300 border border-pink-500/40">
                    👑 Best Fen
                  </span>
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-400 animate-spin" style={{ animationDuration: '3s' }} />
                  Nhấn xem avatar 2 đứa &amp; vẽ trái tim ✨
                </p>
              </div>
            </div>

            <div className="px-2.5 py-1.5 rounded-xl bg-pink-500/20 group-hover/duoCard:bg-pink-500/30 text-pink-300 text-xs font-semibold shrink-0 transition-colors flex items-center gap-1">
              <span>Mở</span>
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-current animate-pulse" />
            </div>
          </div>
        </div>

        {filteredFriends.length === 0 ? (
          <div className="text-center py-10 px-4 text-gray-500 text-xs">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-400" />
            <p>Không có bạn bè nào phù hợp bộ lọc.</p>
          </div>
        ) : (
          filteredFriends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => {
                if (onOpenDuoModal) {
                  onOpenDuoModal(friend);
                }
              }}
              className="group/item relative p-3 rounded-xl bg-[#1e1f22]/70 hover:bg-[#232428]/90 border border-white/5 hover:border-pink-500/40 transition-all duration-200 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col gap-2 cursor-pointer"
            >
              {/* Top Row: Avatar + Info + Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar + Status + Decor */}
                  <div className="relative w-12 h-12 shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-black/60 border border-white/10">
                      <img
                        src={friend.avatarUrl}
                        alt={friend.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm4ft_l3UP4HWpzArGJaabiH2Muv648CtDVcBwMQl43Q&s';
                        }}
                      />
                    </div>

                    {/* Discord Status Indicator */}
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#1e1f22] flex items-center justify-center ${getStatusColor(
                        friend.status
                      )} z-30`}
                    >
                      {friend.status === 'idle' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e1f22] -ml-0.5 -mt-0.5" />
                      )}
                      {friend.status === 'dnd' && (
                        <div className="w-1.5 h-0.5 bg-[#1e1f22] rounded-full" />
                      )}
                    </div>

                    {/* Avatar Decor if present */}
                    {friend.avatarDecor && (
                      <AvatarDecoration
                        decor={friend.avatarDecor}
                        customDecorUrl={friend.customDecorUrl}
                      />
                    )}
                  </div>

                  {/* Friend Names & Tag */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-white truncate group-hover/item:text-purple-200 transition-colors">
                        {friend.name}
                      </span>
                      {friend.relationship && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                          {friend.relationship}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono mt-0.5">
                      <span
                        onClick={(e) => handleCopy(friend, e)}
                        className="hover:text-white cursor-pointer transition-colors flex items-center gap-1"
                        title="Sao chép Discord Tag"
                      >
                        @{friend.username}
                        {copiedId === friend.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions (Wave / Remove) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => handleWave(friend, e)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-600/30 text-gray-300 hover:text-purple-200 transition-all cursor-pointer active:scale-90"
                    title="Vẫy tay chào bạn 👋"
                  >
                    <span className="text-sm">👋</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFX.playClickSound();
                      onRemoveFriend(friend.id);
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer opacity-0 group-hover/item:opacity-100"
                    title="Xóa khỏi danh sách bạn thân"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Custom Status Quote */}
              {friend.customStatus && (
                <div className="text-[11px] text-gray-300 bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/5 font-sans leading-relaxed">
                  {friend.customStatus}
                </div>
              )}

              {/* Rich Activity Indicator (Game or Spotify) */}
              {friend.activity && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/5 text-xs">
                  {friend.activity.type === 'game' ? (
                    <Gamepad2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : friend.activity.type === 'spotify' ? (
                    <Music className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-pulse" />
                  ) : (
                    <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}

                  <div className="min-w-0 flex-1 text-[11px]">
                    <div className="text-white font-medium truncate flex items-center gap-1.5">
                      <span>{friend.activity.name}</span>
                      {friend.activity.details && (
                        <span className="text-gray-400 font-normal truncate">• {friend.activity.details}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Controls: Reset Friends */}
      <div className="p-3 border-t border-white/10 bg-black/30 flex items-center justify-between text-[11px] text-gray-400">
        <span className="font-mono">Squad with @40wf</span>
        <button
          onClick={() => {
            soundFX.playClickSound();
            onResetFriends();
          }}
          className="text-gray-400 hover:text-purple-300 hover:underline transition-colors cursor-pointer"
        >
          Khôi phục danh sách mẫu
        </button>
      </div>

      {/* Add Friend Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#18191c] border border-purple-500/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(168,85,247,0.3)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                Thêm Bạn Thân Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewFriend} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Tên hiển thị (Display Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Gia Huy"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#2b2d31] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Username Discord *</label>
                <input
                  type="text"
                  required
                  placeholder="huy_vlr (không cần @)"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#2b2d31] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Link Ảnh Avatar</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... hoặc để trống"
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#2b2d31] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Danh hiệu quan hệ</label>
                  <select
                    value={newRelationship}
                    onChange={(e) => setNewRelationship(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#2b2d31] border border-white/10 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="💖 Bestie">💖 Bestie</option>
                    <option value="🎮 Duo Partner">🎮 Duo Partner</option>
                    <option value="⚡ Tri Kỷ">⚡ Tri Kỷ</option>
                    <option value="👑 Anh em chí cốt">👑 Anh em chí cốt</option>
                    <option value="✨ Bạn Thân">✨ Bạn Thân</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1">Trạng thái Discord</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as StatusType)}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#2b2d31] border border-white/10 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="online">🟢 Trực tuyến (Online)</option>
                    <option value="idle">🟡 Chờ (Idle)</option>
                    <option value="dnd">🔴 Vui lòng không làm phiền (DND)</option>
                    <option value="offline">⚪ Ngoại tuyến (Offline)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Status tùy chỉnh / Trích dẫn</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Kéo rank cùng @40wf 🔥"
                  value={newCustomStatus}
                  onChange={(e) => setNewCustomStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#2b2d31] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Loại Hoạt động</label>
                  <select
                    value={newActivityType}
                    onChange={(e) => setNewActivityType(e.target.value as 'game' | 'spotify' | 'none')}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#2b2d31] border border-white/10 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="game">🎮 Chơi Game</option>
                    <option value="spotify">🎧 Nghe Spotify</option>
                    <option value="none">Không hiển thị</option>
                  </select>
                </div>

                {newActivityType !== 'none' && (
                  <div>
                    <label className="block text-gray-300 font-medium mb-1">Tên Game / Bài hát</label>
                    <input
                      type="text"
                      placeholder="Valorant / Roblox"
                      value={newActivityName}
                      onChange={(e) => setNewActivityName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#2b2d31] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-md transition-all active:scale-95"
                >
                  Lưu Bạn Thân
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
