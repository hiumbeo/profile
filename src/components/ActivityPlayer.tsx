import { useEffect, useState } from 'react';
import { RichPresenceActivity } from '../types/profile';
import { Play, Pause } from 'lucide-react';

interface ActivityPlayerProps {
  activity: RichPresenceActivity;
}

export function ActivityPlayer({ activity }: ActivityPlayerProps) {
  const [elapsed, setElapsed] = useState(activity.elapsedSeconds);
  const [isPlaying, setIsPlaying] = useState(true);

  // Live timer tick
  useEffect(() => {
    setElapsed(activity.elapsedSeconds);
  }, [activity.elapsedSeconds]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (activity.type === 'spotify') {
          return prev >= activity.totalDurationSeconds ? 0 : prev + 1;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, activity.type, activity.totalDurationSeconds]);

  if (activity.type === 'none') return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = activity.type === 'spotify' 
    ? Math.min(100, (elapsed / (activity.totalDurationSeconds || 1)) * 100) 
    : 0;

  return (
    <div className="mt-4 pt-3 border-t border-white/10">
      <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
        <span className="flex items-center gap-1.5">
          {activity.type === 'spotify' ? (
            <>
              <svg className="w-4 h-4 text-[#1db954]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.435-5.308-1.76-8.793-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.808-.87 7.076-.496 9.722 1.115.294.18.386.562.207.855zm1.226-2.73c-.226.367-.706.482-1.072.257-2.687-1.652-6.785-2.131-9.965-1.166-.413.127-.85-.106-.976-.52-.126-.413.106-.85.52-.976 3.632-1.102 8.147-.568 11.236 1.332.366.226.482.707.257 1.073zm.105-2.836C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.13-1.166-.624-.15-.493.13-1.016.624-1.165 3.532-1.072 9.404-.866 13.115 1.338.445.264.59.838.327 1.282-.264.443-.838.59-1.28.327z" />
              </svg>
              <span>Listening to Spotify</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-[#5865f2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6Zm1.5 5.5a1.5 1.5 0 0 1 1.5 1.5v1h1a1.5 1.5 0 0 1 0 3h-1v1a1.5 1.5 0 0 1-3 0v-1h-1a1.5 1.5 0 0 1 0-3h1v-1a1.5 1.5 0 0 1 1.5-1.5Zm8.5 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm2.5 3.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
              </svg>
              <span>Playing a Game</span>
            </>
          )}
        </span>

        {activity.type === 'spotify' && (
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 h-full bg-[#1db954] animate-pulse rounded-full" />
            <span className="w-0.5 h-2 bg-[#1db954] animate-pulse rounded-full" style={{ animationDelay: '0.2s' }} />
            <span className="w-0.5 h-3 bg-[#1db954] animate-pulse rounded-full" style={{ animationDelay: '0.4s' }} />
            <span className="w-0.5 h-1.5 bg-[#1db954] animate-pulse rounded-full" style={{ animationDelay: '0.1s' }} />
          </div>
        )}
      </div>

      <div className="bg-[#111214]/60 p-3 rounded-lg border border-white/5 flex gap-3 items-center">
        {/* Cover image */}
        <div className="relative group shrink-0 w-14 h-14 rounded-md overflow-hidden bg-black/40">
          <img
            src={activity.image}
            alt={activity.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80';
            }}
          />
          {activity.type === 'spotify' && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
              title={isPlaying ? 'Pause simulation' : 'Play simulation'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate hover:underline cursor-pointer">
            {activity.title}
          </p>
          <p className="text-xs text-gray-300 truncate">
            {activity.subtitle}
          </p>
          <p className="text-[11px] text-gray-400 truncate">
            {activity.details}
          </p>

          {/* Spotify Progress Bar */}
          {activity.type === 'spotify' && (
            <div className="mt-2">
              <div className="w-full bg-gray-700/60 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-white hover:bg-[#1db954] transition-all h-full rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                <span>{formatTime(elapsed)}</span>
                <span>{formatTime(activity.totalDurationSeconds)}</span>
              </div>
            </div>
          )}

          {/* Game Elapsed */}
          {activity.type === 'game' && (
            <div className="mt-1 text-[11px] text-gray-400 font-mono">
              {formatTime(elapsed)} elapsed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
