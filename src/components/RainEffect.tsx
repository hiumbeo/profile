import { useEffect, useRef } from 'react';

export function RainEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let drops: { x: number, y: number, length: number, speed: number }[] = [];

    const init = () => {
      drops = [];
      for (let i = 0; i < 200; i++) {
        drops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 20 + 10,
          speed: Math.random() * 5 + 5
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      drops.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x, d.y + d.length);
        ctx.stroke();
        d.y += d.speed;
        if (d.y > height) d.y = -d.length;
      });
      requestAnimationFrame(animate);
    };

    init();
    animate();
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20 w-full h-full opacity-20" />;
}
