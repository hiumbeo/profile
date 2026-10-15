import { useState, useEffect, useRef } from 'react';
import { LyricLine, TrackItem } from '../types/profile';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Music2, 
  ChevronUp, 
  ChevronDown,
  FolderPlus,
  Upload,
  Link as LinkIcon,
  Check,
  X,
  ListMusic
} from 'lucide-react';

interface SyncedLyricsPlayerProps {
  tracks: TrackItem[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  onTogglePlay: () => void;
  onSkipTrack: () => void;
  onPrevTrack?: () => void;
  onSelectTrack?: (index: number) => void;
  onVolumeChange: (vol: number) => void;
  onCustomAudioChange?: (url: string) => void;
  customAudioUrl?: string;
}

export function SyncedLyricsPlayer({
  tracks,
  currentTrackIndex,
  isPlaying,
  volume,
  onTogglePlay,
  onSkipTrack,
  onPrevTrack,
  onSelectTrack,
  onVolumeChange,
  onCustomAudioChange,
  customAudioUrl,
}: SyncedLyricsPlayerProps) {
  const currentTrack = tracks[currentTrackIndex % tracks.length] || tracks[0];
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [urlApplied, setUrlApplied] = useState(false);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Timer for tracking lyrics
  useEffect(() => {
    setPlaybackSeconds(0);
  }, [currentTrackIndex]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlaybackSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Find active lyric index
  const lyrics: LyricLine[] = currentTrack?.lyrics || [];
  let activeLyricIdx = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (playbackSeconds >= lyrics[i].time) {
      activeLyricIdx = i;
    }
  }

  const activeLyric = lyrics[activeLyricIdx];
  const nextLyric = lyrics[activeLyricIdx + 1];

  // Auto-scroll inside expanded lyrics view
  useEffect(() => {
    if (isLyricsExpanded && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.querySelector(`[data-lyric-idx="${activeLyricIdx}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIdx, isLyricsExpanded]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onCustomAudioChange) {
      const blobUrl = URL.createObjectURL(file);
      onCustomAudioChange(blobUrl);
      setIsSourceModalOpen(false);
    }
  };

  const handleApplyUrl = () => {
    if (inputUrl.trim() && onCustomAudioChange) {
      onCustomAudioChange(inputUrl.trim());
      setUrlApplied(true);
      setTimeout(() => {
        setUrlApplied(false);
        setIsSourceModalOpen(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] select-none">
      {/* 1. Main Music Widget */}
      <div className="bg-[#111214]/95 backdrop-blur-2xl border border-cyan-500/20 p-3 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          {/* Spinning Vinyl Disc */}
          <div
            onClick={onTogglePlay}
            className={`w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer shrink-0 transition-transform hover:scale-105 ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '4s' }}
            title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
          >
            <div className="w-full h-full rounded-full bg-[#18181b] flex items-center justify-center text-cyan-300 border border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            </div>
          </div>

          {/* Track Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                {currentTrack.title}
              </p>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate mt-0.5">
              {currentTrack.artist}
            </p>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Prev Track */}
            {onPrevTrack && (
              <button
                onClick={onPrevTrack}
                className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Bài trước đó"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}

            {/* Play/Pause */}
            <button
              onClick={onTogglePlay}
              className="p-1.5 rounded-lg text-white hover:text-cyan-400 hover:bg-white/10 transition-colors"
              title={isPlaying ? 'Dừng' : 'Phát'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Skip / Next Track Button */}
            <button
              onClick={onSkipTrack}
              className="p-1.5 rounded-lg text-white hover:text-cyan-400 hover:bg-white/10 transition-colors"
              title="Bỏ qua bài hát (Bài tiếp theo)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Source / Add Music Button */}
            <button
              onClick={() => setIsSourceModalOpen(!isSourceModalOpen)}
              className={`p-1.5 rounded-lg transition-colors ${
                isSourceModalOpen ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Danh sách bài hát & Nơi nhét nhạc MP3"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Toggle Full Lyrics Drawer */}
            <button
              onClick={() => setIsLyricsExpanded(!isLyricsExpanded)}
              className={`p-1.5 rounded-lg transition-colors ${
                isLyricsExpanded ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={isLyricsExpanded ? 'Thu gọn lời bài hát' : 'Xem toàn bộ lời bài hát'}
            >
              {isLyricsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 2. VOLUME CONTROL SLIDER (Volum chỉnh) */}
        <div className="flex items-center gap-2 px-1 pt-1 border-t border-white/5">
          <button
            onClick={() => onVolumeChange(volume === 0 ? 0.6 : 0)}
            className="text-gray-400 hover:text-cyan-300 transition-colors"
            title={volume === 0 ? 'Bật âm thanh' : 'Tắt tiếng'}
          >
            {volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
            title={`Âm lượng: ${Math.round(volume * 100)}%`}
          />
          <span className="text-[10px] font-mono text-gray-400 w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* 3. LIVE RUNNING KARAOKE LYRIC (Chữ chạy tới đâu theo nhịp tới đó) */}
        {activeLyric && (
          <div className="pt-2 border-t border-white/10 flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <p className="text-xs sm:text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-200 to-white drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] truncate">
                {activeLyric.text}
              </p>
            </div>
            {nextLyric && (
              <p className="text-[10px] text-gray-500 italic pl-3.5 truncate">
                tiếp: {nextLyric.text}
              </p>
            )}
          </div>
        )}

        {/* 4. EXPANDED FULL LYRICS PANEL */}
        {isLyricsExpanded && (
          <div
            ref={lyricsContainerRef}
            className="mt-1 p-3 max-h-48 overflow-y-auto rounded-xl bg-black/60 border border-white/5 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              <span>Lời bài hát chạy theo nhạc (Synced Lyrics)</span>
              <span>Track {currentTrackIndex + 1}/{tracks.length}</span>
            </div>
            {lyrics.map((line, idx) => {
              const isActive = idx === activeLyricIdx;
              return (
                <div
                  key={idx}
                  data-lyric-idx={idx}
                  className={`transition-all duration-300 py-1 px-2 rounded-lg ${
                    isActive
                      ? 'bg-cyan-950/70 text-cyan-200 font-bold text-sm shadow border border-cyan-500/50 scale-[1.02]'
                      : 'text-gray-400 text-xs hover:text-gray-200'
                  }`}
                >
                  {line.text}
                </div>
              );
            })}
          </div>
        )}

        {/* 5. PLAYLIST & "NƠI NHÉT NHẠC" DRAWER */}
        {isSourceModalOpen && (
          <div className="mt-2 p-3 rounded-xl bg-black/85 border border-cyan-500/30 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5" />
                <span>4 Bài Nhạc Có Sẵn Lời & Nơi Nhét Nhạc</span>
              </h4>
              <button
                onClick={() => setIsSourceModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List 4 Tracks */}
            <div className="space-y-1">
              {tracks.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (onSelectTrack) onSelectTrack(idx);
                  }}
                  className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between transition-colors ${
                    idx === currentTrackIndex
                      ? 'bg-cyan-900/50 text-cyan-200 border border-cyan-500/40 font-semibold'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <span className="truncate">
                    {idx + 1}. {t.title}
                  </span>
                  <span className="text-[10px] text-gray-500 shrink-0 font-mono">
                    {t.url}
                  </span>
                </button>
              ))}
            </div>

            {/* Instructions: Nhét nhạc ở đâu */}
            <div className="p-2.5 rounded-lg bg-[#18191c] border border-white/5 text-[11px] text-gray-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Nơi nhét file nhạc MP3 trên Termux / Host:</span>
              </div>
              <p className="text-gray-400 leading-relaxed font-mono text-[10px]">
                Bỏ các file MP3 vào đúng thư mục:
                <br />
                <span className="text-green-400">public/music/track1.mp3</span> (Late Night Rose)
                <br />
                <span className="text-green-400">public/music/track2.mp3</span> (Losing Interest)
                <br />
                <span className="text-green-400">public/music/track3.mp3</span> (Đường Dài Em Đi)
                <br />
                <span className="text-green-400">public/music/track4.mp3</span> (Best Part)
              </p>
            </div>

            {/* Direct Link or Upload File */}
            <div className="space-y-2 pt-1 border-t border-white/5">
              <label className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                <span>Hoặc dán Link MP3 Online:</span>
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="https://.../song.mp3"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="flex-1 px-2.5 py-1 bg-black/50 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  onClick={handleApplyUrl}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1 shrink-0"
                >
                  {urlApplied ? <Check className="w-3 h-3" /> : 'Áp dụng'}
                </button>
              </div>

              {/* Upload local file */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-gray-400">Hoặc chọn file từ máy:</span>
                <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1.5">
                  <Upload className="w-3 h-3 text-cyan-300" />
                  <span>Chọn MP3</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
