import { useState, useEffect } from 'react';
import { Volume2, Sparkles } from 'lucide-react';

interface ClickToEnterOverlayProps {
  onEnter: () => void;
  displayName: string;
}

export function ClickToEnterOverlay({ onEnter, displayName }: ClickToEnterOverlayProps) {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const phrases = [displayName, 'glight'];

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];

      if (isDeleting) {
        setText(fullText.substring(0, text.length - 1));
        setTypingSpeed(30);
      } else {
        setText(fullText.substring(0, text.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum((prev) => prev + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, phrases, typingSpeed]);

  return (
    <div
      onClick={onEnter}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl cursor-pointer select-none transition-all duration-700 animate-fadeIn"
    >
      <div className="text-center px-4 max-w-md">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide mb-8 drop-shadow-md min-h-[4rem]">
          {text}
          <span className="animate-blink">|</span>
        </h1>

        <div className="inline-block mt-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg">
          <p className="text-sm md:text-base font-medium text-gray-200 tracking-wider uppercase flex items-center justify-center gap-2">
            <span>[ Click anywhere to enter ]</span>
          </p>
        </div>
      </div>
    </div>
  );
}
