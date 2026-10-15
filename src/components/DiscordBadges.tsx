import { DiscordBadgeState } from '../types/profile';

interface DiscordBadgesProps {
  badges: DiscordBadgeState;
}

export function DiscordBadges({ badges }: DiscordBadgesProps) {
  return (
    <div className="flex items-center gap-1.5 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/5">
      {/* 1. DISCORD NITRO */}
      {badges.nitro && (
        <div className="group relative flex items-center justify-center p-1 cursor-pointer">
          <svg className="w-5 h-5 text-[#f47fff] hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.973 3.5 12 7.2l5.027-3.7L22 13.5l-10 7-10-7L6.973 3.5ZM12 9.5 8.5 6.9 4.3 12.8l7.7 5.4 7.7-5.4-4.2-5.9L12 9.5Z" />
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111214] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10 z-30 pointer-events-none">
            Subscriber since Mar 2018
          </span>
        </div>
      )}

      {/* 2. SERVER BOOSTER */}
      {badges.booster && (
        <div className="group relative flex items-center justify-center p-1 cursor-pointer">
          <svg className="w-5 h-5 text-[#ff73fa] hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2 4 9l2 11 6 2 6-2 2-11-8-7Zm0 3.8 5 4.4-1.2 6.8-3.8 1.3-3.8-1.3L7 10.2l5-4.4Z" />
            <path d="m12 7.5 2.8 2.5-.7 3.8-2.1.7-2.1-.7-.7-3.8L12 7.5Z" />
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111214] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10 z-30 pointer-events-none">
            Server Booster (Level 24)
          </span>
        </div>
      )}

      {/* 3. HYPESQUAD */}
      {badges.hypeSquad === 'bravery' && (
        <div className="group relative flex items-center justify-center p-1 cursor-pointer">
          <svg className="w-5 h-5 text-[#9b59b6] hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="m12 2.5 7.5 6-2.5 12-5-3.5-5 3.5-2.5-12 7.5-6Zm0 4.2-4.5 3.6 1.5 7.2 3-2.1 3 2.1 1.5-7.2-4.5-3.6Z" />
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111214] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10 z-30 pointer-events-none">
            HypeSquad Bravery
          </span>
        </div>
      )}

      {badges.hypeSquad === 'brilliance' && (
        <div className="group relative flex items-center justify-center p-1 cursor-pointer">
          <svg className="w-5 h-5 text-[#e67e22] hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2 3.5 10.5 12 22l8.5-11.5L12 2Zm0 4 5 5-5 7-5-7 5-5Z" />
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111214] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10 z-30 pointer-events-none">
            HypeSquad Brilliance
          </span>
        </div>
      )}

      {badges.hypeSquad === 'balance' && (
        <div className="group relative flex items-center justify-center p-1 cursor-pointer">
          <svg className="w-5 h-5 text-[#2ecc71] hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2 3 8v8l9 6 9-6V8l-9-6Zm0 3.8 6 4v5.4l-6 4-6-4V9.8l6-4Z" />
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111214] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10 z-30 pointer-events-none">
            HypeSquad Balance
          </span>
        </div>
      )}

      {/* 4. ACTIVE DEVELOPER */}
      {badges.activeDev && (
        <div className="group relative flex items-center justify-center p-1 cursor-pointer">
          <svg className="w-5 h-5 text-[#57f287] hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="m8.5 7-5 5 5 5 1.4-1.4L6.3 12l3.6-3.6L8.5 7Zm7 0-1.4 1.4 3.6 3.6-3.6 3.6 1.4 1.4 5-5-5-5Z" />
            <circle cx="12" cy="12" r="1.5" />
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111214] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10 z-30 pointer-events-none">
            Active Developer
          </span>
        </div>
      )}

      {/* 5. EARLY SUPPORTER */}
      {badges.earlySupporter && (
        <div className="group relative flex items-center justify-center p-1 cursor-pointer">
          <svg className="w-5 h-5 text-[#f47b67] hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H8v2h8v-2h-3v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2ZM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8Zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1Z" />
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111214] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10 z-30 pointer-events-none">
            Early Supporter
          </span>
        </div>
      )}

      {/* 6. BUG HUNTER */}
      {badges.bugHunter && (
        <div className="group relative flex items-center justify-center p-1 cursor-pointer">
          <svg className="w-5 h-5 text-[#5865f2] hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 8h-1.81a5.985 5.985 0 0 0-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.69 7.27 7.57 6.81 8H5v2h1.19c-.07.32-.12.66-.16 1H4v2h2.03c.04.34.09.68.16 1H5v2h1.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H19v-2h-1.19c.07-.32.12-.66.16-1H20v-2h-2.03c-.04-.34-.09-.68-.16-1H19V8Zm-6 8h-2c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1Z" />
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111214] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10 z-30 pointer-events-none">
            Discord Bug Hunter
          </span>
        </div>
      )}

      {/* 7. VERIFIED BOT DEV */}
      {badges.botDev && (
        <div className="group relative flex items-center justify-center p-1 cursor-pointer">
          <svg className="w-5 h-5 text-[#5865f2] hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h2a5 5 0 0 1 5 5v1h1a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v1a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-1H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h1v-1a5 5 0 0 1 5-5h2V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2Zm-3 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#111214] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10 z-30 pointer-events-none">
            Early Verified Bot Developer
          </span>
        </div>
      )}
    </div>
  );
}
