import { useEffect, useRef } from 'react';

export function NightSkyEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let stars: { x: number, y: number, r: number, alpha: number }[] = [];

    const init = () => {
      stars = [];
      for (let i = 0; i < 100; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 1.5 + 0.5,
          alpha: Math.random()
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      // Moon
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(width - 50, 50, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#070a0e';
      ctx.beginPath();
      ctx.arc(width - 40, 40, 30, 0, Math.PI * 2);
      ctx.fill();

      // Stars
      stars.forEach(s => {
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha + Math.sin(Date.now() * 0.002) * 0.5})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    init();
    animate();
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20 w-full h-full opacity-80" />;
}
