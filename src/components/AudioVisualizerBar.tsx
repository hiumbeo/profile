import { useEffect, useState } from 'react';

interface AudioVisualizerBarProps {
  isPlaying: boolean;
  color?: string;
  barCount?: number;
}

export function AudioVisualizerBar({
  isPlaying,
  color = '#a855f7', // purple neon
  barCount = 18,
}: AudioVisualizerBarProps) {
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => 20)
  );

  useEffect(() => {
    let animId: number;
    let tick = 0;

    const animate = () => {
      tick++;
      if (isPlaying) {
        // High energy wave dance with harmonic peaks
        setHeights(
          Array.from({ length: barCount }, (_, i) => {
            const wave1 = Math.sin(tick * 0.12 + i * 0.45);
            const wave2 = Math.cos(tick * 0.08 - i * 0.3);
            const wave3 = Math.sin(tick * 0.2 + (i % 3));
            const combined = (wave1 + wave2 + wave3 + 3) / 6; // 0 to 1
            return Math.max(12, Math.min(96, Math.floor(combined * 90 + Math.random() * 12)));
          })
        );
      } else {
        // Gentle resting heartbeat pulse
        setHeights(
          Array.from({ length: barCount }, (_, i) => {
            const base = Math.sin(tick * 0.03 + i * 0.2) * 6 + 14;
            return Math.max(8, Math.min(24, Math.floor(base)));
          })
        );
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, barCount]);

  return (
    <div className="flex items-end justify-center gap-[3px] h-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/5 overflow-hidden">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[2.5px] rounded-full transition-all duration-75 ease-out"
          style={{
            height: `${h}%`,
            backgroundColor: color,
            boxShadow: isPlaying ? `0 0 8px ${color}` : 'none',
            opacity: isPlaying ? 0.85 + (i % 2) * 0.15 : 0.4,
          }}
        />
      ))}
    </div>
  );
}
