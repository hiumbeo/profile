import { AvatarDecorType } from '../types/profile';

interface AvatarDecorationProps {
  decor: AvatarDecorType;
  customDecorUrl?: string;
}

export function AvatarDecoration({ decor, customDecorUrl }: AvatarDecorationProps) {
  if (decor === 'none') return null;

  return (
    <div className="absolute -top-4 -left-4 -right-4 -bottom-4 z-20 flex items-center justify-center pointer-events-none">
      {/* 0. DISCORD OFFICIAL CDN AVATAR DECORATION */}
      {((decor === 'discord_native' || decor === 'custom_decor') && customDecorUrl) && (
        <img
          src={customDecorUrl}
          alt="Avatar Decoration"
          className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] object-contain z-50 pointer-events-none"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      )}

      {/* 2. CYBERPUNK HUD VISOR */}
      {/* 2. CYBERPUNK HUD VISOR */}
      {decor === 'cyberpunk' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            {/* Tech Corner Brackets */}
            <path d="M22 34 L18 34 L18 22 L30 22 L30 26" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M78 34 L82 34 L82 22 L70 22 L70 26" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M22 66 L18 66 L18 78 L30 78 L30 74" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M78 66 L82 66 L82 78 L70 78 L70 74" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            
            {/* Rotating Tech Reticle */}
            <circle cx="50" cy="50" r="44" stroke="#00f0ff" strokeWidth="1" strokeDasharray="14 8 4 8" opacity="0.8" className="animate-rotate-slow origin-center" />
            
            {/* Visor Glint Bar */}
            <rect x="24" y="46" width="52" height="3" fill="url(#cyanGlow)" rx="1.5" className="animate-pulse" />
            <defs>
              <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      {/* 3. KAWAII CAT EARS */}
      {decor === 'cat_ears' && (
        <div className="relative w-full h-full">
          <svg className="w-full h-full animate-float" viewBox="0 0 100 100" fill="none">
            {/* Left Ear */}
            <path d="M18 32 C14 12 28 6 38 18 C30 24 24 28 18 32Z" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
            <path d="M22 28 C20 16 28 12 34 20 C28 23 25 26 22 28Z" fill="#f472b6" />
            {/* Right Ear */}
            <path d="M82 32 C86 12 72 6 62 18 C70 24 76 28 82 32Z" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />
            <path d="M78 28 C80 16 72 12 66 20 C72 23 75 26 78 28Z" fill="#f472b6" />
            
            {/* Small Stars / Whiskers */}
            <circle cx="12" cy="50" r="2" fill="#818cf8" />
            <circle cx="88" cy="50" r="2" fill="#818cf8" />
            <circle cx="50" cy="94" r="3" fill="#f472b6" opacity="0.7" />
          </svg>
        </div>
      )}

      {/* 4. ANGEL HALO */}
      {decor === 'angel_halo' && (
        <div className="relative w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            {/* Floating Radiant Halo */}
            <g className="animate-float">
              <ellipse cx="50" cy="14" rx="28" ry="7" stroke="#fbbf24" strokeWidth="3" filter="drop-shadow(0 0 6px #f59e0b)" />
              <ellipse cx="50" cy="14" rx="26" ry="5.5" stroke="#fff" strokeWidth="1" opacity="0.9" />
              {/* Rays */}
              <line x1="50" y1="4" x2="50" y2="0" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="8" x2="28" y2="5" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="68" y1="8" x2="72" y2="5" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
            </g>
            {/* Subtle Divine Wing outlines */}
            <path d="M12 40 C6 28 16 20 22 28 C14 36 18 48 24 54" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M88 40 C94 28 84 20 78 28 C86 36 82 48 76 54" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>
      )}

      {/* 5. DEMON HORNS */}
      {decor === 'demon_horns' && (
        <div className="relative w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            {/* Left Horn */}
            <path d="M26 28 C20 18 10 14 8 4 C18 10 26 18 32 24 Z" fill="#991b1b" stroke="#ef4444" strokeWidth="1.5" filter="drop-shadow(0 0 4px #dc2626)" />
            {/* Right Horn */}
            <path d="M74 28 C80 18 90 14 92 4 C82 10 74 18 68 24 Z" fill="#991b1b" stroke="#ef4444" strokeWidth="1.5" filter="drop-shadow(0 0 4px #dc2626)" />
            {/* Dark Aura Ring */}
            <circle cx="50" cy="50" r="43" stroke="#7f1d1d" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" className="animate-spin origin-center" style={{ animationDuration: '15s' }} />
          </svg>
        </div>
      )}

      {/* 6. COSMIC ORBIT RING */}
      {decor === 'cosmic_ring' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            {/* Saturn Ring tilted */}
            <g transform="rotate(-25 50 50)">
              <ellipse cx="50" cy="50" rx="46" ry="14" stroke="#38bdf8" strokeWidth="2.5" opacity="0.8" filter="drop-shadow(0 0 5px #0284c7)" />
              <ellipse cx="50" cy="50" rx="48" ry="15.5" stroke="#a855f7" strokeWidth="1" strokeDasharray="8 6" opacity="0.7" />
              {/* Little Moon */}
              <circle cx="94" cy="50" r="3.5" fill="#f0abfc" filter="drop-shadow(0 0 3px #d946ef)" />
              <circle cx="6" cy="50" r="2.5" fill="#bae6fd" />
            </g>
          </svg>
        </div>
      )}

      {/* 7. GLITCH PIXEL CROWN */}
      {decor === 'glitch_crown' && (
        <div className="relative w-full h-full flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            {/* Crown Top */}
            <g className="animate-pulse">
              <polygon points="26,22 34,10 50,18 66,10 74,22 70,26 30,26" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
              <rect x="32" y="11" width="3" height="3" fill="#ef4444" />
              <rect x="49" y="19" width="3" height="3" fill="#3b82f6" />
              <rect x="65" y="11" width="3" height="3" fill="#10b981" />
            </g>
            {/* Glitch Frame Corners */}
            <path d="M15 28 L15 15 L28 15" stroke="#22c55e" strokeWidth="2" />
            <path d="M85 28 L85 15 L72 15" stroke="#ec4899" strokeWidth="2" />
            <path d="M15 72 L15 85 L28 85" stroke="#06b6d4" strokeWidth="2" />
            <path d="M85 72 L85 85 L72 85" stroke="#eab308" strokeWidth="2" />
          </svg>
        </div>
      )}

      {/* 8. FIRE FLAME AURA */}
      {decor === 'fire_aura' && (
        <div className="relative w-full h-full">
          <svg className="w-full h-full animate-pulse-glow" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="44" stroke="url(#fireGradient)" strokeWidth="3" filter="drop-shadow(0 0 8px #f97316)" />
            {/* Flames */}
            <path d="M30 18 C32 10 38 6 36 2 C44 8 42 16 40 20 Z" fill="#f97316" />
            <path d="M48 16 C50 6 56 2 54 -2 C62 6 60 14 58 18 Z" fill="#ef4444" />
            <path d="M66 18 C68 10 74 6 72 2 C80 8 78 16 76 20 Z" fill="#f59e0b" />
            <defs>
              <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
      {/* 9. WITCH HAT */}
      {decor === 'witch_hat' && (
        <div className="relative w-full h-full">
          <svg className="w-full h-full animate-float" viewBox="0 0 100 100" fill="none">
            <path d="M30 40 L50 10 L70 40 Z" fill="#4c1d95" stroke="#7e22ce" strokeWidth="2" />
            <rect x="25" y="40" width="50" height="8" fill="#4c1d95" stroke="#7e22ce" strokeWidth="2" rx="2" />
            <circle cx="50" cy="25" r="5" fill="#fbcfe8" />
          </svg>
        </div>
      )}
    </div>
  );
}
