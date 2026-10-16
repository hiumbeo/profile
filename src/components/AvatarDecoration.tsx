import { AvatarDecorType } from '../types/profile';

interface AvatarDecorationProps {
  decor: AvatarDecorType;
  customDecorUrl?: string;
}

export function AvatarDecoration({ decor, customDecorUrl }: AvatarDecorationProps) {
  if (decor === 'none') return null;

  const isImageDecor =
    decor === 'reyna_eye' ||
    decor === 'gif_decoration' ||
    decor === 'discord_native' ||
    decor === 'custom_decor';

  const imageSrc =
    decor === 'reyna_eye' || decor === 'gif_decoration'
      ? '/decorations/reyna_leer.gif'
      : (customDecorUrl || '/decorations/reyna_leer.gif');

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none">
      {/* 0. DISCORD REYNA LEER / OFFICIAL CDN / CUSTOM GIF DECORATION (PERFECTLY CENTERED, 0% OFFSET) */}
      {isImageDecor && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <img
            src={imageSrc}
            alt="Avatar Decoration"
            className="w-[124%] h-[124%] max-w-none max-h-none object-contain pointer-events-none select-none drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://media.tenor.com/kiCMvLEIhckAAAAj/reyna%27s-leer-discord.gif';
            }}
          />
        </div>
      )}

      {/* 1. SAKURA WREATH */}
      {decor === 'sakura' && (
        <div className="w-[120%] h-[120%] flex items-center justify-center shrink-0">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="44" stroke="#f472b6" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" className="animate-spin origin-center" style={{ animationDuration: '24s' }} />
            {/* Cherry Blossom Petals */}
            <circle cx="20" cy="24" r="5" fill="#fbcfe8" filter="drop-shadow(0 0 4px #ec4899)" />
            <circle cx="80" cy="24" r="5" fill="#fbcfe8" filter="drop-shadow(0 0 4px #ec4899)" />
            <circle cx="14" cy="50" r="4" fill="#fda4af" />
            <circle cx="86" cy="50" r="4" fill="#fda4af" />
            <circle cx="26" cy="76" r="4.5" fill="#fbcfe8" />
            <circle cx="74" cy="76" r="4.5" fill="#fbcfe8" />
          </svg>
        </div>
      )}

      {/* 2. CYBERPUNK HUD VISOR */}
      {decor === 'cyberpunk' && (
        <div className="w-[120%] h-[120%] flex items-center justify-center shrink-0">
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

      {/* 4. ANGEL HALO */}
      {decor === 'angel_halo' && (
        <div className="w-[120%] h-[120%] flex items-center justify-center shrink-0">
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
        <div className="w-[120%] h-[120%] flex items-center justify-center shrink-0">
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
        <div className="w-[120%] h-[120%] flex items-center justify-center shrink-0">
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
        <div className="w-[120%] h-[120%] flex items-center justify-center shrink-0">
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
        <div className="w-[120%] h-[120%] flex items-center justify-center shrink-0">
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
        <div className="w-[120%] h-[120%] flex items-center justify-center shrink-0">
          <svg className="w-full h-full animate-float" viewBox="0 0 100 100" fill="none">
            <path d="M30 40 L50 10 L70 40 Z" fill="#4c1d95" stroke="#7e22ce" strokeWidth="2" />
            <rect x="25" y="40" width="50" height="8" fill="#4c1d95" stroke="#7e22ce" strokeWidth="2" rx="2" />
            <circle cx="50" cy="25" r="5" fill="#fbcfe8" />
          </svg>
        </div>
      )}

      {/* 10. MINIMAL NEON RING */}
      {decor === 'minimal_neon_ring' && (
        <div className="w-[120%] h-[120%] flex items-center justify-center shrink-0">
          <svg className="w-full h-full animate-spin" style={{ animationDuration: '8s' }} viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="#00f0ff" strokeWidth="2" strokeDasharray="10 4" opacity="0.6" />
          </svg>
        </div>
      )}

      {/* 11. SUBTLE HALO */}
      {decor === 'subtle_halo' && (
        <div className="w-[120%] h-[120%] flex items-center justify-center shrink-0">
          <svg className="w-full h-full animate-float" viewBox="0 0 100 100" fill="none">
            <ellipse cx="50" cy="14" rx="22" ry="5" stroke="#ffffff" strokeWidth="2" opacity="0.7" />
          </svg>
        </div>
      )}
    </div>
  );
}
