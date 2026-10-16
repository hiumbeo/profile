export type AvatarDecorType = 
  | 'none'
  | 'reyna_eye'
  | 'discord_native'
  | 'cyberpunk'
  | 'sakura'
  | 'angel_halo'
  | 'demon_horns'
  | 'cosmic_ring'
  | 'glitch_crown'
  | 'fire_aura'
  | 'witch_hat'
  | 'minimal_neon_ring'
  | 'subtle_halo'
  | 'gif_decoration'
  | 'custom_decor';

export type StatusType = 'online' | 'idle' | 'dnd' | 'streaming' | 'offline';

export type WeatherEffectType = 'rain' | 'snow' | 'matrix' | 'stars' | 'sakura' | 'none';

export type BannerDecorType = 'none' | 'sparkles' | 'scanlines' | 'rain_drops' | 'matrix' | 'stars';

export interface DiscordBadgeState {
  nitro: boolean;
  booster: boolean;
  hypeSquad: 'bravery' | 'brilliance' | 'balance' | 'none';
  activeDev: boolean;
  earlySupporter: boolean;
  bugHunter: boolean;
  botDev: boolean;
}

export interface DiscordServer {
  id: string;
  name: string;
  iconUrl?: string;
  role?: string;
}

export interface DiscordFriend {
  id: string;
  name: string;
  avatarUrl: string;
  status?: StatusType;
  customStatus?: string;
}

export interface ProfileRole {
  id: string;
  name: string;
  color: string;
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface TrackItem {
  id: string;
  title: string;
  artist: string;
  url?: string;
  coverUrl?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  type: 'youtube' | 'custom_url' | 'uploaded_audio' | 'synth_lofi' | 'synth_ambient' | 'synth_cyber';
  lyrics: LyricLine[];
}

export interface SocialConnection {
  id: string;
  platform: 'roblox' | 'spotify' | 'github' | 'steam' | 'youtube' | 'x' | 'instagram' | 'telegram' | 'discord' | 'tiktok';
  url: string;
  label: string;
  accountName: string;
}

export interface RichPresenceActivity {
  type: 'spotify' | 'game' | 'none';
  title: string;
  subtitle: string;
  details: string;
  image: string;
  smallImage?: string;
  stateText?: string;
  elapsedSeconds: number;
  totalDurationSeconds: number;
}

export interface ProfileConfig {
  displayName: string;
  username: string;
  pronouns: string;
  avatarUrl: string;
  avatarDecor: AvatarDecorType;
  customAvatarDecorUrl?: string; // Real Discord CDN decoration URL from Token or User ID
  status: StatusType;
  statusText: string;
  statusEmoji: string;
  bannerType: 'image' | 'gradient';
  bannerUrl: string;
  bannerGradient: string;
  bannerDecor: BannerDecorType;
  primaryColor: string;
  accentColor: string;
  bio: string;
  aboutMe?: string;
  bioLink?: string;
  memberSince: string;
  serverMemberSince: string;
  accountCreatedDate?: string;
  vanitySlug: string; // e.g. "phu" -> web link /#phu
  badges: DiscordBadgeState;
  roles: ProfileRole[];
  servers?: DiscordServer[];
  friends?: DiscordFriend[];
  activity: RichPresenceActivity;
  socials: SocialConnection[];
  backgroundEffect: WeatherEffectType;
  profileEffect?: 'none' | 'sakura_drift_left' | 'cyber_pulse' | 'magic_orbs';
  weatherIntensity: number; // 1-10
  audio: {
    enabled: boolean;
    title: string;
    artist: string;
    type: 'youtube' | 'custom_url' | 'uploaded_audio' | 'synth_lofi' | 'synth_ambient' | 'synth_cyber';
    customAudioUrl?: string;
    volume: number; // 0 to 1
    loop?: boolean;
    currentTrackIndex?: number;
    lyrics?: LyricLine[];
    playlist?: TrackItem[];
  };
  clickToEnter: boolean;
  linkedDiscordId?: string;
}
