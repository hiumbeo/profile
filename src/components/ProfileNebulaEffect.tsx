import { useEffect, useRef } from 'react';

export function ProfileNebulaEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let particles: { x: number, y: number, vx: number, vy: number, alpha: number }[] = [];

    const init = () => {
      particles = [];
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          alpha: Math.random() * 0.5 + 0.2
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    init();
    animate();
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20 w-full h-full opacity-60" />;
}
