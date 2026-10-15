import { useEffect, useRef } from 'react';
import { WeatherEffectType } from '../types/profile';

interface BackgroundCanvasProps {
  effect: WeatherEffectType;
  intensity: number; // 1 to 10
}

export function BackgroundCanvas({ effect, intensity }: BackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || effect === 'none') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Weather particles setup
    const countMultiplier = intensity / 5;

    // --- RAIN SETUP ---
    interface RainDrop {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
    }
    interface Splashes {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }
    const rainDrops: RainDrop[] = [];
    const splashes: Splashes[] = [];
    const rainCount = Math.floor(120 * countMultiplier);
    for (let i = 0; i < rainCount; i++) {
      rainDrops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 15 + Math.random() * 25,
        speed: 14 + Math.random() * 12,
        opacity: 0.2 + Math.random() * 0.4,
      });
    }

    // --- SAKURA SETUP ---
    interface SakuraPetal {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      rotation: number;
      rotSpeed: number;
      flip: number;
      flipSpeed: number;
      opacity: number;
    }
    const sakuraPetals: SakuraPetal[] = [];
    const sakuraCount = Math.floor(45 * countMultiplier);
    for (let i = 0; i < sakuraCount; i++) {
      sakuraPetals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 9 + Math.random() * 8,
        speedX: -1 + Math.random() * 2,
        speedY: 1.2 + Math.random() * 2,
        rotation: Math.random() * 360,
        rotSpeed: -1 + Math.random() * 2,
        flip: Math.random(),
        flipSpeed: 0.02 + Math.random() * 0.03,
        opacity: 0.5 + Math.random() * 0.4,
      });
    }

    // --- SNOW SETUP ---
    interface Snowflake {
      x: number;
      y: number;
      radius: number;
      speedY: number;
      wind: number;
      opacity: number;
    }
    const snowflakes: Snowflake[] = [];
    const snowCount = Math.floor(90 * countMultiplier);
    for (let i = 0; i < snowCount; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.5 + Math.random() * 3.5,
        speedY: 0.8 + Math.random() * 1.8,
        wind: -0.5 + Math.random() * 1,
        opacity: 0.3 + Math.random() * 0.6,
      });
    }

    // --- MATRIX SETUP ---
    const characters = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ1234567890ABCDEF@#$%&*';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const matrixDrops: number[] = [];
    for (let i = 0; i < columns; i++) {
      matrixDrops[i] = Math.random() * -100;
    }

    // --- STARS SETUP ---
    interface Star {
      x: number;
      y: number;
      radius: number;
      alpha: number;
      alphaChange: number;
    }
    const stars: Star[] = [];
    const starCount = Math.floor(150 * countMultiplier);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.5 + Math.random() * 2,
        alpha: Math.random(),
        alphaChange: (Math.random() * 0.02 - 0.01) * 0.8,
      });
    }
    let shootingStar: { x: number; y: number; length: number; speed: number; opacity: number } | null = null;

    let lightningTimer = 0;
    let lightningFlash = 0;

    const render = () => {
      // 1. CLEAR / TRAIL
      if (effect === 'matrix') {
        ctx.fillStyle = 'rgba(7, 10, 15, 0.12)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // 2. RAIN EFFECT
      if (effect === 'rain') {
        // Lightning random trigger
        lightningTimer++;
        if (lightningTimer > 300 + Math.random() * 400) {
          lightningFlash = 0.18;
          lightningTimer = 0;
        }
        if (lightningFlash > 0) {
          ctx.fillStyle = `rgba(180, 200, 255, ${lightningFlash})`;
          ctx.fillRect(0, 0, width, height);
          lightningFlash -= 0.015;
        }

        ctx.strokeStyle = 'rgba(174, 194, 230, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < rainDrops.length; i++) {
          const drop = rainDrops[i];
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 3, drop.y + drop.length);

          drop.y += drop.speed;
          drop.x -= 1.5;

          if (drop.y > height) {
            // chance to create ground splash
            if (Math.random() < 0.25) {
              splashes.push({
                x: drop.x,
                y: height - Math.random() * 15,
                radius: 1,
                maxRadius: 4 + Math.random() * 4,
                opacity: 0.4,
              });
            }
            drop.y = -drop.length;
            drop.x = Math.random() * (width + 100);
          }
        }
        ctx.stroke();

        // Splashes
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.strokeStyle = `rgba(174, 194, 230, ${s.opacity})`;
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius * 2, s.radius, 0, 0, Math.PI * 2);
          ctx.stroke();

          s.radius += 0.4;
          s.opacity -= 0.04;
          if (s.opacity <= 0 || s.radius >= s.maxRadius) {
            splashes.splice(i, 1);
          }
        }
      }

      // 3. SAKURA EFFECT
      if (effect === 'sakura') {
        for (let i = 0; i < sakuraPetals.length; i++) {
          const p = sakuraPetals[i];
          p.x += p.speedX + Math.sin(p.y * 0.01) * 0.8;
          p.y += p.speedY;
          p.rotation += p.rotSpeed;
          p.flip += p.flipSpeed;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;
          if (p.x < -20) p.x = width + 20;

          const scaleX = Math.cos(p.flip);

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.scale(scaleX, 1);

          ctx.fillStyle = `rgba(255, 183, 209, ${p.opacity})`;
          ctx.shadowColor = 'rgba(255, 130, 180, 0.4)';
          ctx.shadowBlur = 4;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
          ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
          ctx.fill();
          ctx.restore();
        }
      }

      // 4. SNOW EFFECT
      if (effect === 'snow') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < snowflakes.length; i++) {
          const s = snowflakes[i];
          ctx.beginPath();
          ctx.fillStyle = `rgba(220, 235, 255, ${s.opacity})`;
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fill();

          s.y += s.speedY;
          s.x += s.wind + Math.sin(s.y * 0.02) * 0.5;

          if (s.y > height + 10) {
            s.y = -10;
            s.x = Math.random() * width;
          }
          if (s.x > width + 10) s.x = -10;
          if (s.x < -10) s.x = width + 10;
        }
      }

      // 5. MATRIX & CYAN-GREEN GLITCH EFFECT
      if (effect === 'matrix') {
        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
        for (let i = 0; i < matrixDrops.length; i++) {
          const text = characters.charAt(Math.floor(Math.random() * characters.length));
          const x = i * fontSize;
          const y = matrixDrops[i] * fontSize;

          // Head of drop is bright electric cyan-green
          ctx.fillStyle = i % 3 === 0 ? '#00f0ff' : '#6ee7b7';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 6;
          ctx.fillText(text, x, y);

          // Trail text in cyan/green
          ctx.shadowBlur = 0;
          ctx.fillStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.75)' : 'rgba(34, 197, 94, 0.75)';
          ctx.fillText(characters.charAt(Math.floor(Math.random() * characters.length)), x, y - fontSize);

          if (y > height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
          }
          matrixDrops[i]++;
        }

        // Random horizontal glitch slice tear (hiệu ứng lỗi xanh xanh)
        if (Math.random() < 0.12) {
          const sliceY = Math.random() * height;
          const sliceH = 4 + Math.random() * 22;
          const offset = (Math.random() - 0.5) * 28;

          try {
            ctx.drawImage(canvas, 0, sliceY, width, sliceH, offset, sliceY, width, sliceH);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
            ctx.fillRect(0, sliceY, width, sliceH);
          } catch {
            // Ignored
          }
        }
      }

      // 6. STARS & NEBULA
      if (effect === 'stars') {
        for (let i = 0; i < stars.length; i++) {
          const st = stars[i];
          st.alpha += st.alphaChange;
          if (st.alpha <= 0.1 || st.alpha >= 0.9) {
            st.alphaChange = -st.alphaChange;
          }
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, Math.min(1, st.alpha))})`;
          ctx.shadowBlur = st.radius > 1.2 ? 6 : 0;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shooting star
        if (!shootingStar && Math.random() < 0.008) {
          shootingStar = {
            x: Math.random() * (width * 0.7),
            y: Math.random() * (height * 0.4),
            length: 80 + Math.random() * 60,
            speed: 16 + Math.random() * 8,
            opacity: 1,
          };
        }

        if (shootingStar) {
          ctx.save();
          const grad = ctx.createLinearGradient(
            shootingStar.x,
            shootingStar.y,
            shootingStar.x + shootingStar.length,
            shootingStar.y + shootingStar.length * 0.5
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(shootingStar.x, shootingStar.y);
          ctx.lineTo(
            shootingStar.x + shootingStar.length,
            shootingStar.y + shootingStar.length * 0.5
          );
          ctx.stroke();
          ctx.restore();

          shootingStar.x += shootingStar.speed;
          shootingStar.y += shootingStar.speed * 0.5;
          shootingStar.opacity -= 0.025;
          if (shootingStar.opacity <= 0) {
            shootingStar = null;
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [effect, intensity]);

  if (effect === 'none') return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
      style={{ opacity: 0.95 }}
    />
  );
}
