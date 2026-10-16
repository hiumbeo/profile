import { useState, useRef, useEffect } from 'react';
import { CloudRain, Sparkles, Snowflake, Terminal, CloudLightning, Volume2, VolumeX, Moon } from 'lucide-react';
import { WeatherEffectType } from '../types/profile';
import { soundFX } from '../utils/soundEffects';

interface AtmosphereSwitcherProps {
  currentEffect: WeatherEffectType;
  onChangeEffect: (effect: WeatherEffectType) => void;
  weatherIntensity: number;
  onChangeIntensity: (intensity: number) => void;
}

export function AtmosphereSwitcher({
  currentEffect,
  onChangeEffect,
  weatherIntensity,
  onChangeIntensity,
}: AtmosphereSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { id: WeatherEffectType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'rain',
      label: 'Mưa & Sét',
      icon: <CloudLightning className="w-4 h-4 text-cyan-400" />,
      desc: 'Sấm sét rền rĩ và giọt mưa rơi',
    },
    {
      id: 'stars',
      label: 'Bầu trời sao',
      icon: <Moon className="w-4 h-4 text-purple-400" />,
      desc: 'Sao băng lung linh trong đêm đen',
    },
    {
      id: 'sakura',
      label: 'Hoa anh đào',
      icon: <Sparkles className="w-4 h-4 text-pink-400" />,
      desc: 'Cánh hoa đào bay theo gió nhẹ',
    },
    {
      id: 'snow',
      label: 'Tuyết rơi',
      icon: <Snowflake className="w-4 h-4 text-blue-300" />,
      desc: 'Bông tuyết trắng xóa huyền ảo',
    },
    {
      id: 'matrix',
      label: 'Cyber Matrix',
      icon: <Terminal className="w-4 h-4 text-emerald-400" />,
      desc: 'Dòng mã số kỹ thuật số huyền bí',
    },
  ];

  const handleSelect = (id: WeatherEffectType) => {
    soundFX.playClickSound();
    onChangeEffect(id);
    setIsOpen(false);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  };

  const activeOption = options.find((o) => o.id === currentEffect) || options[0];

  return (
    <div ref={menuRef} className="fixed bottom-4 left-4 z-40 select-none">
      {/* Popover Menu */}
      {isOpen && (
        <div className="mb-2 p-3 w-64 bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Không khí & Hiệu ứng
            </span>
            <button
              onClick={handleToggleMute}
              className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title={isMuted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh hiệu ứng'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
          </div>

          {/* List of atmospheres */}
          <div className="space-y-1">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-left transition-all ${
                  currentEffect === opt.id
                    ? 'bg-white/15 border border-white/20 text-white shadow-sm'
                    : 'hover:bg-white/5 text-gray-300 hover:text-white border border-transparent'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-black/50 border border-white/5 shrink-0">
                  {opt.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium leading-none">{opt.label}</div>
                  <div className="text-[10px] text-gray-500 truncate mt-0.5">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Weather Intensity Slider */}
          <div className="mt-3 pt-2.5 border-t border-white/10">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
              <span>Độ dày hiệu ứng</span>
              <span className="text-cyan-400 font-bold">{weatherIntensity}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={weatherIntensity}
              onChange={(e) => onChangeIntensity(Number(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      )}

      {/* Floating Trigger Pill */}
      <button
        onClick={() => {
          soundFX.playClickSound();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-md border border-white/15 hover:border-white/30 text-xs font-mono text-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:scale-105 transition-all cursor-pointer"
        title="Chỉnh đổi bầu không khí nền"
      >
        <span className="animate-pulse">{activeOption.icon}</span>
        <span className="text-xs font-medium">{activeOption.label}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
      </button>
    </div>
  );
}
