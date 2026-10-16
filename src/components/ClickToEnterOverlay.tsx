import { useState, useEffect } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { AvatarDecoration } from './AvatarDecoration';
import { AvatarDecorType } from '../types/profile';

interface ClickToEnterOverlayProps {
  onEnter: () => void;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  avatarDecor?: AvatarDecorType;
  customAvatarDecorUrl?: string;
}

export function ClickToEnterOverlay({
  onEnter,
  displayName,
  username = '40wf',
  avatarUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm4ft_l3UP4HWpzArGJaabiH2Muv648CtDVcBwMQl43Q&s',
  avatarDecor = 'reyna_eye',
  customAvatarDecorUrl = '/decorations/reyna_leer.gif'
}: ClickToEnterOverlayProps) {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(140);
  const [isLeaving, setIsLeaving] = useState(false);

  const phrases = [displayName, `@${username}`, 'Discord Profile ⛧'];

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      if (isDeleting) {
        setText(fullText.substring(0, text.length - 1));
        setTypingSpeed(35);
      } else {
        setText(fullText.substring(0, text.length + 1));
        setTypingSpeed(130);
      }

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2200);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum((prev) => prev + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, phrases, typingSpeed]);

  const handleClick = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    onEnter();
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md cursor-pointer select-none transition-all duration-700 ${
        isLeaving ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center px-4 max-w-md animate-fade-in">
        {/* Glowing Center Avatar with Decor */}
        {avatarUrl && (
          <div className="relative mb-6 group">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-[#0a0a0c] p-1.5 relative shadow-[0_0_35px_rgba(168,85,247,0.4)] border border-purple-500/30 transition-transform duration-500 group-hover:scale-105">
              <div className="w-full h-full rounded-full overflow-hidden bg-black/60">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {avatarDecor && (
              <AvatarDecoration decor={avatarDecor} customDecorUrl={customAvatarDecorUrl} />
            )}
          </div>
        )}

        {/* Typewriter Title */}
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-purple-300 tracking-wider mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] min-h-[3.5rem] flex items-center justify-center">
          <span>{text}</span>
          <span className="inline-block w-[3px] h-8 md:h-10 bg-cyan-400 ml-1 animate-pulse" />
        </h1>

        {/* Click to Enter Prompt */}
        <div className="mt-3 px-6 py-3 rounded-full bg-white/5 border border-white/15 hover:bg-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-300 shadow-xl backdrop-blur-sm group">
          <p className="text-sm md:text-base font-semibold text-gray-200 tracking-widest uppercase flex items-center justify-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span className="group-hover:text-cyan-300 transition-colors">[ Click to enter ]</span>
            <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
          </p>
        </div>

        <p className="mt-4 text-xs text-gray-400 tracking-wide flex items-center gap-1.5">
          <span>Nhấn bất kỳ đâu để vào profile & phát nhạc</span>
        </p>
      </div>
    </div>
  );
}
