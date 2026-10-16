import { useState, useEffect, useRef } from 'react';
import { LyricLine, TrackItem } from '../types/profile';
import { audioEngine } from '../utils/audioEngine';
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
  ListMusic,
  FolderPlus,
  Link as LinkIcon,
  Upload,
  Check,
  X,
  Loader2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SyncedLyricsPlayerProps {
  tracks: TrackItem[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  onTogglePlay: () => void;
  onSkipTrack: () => void;
  onPrevTrack: () => void;
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
}: SyncedLyricsPlayerProps) {
  const currentTrack = tracks[currentTrackIndex % tracks.length] || tracks[0];
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [isLyricsExpanded, setIsLyricsExpanded] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [urlApplied, setUrlApplied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync playback time from audioEngine
  useEffect(() => {
    setPlaybackSeconds(0);
  }, [currentTrackIndex]);

  useEffect(() => {
    const unsubscribe = audioEngine.onTimeUpdate((sec) => {
      setPlaybackSeconds(sec);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Continuous precision sync from audioEngine
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const cur = audioEngine.getCurrentTime();
      if (typeof cur === 'number' && !isNaN(cur) && cur >= 0) {
        setPlaybackSeconds(cur);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Find active lyric line based on playbackSeconds
  const lyrics: LyricLine[] = currentTrack?.lyrics || [];
  let activeLyricIdx = 0;
  for (let i = 0; i < lyrics.length; i++) {
    if (playbackSeconds >= lyrics[i].time) {
      activeLyricIdx = i;
    }
  }

  const activeLyric = lyrics[activeLyricIdx];

  // Auto-scroll inside expanded lyrics view
  useEffect(() => {
    if (isLyricsExpanded && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.querySelector(`[data-lyric-idx="${activeLyricIdx}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIdx, isLyricsExpanded]);

  // Handle uploading audio file directly to server & playing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediately play local blob URL in browser
    const blobUrl = URL.createObjectURL(file);
    if (onCustomAudioChange) {
      onCustomAudioChange(blobUrl);
    }

    setIsUploading(true);
    setUploadSuccess('');

    try {
      // Read as base64 to send to server
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const trackNum = (currentTrackIndex % tracks.length) + 1;
          const res = await fetch('/api/upload-music', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trackId: trackNum,
              base64Data,
              filename: file.name,
            }),
          });
          const data = await res.json();
          if (data && data.success) {
            setUploadSuccess(`Đã lưu ${file.name} vào Track ${trackNum}!`);
            setTimeout(() => {
              setUploadSuccess('');
              setIsSourceModalOpen(false);
            }, 2500);
          }
        } catch (err) {
          console.error('Upload to server failed:', err);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (inputUrl.trim() && onCustomAudioChange) {
      onCustomAudioChange(inputUrl.trim());
      setUrlApplied(true);
      setTimeout(() => {
        setUrlApplied(false);
        setIsSourceModalOpen(false);
      }, 1200);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] select-none">
      {/* 1. Main Music Widget */}
      <div className="bg-[#111214]/95 backdrop-blur-2xl border border-cyan-500/30 p-3 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.85)] flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          {/* Spinning Vinyl Disc with YouTube Cover */}
          <div
            onClick={onTogglePlay}
            className={`w-12 h-12 rounded-full p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-pointer shrink-0 transition-transform hover:scale-105 relative overflow-hidden bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '6s' }}
            title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
          >
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80';
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#18181b] flex items-center justify-center text-cyan-300 border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              </div>
            )}
            {/* Center vinyl pinhole */}
            <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-black/90 border border-white/30 flex items-center justify-center pointer-events-none">
              <div className="w-1 h-1 rounded-full bg-cyan-400" />
            </div>
          </div>

          {/* Track Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                {currentTrack.title}
              </p>
              {currentTrack.youtubeUrl && (
                <a
                  href={currentTrack.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-400 hover:text-red-300 p-0.5 transition-colors shrink-0"
                  title="Mở bài này trên YouTube"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1.5">
              <span className="truncate">{currentTrack.artist}</span>
              <span className="text-[9px] text-red-400 font-mono bg-red-950/60 px-1 py-0.5 rounded border border-red-500/30 shrink-0">
                YouTube
              </span>
            </p>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Prev Track */}
            <button
              onClick={onPrevTrack}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Bài trước đó"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25 transition-transform active:scale-95"
              title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Next Track */}
            <button
              onClick={onSkipTrack}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Bài tiếp theo (Bỏ qua)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Source / Add Music Button */}
            <button
              onClick={() => setIsSourceModalOpen(!isSourceModalOpen)}
              className={`p-1.5 rounded-lg transition-colors ${
                isSourceModalOpen ? 'bg-cyan-600 text-white' : 'text-cyan-400 hover:text-white hover:bg-white/10'
              }`}
              title="Chọn bài nhạc hoặc Tải file MP3 của bạn lên"
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
            className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
            title={`Âm lượng: ${Math.round(volume * 100)}%`}
          />
          <span className="text-[10px] font-mono text-cyan-300 w-8 text-right font-semibold">
            {Math.round(volume * 100)}%
          </span>
        </div>


        {/* 5. PLAYLIST & "NƠI NHÉT NHẠC / TẢI NHẠC LÊN" DRAWER */}
        {isSourceModalOpen && (
          <div className="mt-2 p-3 rounded-xl bg-black/90 border border-cyan-500/40 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Music2 className="w-3.5 h-3.5" />
                <span>4 Bài Nhạc & Nơi Bỏ File MP3</span>
              </h4>
              <button
                onClick={() => setIsSourceModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List 4 Tracks with direct Play buttons & YouTube Thumbnails */}
            <div className="space-y-1.5">
              {tracks.map((t, idx) => {
                const isCurrent = idx === currentTrackIndex;
                return (
                  <div
                    key={t.id}
                    className={`p-2 rounded-lg flex items-center justify-between gap-2 transition-colors ${
                      isCurrent
                        ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/50 shadow-sm'
                        : 'hover:bg-white/5 bg-black/40 text-gray-300 border border-white/5'
                    }`}
                  >
                    {/* Track info and selection */}
                    <button
                      onClick={() => {
                        if (onSelectTrack) onSelectTrack(idx);
                      }}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                    >
                      {/* YouTube Thumbnail */}
                      <div className="relative w-9 h-9 rounded-md overflow-hidden bg-black/60 shrink-0 border border-white/10">
                        {t.coverUrl ? (
                          <img
                            src={t.coverUrl}
                            alt={t.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=80&auto=format&fit=crop&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-cyan-400">
                            {idx + 1}
                          </div>
                        )}
                        {isCurrent && (
                          <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs truncate font-medium ${isCurrent ? 'text-cyan-300 font-bold' : 'text-white'}`}>
                          {t.title}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {t.artist}
                        </p>
                      </div>
                    </button>

                    {/* YouTube MV Link */}
                    {t.youtubeUrl && (
                      <a
                        href={t.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 hover:text-white text-[10px] font-mono flex items-center gap-1 shrink-0 transition-colors"
                        title="Xem MV trên YouTube"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>MV</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upload file directly to replace current song */}
            <div className="p-2.5 rounded-lg bg-[#18191c] border border-cyan-500/30 text-[11px] text-gray-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải file MP3 của bạn lên:</span>
                </div>
                {isUploading && (
                  <span className="text-cyan-400 flex items-center gap-1 text-[10px]">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
                  </span>
                )}
              </div>

              {uploadSuccess ? (
                <div className="p-1.5 bg-green-950/60 border border-green-500/50 text-green-300 rounded text-center font-bold text-xs">
                  {uploadSuccess}
                </div>
              ) : (
                <label className="cursor-pointer w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all active:scale-[0.98]">
                  <Upload className="w-4 h-4" />
                  <span>Chọn file nhạc MP3 từ máy của bạn</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              <p className="text-[10px] text-gray-400 leading-normal">
                Bấm vào nút trên để chọn bài hát MP3 từ điện thoại / máy tính. Nhạc sẽ tự động lưu vào server và phát ngay lập tức!
              </p>
            </div>

            {/* Direct Link MP3 Online */}
            <div className="space-y-1.5 pt-1 border-t border-white/5">
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
            </div>

            {/* Instructions: Nhét nhạc trên Termux */}
            <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[10px] text-gray-400 space-y-1 font-mono">
              <div className="flex items-center gap-1 text-gray-300 font-bold">
                <FolderPlus className="w-3 h-3 text-cyan-400" />
                <span>Đường dẫn lưu file trên Termux / Host:</span>
              </div>
              <p className="text-[9px] text-gray-400">
                public/music/track1.mp3 (Late Night Rose)
                <br />
                public/music/track2.mp3 (Losing Interest)
                <br />
                public/music/track3.mp3 (Đường Dài Em Đi)
                <br />
                public/music/track4.mp3 (Best Part)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
