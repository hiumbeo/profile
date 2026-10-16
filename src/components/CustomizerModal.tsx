import { useState, useRef } from 'react';
import { 
  ProfileConfig, 
  AvatarDecorType, 
  StatusType, 
  WeatherEffectType, 
  BannerDecorType 
} from '../types/profile';
import { PRESETS, DEFAULT_PROFILE } from '../utils/presets';
import { 
  X, 
  Sliders, 
  Sparkles, 
  User, 
  Image as ImageIcon, 
  CloudRain, 
  Music, 
  ShieldCheck, 
  Share2, 
  RotateCcw, 
  Check, 
  Gamepad2, 
  Plus, 
  Trash2,
  Upload,
  Link as LinkIcon,
  KeyRound,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProfileConfig;
  onChange: (updated: ProfileConfig) => void;
  onAudioChange: () => void;
}

export function CustomizerModal({
  isOpen,
  onClose,
  config,
  onChange,
  onAudioChange,
}: CustomizerModalProps) {
  const [activeTab, setActiveTab] = useState<'discord' | 'presets' | 'profile' | 'avatar' | 'banner' | 'audio' | 'weather' | 'badges' | 'activity'>('discord');
  const [copiedShare, setCopiedShare] = useState(false);

  // Discord fetcher states
  const [discordInputType, setDiscordInputType] = useState<'id' | 'token'>('id');
  const [discordInputVal, setDiscordInputVal] = useState('');
  const [isFetchingDiscord, setIsFetchingDiscord] = useState(false);
  const [discordFetchError, setDiscordFetchError] = useState<string | null>(null);
  const [discordFetchSuccess, setDiscordFetchSuccess] = useState<string | null>(null);

  // File upload refs
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const updateConfig = (patch: Partial<ProfileConfig>) => {
    onChange({ ...config, ...patch });
  };

  const handleShareLink = () => {
    try {
      const serialized = btoa(encodeURIComponent(JSON.stringify(config)));
      const shareUrl = `${window.location.origin}${window.location.pathname}#profile=${serialized}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // 1. DISCORD FETCH HANDLER (Token or User ID)
  const handleFetchDiscord = async () => {
    const val = discordInputVal.trim();
    if (!val) {
      setDiscordFetchError('Please enter a Discord User ID or Token');
      return;
    }

    setIsFetchingDiscord(true);
    setDiscordFetchError(null);
    setDiscordFetchSuccess(null);

    try {
      let data: any;
      if (discordInputType === 'token') {
        const res = await fetch('/api/discord/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: val }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.details || err.error || `HTTP ${res.status}`);
        }
        data = await res.json();
      } else {
        const res = await fetch(`/api/discord/user/${val}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.details || err.error || `HTTP ${res.status}`);
        }
        data = await res.json();
      }

      // Apply fetched Discord data
      const patch: Partial<ProfileConfig> = {
        // Force preferred values
        displayName: 'Phú ⛧',
        username: 'tyLNTV1706',
        avatarUrl: data.avatarUrl || config.avatarUrl,
        linkedDiscordId: data.id,
      };

      if (data.accountCreatedDate) {
        patch.accountCreatedDate = data.accountCreatedDate;
        patch.memberSince = data.accountCreatedDate;
        patch.serverMemberSince = data.accountCreatedDate;
      }

      if (data.avatarDecorUrl) {
        patch.customAvatarDecorUrl = data.avatarDecorUrl;
        patch.avatarDecor = 'discord_native';
      }

      // If user has a banner on Discord, apply it; if not, keep their custom banner (like guns.lol)
      if (data.bannerUrl) {
        patch.bannerType = 'image';
        patch.bannerUrl = data.bannerUrl;
      }

      if (data.accentColor) {
        patch.accentColor = data.accentColor;
      }

      if (data.bio) {
        patch.bio = data.bio;
      }

      if (data.status) {
        patch.status = data.status;
      }

      if (data.badges) {
        patch.badges = { ...config.badges, ...data.badges };
      }

      if (data.activity) {
        patch.activity = data.activity;
      }

      updateConfig(patch);
      setDiscordFetchSuccess(`Successfully linked Discord account @${data.username}!`);
      setTimeout(() => setDiscordFetchSuccess(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch Discord profile';
      setDiscordFetchError(msg);
    } finally {
      setIsFetchingDiscord(false);
    }
  };

  // 2. FILE UPLOADS (Banner, Avatar, Audio)
  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateConfig({
          bannerType: 'image',
          bannerUrl: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateConfig({ avatarUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateConfig({
          audio: {
            ...config.audio,
            enabled: true,
            type: 'uploaded_audio',
            customAudioUrl: reader.result,
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Local Track',
          },
        });
        setTimeout(onAudioChange, 100);
      }
    };
    reader.readAsDataURL(file);
  };

  const avatarDecorList: { id: AvatarDecorType; label: string }[] = [
    { id: 'reyna_eye', label: 'Reyna Eye (Valorant Con Mắt Tím)' },
    { id: 'discord_native', label: 'Discord Account Decor (Official)' },
    { id: 'cyberpunk', label: 'Cyberpunk Visor' },
    { id: 'sakura', label: 'Sakura Wreath' },
    { id: 'cat_ears', label: 'Cat Ears' },
    { id: 'angel_halo', label: 'Angel Halo' },
    { id: 'demon_horns', label: 'Demon Horns' },
    { id: 'cosmic_ring', label: 'Cosmic Orbit' },
    { id: 'glitch_crown', label: 'Glitch Crown' },
    { id: 'fire_aura', label: 'Fire Flame Aura' },
    { id: 'witch_hat', label: 'Witch Hat' },
    { id: 'none', label: 'None' },
  ];

  const weatherEffectsList: { id: WeatherEffectType; label: string; desc: string }[] = [
    { id: 'rain', label: 'Rain Drops', desc: 'Rain streaks, glass droplets & distant lightning' },
    { id: 'sakura', label: 'Sakura Petals', desc: 'Floating pink cherry blossom leaves' },
    { id: 'snow', label: 'Falling Snow', desc: 'Soft peaceful drifting snowflakes' },
    { id: 'matrix', label: 'Matrix Code', desc: 'Falling digital green character streams' },
    { id: 'stars', label: 'Starry Cosmic', desc: 'Twinkling galaxy stars and shooting star' },
    { id: 'none', label: 'None (Clean)', desc: 'No background weather particles' },
  ];

  const bannerDecorList: { id: BannerDecorType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'scanlines', label: 'Cyber Scanlines' },
    { id: 'sparkles', label: 'Pink Sparkles' },
    { id: 'rain_drops', label: 'Rain Blur' },
    { id: 'matrix', label: 'Matrix Dot Grid' },
    { id: 'stars', label: 'Twinkling Stars' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1e1f22] w-full max-w-2xl max-h-[92vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden text-gray-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#111214] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Discord Profile & Bio Customizer
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors shadow"
              title="Copy shareable link with this profile configuration"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? 'Copied Link!' : 'Share Profile'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#2b2d31]/60 border-b border-white/5 overflow-x-auto text-xs whitespace-nowrap">
          <button
            onClick={() => setActiveTab('discord')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'discord' ? 'bg-[#5865f2] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-yellow-300" />
            <span>Link Discord (Token / ID)</span>
          </button>
          <button
            onClick={() => setActiveTab('banner')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'banner' ? 'bg-[#5865f2] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Banner (guns.lol style)</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'audio' ? 'bg-[#5865f2] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Nhét nhạc vào</span>
          </button>
          <button
            onClick={() => setActiveTab('avatar')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'avatar' ? 'bg-[#5865f2] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Avatar & Decor</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'presets' ? 'bg-[#5865f2] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presets</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-[#5865f2] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Bio & Text</span>
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'weather' ? 'bg-[#5865f2] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Weather</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'badges' ? 'bg-[#5865f2] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Badges</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'activity' ? 'bg-[#5865f2] text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Activity</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB: LINK DISCORD (TOKEN OR USER ID) */}
          {activeTab === 'discord' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#5865f2]/20 via-purple-600/10 to-transparent border border-[#5865f2]/30">
                <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                  <KeyRound className="w-4 h-4 text-[#5865f2]" />
                  <span>Đồng bộ từ tài khoản Discord</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Tự động kéo chính xác Avatar (bao gồm ảnh GIF), Avatar Decoration chính thức từ Discord Shop, Tên hiển thị, Huy hiệu và Trạng thái của tài khoản bạn!
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiscordInputType('id')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    discordInputType === 'id'
                      ? 'bg-[#5865f2] border-[#5865f2] text-white'
                      : 'bg-[#2b2d31] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Nhập Discord User ID (Lanyard / Public)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscordInputType('token')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    discordInputType === 'token'
                      ? 'bg-[#5865f2] border-[#5865f2] text-white'
                      : 'bg-[#2b2d31] border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Nhập Discord Token (@me / Full Data)
                </button>
              </div>

              {/* Input field */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  {discordInputType === 'token' ? 'Discord User Token' : 'Discord User ID (18-19 số)'}
                </label>
                <div className="flex gap-2">
                  <input
                    type={discordInputType === 'token' ? 'password' : 'text'}
                    value={discordInputVal}
                    onChange={(e) => setDiscordInputVal(e.target.value)}
                    placeholder={
                      discordInputType === 'token' 
                        ? 'Dán token Discord của bạn vào đây...' 
                        : 'Ví dụ: 306384717440123456 hoặc ID của bạn'
                    }
                    className="flex-1 bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5865f2] font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleFetchDiscord}
                    disabled={isFetchingDiscord}
                    className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {isFetchingDiscord ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tải...</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Kéo dữ liệu</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {discordFetchError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{discordFetchError}</span>
                </div>
              )}

              {discordFetchSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{discordFetchSuccess}</span>
                </div>
              )}

              {/* Status info */}
              {config.customAvatarDecorUrl && (
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={config.customAvatarDecorUrl}
                      alt="Decor"
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">Đã nhận diện Discord Avatar Decor!</p>
                      <p className="text-[11px] text-gray-400">Khung trang trí chính thức từ Discord Shop</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateConfig({ avatarDecor: 'discord_native' })}
                    className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                  >
                    Áp dụng decor này
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: BANNER (GUNS.LOL STYLE - NO NITRO NEEDED) */}
          {activeTab === 'banner' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40">
                <p className="text-xs font-bold text-purple-200">
                  ✨ Custom Banner (Phong cách guns.lol)
                </p>
                <p className="text-[11px] text-gray-300 mt-1">
                  Nếu tài khoản Discord không có Nitro, trong Discord bạn không thể đặt banner. Nhưng trên trang web này, bạn có thể tải lên ảnh GIF, ảnh nền độ nét cao hoặc video wallpaper tùy ý mà không cần Nitro!
                </p>
              </div>

              {/* Upload from file */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Tải ảnh hoặc GIF từ máy tính / điện thoại
                </label>
                <input
                  type="file"
                  ref={bannerFileInputRef}
                  accept="image/*"
                  onChange={handleBannerFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-white/20 hover:border-purple-400 bg-[#111214]/60 hover:bg-[#111214] text-xs text-gray-300 hover:text-white flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Bấm vào đây để chọn tệp ảnh/GIF từ máy...</span>
                </button>
              </div>

              {/* Paste URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Hoặc dán URL ảnh / GIF banner bất kỳ
                </label>
                <input
                  type="text"
                  value={config.bannerUrl}
                  onChange={(e) => updateConfig({ bannerType: 'image', bannerUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Preset Gradients */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Hoặc chọn Gradient phối màu:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Cyber Purple', grad: 'linear-gradient(135deg, #1b0a2a 0%, #360b4f 50%, #061e38 100%)' },
                    { name: 'Midnight Rain', grad: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)' },
                    { name: 'Sakura Glow', grad: 'linear-gradient(135deg, #371435 0%, #63174a 50%, #2b0f38 100%)' },
                    { name: 'Matrix Terminal', grad: 'linear-gradient(135deg, #051a0e 0%, #0c331a 50%, #031409 100%)' },
                  ].map((g, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => updateConfig({ bannerType: 'gradient', bannerGradient: g.grad })}
                      className="h-9 rounded-lg border border-white/10 text-xs font-semibold text-white drop-shadow"
                      style={{ background: g.grad }}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Decor Overlay */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Hiệu ứng phủ động trên banner (Banner Decor)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {bannerDecorList.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateConfig({ bannerDecor: item.id })}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        config.bannerDecor === item.id
                          ? 'bg-purple-900/40 border-purple-500 text-white shadow'
                          : 'bg-[#2b2d31] border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: NHÉT NHẠC VÀO (AUDIO ENGINE) */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#2b2d31] border border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white">Bật nhạc nền / Âm thanh</h4>
                  <p className="text-xs text-gray-400">Tự động phát khi người xem bấm vào trang web</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.audio.enabled}
                  onChange={(e) => {
                    updateConfig({
                      audio: { ...config.audio, enabled: e.target.checked }
                    });
                    setTimeout(onAudioChange, 50);
                  }}
                  className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              {/* 1. Upload local song file */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  1. Tải tệp nhạc từ máy tính / điện thoại (.mp3, .wav, .ogg, .m4a)
                </label>
                <input
                  type="file"
                  ref={audioFileInputRef}
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => audioFileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-purple-500/50 hover:border-purple-400 bg-[#111214]/60 hover:bg-[#111214] text-xs text-purple-200 flex items-center justify-center gap-2 transition-all shadow"
                >
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>Bấm vào đây để chọn bài hát từ máy của bạn...</span>
                </button>
              </div>

              {/* 2. Direct MP3 URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  2. Hoặc dán link trực tiếp tệp nhạc (.mp3 / stream URL / Discord audio attachment)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.audio.customAudioUrl || ''}
                    onChange={(e) => {
                      updateConfig({
                        audio: { 
                          ...config.audio, 
                          type: 'custom_url',
                          customAudioUrl: e.target.value 
                        }
                      });
                    }}
                    placeholder="https://example.com/song.mp3 hoặc link CDN"
                    className="flex-1 bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      updateConfig({
                        audio: { ...config.audio, type: 'custom_url' }
                      });
                      setTimeout(onAudioChange, 50);
                    }}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Thử phát
                  </button>
                </div>
              </div>

              {/* Track Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Tên bài hát hiển thị
                  </label>
                  <input
                    type="text"
                    value={config.audio.title}
                    onChange={(e) => {
                      updateConfig({
                        audio: { ...config.audio, title: e.target.value }
                      });
                    }}
                    className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Nghệ sĩ / Ca sĩ
                  </label>
                  <input
                    type="text"
                    value={config.audio.artist}
                    onChange={(e) => {
                      updateConfig({
                        audio: { ...config.audio, artist: e.target.value }
                      });
                    }}
                    className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* 3. Danh sách 5 bài hát YouTube chất lượng cao */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  3. Chọn nhanh bài hát YouTube:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'NwFVSclD_uc', title: 'I Love You So', artist: 'The Walters' },
                    { id: 'Oextk-If8HQ', title: 'Somewhere Only We Know', artist: 'Keane' },
                    { id: 'xpfQf3zWQvA', title: 'Nuts (That\'s The Best Part)', artist: 'Lil Peep ft. rainy bear' },
                    { id: 'cHHLHGNpCSA', title: 'Waiting For Love', artist: 'Avicii' },
                    { id: 'nyFi7rAYw-4', title: 'Vừa Hận Vừa Yêu (Đường Dài Em Đi)', artist: 'Trung Tự · Kuma Sorai' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        updateConfig({
                          audio: {
                            ...config.audio,
                            type: 'youtube',
                            title: s.title,
                            artist: s.artist,
                            customAudioUrl: undefined,
                          }
                        });
                        setTimeout(onAudioChange, 50);
                      }}
                      className="p-2.5 rounded-lg border text-left text-xs transition-all bg-[#1a1b1e] border-white/5 hover:border-cyan-500/50 hover:bg-white/5 text-gray-200"
                    >
                      <p className="font-semibold text-white truncate">{s.title}</p>
                      <p className="text-[10px] text-gray-400 truncate">{s.artist}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                  <span>Âm lượng (Volume)</span>
                  <span className="font-mono text-purple-400">{Math.round(config.audio.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.audio.volume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    updateConfig({
                      audio: { ...config.audio, volume: vol }
                    });
                    setTimeout(onAudioChange, 50);
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB: AVATAR & DECOR */}
          {activeTab === 'avatar' && (
            <div className="space-y-4">
              {/* File upload for avatar */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Tải ảnh đại diện từ máy (GIF / PNG / JPG)
                </label>
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-white/20 hover:border-purple-400 bg-[#111214]/60 hover:bg-[#111214] text-xs text-gray-300 flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Chọn tệp ảnh đại diện...</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Hoặc dán URL ảnh đại diện
                </label>
                <input
                  type="text"
                  value={config.avatarUrl}
                  onChange={(e) => updateConfig({ avatarUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              {/* Avatar Decorations */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Trang trí Avatar (Discord Avatar Decoration)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {avatarDecorList.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateConfig({ avatarDecor: item.id })}
                      className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                        config.avatarDecor === item.id
                          ? 'bg-purple-900/40 border-purple-500 text-white shadow'
                          : 'bg-[#2b2d31] border-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 mb-2">
                Bấm vào preset bất kỳ để áp dụng toàn bộ theme, avatar decor, mưa/tuyết và âm thanh:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => {
                      onChange({ ...config, ...preset.config });
                      setTimeout(onAudioChange, 50);
                    }}
                    className="p-3.5 rounded-xl bg-[#2b2d31] hover:bg-[#313338] border border-white/5 hover:border-purple-500/50 cursor-pointer transition-all hover:scale-[1.01] shadow"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-white">{preset.name}</h4>
                      <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded">
                        {preset.config.backgroundEffect || 'Preset'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{preset.description}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs text-gray-400">Khôi phục về mặc định</span>
                <button
                  type="button"
                  onClick={() => {
                    onChange(DEFAULT_PROFILE);
                    setTimeout(onAudioChange, 50);
                  }}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-900/40 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset về Keifer Default</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: PROFILE & TEXT */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Display Name (Tên hiển thị)
                  </label>
                  <input
                    type="text"
                    value={config.displayName}
                    onChange={(e) => updateConfig({ displayName: e.target.value })}
                    className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Username (@tag)
                  </label>
                  <input
                    type="text"
                    value={config.username}
                    onChange={(e) => updateConfig({ username: e.target.value })}
                    className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Pronouns (Đại từ)
                  </label>
                  <input
                    type="text"
                    value={config.pronouns}
                    onChange={(e) => updateConfig({ pronouns: e.target.value })}
                    placeholder="he/him, she/her"
                    className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Trạng thái trực tuyến
                  </label>
                  <select
                    value={config.status}
                    onChange={(e) => updateConfig({ status: e.target.value as StatusType })}
                    className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="online">Online (Xanh lá)</option>
                    <option value="idle">Idle (Vàng)</option>
                    <option value="dnd">Do Not Disturb (Đỏ)</option>
                    <option value="streaming">Streaming (Tím)</option>
                    <option value="offline">Invisible / Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Icon trạng thái
                  </label>
                  <input
                    type="text"
                    value={config.statusEmoji}
                    onChange={(e) => updateConfig({ statusEmoji: e.target.value })}
                    placeholder="🌧️"
                    className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Dòng chữ trạng thái (Custom Status)
                  </label>
                  <input
                    type="text"
                    value={config.statusText}
                    onChange={(e) => updateConfig({ statusText: e.target.value })}
                    className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Đường dẫn Web cá nhân (Vanity Link)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">profile.app/#</span>
                  <input
                    type="text"
                    value={config.vanitySlug || 'phu'}
                    onChange={(e) => updateConfig({ vanitySlug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                    placeholder="phu"
                    className="flex-1 bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono font-bold"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Mọi người chỉ cần vào đường dẫn <code className="text-purple-300">#{config.vanitySlug || 'phu'}</code> để xem đúng hồ sơ của bạn!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Ngày tạo Discord
                  </label>
                  <input
                    type="text"
                    value={config.accountCreatedDate || config.memberSince}
                    onChange={(e) => updateConfig({ accountCreatedDate: e.target.value, memberSince: e.target.value })}
                    className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Ngày gia nhập Server
                  </label>
                  <input
                    type="text"
                    value={config.serverMemberSince}
                    onChange={(e) => updateConfig({ serverMemberSince: e.target.value })}
                    className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Servers manager */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-300">
                    Các Server đang tham gia ({config.servers?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newSrv = {
                        id: Date.now().toString(),
                        name: 'New Community Server',
                        role: 'Member',
                      };
                      updateConfig({ servers: [...(config.servers || []), newSrv] });
                    }}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Server</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {config.servers?.map((srv, idx) => (
                    <div key={srv.id} className="flex items-center gap-2 bg-[#2b2d31] p-2 rounded-lg border border-white/5">
                      <input
                        type="text"
                        value={srv.name}
                        onChange={(e) => {
                          const updated = [...(config.servers || [])];
                          updated[idx].name = e.target.value;
                          updateConfig({ servers: updated });
                        }}
                        placeholder="Tên Server"
                        className="flex-1 bg-[#111214] border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={srv.role || ''}
                        onChange={(e) => {
                          const updated = [...(config.servers || [])];
                          updated[idx].role = e.target.value;
                          updateConfig({ servers: updated });
                        }}
                        placeholder="Role (VIP/Owner)"
                        className="w-24 bg-[#111214] border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (config.servers || []).filter((s) => s.id !== srv.id);
                          updateConfig({ servers: updated });
                        }}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Friends manager */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-300">
                    Danh sách Bạn bè ({config.friends?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newFriend = {
                        id: Date.now().toString(),
                        name: 'Friend',
                        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + Math.random(),
                        status: 'online' as StatusType,
                      };
                      updateConfig({ friends: [...(config.friends || []), newFriend] });
                    }}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm bạn</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {config.friends?.map((friend, idx) => (
                    <div key={friend.id} className="flex items-center gap-2 bg-[#2b2d31] p-2 rounded-lg border border-white/5">
                      <input
                        type="text"
                        value={friend.name}
                        onChange={(e) => {
                          const updated = [...(config.friends || [])];
                          updated[idx].name = e.target.value;
                          updateConfig({ friends: updated });
                        }}
                        placeholder="Tên bạn bè"
                        className="flex-1 bg-[#111214] border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                      <select
                        value={friend.status || 'online'}
                        onChange={(e) => {
                          const updated = [...(config.friends || [])];
                          updated[idx].status = e.target.value as StatusType;
                          updateConfig({ friends: updated });
                        }}
                        className="bg-[#111214] border border-white/10 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="online">Online</option>
                        <option value="idle">Idle</option>
                        <option value="dnd">DND</option>
                        <option value="offline">Offline</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (config.friends || []).filter((f) => f.id !== friend.id);
                          updateConfig({ friends: updated });
                        }}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: WEATHER */}
          {activeTab === 'weather' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Hiệu ứng thời tiết toàn màn hình:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {weatherEffectsList.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => updateConfig({ backgroundEffect: w.id })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      config.backgroundEffect === w.id
                        ? 'bg-purple-900/40 border-purple-500 shadow-md'
                        : 'bg-[#2b2d31] border-white/5 hover:bg-[#313338]'
                    }`}
                  >
                    <h4 className="text-sm font-bold text-white">{w.label}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{w.desc}</p>
                  </div>
                ))}
              </div>

              {config.backgroundEffect !== 'none' && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span>Mật độ & Tốc độ hạt</span>
                    <span className="font-mono text-purple-400">{config.weatherIntensity}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={config.weatherIntensity}
                    onChange={(e) => updateConfig({ weatherIntensity: parseInt(e.target.value) })}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB: BADGES & ROLES */}
          {activeTab === 'badges' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Bật / tắt huy hiệu Discord:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'nitro', label: 'Discord Nitro' },
                    { key: 'booster', label: 'Server Booster' },
                    { key: 'activeDev', label: 'Active Developer' },
                    { key: 'earlySupporter', label: 'Early Supporter' },
                    { key: 'bugHunter', label: 'Bug Hunter' },
                    { key: 'botDev', label: 'Verified Bot Dev' },
                  ].map((b) => (
                    <label
                      key={b.key}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-[#2b2d31] border border-white/5 cursor-pointer text-xs font-medium text-gray-300 hover:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={config.badges[b.key as keyof typeof config.badges] as boolean}
                        onChange={(e) => {
                          updateConfig({
                            badges: {
                              ...config.badges,
                              [b.key]: e.target.checked,
                            },
                          });
                        }}
                        className="accent-purple-500 rounded"
                      />
                      <span>{b.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Roles */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-300">
                    Roles trên profile:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newRole = {
                        id: Date.now().toString(),
                        name: 'New Role',
                        color: '#a855f7',
                      };
                      updateConfig({ roles: [...config.roles, newRole] });
                    }}
                    className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Role</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {config.roles.map((role, idx) => (
                    <div key={role.id} className="flex items-center gap-2 bg-[#2b2d31] p-2 rounded-lg border border-white/5">
                      <input
                        type="color"
                        value={role.color}
                        onChange={(e) => {
                          const updated = [...config.roles];
                          updated[idx].color = e.target.value;
                          updateConfig({ roles: updated });
                        }}
                        className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={role.name}
                        onChange={(e) => {
                          const updated = [...config.roles];
                          updated[idx].name = e.target.value;
                          updateConfig({ roles: updated });
                        }}
                        className="flex-1 bg-[#111214] border border-white/10 rounded px-2 py-1 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.roles.filter((r) => r.id !== role.id);
                          updateConfig({ roles: updated });
                        }}
                        className="text-gray-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Trạng thái hoạt động (Rich Presence)
                </label>
                <select
                  value={config.activity.type}
                  onChange={(e) => {
                    updateConfig({
                      activity: { ...config.activity, type: e.target.value as any }
                    });
                  }}
                  className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="spotify">Listening to Spotify</option>
                  <option value="game">Playing a Game / App</option>
                  <option value="none">None (Ẩn)</option>
                </select>
              </div>

              {config.activity.type !== 'none' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {config.activity.type === 'spotify' ? 'Tên bài hát Spotify' : 'Tên Game / Ứng dụng'}
                    </label>
                    <input
                      type="text"
                      value={config.activity.title}
                      onChange={(e) => {
                        updateConfig({
                          activity: { ...config.activity, title: e.target.value }
                        });
                      }}
                      className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      {config.activity.type === 'spotify' ? 'Tên ca sĩ / Album' : 'Mô tả chi tiết'}
                    </label>
                    <input
                      type="text"
                      value={config.activity.subtitle}
                      onChange={(e) => {
                        updateConfig({
                          activity: { ...config.activity, subtitle: e.target.value }
                        });
                      }}
                      className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      URL ảnh bìa hoạt động
                    </label>
                    <input
                      type="text"
                      value={config.activity.image}
                      onChange={(e) => {
                        updateConfig({
                          activity: { ...config.activity, image: e.target.value }
                        });
                      }}
                      className="w-full bg-[#111214] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#111214] border-t border-white/10 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            Tự động lưu vào trình duyệt & link chia sẻ
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold transition-colors shadow"
          >
            Hoàn tất / Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
