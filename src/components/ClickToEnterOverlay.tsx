import { Volume2, Sparkles } from 'lucide-react';

interface ClickToEnterOverlayProps {
  onEnter: () => void;
  displayName: string;
}

export function ClickToEnterOverlay({ onEnter, displayName }: ClickToEnterOverlayProps) {
  return (
    <div
      onClick={onEnter}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl cursor-pointer select-none transition-all duration-700 animate-fadeIn"
    >
      <div className="text-center px-4 max-w-md">
        {/* Subtle avatar/identity hint */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 p-0.5 shadow-[0_0_25px_rgba(168,85,247,0.4)] animate-pulse">
          <div className="w-full h-full bg-[#111214] rounded-full flex items-center justify-center text-white">
            <Sparkles className="w-7 h-7 text-purple-300 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide mb-2 drop-shadow-md">
          {displayName}
        </h1>

        <div className="inline-block mt-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg">
          <p className="text-sm md:text-base font-medium text-gray-200 tracking-wider uppercase flex items-center justify-center gap-2">
            <span>[ Click anywhere to enter ]</span>
          </p>
        </div>

        <p className="mt-5 text-xs text-gray-400 flex items-center justify-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Sound & weather effects enabled</span>
        </p>
      </div>
    </div>
  );
}
